/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import List from '../src/list';
import ListEngine from '../src/listengine';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'List', () => {
	let editor, model, bulletedListButton, numberedListButton;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, { plugins: [ Paragraph, BlockQuote, List ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

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
		sinon.assert.calledWithExactly( editor.execute, 'bulletedList' );

		numberedListButton.fire( 'execute' );
		sinon.assert.calledWithExactly( editor.execute, 'numberedList' );
	} );

	it( 'should bind bulleted list button model to bulledList command', () => {
		setData( model, '<listItem type="bulleted" indent="0">[]foo</listItem>' );

		const command = editor.commands.get( 'bulletedList' );

		expect( bulletedListButton.isOn ).to.be.true;
		expect( bulletedListButton.isEnabled ).to.be.true;

		command.value = false;
		expect( bulletedListButton.isOn ).to.be.false;

		command.isEnabled = false;
		expect( bulletedListButton.isEnabled ).to.be.false;
	} );

	it( 'should bind numbered list button model to numberedList command', () => {
		setData( model, '<listItem type="bulleted" indent="0">[]foo</listItem>' );

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

			setData( model, '<listItem type="bulleted" indent="0">[]</listItem>' );

			editor.editing.view.document.fire( 'enter', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it( 'should not execute outdentList command on enter key in non-empty list', () => {
			const domEvtDataStub = { preventDefault() {} };

			sinon.spy( editor, 'execute' );

			setData( model, '<listItem type="bulleted" indent="0">foo[]</listItem>' );

			editor.editing.view.document.fire( 'enter', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );
	} );

	describe( 'delete key handling callback', () => {
		it( 'should execute outdentList command on backspace key in first item of list', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setData( model, '<listItem type="bulleted" indent="0">[]foo</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it( 'should execute outdentList command on backspace key in first item of list', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setData( model, '<paragraph>foo</paragraph><listItem type="bulleted" indent="0">[]foo</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it( 'should not execute outdentList command on delete key in first item of list', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'forward' };

			sinon.spy( editor, 'execute' );

			setData( model, '<listItem type="bulleted" indent="0">[]foo</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );

		it( 'should not execute outdentList command when selection is not collapsed', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setData( model, '<listItem type="bulleted" indent="0">[fo]o</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );

		it( 'should not execute outdentList command if not in list item', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setData( model, '<paragraph>[]foo</paragraph>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );

		it( 'should not execute outdentList command if not in first list item', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setData( model, '<listItem type="bulleted" indent="0">foo</listItem><listItem type="bulleted" indent="0">[]foo</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );

		it( 'should not execute outdentList command when selection is not on first position', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setData( model, '<listItem type="bulleted" indent="0">fo[]o</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );

		it( 'should not execute outdentList command when selection is not on first position', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setData( model, '<listItem type="bulleted" indent="0">fo[]o</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );

		it( 'should outdent list when previous element is nested in block quote', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setData( model, '<blockQuote><paragraph>x</paragraph></blockQuote><listItem type="bulleted" indent="0">[]foo</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it( 'should outdent list when list is nested in block quote', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setData( model, '<paragraph>x</paragraph><blockQuote><listItem type="bulleted" indent="0">[]foo</listItem></blockQuote>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );
	} );

	describe( 'tab key handling callback', () => {
		let domEvtDataStub;

		beforeEach( () => {
			domEvtDataStub = {
				keyCode: getCode( 'Tab' ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			sinon.spy( editor, 'execute' );
		} );

		afterEach( () => {
			editor.execute.restore();
		} );

		it( 'should execute indentList command on tab key', () => {
			setData(
				model,
				'<listItem type="bulleted" indent="0">foo</listItem>' +
				'<listItem type="bulleted" indent="0">[]bar</listItem>'
			);

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'indentList' );
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
		} );

		it( 'should execute outdentList command on Shift+Tab keystroke', () => {
			domEvtDataStub.keyCode += getCode( 'Shift' );

			setData(
				model,
				'<listItem type="bulleted" indent="0">foo</listItem>' +
				'<listItem type="bulleted" indent="1">[]bar</listItem>'
			);

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
		} );

		it( 'should not indent if command is disabled', () => {
			setData( model, '<listItem type="bulleted" indent="0">[]foo</listItem>' );

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			expect( editor.execute.called ).to.be.false;
			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
		} );

		it( 'should not indent or outdent if alt+tab is pressed', () => {
			domEvtDataStub.keyCode += getCode( 'alt' );

			setData(
				model,
				'<listItem type="bulleted" indent="0">foo</listItem>' +
				'<listItem type="bulleted" indent="0">[]bar</listItem>'
			);

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			expect( editor.execute.called ).to.be.false;
			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
		} );
	} );
} );
