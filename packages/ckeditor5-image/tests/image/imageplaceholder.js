/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import ImagePlaceholder from '../../src/image/imageplaceholder';
import ImageUtils from '../../src/imageutils';
import ImageBlock from '../../src/imageblock';
import ImageInline from '../../src/imageinline';

describe( 'ImagePlaceholder', () => {
	let editor, element, model, doc, view;

	testUtils.createSinonSandbox();

	it( 'should have pluginName', () => {
		expect( ImagePlaceholder.pluginName ).to.equal( 'ImagePlaceholder' );
	} );

	it( 'should require ImageUtils', () => {
		expect( ImagePlaceholder.requires ).to.deep.equal( [ ImageUtils ] );
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

		// TODO
	} );
} );
