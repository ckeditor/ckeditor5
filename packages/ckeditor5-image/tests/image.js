/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Image from '../src/image.js';
import ImageEditing from '../src/image/imageediting.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import ImageTextAlternative from '../src/imagetextalternative.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'Image', () => {
	let editorElement, model, view, editor, document, viewDocument;

	testUtils.createSinonSandbox();

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

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Image.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Image.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Image ) ).to.instanceOf( Image );
	} );

	it( 'should load ImageEditing plugin', () => {
		expect( editor.plugins.get( ImageEditing ) ).to.instanceOf( ImageEditing );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).to.instanceOf( Widget );
	} );

	it( 'should load ImageTextAlternative plugin', () => {
		expect( editor.plugins.get( ImageTextAlternative ) ).to.instanceOf( ImageTextAlternative );
	} );

	describe( 'selection', () => {
		describe( 'for block images', () => {
			it( 'should create fake selection', () => {
				setModelData( model, '[<imageBlock alt="alt text" src="/assets/sample.png"></imageBlock>]' );

				expect( getViewData( view ) ).to.equal(
					'[<figure class="' +
						'ck-widget ' +
						'ck-widget_selected image" contenteditable="false"' +
					'>' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</figure>]'
				);

				expect( viewDocument.selection.isFake ).to.be.true;
				expect( viewDocument.selection.fakeSelectionLabel ).to.equal(
					'alt text image widget. Press Enter to type after or press Shift + Enter to type before the widget'
				);
			} );

			it( 'should create proper fake selection label when alt attribute is empty', () => {
				setModelData( model, '[<imageBlock src="/assets/sample.png" alt=""></imageBlock>]' );

				expect( getViewData( view ) ).to.equal(
					'[<figure class="' +
						'ck-widget ' +
						'ck-widget_selected image" contenteditable="false"' +
					'>' +
						'<img alt="" src="/assets/sample.png"></img>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</figure>]'
				);

				expect( viewDocument.selection.isFake ).to.be.true;
				expect( viewDocument.selection.fakeSelectionLabel ).to.equal(
					'image widget. Press Enter to type after or press Shift + Enter to type before the widget'
				);
			} );

			it( 'should remove selected class from previously selected element', () => {
				setModelData( model,
					'[<imageBlock src="/assets/sample.png" alt="alt text"></imageBlock>]' +
					'<imageBlock src="/assets/sample.png" alt="alt text"></imageBlock>'
				);

				expect( getViewData( view ) ).to.equal(
					'[<figure class="' +
						'ck-widget ' +
						'ck-widget_selected image" contenteditable="false"' +
					'>' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</figure>]' +
					'<figure class="' +
						'ck-widget ' +
						'image" contenteditable="false"' +
					'>' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</figure>'
				);

				model.change( writer => {
					const secondImage = document.getRoot().getChild( 1 );
					writer.setSelection( writer.createRangeOn( secondImage ) );
				} );

				expect( getViewData( view ) ).to.equal(
					'<figure class="' +
						'ck-widget ' +
						'image" contenteditable="false"' +
					'>' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</figure>' +
					'[<figure class="' +
						'ck-widget ' +
						'ck-widget_selected image" contenteditable="false"' +
					'>' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</figure>]'
				);
			} );
		} );

		describe( 'for inline images', () => {
			it( 'should create fake selection', () => {
				setModelData( model, '<paragraph>[<imageInline alt="alt text" src="/assets/sample.png"></imageInline>]</paragraph>' );

				expect( getViewData( view ) ).to.equal(
					'<p>[' +
						'<span class="ck-widget ck-widget_selected image-inline" contenteditable="false">' +
							'<img alt="alt text" src="/assets/sample.png"></img>' +
						'</span>' +
					']</p>'
				);

				expect( viewDocument.selection.isFake ).to.be.true;
				expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'alt text image widget' );
			} );

			it( 'should create proper fake selection label when alt attribute is empty', () => {
				setModelData( model, '<paragraph>[<imageInline src="/assets/sample.png" alt=""></imageInline>]</paragraph>' );

				expect( getViewData( view ) ).to.equal(
					'<p>[' +
						'<span class="ck-widget ck-widget_selected image-inline" contenteditable="false">' +
							'<img alt="" src="/assets/sample.png"></img>' +
						'</span>' +
					']</p>'
				);

				expect( viewDocument.selection.isFake ).to.be.true;
				expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'image widget' );
			} );

			it( 'should remove selected class from previously selected element', () => {
				setModelData( model,
					'<paragraph>[<imageInline src="/assets/sample.png" alt="alt text"></imageInline>]' +
					'<imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>'
				);

				expect( getViewData( view ) ).to.equal(
					'<p>[' +
						'<span class="ck-widget ck-widget_selected image-inline" contenteditable="false">' +
							'<img alt="alt text" src="/assets/sample.png"></img>' +
						'</span>]' +
						'<span class="ck-widget image-inline" contenteditable="false">' +
							'<img alt="alt text" src="/assets/sample.png"></img>' +
						'</span>' +
					'</p>'
				);

				model.change( writer => {
					const secondImage = document.getRoot().getChild( 0 ).getChild( 1 );
					writer.setSelection( writer.createRangeOn( secondImage ) );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>' +
						'<span class="ck-widget image-inline" contenteditable="false">' +
							'<img alt="alt text" src="/assets/sample.png"></img>' +
						'</span>' +
						'[<span class="ck-widget ck-widget_selected image-inline" contenteditable="false">' +
							'<img alt="alt text" src="/assets/sample.png"></img>' +
						'</span>' +
					']</p>'
				);
			} );
		} );
	} );
} );
