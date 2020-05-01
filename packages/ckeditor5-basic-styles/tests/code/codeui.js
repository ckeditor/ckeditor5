/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import CodeEditing from '../../src/code/codeediting';
import CodeUI from '../../src/code/codeui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'CodeUI', () => {
	let editor, codeView, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, CodeEditing, CodeUI ]
			} )
			.then( newEditor => {
				editor = newEditor;

				codeView = editor.ui.componentFactory.create( 'code' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should register code feature component', () => {
		expect( codeView ).to.be.instanceOf( ButtonView );
		expect( codeView.isOn ).to.be.false;
		expect( codeView.label ).to.equal( 'Code' );
		expect( codeView.icon ).to.match( /<svg / );
		expect( codeView.isToggleable ).to.be.true;
	} );

	it( 'should execute code command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		codeView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'code' );
	} );

	it( 'should bind model to code command', () => {
		const command = editor.commands.get( 'code' );

		expect( codeView.isOn ).to.be.false;
		expect( codeView.isEnabled ).to.be.true;

		command.value = true;
		expect( codeView.isOn ).to.be.true;

		command.isEnabled = false;
		expect( codeView.isEnabled ).to.be.false;
	} );
} );
