/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import StandardEditingModeUI from '../src/standardeditingmodeui.js';
import StandardEditingModeEditing from '../src/standardeditingmodeediting.js';

describe( 'StandardEditingModeUI', () => {
	let editor, buttonView, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, StandardEditingModeEditing, StandardEditingModeUI ]
		} );

		buttonView = editor.ui.componentFactory.create( 'restrictedEditingException' );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should register a button', () => {
		expect( buttonView ).to.be.instanceOf( ButtonView );
		expect( buttonView.isOn ).to.be.false;
		expect( buttonView.label ).to.equal( 'Enable editing' );
		expect( buttonView.icon ).to.match( /<svg / );
		expect( buttonView.isToggleable ).to.be.true;
	} );

	it( 'should execute a command on the button "execute" event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		buttonView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
	} );

	it( 'should bind a button to the command', () => {
		const command = editor.commands.get( 'restrictedEditingException' );

		expect( buttonView.isOn ).to.be.false;
		expect( buttonView.isEnabled ).to.be.true;

		command.value = true;
		expect( buttonView.isOn ).to.be.true;

		command.isEnabled = false;
		expect( buttonView.isEnabled ).to.be.false;
	} );
} );
