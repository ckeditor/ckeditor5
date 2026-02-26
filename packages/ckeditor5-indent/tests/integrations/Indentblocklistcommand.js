/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { modelList } from '../../../ckeditor5-list/tests/list/_utils/utils.js';
import { isFirstListItemInList, expandListBlocksToCompleteList } from '../../../ckeditor5-list/src/list/utils/model.js';
import { IndentUsingOffset } from '../../src/indentcommandbehavior/indentusingoffset.js';
import { IndentUsingClasses } from '../../src/indentcommandbehavior/indentusingclasses.js';
import { IndentBlockListCommand } from '../../src/integrations/indentblocklistcommand.js';

describe( 'IndentBlockListCommand', () => {
	let editor, model, command, indentBlockUsingClasses;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				model.schema.register( 'paragraph', {
					inheritAllFrom: '$block',
					allowAttributes: [ 'listType', 'listIndent', 'listItemId', 'blockIndentList' ]
				} );

				indentBlockUsingClasses = false;

				sinon.stub( editor.plugins, 'get' ).callsFake( name => {
					if ( name === 'ListUtils' ) {
						return { isFirstListItemInList, expandListBlocksToCompleteList };
					}

					if ( name === 'IndentBlockListIntegration' ) {
						return { indentBlockUsingClasses };
					}
				} );
			} );
	} );

	afterEach( () => {
		sinon.restore();
		command.destroy();

		return editor.destroy();
	} );

	describe( 'indent', () => {
		describe( 'using offset', () => {
			beforeEach( () => {
				command = new IndentBlockListCommand( editor, new IndentUsingOffset( {
					offset: 40,
					unit: 'px',
					direction: 'forward'
				} ) );
			} );

			describe( 'isEnabled', () => {
				describe( 'general cases', () => {
					it( 'should be true when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be false when collapsed selection is not at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* f[]oo'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be false when non-collapsed selection does not start at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* f[oo]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when collapsed selection is at the start of the second list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the second list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* [bar]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection is at start of the nested list', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * []bar'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the nested list', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * [bar]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true when selection starts at the start of the first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection starts at the start of the first list item and spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be false when selection is outside of list', () => {
						_setModelData( model, modelList( [
							'[]foo',
							'* bar',
							'* baz'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true when selection starts in list with positive indent and finishes in list with ' +
					'negative indent', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:50px}',
							'',
							'* ba]r {blockIndentList:-50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection starts in list with negative indent and finishes in list with ' +
					'positive indent', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:-50px}',
							'',
							'* ba]r {blockIndentList:50px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be false in empty editor', () => {
						_setModelData( model, '' );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true when blockIndentList attribute is set using different unit', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentList:5em}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );

			describe( 'execute', () => {
				describe( 'when current indent is not set', () => {
					it( 'should indent list when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo {blockIndentList:40px}'
						] ) );
					} );

					it( 'should indent list when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [fo]o {blockIndentList:40px}'
						] ) );
					} );

					it( 'should indent list when selection starts at the start of first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:40px}',
							'* bar {blockIndentList:40px}',
							'* ba]z {blockIndentList:40px}'
						] ) );
					} );

					it( 'should indent lists when selection starts at the start of first list item and spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:40px}',
							'* bar {blockIndentList:40px}',
							'',
							'* baz] {blockIndentList:40px}'
						] ) );
					} );
				} );

				describe( 'when current indent is positive', () => {
					it( 'should indent list when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentList:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo {blockIndentList:90px}'
						] ) );
					} );

					it( 'should indent list when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o {blockIndentList:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [fo]o {blockIndentList:90px}'
						] ) );
					} );

					it( 'should indent list when selection starts at the start of first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:50px}',
							'* bar {blockIndentList:50px}',
							'* ba]z {blockIndentList:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:90px}',
							'* bar {blockIndentList:90px}',
							'* ba]z {blockIndentList:90px}'
						] ) );
					} );

					it( 'should indent lists when selection starts at the start of first list item and spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:50px}',
							'* bar {blockIndentList:50px}',
							'',
							'* baz] {blockIndentList:70px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:90px}',
							'* bar {blockIndentList:90px}',
							'',
							'* baz] {blockIndentList:110px}'
						] ) );
					} );
				} );

				describe( 'when current indent is negative', () => {
					it( 'should reset indentation to 0 when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentList:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo'
						] ) );
					} );

					it( 'should reset indentation to 0 when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o {blockIndentList:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [fo]o'
						] ) );
					} );

					it( 'should reset indentation to 0 when selection starts at the start of the first list item and ' +
					'spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:-50px}',
							'* bar {blockIndentList:-50px}',
							'* ba]z {blockIndentList:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );
					} );

					it( 'should reset indentation to 0 when selection starts at the start of the first list item and ' +
					'spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:-50px}',
							'* bar {blockIndentList:-50px}',
							'',
							'* baz] {blockIndentList:-70px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );
					} );
				} );

				describe( 'when current indent is set using different unit', () => {
					it( 'should indent list using configured offset and unit when selection is in list using different unit', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentList:5em}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo {blockIndentList:40px}'
						] ) );
					} );
				} );

				describe( 'when there are lists with positive and negative indents in selection', () => {
					it( 'should indent first list (with positive indentation) and reset indentation of ' +
					'second list (negative indentation)', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:50px}',
							'',
							'* ba]r {blockIndentList:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:90px}',
							'',
							'* ba]r'
						] ) );
					} );

					it( 'should reset indentation of first list (with negative indentation) and ' +
					'indent second list (positive indentation)', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:-50px}',
							'',
							'* ba]r {blockIndentList:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo',
							'',
							'* ba]r {blockIndentList:90px}'
						] ) );
					} );
				} );

				describe( 'when command is triggered by keyboard', () => {
					it( 'should indent only first list from the selection', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'',
							'* bar]'
						] ) );

						command.execute( { firstListOnly: true } );

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:40px}',
							'',
							'* bar]'
						] ) );
					} );
				} );
			} );
		} );

		describe( 'using classes', () => {
			beforeEach( () => {
				command = new IndentBlockListCommand( editor, new IndentUsingClasses( {
					direction: 'forward',
					classes: [ 'indent-1', 'indent-2', 'indent-3', 'indent-4' ]
				} ) );

				indentBlockUsingClasses = true;
			} );

			describe( 'isEnabled', () => {
				describe( 'general cases', () => {
					it( 'should be true when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be false when collapsed selection is not at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* f[]oo'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be false when non-collapsed selection does not start at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* f[oo]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when collapsed selection is at the start of the second list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the second list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* [bar]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection is at start of the nested list', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * []bar'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the nested list', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * [bar]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true when selection starts at the start of the first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection starts at the start of the first list item and spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be false when selection is outside of list', () => {
						_setModelData( model, modelList( [
							'[]foo',
							'* bar',
							'* baz'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true when selection starts in list with one class and finishes in list with ' +
					'second class', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:indent-1}',
							'',
							'* ba]r {blockIndentList:indent-2}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection starts in list with third class and finishes in list with ' +
					'fourth class', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:indent-3}',
							'',
							'* ba]r {blockIndentList:indent-4}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be false when selection starts in list with fourth class and finishes in list with ' +
					'third class', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:indent-4}',
							'',
							'* ba]r {blockIndentList:indent-3}'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false in empty editor', () => {
						_setModelData( model, '' );

						expect( command.isEnabled ).to.be.false;
					} );
				} );
			} );

			describe( 'execute', () => {
				describe( 'when current indent is not set', () => {
					it( 'should indent list when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo {blockIndentList:indent-1}'
						] ) );
					} );

					it( 'should indent list when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [fo]o {blockIndentList:indent-1}'
						] ) );
					} );

					it( 'should indent list when selection starts at the start of first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:indent-1}',
							'* bar {blockIndentList:indent-1}',
							'* ba]z {blockIndentList:indent-1}'
						] ) );
					} );

					it( 'should indent lists when selection starts at the start of first list item and spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:indent-1}',
							'* bar {blockIndentList:indent-1}',
							'',
							'* baz] {blockIndentList:indent-1}'
						] ) );
					} );
				} );

				describe( 'when current indent is already set', () => {
					it( 'should indent list when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentList:indent-1}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo {blockIndentList:indent-2}'
						] ) );
					} );

					it( 'should indent list when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o {blockIndentList:indent-1}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [fo]o {blockIndentList:indent-2}'
						] ) );
					} );

					it( 'should indent list when selection starts at the start of first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:indent-1}',
							'* bar {blockIndentList:indent-1}',
							'* ba]z {blockIndentList:indent-1}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:indent-2}',
							'* bar {blockIndentList:indent-2}',
							'* ba]z {blockIndentList:indent-2}'
						] ) );
					} );

					it( 'should indent lists when selection starts at the start of first list item and spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:indent-1}',
							'* bar {blockIndentList:indent-1}',
							'',
							'* baz] {blockIndentList:indent-2}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:indent-2}',
							'* bar {blockIndentList:indent-2}',
							'',
							'* baz] {blockIndentList:indent-3}'
						] ) );
					} );
				} );

				describe( 'when there are lists with third and fourth indents in selection', () => {
					it( 'should indent first list (with third indent) and not affect second list (with fourth indent)', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:indent-3}',
							'',
							'* ba]r {blockIndentList:indent-4}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:indent-4}',
							'',
							'* ba]r {blockIndentList:indent-4}'
						] ) );
					} );
				} );

				describe( 'when command is triggered by keyboard', () => {
					it( 'should indent only first list from the selection', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'',
							'* bar]'
						] ) );

						command.execute( { firstListOnly: true } );

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:indent-1}',
							'',
							'* bar]'
						] ) );
					} );
				} );
			} );
		} );
	} );

	describe( 'outdent', () => {
		describe( 'using offset', () => {
			beforeEach( () => {
				command = new IndentBlockListCommand( editor, new IndentUsingOffset( {
					offset: 40,
					unit: 'px',
					direction: 'backward'
				} ) );
			} );

			describe( 'isEnabled', () => {
				describe( 'general cases', () => {
					it( 'should be false when collapsed selection is not at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* f[]oo'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection does not start at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* f[oo]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when collapsed selection is at the start of the second list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the second list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* [bar]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection is at start of the nested list', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the nested list', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * [bar]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection is outside of list', () => {
						_setModelData( model, modelList( [
							'[]foo',
							'* bar',
							'* baz'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true when collapsed selection is at start of the list using different unit', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentList:5em}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'when current indent is not set', () => {
					it( 'should be false when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection starts at the start of the first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection starts at the start of the first list item and spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );
				} );

				describe( 'when current indent is positive', () => {
					it( 'should be true when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', '50px', item );
						} );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', '50px', item );
						} );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection starts at the start of the first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', '50px', item );
						} );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection starts at the start of the first list item and spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', '50px', item );
						} );

						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'when current indent is negative', () => {
					it( 'should be false when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', '-50px', item );
						} );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', '-50px', item );
						} );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection starts at the start of the first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', '-50px', item );
						} );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection starts at the start of the first list item and spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', '-50px', item );
						} );

						expect( command.isEnabled ).to.be.false;
					} );
				} );
			} );

			describe( 'execute()', () => {
				describe( 'when current indent is positive', () => {
					it( 'should outdent list when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentList:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo {blockIndentList:10px}'
						] ) );
					} );

					it( 'should outdent list when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o {blockIndentList:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [fo]o {blockIndentList:10px}'
						] ) );
					} );

					it( 'should outdent list when selection starts at the start of first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:50px}',
							'* bar {blockIndentList:50px}',
							'* ba]z {blockIndentList:50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:10px}',
							'* bar {blockIndentList:10px}',
							'* ba]z {blockIndentList:10px}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should outdent lists when selection starts at the start of the first list item and spans ' +
					'across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:50px}',
							'* bar {blockIndentList:50px}',
							'',
							'* baz] {blockIndentList:70px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:10px}',
							'* bar {blockIndentList:10px}',
							'',
							'* baz] {blockIndentList:30px}'
						] ) );
					} );
				} );

				describe( 'when current indent is set using different unit', () => {
					it( 'should reset indentation of list to 0 when selection is in list using different unit', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentList:5em}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo'
						] ) );
					} );
				} );

				describe( 'when there are lists with positive and negative indents in selection', () => {
					it( 'should outdent first list (with positive indentation) and reset indentation of ' +
					'second list (negative indentation)', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:50px}',
							'',
							'* ba]r {blockIndentList:-50px}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:10px}',
							'',
							'* ba]r'
						] ) );
					} );
				} );

				describe( 'when command is triggered by keyboard', () => {
					it( 'should outdent only first list from the selection', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:50px}',
							'',
							'* bar] {blockIndentList:50px}'
						] ) );

						command.execute( { firstListOnly: true } );

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:10px}',
							'',
							'* bar] {blockIndentList:50px}'
						] ) );
					} );
				} );
			} );
		} );

		describe( 'using classes', () => {
			beforeEach( () => {
				command = new IndentBlockListCommand( editor, new IndentUsingClasses( {
					direction: 'backward',
					classes: [ 'indent-1', 'indent-2', 'indent-3', 'indent-4' ]
				} ) );

				indentBlockUsingClasses = true;
			} );

			describe( 'isEnabled', () => {
				describe( 'general cases', () => {
					it( 'should be false when collapsed selection is not at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* f[]oo'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection does not start at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* f[oo]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when collapsed selection is at the start of the second list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the second list item', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* [bar]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection is at start of the nested list', () => {
						_setModelData( model, modelList( [
							'* foo',
							'* []bar'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the nested list', () => {
						_setModelData( model, modelList( [
							'* foo',
							'  * [bar]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection is outside of list', () => {
						_setModelData( model, modelList( [
							'[]foo',
							'* bar',
							'* baz'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );
				} );

				describe( 'when current indent is not set', () => {
					it( 'should be false when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection starts at the start of the first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be false when selection starts at the start of the first list item and spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );

						expect( command.isEnabled ).to.be.false;
					} );
				} );

				describe( 'when current indent is set', () => {
					it( 'should be true when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', 'indent-1', item );
						} );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', 'indent-1', item );
						} );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection starts at the start of the first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'* ba]z'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', 'indent-1', item );
						} );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true when selection starts at the start of the first list item and spans across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo',
							'* bar',
							'',
							'* baz]'
						] ) );

						model.change( writer => {
							const item = model.document.getRoot().getChild( 0 );
							writer.setAttribute( 'blockIndentList', 'indent-1', item );
						} );

						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );

			describe( 'execute()', () => {
				describe( 'when current indent is set', () => {
					it( 'should outdent list when collapsed selection is at start of the first list item', () => {
						_setModelData( model, modelList( [
							'* []foo {blockIndentList:indent-2}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* []foo {blockIndentList:indent-1}'
						] ) );
					} );

					it( 'should outdent list when non-collapsed selection starts at the start of the first list item', () => {
						_setModelData( model, modelList( [
							'* [fo]o {blockIndentList:indent-2}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [fo]o {blockIndentList:indent-1}'
						] ) );
					} );

					it( 'should outdent list when selection starts at the start of first list item and spans across multiple items', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:indent-2}',
							'* bar {blockIndentList:indent-2}',
							'* ba]z {blockIndentList:indent-2}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:indent-1}',
							'* bar {blockIndentList:indent-1}',
							'* ba]z {blockIndentList:indent-1}'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should outdent lists when selection starts at the start of the first list item and spans ' +
					'across multiple lists', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:indent-2}',
							'* bar {blockIndentList:indent-2}',
							'',
							'* baz] {blockIndentList:indent-3}'
						] ) );

						command.execute();

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:indent-1}',
							'* bar {blockIndentList:indent-1}',
							'',
							'* baz] {blockIndentList:indent-2}'
						] ) );
					} );
				} );

				describe( 'when command is triggered by keyboard', () => {
					it( 'should outdent only first list from the selection', () => {
						_setModelData( model, modelList( [
							'* [foo {blockIndentList:indent-2}',
							'',
							'* bar] {blockIndentList:indent-2}'
						] ) );

						command.execute( { firstListOnly: true } );

						expect( _getModelData( model ) ).to.equalMarkup( modelList( [
							'* [foo {blockIndentList:indent-1}',
							'',
							'* bar] {blockIndentList:indent-2}'
						] ) );
					} );
				} );
			} );
		} );
	} );
} );
