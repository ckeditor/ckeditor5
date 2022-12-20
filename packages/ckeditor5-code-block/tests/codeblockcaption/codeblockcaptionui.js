/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { icons } from 'ckeditor5/src/core';

import CodeBlock from '../../src/codeblock';
import CodeblockCaptionEditing from '../../src/codeblockcaption/codeblockcaptionediting';
import CodeblockCaption from '../../src/codeblockcaption';
import CodeblockCaptionUI from '../../src/codeblockcaption/codeblockcaptionui';

describe( 'CodeblockCaptionUI', () => {
	let editor, editorElement;
	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Paragraph,
				CodeBlock,
				CodeblockCaption,
				CodeblockCaptionEditing,
				CodeblockCaptionUI
			]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have a name', () => {
		expect( CodeblockCaptionUI.pluginName ).to.equal( 'CodeblockCaptionUI' );
	} );

	describe( 'button component', () => {
		let buttonView;

		beforeEach( () => {
			buttonView = editor.ui.componentFactory.create( 'toggleCodeblockCaption' );
		} );

		it( 'should be registered as toggleCodeblockCaption in the component factory', () => {
			expect( buttonView ).to.be.instanceOf( ButtonView );
			expect( buttonView.isOn ).to.be.false;
			expect( buttonView.label ).to.equal( 'Toggle caption on' );
			expect( buttonView.icon ).to.equal( icons.caption );
			expect( buttonView.tooltip ).to.be.true;
			expect( buttonView.isToggleable ).to.be.true;
		} );

		it( 'should execute the toggleCodeblockCaption command on the #execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'toggleCodeblockCaption', { focusCaptionOnShow: true } );
		} );

		it( 'should scroll the editing view to the caption on the #execute event if the caption showed up', () => {
			editor.setData( '<pre data-language="Plain text" spellcheck="false"><code class="language-plaintext"></code></pre>' );

			const executeSpy = testUtils.sinon.spy( editor.editing.view, 'scrollToTheSelection' );

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
		} );

		it( 'should focus the editing view on the #execute event if the caption showed up', () => {
			editor.setData( '<pre data-language="Plain text" spellcheck="false"><code class="language-plaintext"></code></pre>' );

			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );
		} );

		it( 'should focus the editing view on the #execute event if the caption was hidden', () => {
			editor.setData( '<pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
			'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-editor__nested-editable_focused"' +
			' contenteditable="true" data-placeholder="Enter codeblock caption" role="textbox">caption</figcaption></code></pre>' );

			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );
		} );

		it( 'should not scroll the editing view on the #execute event if the caption was hidden', () => {
			editor.setData( '<pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
			'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-editor__nested-editable_focused" ' +
			'contenteditable="true" data-placeholder="Enter codeblock caption" role="textbox">' +
			'foo</figcaption></code></pre>' );

			const executeSpy = testUtils.sinon.spy( editor.editing.view, 'scrollToTheSelection' );

			buttonView.fire( 'execute' );

			sinon.assert.notCalled( executeSpy );
		} );

		it( 'should highlight the figcaption element in the view on the #execute event if the caption showed up', () => {
			editor.setData( '<pre data-language="Plain text" spellcheck="false"><code class="language-plaintext"></code></pre>' );

			buttonView.fire( 'execute' );

			const figcaptionElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 );

			expect( figcaptionElement.hasClass( 'codeblock__caption_highlighted' ) ).to.be.true;
		} );

		it( 'should have #isEnabled and #isOn bound to the toggleCodeblockCaption command', () => {
			const command = editor.commands.get( 'toggleCodeblockCaption' );

			command.isEnabled = command.value = false;

			expect( buttonView.isOn ).to.be.false;
			expect( buttonView.isEnabled ).to.be.false;

			command.isEnabled = command.value = true;

			expect( buttonView.isOn ).to.be.true;
			expect( buttonView.isEnabled ).to.be.true;

			command.value = false;

			expect( buttonView.isOn ).to.be.false;
			expect( buttonView.isEnabled ).to.be.true;
		} );

		it( 'should have #label bound to the toggleCodeblockCaption command', () => {
			const command = editor.commands.get( 'toggleCodeblockCaption' );

			command.value = true;
			expect( buttonView.label ).to.equal( 'Toggle caption off' );

			command.value = false;
			expect( buttonView.label ).to.equal( 'Toggle caption on' );
		} );
	} );
} );
