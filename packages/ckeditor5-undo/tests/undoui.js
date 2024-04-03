/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import { icons } from '@ckeditor/ckeditor5-core';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import UndoEditing from '../src/undoediting.js';
import UndoUI from '../src/undoui.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import MenuBarMenuListItemButtonView from '@ckeditor/ckeditor5-ui/src/menubar/menubarmenulistitembuttonview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'UndoUI', () => {
	let editor, editorElement, button;

	testUtils.createSinonSandbox();

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

	describe( 'toolbar', () => {
		describe( 'undo button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'undo' );
			} );

			testButton( 'undo', 'Undo', 'CTRL+Z', ButtonView );

			it( 'should have tooltip', () => {
				expect( button.tooltip ).to.be.true;
			} );
		} );

		describe( 'redo button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'redo' );
			} );

			testButton( 'redo', 'Redo', 'CTRL+Y', ButtonView );

			it( 'should have tooltip', () => {
				expect( button.tooltip ).to.be.true;
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

				expect( undoButton.icon ).to.equal( icons.undo );
			} );

			it( 'should display the right icon for redo', () => {
				const redoButton = editor.ui.componentFactory.create( 'redo' );

				expect( redoButton.icon ).to.equal( icons.redo );
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

						expect( undoButton.icon ).to.equal( icons.redo );

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

						expect( redoButton.icon ).to.equal( icons.undo );

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
			expect( button.isOn ).to.be.false;
			expect( button.label ).to.equal( label );
			expect( button.icon ).to.match( /<svg / ); } );

		it( `should execute ${ featureName } command on model execute event`, () => {
			const executeSpy = testUtils.sinon.stub( editor, 'execute' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, featureName );
		} );

		it( `should bind model to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			expect( button.isOn ).to.be.false;

			const initState = command.isEnabled;
			expect( button.isEnabled ).to.equal( initState );

			command.isEnabled = !initState;
			expect( button.isEnabled ).to.equal( !initState );
		} );

		it( 'should set keystroke in the model', () => {
			expect( button.keystroke ).to.equal( featureKeystroke );
		} );
	}
} );
