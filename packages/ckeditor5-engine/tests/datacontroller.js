/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import ModelDocument from '/ckeditor5/engine/treemodel/document.js';
import DataController from '/ckeditor5/engine/datacontroller.js';
import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/HtmlDataProcessor.js';

import BuildViewConverterFor  from '/ckeditor5/engine/treecontroller/view-converter-builder.js';

import { getData } from '/tests/engine/_utils/model.js';

describe( 'DataController', () => {
	let modelDocument, htmlDataProcessor, data, schema;

	beforeEach( () => {
		modelDocument = new ModelDocument();
		modelDocument.createRoot( 'main' );

		htmlDataProcessor = new HtmlDataProcessor();

		data = new DataController( modelDocument, htmlDataProcessor );

		schema = modelDocument.schema;
	} );

	describe( 'set', () => {
		it( 'should set text', () => {
			schema.allow( { name: '$text', inside: '$root' } );
			data.set( '<p>foo<b>bar</b></p>' );

			expect( getData( modelDocument, { withoutSelection: true } ) ).to.equal( 'foobar' );
		} );

		it( 'should set paragraph', () => {
			schema.registerItem( 'paragraph', '$block' );

			BuildViewConverterFor( data.toModel ).fromElement( 'p' ).toElement( 'paragraph' );

			data.set( '<p>foo<b>bar</b></p>' );

			expect( getData( modelDocument, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );
		} );

		it( 'should set two paragraphs', () => {
			schema.registerItem( 'paragraph', '$block' );

			BuildViewConverterFor( data.toModel ).fromElement( 'p' ).toElement( 'paragraph' );

			data.set( '<p>foo</p><p>bar</p>' );

			expect( getData( modelDocument, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo</paragraph><paragraph>bar</paragraph>' );
		} );

		it( 'should set paragraphs with bold', () => {
			schema.registerItem( 'paragraph', '$block' );
			schema.allow( { name: '$text', attributes: [ 'bold' ], inside: '$block' } );

			BuildViewConverterFor( data.toModel ).fromElement( 'p' ).toElement( 'paragraph' );
			BuildViewConverterFor( data.toModel ).fromElement( 'b' ).toAttribute( 'bold', true );

			data.set( '<p>foo<b>bar</b></p>' );

			expect( getData( modelDocument, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo<$text bold=true>bar</$text></paragraph>' );
		} );
	} );
} );
