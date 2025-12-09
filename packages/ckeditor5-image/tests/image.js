/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Image } from '../src/image.js';
import { ImageEditing } from '../src/image/imageediting.js';
import { Widget } from '@ckeditor/ckeditor5-widget';
import { ImageTextAlternative } from '../src/imagetextalternative.js';
import { _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { global } from '@ckeditor/ckeditor5-utils';

describe( 'Image', () => {
	let editorElement, model, view, editor, document, viewDocument;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				document = model.document;
				view = editor.editing.view;
				viewDocument = editor.editing.view.document;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		vi.restoreAllMocks();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Image.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Image.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Image ) ).toBeInstanceOf( Image );
	} );

	it( 'should load ImageEditing plugin', () => {
		expect( editor.plugins.get( ImageEditing ) ).toBeInstanceOf( ImageEditing );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).toBeInstanceOf( Widget );
	} );

	it( 'should load ImageTextAlternative plugin', () => {
		expect( editor.plugins.get( ImageTextAlternative ) ).toBeInstanceOf( ImageTextAlternative );
	} );

	describe( 'selection', () => {
		describe( 'for block images', () => {
			it( 'should create fake selection', () => {
				_setModelData( model, '[<imageBlock alt="alt text" src="/sample.png"></imageBlock>]' );

				expect( _getViewData( view ) ).toBe(
					'[<figure class="' +
						'ck-widget ' +
						'ck-widget_selected image" contenteditable="false"' +
					'>' +
				'<img alt="alt text" src="/sample.png"></img>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>]'
				);

				expect( viewDocument.selection.isFake ).toBe( true );
				expect( viewDocument.selection.fakeSelectionLabel ).toBe(
					'alt text image widget. Press Enter to type after or press Shift + Enter to type before the widget'
				);
			} );

			it( 'should create proper fake selection label when alt attribute is empty', () => {
				_setModelData( model, '[<imageBlock src="/sample.png" alt=""></imageBlock>]' );

				expect( _getViewData( view ) ).toBe(
					'[<figure class="' +
						'ck-widget ' +
						'ck-widget_selected image" contenteditable="false"' +
					'>' +
				'<img alt="" src="/sample.png"></img>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>]'
				);

				expect( viewDocument.selection.isFake ).toBe( true );
				expect( viewDocument.selection.fakeSelectionLabel ).toBe(
					'image widget. Press Enter to type after or press Shift + Enter to type before the widget'
				);
			} );

			it( 'should remove selected class from previously selected element', () => {
				_setModelData( model,
					'[<imageBlock src="/sample.png" alt="alt text"></imageBlock>]' +
				'<imageBlock src="/sample.png" alt="alt text"></imageBlock>'
				);

				expect( _getViewData( view ) ).toBe(
					'[<figure class="' +
						'ck-widget ' +
						'ck-widget_selected image" contenteditable="false"' +
					'>' +
				'<img alt="alt text" src="/sample.png"></img>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>]' +
				'<figure class="' +
					'ck-widget ' +
					'image" contenteditable="false"' +
				'>' +
					'<img alt="alt text" src="/sample.png"></img>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</figure>'
				);

				model.change( writer => {
					const secondImage = document.getRoot().getChild( 1 );
					writer.setSelection( writer.createRangeOn( secondImage ) );
				} );

				expect( _getViewData( view ) ).toBe(
					'<figure class="' +
					'ck-widget ' +
					'image" contenteditable="false"' +
				'>' +
					'<img alt="alt text" src="/sample.png"></img>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>' +
				'[<figure class="' +
					'ck-widget ' +
					'ck-widget_selected image" contenteditable="false"' +
				'>' +
					'<img alt="alt text" src="/sample.png"></img>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</figure>]'
				);
			} );
		} );

		describe( 'for inline images', () => {
			it( 'should create fake selection', () => {
				_setModelData( model, '<paragraph>[<imageInline alt="alt text" src="/sample.png"></imageInline>]</paragraph>' );

				expect( _getViewData( view ) ).toBe(
					'<p>[' +
						'<span class="ck-widget ck-widget_selected image-inline" contenteditable="false">' +
							'<img alt="alt text" src="/sample.png"></img>' +
						'</span>' +
					']</p>'
				);

				expect( viewDocument.selection.isFake ).toBe( true );
				expect( viewDocument.selection.fakeSelectionLabel ).toBe( 'alt text image widget' );
			} );

			it( 'should create proper fake selection label when alt attribute is empty', () => {
				_setModelData( model, '<paragraph>[<imageInline src="/sample.png" alt=""></imageInline>]</paragraph>' );

				expect( _getViewData( view ) ).toBe(
					'<p>[' +
						'<span class="ck-widget ck-widget_selected image-inline" contenteditable="false">' +
							'<img alt="" src="/sample.png"></img>' +
						'</span>' +
					']</p>'
				);

				expect( viewDocument.selection.isFake ).toBe( true );
				expect( viewDocument.selection.fakeSelectionLabel ).toBe( 'image widget' );
			} );

			it( 'should remove selected class from previously selected element', () => {
				_setModelData( model,
					'<paragraph>[<imageInline src="/sample.png" alt="alt text"></imageInline>]' +
				'<imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>'
				);

				expect( _getViewData( view ) ).toBe(
					'<p>[' +
						'<span class="ck-widget ck-widget_selected image-inline" contenteditable="false">' +
							'<img alt="alt text" src="/sample.png"></img>' +
						'</span>]' +
				'<span class="ck-widget image-inline" contenteditable="false">' +
					'<img alt="alt text" src="/sample.png"></img>' +
						'</span>' +
					'</p>'
				);

				model.change( writer => {
					const secondImage = document.getRoot().getChild( 0 ).getChild( 1 );
					writer.setSelection( writer.createRangeOn( secondImage ) );
				} );

				expect( _getViewData( view ) ).toBe(
					'<p>' +
					'<span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="alt text" src="/sample.png"></img>' +
						'</span>' +
				'[<span class="ck-widget ck-widget_selected image-inline" contenteditable="false">' +
					'<img alt="alt text" src="/sample.png"></img>' +
						'</span>' +
					']</p>'
				);
			} );
		} );
	} );
} );
