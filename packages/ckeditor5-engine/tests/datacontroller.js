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
import BuildModelConverterFor  from '/ckeditor5/engine/treecontroller/model-converter-builder.js';

import { getData, setData } from '/tests/engine/_utils/model.js';

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

	describe( 'get', () => {
		it( 'should get paragraph with text', () => {
			setData( modelDocument, '<paragraph>foo</paragraph>' );

			BuildModelConverterFor( data.toView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foo</p>' );
		} );

		it( 'should get empty paragraph', () => {
			setData( modelDocument, '<paragraph></paragraph>' );

			BuildModelConverterFor( data.toView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>&nbsp;</p>' );
		} );

		it( 'should get two paragraphs', () => {
			setData( modelDocument, '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			BuildModelConverterFor( data.toView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should get text directly in root', () => {
			setData( modelDocument, 'foo' );

			expect( data.get() ).to.equal( 'foo' );
		} );

		it( 'should get paragraphs without bold', () => {
			setData( modelDocument, '<paragraph>foo<$text bold=true>bar</$text></paragraph>' );

			BuildModelConverterFor( data.toView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foobar</p>' );
		} );

		it( 'should get paragraphs with bold', () => {
			setData( modelDocument, '<paragraph>foo<$text bold=true>bar</$text></paragraph>' );

			BuildModelConverterFor( data.toView ).fromElement( 'paragraph' ).toElement( 'p' );
			BuildModelConverterFor( data.toView ).fromAttribute( 'bold' ).toElement( 'b' );

			expect( data.get() ).to.equal( '<p>foo<b>bar</b></p>' );
		} );
	} );

	describe( 'destroy', () => {
		it( 'should be there for you', () => {
			expect( data ).to.respondTo( 'destroy' );
		} );
	} );
} );
