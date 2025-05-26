/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// TODO use new list
import LegacyTodoListEditing from '../../src/legacytodolist/legacytodolistediting.js';
import TodoListUI from '../../src/todolist/todolistui.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'TodoListUI', () => {
	let editorElement, editor, model;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, { plugins: [ Paragraph, LegacyTodoListEditing, TodoListUI ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TodoListUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TodoListUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'toolbar button', () => {
		let button;

		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'todoList' );
		} );

		it( 'should be a button', () => {
			expect( button ).to.be.instanceOf( ButtonView );
		} );

		it( 'should execute proper commands when buttons are used', () => {
			sinon.spy( editor, 'execute' );

			button.fire( 'execute' );
			sinon.assert.calledWithExactly( editor.execute, 'todoList' );
		} );

		it( 'should bind button to command', () => {
			setData( model, '<listItem listType="todo" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'todoList' );

			expect( button.isOn ).to.be.true;
			expect( button.isEnabled ).to.be.true;

			command.value = false;
			expect( button.isOn ).to.be.false;

			command.isEnabled = false;
			expect( button.isEnabled ).to.be.false;
		} );
	} );

	describe( 'menu bar button', () => {
		let button;

		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:todoList' );
		} );

		it( 'should be a button', () => {
			expect( button ).to.be.instanceOf( MenuBarMenuListItemButtonView );
		} );

		it( 'should execute proper commands when buttons are used', () => {
			sinon.spy( editor, 'execute' );

			button.fire( 'execute' );
			sinon.assert.calledWithExactly( editor.execute, 'todoList' );
		} );

		it( 'should bind button to command', () => {
			setData( model, '<listItem listType="todo" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'todoList' );

			expect( button.isOn ).to.be.true;
			expect( button.isEnabled ).to.be.true;

			command.value = false;
			expect( button.isOn ).to.be.false;

			command.isEnabled = false;
			expect( button.isEnabled ).to.be.false;
		} );
	} );
} );
