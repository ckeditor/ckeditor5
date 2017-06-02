/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import Heading from '../src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Heading integration', () => {
	let editor, doc, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor.create( element, {
			plugins: [ Paragraph, Heading, Image, ImageCaption ]
		} )
		.then( newEditor => {
			editor = newEditor;
			doc = editor.document;
		} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'with the image feature', () => {
		// https://github.com/ckeditor/ckeditor5-heading/issues/73
		it( 'should not destroy the image when a selection converted to a heading', () => {
			setModelData( editor.document,
				'<paragraph>fo[o</paragraph>' +
				'<image src="foo.png">' +
					'<caption>xxx</caption>' +
				'</image>' +
				'<paragraph>b]ar</paragraph>'
			);

			editor.execute( 'heading1' );

			expect( getModelData( doc ) ).to.equal(
				'<heading1>fo[o</heading1>' +
				'<image src="foo.png">' +
					'<caption>xxx</caption>' +
				'</image>' +
				'<heading1>b]ar</heading1>'
			);
		} );
	} );
} );
