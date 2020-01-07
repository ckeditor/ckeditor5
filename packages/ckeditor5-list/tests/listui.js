/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ListEditing from '../src/listediting';
import ListUI from '../src/listui';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ListUI', () => {
	let editorElement, editor, model, bulletedListButton, numberedListButton;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, { plugins: [ Paragraph, BlockQuote, ListEditing, ListUI ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				bulletedListButton = editor.ui.componentFactory.create( 'bulletedList' );
				numberedListButton = editor.ui.componentFactory.create( 'numberedList' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListUI ) ).to.be.instanceOf( ListUI );
	} );

	it( 'should set up buttons for bulleted list and numbered list', () => {
		expect( bulletedListButton ).to.be.instanceOf( ButtonView );
		expect( bulletedListButton.isToggleable ).to.be.true;

		expect( numberedListButton ).to.be.instanceOf( ButtonView );
		expect( numberedListButton.isToggleable ).to.be.true;
	} );

	it( 'should execute proper commands when buttons are used', () => {
		sinon.spy( editor, 'execute' );

		bulletedListButton.fire( 'execute' );
		sinon.assert.calledWithExactly( editor.execute, 'bulletedList' );

		numberedListButton.fire( 'execute' );
		sinon.assert.calledWithExactly( editor.execute, 'numberedList' );
	} );

	it( 'should bind bulleted list button model to bulledList command', () => {
		setData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

		const command = editor.commands.get( 'bulletedList' );

		expect( bulletedListButton.isOn ).to.be.true;
		expect( bulletedListButton.isEnabled ).to.be.true;

		command.value = false;
		expect( bulletedListButton.isOn ).to.be.false;

		command.isEnabled = false;
		expect( bulletedListButton.isEnabled ).to.be.false;
	} );

	it( 'should bind numbered list button model to numberedList command', () => {
		setData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

		const command = editor.commands.get( 'numberedList' );

		// We are in UL, so numbered list is off.
		expect( numberedListButton.isOn ).to.be.false;
		expect( numberedListButton.isEnabled ).to.be.true;

		command.value = true;
		expect( numberedListButton.isOn ).to.be.true;

		command.isEnabled = false;
		expect( numberedListButton.isEnabled ).to.be.false;
	} );
} );
