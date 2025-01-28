/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TodoListEditing from '../../src/todolist/todolistediting.js';
import CheckTodoListCommand from '../../src/todolist/checktodolistcommand.js';

describe( 'CheckTodoListCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, HeadingEditing, TodoListEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new CheckTodoListCommand( editor );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be enabled when collapsed selection is inside to-do list item', () => {
			setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo">f[]oo</paragraph>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled when item is already checked', () => {
			setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[]oo</paragraph>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled when non-collapsed selection is inside to-do list item', () => {
			setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo">f[o]o</paragraph>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be disabled when selection is not inside to-do list item', () => {
			setModelData( model, '<paragraph>f[]oo</paragraph>' );

			expect( command.isEnabled ).to.equal( false );
		} );

		it( 'should be enabled when at least one to-do list item is selected', () => {
			setModelData( model,
				'<paragraph>f[oo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">bar</paragraph>' +
				'<paragraph>ba]z</paragraph>'
			);

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be disabled when no to-do list item is selected', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph>b[ar</paragraph>' +
				'<paragraph>baz</paragraph>' +
				'<paragraph>b]ax</paragraph>'
			);

			expect( command.isEnabled ).to.equal( false );
		} );

		it( 'should be enabled when a to-do list item is selected together with other list items', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo">fo[o</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="todo">b]az</paragraph>'
			);

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled when a to-do list item is selected together with other list items in nested list', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo">fo[o</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="bulleted">bar</paragraph>' +
				'<paragraph listIndent="2" listItemId="a02" listType="todo">b]az</paragraph>'
			);

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled when selection is in paragraph in list item', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">b[]ar</paragraph>'
			);

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled when selection is in heading as a first child of list item', () => {
			setModelData( model,
				'<heading1 listIndent="0" listItemId="a00" listType="todo">f[]oo</heading1>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">bar</paragraph>'
			);

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled when selection is in heading as a second child of list item', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo">bar</paragraph>' +
				'<heading1 listIndent="0" listItemId="a00" listType="todo">f[]oo</heading1>'
			);

			expect( command.isEnabled ).to.equal( true );
		} );
	} );

	describe( 'value', () => {
		it( 'should be false when collapsed selection is in not checked element', () => {
			setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo">f[]oo</paragraph>' );

			expect( command.value ).to.equal( false );
		} );

		it( 'should be false when non-collapsed selection is in not checked element', () => {
			setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo">f[o]o</paragraph>' );

			expect( command.value ).to.equal( false );
		} );

		it( 'should be true when collapsed selection is in checked element', () => {
			setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[]oo</paragraph>' );

			expect( command.value ).to.equal( true );
		} );

		it( 'should be true when non-collapsed selection is in checked element', () => {
			setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[o]o</paragraph>' );

			expect( command.value ).to.equal( true );
		} );

		it( 'should be false when at least one selected element is not checked', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[oo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="todo" todoListChecked="true">b]az</paragraph>'
			);

			expect( command.value ).to.equal( false );
		} );

		it( 'should be true when all selected elements are checked', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[oo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo" todoListChecked="true">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="todo" todoListChecked="true">b]az</paragraph>'
			);

			expect( command.value ).to.equal( true );
		} );

		it( 'should be true when a checked to-do list items are selected together with other list items', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">fo[o</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="todo" todoListChecked="true">b]az</paragraph>'
			);

			expect( command.value ).to.equal( true );
		} );

		it( 'should be true when a to-do list item is selected together with other list items in nested list', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">fo[o</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="bulleted">bar</paragraph>' +
				'<paragraph listIndent="2" listItemId="a02" listType="todo" todoListChecked="true">b]az</paragraph>'
			);

			expect( command.value ).to.equal( true );
		} );

		it( 'should be true when selection is in paragraph', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">b[]ar</paragraph>'
			);

			expect( command.value ).to.equal( true );
		} );

		it( 'should be true when selection is in heading as a first child of checkked list item', () => {
			setModelData( model,
				'<heading1 listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[]oo</heading1>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">bar</paragraph>'
			);

			expect( command.value ).to.equal( true );
		} );

		it( 'should be true when selection is in heading as a second child of checkked list item', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">bar</paragraph>' +
				'<heading1 listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[]oo</heading1>'
			);

			expect( command.value ).to.equal( true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should toggle checked state on to-do list item when collapsed selection is inside this item', () => {
			testCommandToggle(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">f[]oo</paragraph>',
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[]oo</paragraph>'
			);
		} );

		it( 'should toggle checked state on to-do list item when non-collapsed selection is inside this item', () => {
			testCommandToggle(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">f[o]o</paragraph>',
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[o]o</paragraph>'
			);
		} );

		it( 'should toggle state on multiple items', () => {
			testCommandToggle(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo[</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="todo">]baz</paragraph>',

				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">foo[</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo" todoListChecked="true">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="todo" todoListChecked="true">]baz</paragraph>'
			);
		} );

		it( 'should toggle state on multiple items in nested list', () => {
			testCommandToggle(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo[</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="todo">bar</paragraph>' +
				'<paragraph listIndent="2" listItemId="a02" listType="todo">]baz</paragraph>',

				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">foo[</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="todo" todoListChecked="true">bar</paragraph>' +
				'<paragraph listIndent="2" listItemId="a02" listType="todo" todoListChecked="true">]baz</paragraph>'
			);
		} );

		it( 'should toggle state on multiple items mixed with none to-do list items', () => {
			testCommandToggle(
				'<paragraph>a[bc</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="todo">baz</paragraph>' +
				'<paragraph>xy]z</paragraph>',

				'<paragraph>a[bc</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="todo" todoListChecked="true">baz</paragraph>' +
				'<paragraph>xy]z</paragraph>'
			);
		} );

		it( 'should toggle state on multiple items mixed with none to-do list items in nested list', () => {
			testCommandToggle(
				'<paragraph>a[bc</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="bulleted">bar</paragraph>' +
				'<paragraph listIndent="2" listItemId="a02" listType="todo">baz</paragraph>' +
				'<paragraph>xy]z</paragraph>',

				'<paragraph>a[bc</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">foo</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="bulleted">bar</paragraph>' +
				'<paragraph listIndent="2" listItemId="a02" listType="todo" todoListChecked="true">baz</paragraph>' +
				'<paragraph>xy]z</paragraph>'
			);
		} );

		it( 'should toggle state on items if selection is in paragraph', () => {
			testCommandToggle(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">b[]ar</paragraph>',

				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">b[]ar</paragraph>'
			);
		} );

		it( 'should toggle state items at the same level if selection is in paragraph', () => {
			testCommandToggle(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="todo">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">b[]az</paragraph>',

				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">foo</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="todo">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">b[]az</paragraph>'
			);
		} );

		it( 'should toggle state items when selection is in heading as a first child of list item', () => {
			testCommandToggle(
				'<heading1 listIndent="0" listItemId="a00" listType="todo">f[]oo</heading1>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">bar</paragraph>',
				'<heading1 listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[]oo</heading1>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">bar</paragraph>'
			);
		} );

		it( 'should toggle state items when selection is in heading as a second child of list item', () => {
			testCommandToggle(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">bar</paragraph>' +
				'<heading1 listIndent="0" listItemId="a00" listType="todo">f[]oo</heading1>',
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">bar</paragraph>' +
				'<heading1 listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[]oo</heading1>'
			);
		} );

		it( 'should toggle state items when selection is in heading as a second child of nested list item', () => {
			testCommandToggle(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="todo">bar</paragraph>' +
				'<heading1 listIndent="0" listItemId="a00" listType="todo">b[]az</heading1>',
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">foo</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="todo">bar</paragraph>' +
				'<heading1 listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">b[]az</heading1>'
			);
		} );

		it( 'should mark all selected items as checked when at least one selected item is not checked', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo[</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo" todoListChecked="true">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="todo">]baz</paragraph>'
			);

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">foo[</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo" todoListChecked="true">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="todo" todoListChecked="true">]baz</paragraph>'
			);
		} );

		it( 'should mark all selected items as checked when at least one selected item is not checked in nested list', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo[</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="todo" todoListChecked="true">bar</paragraph>' +
				'<paragraph listIndent="2" listItemId="a02" listType="todo">]baz</paragraph>'
			);

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">foo[</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="todo" todoListChecked="true">bar</paragraph>' +
				'<paragraph listIndent="2" listItemId="a02" listType="todo" todoListChecked="true">]baz</paragraph>'
			);
		} );

		it( 'should do nothing when there are no elements to toggle attribute', () => {
			setModelData( model, '<paragraph>b[]ar</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal( '<paragraph>b[]ar</paragraph>' );
		} );

		it( 'should set attribute if `forceValue` parameter is set to `true`', () => {
			setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[]oo</paragraph>' );

			command.execute( { forceValue: true } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">f[]oo</paragraph>'
			);
		} );

		it( 'should remove attribute if `forceValue` parameter is set to `false`', () => {
			setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo">f[]oo</paragraph>' );

			command.execute( { forceValue: false } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">f[]oo</paragraph>'
			);
		} );

		function testCommandToggle( initialData, changedData ) {
			setModelData( model, initialData );

			command.execute();

			expect( getModelData( model ) ).to.equal( changedData );

			command.execute();

			expect( getModelData( model ) ).to.equal( initialData );
		}
	} );
} );
