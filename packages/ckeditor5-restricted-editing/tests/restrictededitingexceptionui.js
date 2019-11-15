/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import RestrictedEditingExceptionUI from '../src/restrictededitingexceptionui';
import RestrictedEditingException from '../src/restrictededitingexception';

describe( 'RestrictedEditingExceptionUI', () => {
	let editor, buttonView;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, RestrictedEditingException, RestrictedEditingExceptionUI ]
		} );

		buttonView = editor.ui.componentFactory.create( 'restrictedEditingException' );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should register button', () => {
		expect( buttonView ).to.be.instanceOf( ButtonView );
		expect( buttonView.isOn ).to.be.false;
		expect( buttonView.label ).to.equal( 'Enable editing' );
		expect( buttonView.icon ).to.match( /<svg / );
		expect( buttonView.isToggleable ).to.be.true;
	} );

	it( 'should execute command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		buttonView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
	} );

	it( 'should bind model to command', () => {
		const command = editor.commands.get( 'restrictedEditingException' );

		expect( buttonView.isOn ).to.be.false;
		expect( buttonView.isEnabled ).to.be.true;

		command.value = true;
		expect( buttonView.isOn ).to.be.true;

		command.isEnabled = false;
		expect( buttonView.isEnabled ).to.be.false;
	} );
} );
