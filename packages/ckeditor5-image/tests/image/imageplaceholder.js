/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import ImagePlaceholder from '../../src/image/imageplaceholder.js';
import ImageUtils from '../../src/imageutils.js';
import ImageBlock from '../../src/imageblock.js';
import ImageInline from '../../src/imageinline.js';

describe( 'ImagePlaceholder', () => {
	let editor, element, model, doc, view;

	testUtils.createSinonSandbox();

	it( 'should have pluginName', () => {
		expect( ImagePlaceholder.pluginName ).to.equal( 'ImagePlaceholder' );
	} );

	it( 'should require ImageUtils', () => {
		expect( ImagePlaceholder.requires ).to.deep.equal( [ ImageUtils ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImagePlaceholder.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImagePlaceholder.isPremiumPlugin ).to.be.false;
	} );

	describe( 'imageBlock', () => {
		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ImageBlock, Paragraph ]
			} );

			model = editor.model;
			doc = model.document;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			element.remove();
			await editor.destroy();
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( ImagePlaceholder ) ).to.be.instanceOf( ImagePlaceholder );
		} );

		it( 'should extend imageBlock schema', () => {
			expect( model.schema.checkAttribute( 'imageBlock', 'placeholder' ) ).to.be.true;
		} );

		it( 'should not extend imageInline schema', () => {
			expect( model.schema.checkAttribute( 'imageInline', 'placeholder' ) ).to.be.false;
		} );

		it( 'should apply placeholder to the img in the editing view (only)', () => {
			setModelData( model, '<imageBlock src="/assets/sample.png" placeholder="#blurImage"></imageBlock>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
					'<img class="image_placeholder" src="/assets/sample.png" style="background-image:url(#blurImage)"></img>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="image"><img src="/assets/sample.png"></figure>'
			);
		} );

		it( 'should remove placeholder from the img in the editing view (only)', () => {
			setModelData( model, '<imageBlock src="/assets/sample.png" placeholder="#blurImage"></imageBlock>' );

			model.change( writer => writer.removeAttribute( 'placeholder', doc.getRoot().getChild( 0 ) ) );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
					'<img src="/assets/sample.png"></img>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="image"><img src="/assets/sample.png"></figure>'
			);
		} );

		it( 'should remove placeholder when the image is loaded', () => {
			setModelData( model, '<imageBlock src="/assets/sample.png" placeholder="#blurImage"></imageBlock>' );

			const modelElement = doc.getRoot().getChild( 0 );
			const viewElement = editor.editing.mapper.toViewElement( modelElement ).getChild( 0 );
			const domElement = editor.editing.view.domConverter.mapViewToDom( viewElement );

			expect( domElement.tagName ).to.equal( 'IMG' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
					'<img class="image_placeholder" src="/assets/sample.png" style="background-image:url(#blurImage)"></img>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="image"><img src="/assets/sample.png"></figure>'
			);

			view.document.fire( 'imageLoaded', {
				target: domElement
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<imageBlock src="/assets/sample.png"></imageBlock>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
					'<img src="/assets/sample.png"></img>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>'
			);
		} );

		it( 'should not remove placeholder when some other image is loaded', () => {
			setModelData( model, '<imageBlock src="/assets/sample.png" placeholder="#blurImage"></imageBlock>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
					'<img class="image_placeholder" src="/assets/sample.png" style="background-image:url(#blurImage)"></img>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="image"><img src="/assets/sample.png"></figure>'
			);

			view.document.fire( 'imageLoaded', {
				target: document.createElement( 'img' )
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<imageBlock placeholder="#blurImage" src="/assets/sample.png"></imageBlock>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
					'<img class="image_placeholder" src="/assets/sample.png" style="background-image:url(#blurImage)"></img>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>'
			);
		} );

		it( 'should not apply placeholder to other elements than image', () => {
			model.schema.register( 'test', { inheritAllFrom: '$blockObject', allowAttributes: [ 'src', 'placeholder' ] } );
			editor.conversion.elementToElement( { model: 'test', view: 'div' } );
			editor.conversion.attributeToAttribute( { model: 'src', view: 'data-src' } );
			editor.conversion.attributeToAttribute( { model: 'placeholder', view: 'data-placeholder' } );

			setModelData( model, '<test src="/assets/sample.png" placeholder="#blurImage"></test>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<div data-placeholder="#blurImage" data-src="/assets/sample.png"></div>'
			);

			expect( editor.getData() ).to.equal(
				'<div data-src="/assets/sample.png" data-placeholder="#blurImage">&nbsp;</div>'
			);
		} );

		it( 'should not apply placeholder consumed by other converter', () => {
			editor.conversion.attributeToAttribute( { model: 'placeholder', view: 'data-placeholder', converterPriority: 'high' } );

			setModelData( model, '<imageBlock src="/assets/sample.png" placeholder="#blurImage"></imageBlock>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget ck-widget_selected image" contenteditable="false" data-placeholder="#blurImage">' +
					'<img src="/assets/sample.png"></img>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="image" data-placeholder="#blurImage"><img src="/assets/sample.png"></figure>'
			);
		} );
	} );

	describe( 'imageInline', () => {
		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ImageInline, Paragraph ]
			} );

			model = editor.model;
			doc = model.document;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			element.remove();
			await editor.destroy();
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( ImagePlaceholder ) ).to.be.instanceOf( ImagePlaceholder );
		} );

		it( 'should extend imageInline schema', () => {
			expect( model.schema.checkAttribute( 'imageInline', 'placeholder' ) ).to.be.true;
		} );

		it( 'should not extend imageBlock schema', () => {
			expect( model.schema.checkAttribute( 'imageBlock', 'placeholder' ) ).to.be.false;
		} );

		it( 'should apply placeholder to the img in the editing view (only)', () => {
			setModelData( model, '<paragraph><imageInline src="/assets/sample.png" placeholder="#blurImage"></imageInline></paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget image-inline" contenteditable="false">' +
						'<img class="image_placeholder" src="/assets/sample.png" style="background-image:url(#blurImage)"></img>' +
					'</span>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p><img src="/assets/sample.png"></p>'
			);
		} );

		it( 'should remove placeholder from the img in the editing view (only)', () => {
			setModelData( model, '<paragraph><imageInline src="/assets/sample.png" placeholder="#blurImage"></imageInline></paragraph>' );

			model.change( writer => writer.removeAttribute( 'placeholder', doc.getRoot().getChild( 0 ).getChild( 0 ) ) );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget image-inline" contenteditable="false">' +
						'<img src="/assets/sample.png"></img>' +
					'</span>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p><img src="/assets/sample.png"></p>'
			);
		} );

		it( 'should remove placeholder when the image is loaded', () => {
			setModelData( model, '<paragraph><imageInline src="/assets/sample.png" placeholder="#blurImage"></imageInline></paragraph>' );

			const modelElement = doc.getRoot().getChild( 0 ).getChild( 0 );
			const viewElement = editor.editing.mapper.toViewElement( modelElement ).getChild( 0 );
			const domElement = editor.editing.view.domConverter.mapViewToDom( viewElement );

			expect( domElement.tagName ).to.equal( 'IMG' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget image-inline" contenteditable="false">' +
						'<img class="image_placeholder" src="/assets/sample.png" style="background-image:url(#blurImage)"></img>' +
					'</span>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p><img src="/assets/sample.png"></p>'
			);

			view.document.fire( 'imageLoaded', {
				target: domElement
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget image-inline" contenteditable="false">' +
						'<img src="/assets/sample.png"></img>' +
					'</span>' +
				'</p>'
			);
		} );

		it( 'should not remove placeholder when some other image is loaded', () => {
			setModelData( model, '<paragraph><imageInline src="/assets/sample.png" placeholder="#blurImage"></imageInline></paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget image-inline" contenteditable="false">' +
						'<img class="image_placeholder" src="/assets/sample.png" style="background-image:url(#blurImage)"></img>' +
					'</span>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p><img src="/assets/sample.png"></p>'
			);

			view.document.fire( 'imageLoaded', {
				target: document.createElement( 'img' )
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><imageInline placeholder="#blurImage" src="/assets/sample.png"></imageInline></paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget image-inline" contenteditable="false">' +
						'<img class="image_placeholder" src="/assets/sample.png" style="background-image:url(#blurImage)"></img>' +
					'</span>' +
				'</p>'
			);
		} );

		it( 'should not apply placeholder to other elements than image', () => {
			model.schema.register( 'test', { inheritAllFrom: '$inlineObject', allowAttributes: [ 'src', 'placeholder' ] } );
			editor.conversion.elementToElement( { model: 'test', view: 'span' } );
			editor.conversion.attributeToAttribute( { model: 'src', view: 'data-src' } );
			editor.conversion.attributeToAttribute( { model: 'placeholder', view: 'data-placeholder' } );

			setModelData( model, '<paragraph><test src="/assets/sample.png" placeholder="#blurImage"></test></paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><span data-placeholder="#blurImage" data-src="/assets/sample.png"></span></p>'
			);

			expect( editor.getData() ).to.equal(
				'<p><span data-src="/assets/sample.png" data-placeholder="#blurImage">&nbsp;</span></p>'
			);
		} );

		it( 'should not apply placeholder consumed by other converter', () => {
			editor.conversion.attributeToAttribute( { model: 'placeholder', view: 'data-placeholder', converterPriority: 'high' } );

			setModelData( model, '<paragraph><imageInline src="/assets/sample.png" placeholder="#blurImage"></imageInline></paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget image-inline" contenteditable="false" data-placeholder="#blurImage">' +
						'<img src="/assets/sample.png"></img>' +
					'</span>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p><img src="/assets/sample.png" data-placeholder="#blurImage"></p>'
			);
		} );
	} );
} );
