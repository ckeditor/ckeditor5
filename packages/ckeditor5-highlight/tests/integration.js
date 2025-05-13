/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Highlight from '../src/highlight.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Delete from '@ckeditor/ckeditor5-typing/src/delete.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'Highlight', () => {
	let editor, model, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Highlight, BlockQuote, Paragraph, Heading, Image, ImageCaption, List, Enter, Delete ]
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

	describe( 'compatibility with images', () => {
		it( 'does work inside image caption', () => {
			setModelData( model, '<imageBlock src="/assets/sample.png"><caption>foo[bar]baz</caption></imageBlock>' );

			editor.execute( 'highlight', { value: 'yellowMarker' } );

			expect( getModelData( model ) )
				.to.equal( '<imageBlock src="/assets/sample.png">' +
					'<caption>foo[<$text highlight="yellowMarker">bar</$text>]baz</caption>' +
				'</imageBlock>' );
		} );

		it( 'does work on selection with image', () => {
			setModelData(
				model,
				'<paragraph>foo[foo</paragraph>' +
					'<imageBlock src="/assets/sample.png"><caption>abc</caption></imageBlock>' +
				'<paragraph>bar]bar</paragraph>'
			);

			editor.execute( 'highlight', { value: 'yellowMarker' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo[<$text highlight="yellowMarker">foo</$text></paragraph>' +
				'<imageBlock src="/assets/sample.png"><caption><$text highlight="yellowMarker">abc</$text></caption></imageBlock>' +
				'<paragraph><$text highlight="yellowMarker">bar</$text>]bar</paragraph>'
			);
		} );
	} );
} );
