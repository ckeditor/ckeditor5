/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { icons } from 'ckeditor5/src/core';

import ImageCaptionEditing from '../../src/imagecaption/imagecaptionediting';
import ImageCaptionUI from '../../src/imagecaption/imagecaptionui';
import ImageBlockEditing from '../../src/image/imageblockediting';

describe( 'ImageCaptionUI', () => {
	let editor, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, ImageBlockEditing, ImageCaptionEditing, ImageCaptionUI ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have a name', () => {
		expect( ImageCaptionUI.pluginName ).to.equal( 'ImageCaptionUI' );
	} );

	describe( 'button component', () => {
		let buttonView;

		beforeEach( () => {
			buttonView = editor.ui.componentFactory.create( 'toggleImageCaption' );
		} );

		it( 'should be registered as toggleImageCaption in the component factory', () => {
			expect( buttonView ).to.be.instanceOf( ButtonView );
			expect( buttonView.isOn ).to.be.false;
			expect( buttonView.label ).to.equal( 'Toggle caption on' );
			expect( buttonView.icon ).to.equal( icons.caption );
			expect( buttonView.tooltip ).to.be.true;
			expect( buttonView.isToggleable ).to.be.true;
		} );

		it( 'should execute the toggleImageCaption command on the #execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'toggleImageCaption', { focusCaptionOnShow: true } );
		} );

		it( 'should scroll the editing view to the caption on the #execute event if the caption showed up', () => {
			editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );

			const executeSpy = testUtils.sinon.spy( editor.editing.view, 'scrollToTheSelection' );

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
		} );

		it( 'should not scroll the editing view on the #execute event if the caption was hidden', () => {
			editor.setData( '<figure class="image"><img src="/assets/sample.png" /><figcaption>foo</figcaption></figure>' );

			const executeSpy = testUtils.sinon.spy( editor.editing.view, 'scrollToTheSelection' );

			buttonView.fire( 'execute' );

			sinon.assert.notCalled( executeSpy );
		} );

		it( 'should highlight the figcaption element in the view on the #execute event if the caption showed up', () => {
			editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );

			buttonView.fire( 'execute' );

			const figcaptionElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 1 );

			expect( figcaptionElement.hasClass( 'image__caption_highlighted' ) ).to.be.true;
		} );

		it( 'should have #isEnabled and #isOn bound to the toggleImageCaption command', () => {
			const command = editor.commands.get( 'toggleImageCaption' );

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

		it( 'should have #label bound to the toggleImageCaption command', () => {
			const command = editor.commands.get( 'toggleImageCaption' );

			command.value = true;
			expect( buttonView.label ).to.equal( 'Toggle caption off' );

			command.value = false;
			expect( buttonView.label ).to.equal( 'Toggle caption on' );
		} );
	} );
} );
