/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import Alignment from '../src/alignment';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import List from '@ckeditor/ckeditor5-list/src/list';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Delete from '@ckeditor/ckeditor5-typing/src/delete';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Alignment', () => {
	let editor, doc, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Alignment, BlockQuote, Paragraph, Heading, Image, ImageCaption, List, Enter, Delete ]
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

	describe( 'compatibility with images', () => {
		it( 'does not work inside image caption', () => {
			setModelData( doc, '<image src="foo.png"><caption>Foo[]</caption></image>' );

			editor.execute( 'alignCenter' );

			expect( getModelData( doc ) ).to.equal( '<image src="foo.png"><caption>Foo[]</caption></image>' );
		} );
		it( 'does not work inside image caption when selection overlaps image', () => {
			setModelData(
				doc,
				'<paragraph>foo[foo</paragraph>' +
				'<image src="foo.png"><caption>bar</caption></image>' +
				'<paragraph>baz]baz</paragraph>'
			);

			editor.execute( 'alignCenter' );

			expect( getModelData( doc ) ).to.equal(
				'<paragraph alignment="center">foo[foo</paragraph>' +
				'<image src="foo.png"><caption>bar</caption></image>' +
				'<paragraph alignment="center">baz]baz</paragraph>'
			);
		} );
	} );

	describe( 'compatibility with blockQuote', () => {
		it( 'does work inside BlockQuote on paragraph', () => {
			setModelData( doc, '<blockQuote><paragraph>Foo[]</paragraph></blockQuote>' );

			editor.execute( 'alignCenter' );

			expect( getModelData( doc ) ).to.equal( '<blockQuote><paragraph alignment="center">Foo[]</paragraph></blockQuote>' );
		} );

		it( 'does work inside blockQuote on heading', () => {
			setModelData( doc, '<blockQuote><heading1>Foo[]</heading1></blockQuote>' );

			editor.execute( 'alignCenter' );

			expect( getModelData( doc ) ).to.equal( '<blockQuote><heading1 alignment="center">Foo[]</heading1></blockQuote>' );
		} );

		it( 'does work inside blockQuote on listItem', () => {
			setModelData( doc, '<blockQuote><listItem indent="0" type="numbered">Foo[]</listItem></blockQuote>' );

			editor.execute( 'alignCenter' );

			expect( getModelData( doc ) ).to.equal(
				'<blockQuote><listItem alignment="center" indent="0" type="numbered">Foo[]</listItem></blockQuote>'
			);
		} );
	} );
} );
