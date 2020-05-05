/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import TodoListEditing from '../src/todolistediting';
import TodoListUI from '../src/todolistui';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'TodoListUI', () => {
	let editorElement, editor, model, button;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, { plugins: [ Paragraph, TodoListEditing, TodoListUI ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				button = editor.ui.componentFactory.create( 'todoList' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should set up buttons for bulleted list and numbered list', () => {
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
