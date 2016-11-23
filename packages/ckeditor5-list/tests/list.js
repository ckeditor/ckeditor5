/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from 'tests/core/_utils/classictesteditor.js';
import List from 'ckeditor5/list/list.js';
import Paragraph from 'ckeditor5/paragraph/paragraph.js';
import ListEngine from 'ckeditor5/list/listengine.js';
import ButtonView from 'ckeditor5/ui/button/buttonview.js';
import { getCode } from 'ckeditor5/utils/keyboard.js';

describe( 'List', () => {
	let editor, bulletedListButton, numberedListButton, schema;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, List ]
		} )
			.then( newEditor => {
				editor = newEditor;
				schema = editor.document.schema;

				bulletedListButton = editor.ui.componentFactory.create( 'bulletedList' );
				numberedListButton = editor.ui.componentFactory.create( 'numberedList' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( List ) ).to.be.instanceOf( List );
	} );

	it( 'should load ListEngine', () => {
		expect( editor.plugins.get( ListEngine ) ).to.be.instanceOf( ListEngine );
	} );

	it( 'should set up keys for bulleted list and numbered list', () => {
		expect( bulletedListButton ).to.be.instanceOf( ButtonView );
		expect( numberedListButton ).to.be.instanceOf( ButtonView );
	} );

	it( 'should execute proper commands when buttons are used', () => {
		sinon.spy( editor, 'execute' );

		bulletedListButton.fire( 'execute' );
		expect( editor.execute.calledWithExactly( 'bulletedList' ) );

		numberedListButton.fire( 'execute' );
		expect( editor.execute.calledWithExactly( 'numberedList' ) );
	} );

	it( 'should bind bulleted list button model to bulledList command', () => {
		editor.setData( '<ul><li>foo</li></ul>' );
		// Collapsing selection in model, which has just flat listItems.
		editor.document.selection.collapse( editor.document.getRoot().getChild( 0 ) );

		const command = editor.commands.get( 'bulletedList' );

		expect( bulletedListButton.isOn ).to.be.true;
		expect( bulletedListButton.isEnabled ).to.be.true;

		command.value = false;
		expect( bulletedListButton.isOn ).to.be.false;

		command.isEnabled = false;
		expect( bulletedListButton.isEnabled ).to.be.false;
	} );

	it( 'should bind numbered list button model to numberedList command', () => {
		editor.setData( '<ul><li>foo</li></ul>' );
		// Collapsing selection in model, which has just flat listItems.
		editor.document.selection.collapse( editor.document.getRoot().getChild( 0 ) );

		const command = editor.commands.get( 'numberedList' );

		// We are in UL, so numbered list is off.
		expect( numberedListButton.isOn ).to.be.false;
		expect( numberedListButton.isEnabled ).to.be.true;

		command.value = true;
		expect( numberedListButton.isOn ).to.be.true;

		command.isEnabled = false;
		expect( numberedListButton.isEnabled ).to.be.false;
	} );

	describe( 'enter key handling callback', () => {
		it( 'should execute outdentList command on enter key in empty list', () => {
			const domEvtDataStub = { preventDefault() {} };

			sinon.spy( editor, 'execute' );

			editor.setData( '<ul><li></li></ul>' );
			// Collapsing selection in model, which has just flat listItems.
			editor.document.selection.collapse( editor.document.getRoot().getChild( 0 ) );

			editor.editing.view.fire( 'enter', domEvtDataStub );

			expect( editor.execute.calledOnce ).to.be.true;
			expect( editor.execute.calledWithExactly( 'outdentList' ) );
		} );

		it( 'should not execute outdentList command on enter key in non-empty list', () => {
			const domEvtDataStub = { preventDefault() {} };

			sinon.spy( editor, 'execute' );

			editor.setData( '<ul><li>foobar</li></ul>' );
			// Collapsing selection in model, which has just flat listItems.
			editor.document.selection.collapse( editor.document.getRoot().getChild( 0 ) );

			editor.editing.view.fire( 'enter', domEvtDataStub );

			expect( editor.execute.called ).to.be.false;
		} );
	} );

	describe( 'tab key handling callback', () => {
		let domEvtDataStub;

		beforeEach( () => {
			domEvtDataStub = {
				keystroke: getCode( 'tab' ),
				preventDefault() {}
			};

			sinon.spy( editor, 'execute' );
		} );

		afterEach( () => {
			editor.execute.restore();
		} );

		it( 'should execute indentList command on tab key', () => {
			editor.setData( '<ul><li>foo</li><li>bar</li></ul>' );
			// Collapsing selection in model, which has just flat listItems.
			editor.document.selection.collapse( editor.document.getRoot().getChild( 1 ) );

			editor.editing.view.fire( 'keydown', domEvtDataStub );

			expect( editor.execute.calledOnce ).to.be.true;
			expect( editor.execute.calledWithExactly( 'indentList' ) ).to.be.true;
		} );

		it( 'should execute indentList command on tab key for non-collapsed selection and indent only first item', () => {
			editor.setData( '<ul><li>foo</li><li>bar</li><li>xyz</li></ul>' );
			editor.document.selection.collapse( editor.document.getRoot().getChild( 1 ) );
			editor.document.selection.setFocus( editor.document.getRoot().getChild( 2 ) );

			editor.editing.view.fire( 'keydown', domEvtDataStub );

			expect( editor.execute.calledOnce ).to.be.true;
			expect( editor.execute.calledWithExactly( 'indentList' ) ).to.be.true;
			expect( editor.getData() ).to.equal( '<ul><li>foo<ul><li>bar</li></ul></li><li>xyz</li></ul>' );
		} );

		it( 'should execute outdentList command on shift+tab keystroke', () => {
			domEvtDataStub.keystroke += getCode( 'shift' );

			editor.setData( '<ul><li>foo<ul><li>bar</li></ul></li></ul>' );
			// Collapsing selection in model, which has just flat listItems.
			editor.document.selection.collapse( editor.document.getRoot().getChild( 1 ) );

			editor.editing.view.fire( 'keydown', domEvtDataStub );

			expect( editor.execute.calledOnce ).to.be.true;
			expect( editor.execute.calledWithExactly( 'outdentList' ) ).to.be.true;
		} );

		it( 'should not indent if command is disabled', () => {
			editor.setData( '<ul><li>foo</li></ul>' );
			// Collapsing selection in model, which has just flat listItems.
			editor.document.selection.collapse( editor.document.getRoot().getChild( 0 ) );

			editor.editing.view.fire( 'keydown', domEvtDataStub );

			expect( editor.execute.called ).to.be.false;
		} );

		it( 'should not indent or outdent if alt+tab is pressed', () => {
			domEvtDataStub.keystroke += getCode( 'alt' );

			editor.setData( '<ul><li>foo</li></ul>' );
			// Collapsing selection in model, which has just flat listItems.
			editor.document.selection.collapse( editor.document.getRoot().getChild( 0 ) );

			editor.editing.view.fire( 'keydown', domEvtDataStub );

			expect( editor.execute.called ).to.be.false;
		} );
	} );
} );
