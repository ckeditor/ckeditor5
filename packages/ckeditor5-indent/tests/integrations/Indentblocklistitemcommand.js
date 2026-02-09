/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { modelList } from '../../../ckeditor5-list/tests/list/_utils/utils.js';
import { isListItemBlock } from '../../../ckeditor5-list/src/list/utils/model.js';
import { IndentUsingOffset } from '../../src/indentcommandbehavior/indentusingoffset.js';
import { IndentBlockListItemCommand } from '../../src/integrations/indentblocklistitemcommand.js';

describe( 'IndentBlockListItemCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				sinon.stub( editor.plugins, 'get' ).withArgs( 'ListUtils' ).returns( {
					isListItemBlock
				} );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'indent', () => {
		describe( 'using offset', () => {
			beforeEach( () => {
				command = new IndentBlockListItemCommand( editor, new IndentUsingOffset( {
					offset: 40,
					unit: 'px',
					direction: 'forward'
				} ) );
			} );

			describe( 'isEnabled', () => {
				describe( 'general cases', () => {
					it( 'should be false when selection is outside of list', () => {
						_setModelData( model, modelList( [
							'[]foo',
							'* bar',
							'* baz'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false in empty editor', () => {
						_setModelData( model, '' );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true when selection starts in list with positive indent and finishes in list with ' +
					'negative indent', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:50px}',
							'',
							'* ba]r {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection starts in list with negative indent and finishes in list with ' +
					'positive indent', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:-50px}',
							'',
							'* ba]r {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'when current indent is positive', () => {
					it( 'should be false when collapsed selection is at start of the list item', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when collapsed selection is in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[]oo {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when collapsed selection is at end of the list item', () => {
						_setModelData( model, modelList( [
							'* foo[] {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[oo] {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when it is not the first list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection is at start of the nested list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * []bar {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection spans across multiple items (all have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:50px}',
							'* bar {blockIndentListItem:50px}',
							'* ba]z {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection spans across multiple items (some do not have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar {blockIndentListItem:50px}',
							'* ba]z'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:50px}',
							'* bar {blockIndentListItem:50px}',
							'',
							'* baz] {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when blockIndentListItem attribute is set using different unit', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:5em}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );
				} );

				describe( 'when current indent is negative', () => {
					it( 'should be true when collapsed selection is at start of the list item', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when collapsed selection is in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[]oo {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when collapsed selection is at end of the list item', () => {
						_setModelData( model, modelList( [
							'* foo[] {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when non-collapsed selection starts at the start of the list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when non-collapsed selection starts in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[oo] {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when it is not the first list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection is in the nested list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * []bar {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection spans across multiple items (all have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:-50px}',
							'* bar {blockIndentListItem:-50px}',
							'* ba]z {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection spans across multiple items (some do not have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar {blockIndentListItem:-50px}',
							'* ba]z'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:-50px}',
							'* bar {blockIndentListItem:-50px}',
							'',
							'* baz] {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when blockIndentListItem attribute is set using different unit', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:-5em}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );

			describe( 'execute', () => {
				describe( 'when current indent is negative', () => {
					it( 'should reset to 0 when collapsed selection is at start of the list item', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo'
						] ) );
					} );

					it( 'should reset to 0 when collapsed selection is in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[]oo {blockIndentListItem:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* f[]oo'
						] ) );
					} );

					it( 'should reset to 0 when collapsed selection is at end of the list item', () => {
						_setModelData( model, modelList( [
							'* foo[] {blockIndentListItem:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* foo[]'
						] ) );
					} );

					it( 'should reset to 0 when non-collapsed selection starts at the start of the list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o {blockIndentListItem:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [fo]o'
						] ) );
					} );

					it( 'should reset to 0 when non-collapsed selection starts in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[oo] {blockIndentListItem:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* f[oo]'
						] ) );
					} );

					it( 'should reset to 0 when it is not the first list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar {blockIndentListItem:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* foo',
							'* []bar'
						] ) );
					} );

					it( 'should reset to 0 when selection is in the nested list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * []bar {blockIndentListItem:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* foo',
							'  * []bar'
						] ) );
					} );

					it( 'should reset to 0 when selection spans across multiple items (all have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:-50px}',
							'* bar {blockIndentListItem:-60px}',
							'* ba]z {blockIndentListItem:-700px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );
					} );

					it( 'should reset to 0 when selection spans across multiple items (some do not have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar {blockIndentListItem:-50px}',
							'* ba]z'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );
					} );

					it( 'should reset to 0 when selection spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:-50px}',
							'* bar {blockIndentListItem:-50px}',
							'',
							'* baz] {blockIndentListItem:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );
					} );

					it( 'should reset to 0 when blockIndentListItem attribute is set using different unit', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:-5em}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo'
						] ) );
					} );
				} );

				describe( 'when there are list items with positive and negative indents in selection', () => {
					it( 'should reset to 0 only items with negative indents (second one)', () => {
						_setModelData( model, modelList( [
							'* f[oo {blockIndentListItem:50px}',
							'',
							'* ba]r {blockIndentListItem:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* f[oo {blockIndentListItem:50px}',
							'',
							'* ba]r'
						] ) );
					} );

					it( 'should reset to 0 only items with negative indents (first one)', () => {
						_setModelData( model, modelList( [
							'* f[oo {blockIndentListItem:-50px}',
							'',
							'* ba]r {blockIndentListItem:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* f[oo',
							'',
							'* ba]r {blockIndentListItem:50px}'
						] ) );
					} );
				} );
			} );
		} );
	} );

	describe( 'outdent', () => {
		describe( 'using offset', () => {
			beforeEach( () => {
				command = new IndentBlockListItemCommand( editor, new IndentUsingOffset( {
					offset: 40,
					unit: 'px',
					direction: 'backward'
				} ) );
			} );

			describe( 'isEnabled', () => {
				describe( 'general cases', () => {
					it( 'should be false when selection is outside of list', () => {
						_setModelData( model, modelList( [
							'[]foo',
							'* bar',
							'* baz'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false in empty editor', () => {
						_setModelData( model, '' );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true when selection starts in list with positive indent and finishes in list with ' +
					'negative indent', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:50px}',
							'',
							'* ba]r {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection starts in list with negative indent and finishes in list with ' +
					'positive indent', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:-50px}',
							'',
							'* ba]r {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'when current indent is positive', () => {
					it( 'should be true when collapsed selection is at start of the list item', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when collapsed selection is in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[]oo {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when collapsed selection is at end of the list item', () => {
						_setModelData( model, modelList( [
							'* foo[] {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when non-collapsed selection starts at the start of the list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when non-collapsed selection starts in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[oo] {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when it is not the first list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection is at start of the nested list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * []bar {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection spans across multiple items (all have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:50px}',
							'* bar {blockIndentListItem:50px}',
							'* ba]z {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection spans across multiple items (some do not have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar {blockIndentListItem:50px}',
							'* ba]z'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:50px}',
							'* bar {blockIndentListItem:50px}',
							'',
							'* baz] {blockIndentListItem:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when blockIndentListItem attribute is set using different unit', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:5em}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'when current indent is negative', () => {
					it( 'should be false when collapsed selection is at start of the list item', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when collapsed selection is in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[]oo {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when collapsed selection is at end of the list item', () => {
						_setModelData( model, modelList( [
							'* foo[] {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[oo] {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when it is not the first list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection is in the nested list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * []bar {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection spans across multiple items (all have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:-50px}',
							'* bar {blockIndentListItem:-50px}',
							'* ba]z {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection spans across multiple items (some do not have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar {blockIndentListItem:-50px}',
							'* ba]z'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:-50px}',
							'* bar {blockIndentListItem:-50px}',
							'',
							'* baz] {blockIndentListItem:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when blockIndentListItem attribute is set using different unit', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:-5em}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );
				} );
			} );

			describe( 'execute', () => {
				describe( 'when current indent is positive', () => {
					it( 'should reset to 0 when collapsed selection is at start of the list item', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo'
						] ) );
					} );

					it( 'should reset to 0 when collapsed selection is in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[]oo {blockIndentListItem:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* f[]oo'
						] ) );
					} );

					it( 'should reset to 0 when collapsed selection is at end of the list item', () => {
						_setModelData( model, modelList( [
							'* foo[] {blockIndentListItem:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* foo[]'
						] ) );
					} );

					it( 'should reset to 0 when non-collapsed selection starts at the start of the list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o {blockIndentListItem:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [fo]o'
						] ) );
					} );

					it( 'should reset to 0 when non-collapsed selection starts in the middle of the list item', () => {
						_setModelData( model, modelList( [
							'* f[oo] {blockIndentListItem:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* f[oo]'
						] ) );
					} );

					it( 'should reset to 0 when it is not the first list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar {blockIndentListItem:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* foo',
							'* []bar'
						] ) );
					} );

					it( 'should reset to 0 when selection is in the nested list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * []bar {blockIndentListItem:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* foo',
							'  * []bar'
						] ) );
					} );

					it( 'should reset to 0 when selection spans across multiple items (all have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:50px}',
							'* bar {blockIndentListItem:60px}',
							'* ba]z {blockIndentListItem:700px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );
					} );

					it( 'should reset to 0 when selection spans across multiple items (some do not have the attribute set)', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar {blockIndentListItem:50px}',
							'* ba]z'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );
					} );

					it( 'should reset to 0 when selection spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentListItem:50px}',
							'* bar {blockIndentListItem:50px}',
							'',
							'* baz] {blockIndentListItem:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );
					} );

					it( 'should reset to 0 when blockIndentListItem attribute is set using different unit', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentListItem:5em}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo'
						] ) );
					} );
				} );

				describe( 'when there are list items with positive and negative indents in selection', () => {
					it( 'should reset to 0 only items with positive indents (first one)', () => {
						_setModelData( model, modelList( [
							'* f[oo {blockIndentListItem:50px}',
							'',
							'* ba]r {blockIndentListItem:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* f[oo',
							'',
							'* ba]r {blockIndentListItem:-50px}'
						] ) );
					} );

					it( 'should reset to 0 only items with positive indents (second one)', () => {
						_setModelData( model, modelList( [
							'* f[oo {blockIndentListItem:-50px}',
							'',
							'* ba]r {blockIndentListItem:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* f[oo {blockIndentListItem:-50px}',
							'',
							'* ba]r'
						] ) );
					} );
				} );
			} );
		} );
	} );
} );
