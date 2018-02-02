/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

/* global document */

describe( 'Paragraph feature – integration', () => {
	let editor, model, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Essentials, Paragraph, Image, ImageCaption ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		element.remove();
		return editor.destroy();
	} );

	it( 'should convert figure when is inside paragraph element', () => {
		editor.setData(
			'<p>' +
				'<figure class="image">' +
					'<img src="foo.jpg"/>' +
					'<figcaption>bar</figcaption>' +
				'</figure>' +
			'</p>'
		);

		// Empty paragraph is not removed because is not split by converter but by DataProcessor.
		expect( getData( model, { withoutSelection: true } ) )
			.to.equal( '<paragraph></paragraph><image src="foo.jpg"><caption>bar</caption></image><paragraph></paragraph>' );
	} );

	it( 'should convert figure when is inside paragraph like element', () => {
		editor.setData(
			'<dv>' +
				'<figure class="image">' +
					'<img src="foo.jpg"/>' +
					'<figcaption>bar</figcaption>' +
				'</figure>' +
			'</dv>'
		);

		expect( getData( model, { withoutSelection: true } ) )
			.to.equal( '<image src="foo.jpg"><caption>bar</caption></image>' );
	} );

	it( 'should convert figure when element before is autoparagraphed', () => {
		editor.setData(
			'foo' +
			'<figure class="image">' +
				'<img src="foo.jpg"/>' +
				'<figcaption>bar</figcaption>' +
			'</figure>' +
			'bar'
		);

		expect( getData( model, { withoutSelection: true } ) )
			.to.equal( '<paragraph>foo</paragraph><image src="foo.jpg"><caption>bar</caption></image><paragraph>bar</paragraph>' );
	} );
} );
