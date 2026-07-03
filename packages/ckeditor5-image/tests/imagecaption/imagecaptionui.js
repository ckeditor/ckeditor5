/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconCaption } from '@ckeditor/ckeditor5-icons';

import { ImageCaptionEditing } from '../../src/imagecaption/imagecaptionediting.js';
import { ImageCaptionUI } from '../../src/imagecaption/imagecaptionui.js';
import { ImageBlockEditing } from '../../src/image/imageblockediting.js';

describe( 'ImageCaptionUI', () => {
	let editor, editorElement;

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
		expect( ImageCaptionUI.pluginName ).toBe( 'ImageCaptionUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageCaptionUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageCaptionUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'button component', () => {
		let buttonView;

		beforeEach( () => {
			buttonView = editor.ui.componentFactory.create( 'toggleImageCaption' );
		} );

		it( 'should be registered as toggleImageCaption in the component factory', () => {
			expect( buttonView ).toBeInstanceOf( ButtonView );
			expect( buttonView.isOn ).toBe( false );
			expect( buttonView.label ).toBe( 'Toggle caption on' );
			expect( buttonView.icon ).toBe( IconCaption );
			expect( buttonView.tooltip ).toBe( true );
			expect( buttonView.isToggleable ).toBe( true );
		} );

		it( 'should execute the toggleImageCaption command on the #execute event', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			buttonView.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'toggleImageCaption', { focusCaptionOnShow: true } );
		} );

		it( 'should scroll the editing view to the caption on the #execute event if the caption showed up', () => {
			editor.setData( '<figure class="image"><img src="/sample.png" /></figure>' );

			const executeSpy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' );

			buttonView.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should focus the editing view on the #execute event if the caption showed up', () => {
			editor.setData( '<figure class="image"><img src="/sample.png" /></figure>' );

			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

			buttonView.fire( 'execute' );

			expect( focusSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should focus the editing view on the #execute event if the caption was hidden', () => {
			editor.setData( '<figure class="image"><img src="/sample.png" /><figcaption>caption</figcaption></figure>' );

			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

			buttonView.fire( 'execute' );

			expect( focusSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not scroll the editing view on the #execute event if the caption was hidden', () => {
			editor.setData( '<figure class="image"><img src="/sample.png" /><figcaption>foo</figcaption></figure>' );

			const executeSpy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' );

			buttonView.fire( 'execute' );

			expect( executeSpy ).not.toHaveBeenCalled();
		} );

		it( 'should highlight the figcaption element in the view on the #execute event if the caption showed up', () => {
			editor.setData( '<figure class="image"><img src="/sample.png" /></figure>' );

			buttonView.fire( 'execute' );

			const figcaptionElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 1 );

			expect( figcaptionElement.hasClass( 'image__caption_highlighted' ) ).toBe( true );
		} );

		it( 'should have #isEnabled and #isOn bound to the toggleImageCaption command', () => {
			const command = editor.commands.get( 'toggleImageCaption' );

			command.isEnabled = command.value = false;

			expect( buttonView.isOn ).toBe( false );
			expect( buttonView.isEnabled ).toBe( false );

			command.isEnabled = command.value = true;

			expect( buttonView.isOn ).toBe( true );
			expect( buttonView.isEnabled ).toBe( true );

			command.value = false;

			expect( buttonView.isOn ).toBe( false );
			expect( buttonView.isEnabled ).toBe( true );
		} );

		it( 'should have #label bound to the toggleImageCaption command', () => {
			const command = editor.commands.get( 'toggleImageCaption' );

			command.value = true;
			expect( buttonView.label ).toBe( 'Toggle caption off' );

			command.value = false;
			expect( buttonView.label ).toBe( 'Toggle caption on' );
		} );
	} );
} );
