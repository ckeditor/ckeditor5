/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import ImageCaptionEditing from '../../src/imagecaption/imagecaptionediting';
import ImageCaptionUI from '../../src/imagecaption/imagecaptionui';

import captionIcon from '../../theme/icons/imagecaption.svg';

describe( 'ImageCaptionUI', () => {
	let editor, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, ImageCaptionEditing, ImageCaptionUI ]
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
			buttonView = editor.ui.componentFactory.create( 'imageCaptionToggle' );
		} );

		it( 'should be registered as imageCaptionToggle in the component factory', () => {
			expect( buttonView ).to.be.instanceOf( ButtonView );
			expect( buttonView.isOn ).to.be.false;
			expect( buttonView.label ).to.equal( 'Toggle caption on' );
			expect( buttonView.icon ).to.equal( captionIcon );
			expect( buttonView.tooltip ).to.be.true;
			expect( buttonView.isToggleable ).to.be.true;
		} );

		it( 'should execute the imageCaptionToggle command on the #execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'imageCaptionToggle', { focusCaptionOnShow: true } );
		} );

		it( 'should have #isEnabled and #isOn bound to the imageCaptionToggle command', () => {
			const command = editor.commands.get( 'imageCaptionToggle' );

			expect( buttonView.isOn ).to.be.false;
			expect( buttonView.isEnabled ).to.be.true;

			command.value = true;
			expect( buttonView.isOn ).to.be.true;

			command.isEnabled = false;
			expect( buttonView.isEnabled ).to.be.false;
		} );

		it( 'should have #label bound to the imageCaptionToggle command', () => {
			const command = editor.commands.get( 'imageCaptionToggle' );

			command.value = true;
			expect( buttonView.label ).to.equal( 'Toggle caption off' );

			command.value = false;
			expect( buttonView.label ).to.equal( 'Toggle caption on' );
		} );
	} );
} );
