/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import DrupalImageEditing from '../src/drupalimageediting';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting';
import ImageStyleEditing from '@ckeditor/ckeditor5-image/src/imagestyle/imagestyleediting';

describe( 'DrupalImageEditing', () => {
	let editor, model;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				Paragraph,
				ImageBlockEditing,
				ImageInlineEditing,
				ImageCaptionEditing,
				ImageStyleEditing,
				DrupalImageEditing
			]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( DrupalImageEditing.pluginName ).to.equal( 'DrupalImageEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( DrupalImageEditing ) ).to.be.instanceOf( DrupalImageEditing );
	} );

	/**
	 * data-align
	 * data-caption
	 * data-entity-file
	 * data-entity-uuid
	 */

	describe( 'data pipeline', () => {
		describe( 'view to model (upcast)', () => {
			it( 'should convert data-caption', () => {
				editor.setData(
					'<img src="/drupal/image.jpg" alt="Alternative text" data-caption="Some caption" />'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal(
						'<imageBlock alt="Alternative text" src="/drupal/image.jpg">' +
							'<caption>Some caption</caption>' +
						'</imageBlock>'
					);

				// Might move it to a test section with downcast.
				expect( editor.getData() )
					.to.equal(
						'<img src="/drupal/image.jpg" alt="Alternative text" data-caption="Some caption">'
					);
			} );

			it( 'should convert data-align - block image', () => {
				editor.setData(
					'<img src="/drupal/image.jpg" alt="Alternative text" data-align="right" />'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal(
						'<imageBlock alt="Alternative text" imageStyle="alignBlockRight" src="/drupal/image.jpg">' +
						'</imageBlock>'
					);

				// Might move it to a test section with downcast.
				expect( editor.getData() )
					.to.equal(
						'<img src="/drupal/image.jpg" data-align="right" alt="Alternative text">'
					);
			} );

			it( 'should convert data-align - inline image', () => {
				editor.setData(
					'<p>Some text' +
						'<img src="/drupal/image.jpg" alt="Alternative text" data-align="right" />' +
					'</p>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal(
						'<paragraph>' +
							'Some text' +
							'<imageInline alt="Alternative text" imageStyle="alignRight" src="/drupal/image.jpg"></imageInline>' +
						'</paragraph>'
					);

				// Might move it to a test section with downcast.
				expect( editor.getData() )
					.to.equal(
						'<p>' +
							'Some text' +
							'<img src="/drupal/image.jpg" data-align="right" alt="Alternative text">' +
						'</p>'
					);
			} );
		} );

		describe( 'model to view (downcast)', () => {
			it.skip( 'should convert caption element to figcaption', () => {
				setModelData( model, '<imageBlock src="img.png"><caption>Foo bar baz.</caption></imageBlock>' );

				expect( editor.getData() ).to.equal(
					'<figure class="image"><img src="img.png"><figcaption>Foo bar baz.</figcaption></figure>'
				);
			} );
		} );
	} );
} );
