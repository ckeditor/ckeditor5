/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import BoldEditing from '../../src/bold/boldediting.js';
import BoldUI from '../../src/bold/boldui.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

describe( 'BoldUI', () => {
	let editor, boldView, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, BoldEditing, BoldUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			boldView = editor.ui.componentFactory.create( 'bold' );
		} );

		testButton();

		it( 'should bind `isOn` to bold command', () => {
			const command = editor.commands.get( 'bold' );

			expect( boldView.isOn ).to.be.false;

			command.value = true;
			expect( boldView.isOn ).to.be.true;
		} );
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			boldView = editor.ui.componentFactory.create( 'menuBar:bold' );
		} );

		testButton();
	} );

	function testButton() {
		it( 'should register bold feature component', () => {
			expect( boldView ).to.be.instanceOf( ButtonView );
			expect( boldView.isOn ).to.be.false;
			expect( boldView.label ).to.equal( 'Bold' );
			expect( boldView.icon ).to.match( /<svg / );
			expect( boldView.keystroke ).to.equal( 'CTRL+B' );
			expect( boldView.isToggleable ).to.be.true;
		} );

		it( 'should execute bold command on model execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			boldView.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'bold' );
		} );

		it( 'should bind `isEnabled` to bold command', () => {
			const command = editor.commands.get( 'bold' );

			expect( boldView.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( boldView.isEnabled ).to.be.false;
		} );

		it( 'should set keystroke in the model', () => {
			expect( boldView.keystroke ).to.equal( 'CTRL+B' );
		} );
	}
} );
