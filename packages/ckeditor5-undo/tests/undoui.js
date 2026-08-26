/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconUndo, IconRedo } from '@ckeditor/ckeditor5-icons';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { UndoEditing } from '../src/undoediting.js';
import { UndoUI } from '../src/undoui.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe( 'UndoUI', () => {
	let editor, editorElement, button;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, { plugins: [ UndoEditing, UndoUI ] } )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( UndoUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( UndoUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar', () => {
		describe( 'undo button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'undo' );
			} );

			testButton( 'undo', 'Undo', 'CTRL+Z', ButtonView );

			it( 'should have tooltip', () => {
				expect( button.tooltip ).toBe( true );
			} );
		} );

		describe( 'redo button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'redo' );
			} );

			testButton( 'redo', 'Redo', 'CTRL+Y', ButtonView );

			it( 'should have tooltip', () => {
				expect( button.tooltip ).toBe( true );
			} );
		} );
	} );

	describe( 'menu bar', () => {
		describe( 'undo button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'menuBar:undo' );
			} );

			testButton( 'undo', 'Undo', 'CTRL+Z', MenuBarMenuListItemButtonView );
		} );

		describe( 'redo button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'menuBar:redo' );
			} );

			testButton( 'redo', 'Redo', 'CTRL+Y', MenuBarMenuListItemButtonView );
		} );
	} );

	describe( 'icons', () => {
		describe( 'left–to–right UI', () => {
			it( 'should display the right icon for undo', () => {
				const undoButton = editor.ui.componentFactory.create( 'undo' );

				expect( undoButton.icon ).toEqual( IconUndo );
			} );

			it( 'should display the right icon for redo', () => {
				const redoButton = editor.ui.componentFactory.create( 'redo' );

				expect( redoButton.icon ).toEqual( IconRedo );
			} );
		} );

		describe( 'right–to–left UI', () => {
			it( 'should display the right icon for undo', () => {
				const element = document.createElement( 'div' );
				document.body.appendChild( element );

				return ClassicTestEditor
					.create( element, {
						plugins: [ UndoEditing, UndoUI ],
						language: 'ar'
					} )
					.then( newEditor => {
						const undoButton = newEditor.ui.componentFactory.create( 'undo' );

						expect( undoButton.icon ).toEqual( IconRedo );

						return newEditor.destroy();
					} )
					.then( () => {
						element.remove();
					} );
			} );

			it( 'should display the right icon for redo', () => {
				const element = document.createElement( 'div' );
				document.body.appendChild( element );

				return ClassicTestEditor
					.create( element, {
						plugins: [ UndoEditing, UndoUI ],
						language: 'ar'
					} )
					.then( newEditor => {
						const redoButton = newEditor.ui.componentFactory.create( 'redo' );

						expect( redoButton.icon ).toEqual( IconUndo );

						return newEditor.destroy();
					} )
					.then( () => {
						element.remove();
					} );
			} );
		} );
	} );

	function testButton( featureName, label, featureKeystroke, Component ) {
		it( 'should register feature component', () => {
			expect( button ).to.be.instanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).toBe( false );
			expect( button.label ).toEqual( label );
			expect( button.icon ).toMatch( /<svg / ); } );

		it( `should execute ${ featureName } command on model execute event`, () => {
			const executeSpy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );

			button.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledTimes( 1 );
			expect( executeSpy ).toHaveBeenCalledWith( featureName );
		} );

		it( `should bind model to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			expect( button.isOn ).toBe( false );

			const initState = command.isEnabled;
			expect( button.isEnabled ).toEqual( initState );

			command.isEnabled = !initState;
			expect( button.isEnabled ).toEqual( !initState );
		} );

		it( 'should set keystroke in the model', () => {
			expect( button.keystroke ).toEqual( featureKeystroke );
		} );
	}
} );
