/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// TODO use new list
import { LegacyTodoListEditing } from '../../src/legacytodolist/legacytodolistediting.js';
import { TodoListUI } from '../../src/todolist/todolistui.js';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

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
		expect( TodoListUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TodoListUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar button', () => {
		let button;

		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'todoList' );
		} );

		it( 'should be a button', () => {
			expect( button ).toBeInstanceOf( ButtonView );
		} );

		it( 'should execute proper commands when buttons are used', () => {
			const spy = vi.spyOn( editor, 'execute' );

			button.fire( 'execute' );
			expect( spy ).toHaveBeenCalledExactlyOnceWith( 'todoList' );
		} );

		it( 'should bind button to command', () => {
			_setModelData( model, '<listItem listType="todo" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'todoList' );

			expect( button.isOn ).toBe( true );
			expect( button.isEnabled ).toBe( true );

			command.value = false;
			expect( button.isOn ).toBe( false );

			command.isEnabled = false;
			expect( button.isEnabled ).toBe( false );
		} );
	} );

	describe( 'menu bar button', () => {
		let button;

		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:todoList' );
		} );

		it( 'should be a button', () => {
			expect( button ).toBeInstanceOf( MenuBarMenuListItemButtonView );
		} );

		it( 'should execute proper commands when buttons are used', () => {
			const spy = vi.spyOn( editor, 'execute' );

			button.fire( 'execute' );
			expect( spy ).toHaveBeenCalledExactlyOnceWith( 'todoList' );
		} );

		it( 'should bind button to command', () => {
			_setModelData( model, '<listItem listType="todo" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'todoList' );

			expect( button.isOn ).toBe( true );
			expect( button.isEnabled ).toBe( true );

			command.value = false;
			expect( button.isOn ).toBe( false );

			command.isEnabled = false;
			expect( button.isEnabled ).toBe( false );
		} );
	} );
} );
