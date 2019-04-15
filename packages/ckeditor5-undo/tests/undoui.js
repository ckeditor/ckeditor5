/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import UndoEditing from '../src/undoediting';
import UndoUI from '../src/undoui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

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
