/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import RestrictedDocumentUI from '../src/restricteddocumentui';
import RestrictedDocument from '../src/restricteddocument';

describe( 'RestrictedDocumentUI', () => {
	let editor, buttonView;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, RestrictedDocument, RestrictedDocumentUI ]
			} )
			.then( newEditor => {
				editor = newEditor;

				buttonView = editor.ui.componentFactory.create( 'nonRestricted' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should register button', () => {
		expect( buttonView ).to.be.instanceOf( ButtonView );
		expect( buttonView.isOn ).to.be.false;
		expect( buttonView.label ).to.equal( 'Restricted editing' );
		expect( buttonView.icon ).to.match( /<svg / );
		expect( buttonView.isToggleable ).to.be.true;
	} );

	it( 'should execute command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		buttonView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
	} );

	it( 'should bind model to command', () => {
		const command = editor.commands.get( 'nonRestricted' );

		expect( buttonView.isOn ).to.be.false;
		expect( buttonView.isEnabled ).to.be.true;

		command.value = true;
		expect( buttonView.isOn ).to.be.true;

		command.isEnabled = false;
		expect( buttonView.isEnabled ).to.be.false;
	} );
} );
