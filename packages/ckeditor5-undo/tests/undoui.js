/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import UndoEditing from '../src/undoediting';
import UndoUI from '../src/undoui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import undoIcon from '../theme/icons/undo.svg';
import redoIcon from '../theme/icons/redo.svg';

describe( 'UndoUI', () => {
	let editor, editorElement;

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

	testButton( 'undo', 'Undo', 'CTRL+Z' );
	testButton( 'redo', 'Redo', 'CTRL+Y' );

	describe( 'icons', () => {
		describe( 'left–to–right UI', () => {
			it( 'should display the right icon for undo', () => {
				const undoButton = editor.ui.componentFactory.create( 'undo' );

				expect( undoButton.icon ).to.equal( undoIcon );
			} );

			it( 'should display the right icon for redo', () => {
				const redoButton = editor.ui.componentFactory.create( 'redo' );

				expect( redoButton.icon ).to.equal( redoIcon );
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

						expect( undoButton.icon ).to.equal( redoIcon );

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

						expect( redoButton.icon ).to.equal( undoIcon );

						return newEditor.destroy();
					} )
					.then( () => {
						element.remove();
					} );
			} );
		} );
	} );

	function testButton( featureName, label, featureKeystroke ) {
		describe( `${ featureName } button`, () => {
			let button;

			beforeEach( () => {
				button = editor.ui.componentFactory.create( featureName );
			} );

			it( 'should register feature component', () => {
				expect( button ).to.be.instanceOf( ButtonView );
			} );

			it( 'should create UI component with correct attribute values', () => {
				expect( button.isOn ).to.be.false;
				expect( button.label ).to.equal( label );
				expect( button.icon ).to.match( /<svg / );
				expect( button.keystroke ).to.equal( featureKeystroke );
			} );

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
		} );
	}
} );
