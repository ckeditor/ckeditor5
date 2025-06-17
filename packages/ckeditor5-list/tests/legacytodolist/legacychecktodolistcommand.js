/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { LegacyTodoListEditing } from '../../src/legacytodolist/legacytodolistediting.js';
import { LegacyCheckTodoListCommand } from '../../src/legacytodolist/legacychecktodolistcommand.js';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

describe( 'LegacyCheckTodoListCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, LegacyTodoListEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new LegacyCheckTodoListCommand( editor );
			} );
	} );

	describe( 'value', () => {
		it( 'should be false when selection is in not checked element', () => {
			_setModelData( model, '<listItem listIndent="0" listType="todo">ab[]c</listItem>' );

			expect( command.value ).to.equal( false );
		} );

		it( 'should be true when selection is in checked element', () => {
			_setModelData( model, '<listItem listIndent="0" listType="todo" todoListChecked="true">ab[]c</listItem>' );

			expect( command.value ).to.equal( true );
		} );

		it( 'should be false when at least one selected element is not checked', () => {
			_setModelData( model,
				'<listItem listIndent="0" listType="todo" todoListChecked="true">ab[c</listItem>' +
				'<paragraph>abc</paragraph>' +
				'<listItem listIndent="0" listType="todo">abc</listItem>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">ab]c</listItem>'
			);

			expect( command.value ).to.equal( false );
		} );

		it( 'should be true when all selected elements are checked', () => {
			_setModelData( model,
				'<listItem listIndent="0" listType="todo" todoListChecked="true">ab[c</listItem>' +
				'<paragraph>abc</paragraph>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">abc</listItem>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">ab]c</listItem>'
			);

			expect( command.value ).to.equal( true );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be enabled when selection is inside to-do list item', () => {
			_setModelData( model, '<listItem listIndent="0" listType="todo">a[b]c</listItem>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be disabled when selection is not inside to-do list item', () => {
			_setModelData( model, '<paragraph>a[b]c</paragraph>' );

			expect( command.isEnabled ).to.equal( false );
		} );

		it( 'should be enabled when at least one to-do list item is selected', () => {
			_setModelData( model,
				'<paragraph>a[bc</paragraph>' +
				'<listItem listIndent="0" listType="todo">abc</listItem>' +
				'<paragraph>ab]c</paragraph>'
			);

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled when none to-do list item is selected', () => {
			_setModelData( model,
				'<paragraph>a[bc</paragraph>' +
				'<paragraph>abc</paragraph>' +
				'<paragraph>a]bc</paragraph>'
			);

			expect( command.isEnabled ).to.equal( false );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should toggle checked state on to-do list item when collapsed selection is inside this item', () => {
			_setModelData( model, '<listItem listIndent="0" listType="todo">b[]ar</listItem>' );

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="todo" todoListChecked="true">b[]ar</listItem>'
			);

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="todo">b[]ar</listItem>'
			);
		} );

		it( 'should toggle checked state on to-do list item when non-collapsed selection is inside this item', () => {
			_setModelData( model, '<listItem listIndent="0" listType="todo">b[a]r</listItem>' );

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="todo" todoListChecked="true">b[a]r</listItem>'
			);

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="todo">b[a]r</listItem>'
			);
		} );

		it( 'should toggle state on multiple items', () => {
			_setModelData( model,
				'<listItem listIndent="0" listType="todo">abc[</listItem>' +
				'<listItem listIndent="0" listType="todo">def</listItem>' +
				'<listItem listIndent="0" listType="todo">]ghi</listItem>'
			);

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="todo" todoListChecked="true">abc[</listItem>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">def</listItem>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">]ghi</listItem>'
			);

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="todo">abc[</listItem>' +
				'<listItem listIndent="0" listType="todo">def</listItem>' +
				'<listItem listIndent="0" listType="todo">]ghi</listItem>'
			);
		} );

		it( 'should toggle state on multiple items mixed with none to-do list items', () => {
			_setModelData( model,
				'<paragraph>a[bc</paragraph>' +
				'<listItem listIndent="0" listType="todo">def</listItem>' +
				'<listItem listIndent="0" listType="numbered">ghi</listItem>' +
				'<listItem listIndent="0" listType="todo">jkl</listItem>' +
				'<paragraph>mn]o</paragraph>'
			);

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>a[bc</paragraph>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">def</listItem>' +
				'<listItem listIndent="0" listType="numbered">ghi</listItem>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">jkl</listItem>' +
				'<paragraph>mn]o</paragraph>'
			);

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>a[bc</paragraph>' +
				'<listItem listIndent="0" listType="todo">def</listItem>' +
				'<listItem listIndent="0" listType="numbered">ghi</listItem>' +
				'<listItem listIndent="0" listType="todo">jkl</listItem>' +
				'<paragraph>mn]o</paragraph>'
			);
		} );

		it( 'should mark all selected items as checked when at least one selected item is not checked', () => {
			_setModelData( model,
				'<listItem listIndent="0" listType="todo">abc[</listItem>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">def</listItem>' +
				'<listItem listIndent="0" listType="todo">]ghi</listItem>'
			);

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="todo" todoListChecked="true">abc[</listItem>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">def</listItem>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">]ghi</listItem>'
			);
		} );

		it( 'should do nothing when there is no elements to toggle attribute', () => {
			_setModelData( model, '<paragraph>b[]ar</paragraph>' );

			command.execute();

			expect( _getModelData( model ) ).to.equal( '<paragraph>b[]ar</paragraph>' );
		} );

		it( 'should be up to date just before execution', () => {
			_setModelData( model,
				'<listItem listIndent="0" listType="0">f[]oo</listItem>' +
				'<listItem listIndent="0" listType="0">bar</listItem>'
			);

			model.change( writer => {
				writer.setSelection( model.document.getRoot().getChild( 1 ), 'end' );
				command.execute();
			} );
		} );

		it( 'should set attribute if `forceValue` parameter is set to `true`', () => {
			_setModelData( model, '<listItem listIndent="0" listType="todo" todoListChecked="true">b[]ar</listItem>' );

			command.execute( { forceValue: true } );

			expect( _getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="todo" todoListChecked="true">b[]ar</listItem>'
			);
		} );

		it( 'should remove attribute if `forceValue` parameter is set to `false`', () => {
			_setModelData( model, '<listItem listIndent="0" listType="todo">b[]ar</listItem>' );

			command.execute( { forceValue: false } );

			expect( _getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="todo">b[]ar</listItem>'
			);
		} );
	} );
} );
