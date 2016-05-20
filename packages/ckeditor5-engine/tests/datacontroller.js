/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

'use strict';

import ModelDocument from '/ckeditor5/engine/model/document.js';
import DataController from '/ckeditor5/engine/datacontroller.js';
import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/HtmlDataProcessor.js';

import BuildViewConverterFor  from '/ckeditor5/engine/conversion/view-converter-builder.js';
import BuildModelConverterFor  from '/ckeditor5/engine/conversion/model-converter-builder.js';

import { getData, setData, stringify } from '/tests/engine/_utils/model.js';

import count from '/ckeditor5/utils/count.js';

describe( 'DataController', () => {
	let modelDocument, htmlDataProcessor, data, schema;

	beforeEach( () => {
		modelDocument = new ModelDocument();
		modelDocument.createRoot( 'main' );
		modelDocument.createRoot( 'title' );

		htmlDataProcessor = new HtmlDataProcessor();

		data = new DataController( modelDocument, htmlDataProcessor );

		schema = modelDocument.schema;
	} );

	describe( 'parse', () => {
		it( 'should set text', () => {
			schema.allow( { name: '$text', inside: '$root' } );
			const model = data.parse( '<p>foo<b>bar</b></p>' );

			expect( stringify( model ) ).to.equal( 'foobar' );
		} );

		it( 'should set paragraph', () => {
			schema.registerItem( 'paragraph', '$block' );

			BuildViewConverterFor( data.viewToModel ).fromElement( 'p' ).toElement( 'paragraph' );

			const model = data.parse( '<p>foo<b>bar</b></p>' );

			expect( stringify( model ) ).to.equal( '<paragraph>foobar</paragraph>' );
		} );

		it( 'should set two paragraphs', () => {
			schema.registerItem( 'paragraph', '$block' );

			BuildViewConverterFor( data.viewToModel ).fromElement( 'p' ).toElement( 'paragraph' );

			const model = data.parse( '<p>foo</p><p>bar</p>' );

			expect( stringify( model ) ).to.equal(
				'<paragraph>foo</paragraph><paragraph>bar</paragraph>' );
		} );

		it( 'should set paragraphs with bold', () => {
			schema.registerItem( 'paragraph', '$block' );
			schema.allow( { name: '$text', attributes: [ 'bold' ], inside: '$block' } );

			BuildViewConverterFor( data.viewToModel ).fromElement( 'p' ).toElement( 'paragraph' );
			BuildViewConverterFor( data.viewToModel ).fromElement( 'b' ).toAttribute( 'bold', true );

			const model = data.parse( '<p>foo<b>bar</b></p>' );

			expect( stringify( model ) ).to.equal(
				'<paragraph>foo<$text bold=true>bar</$text></paragraph>' );
		} );
	} );

	describe( 'set', () => {
		it( 'should set data to root', () => {
			schema.allow( { name: '$text', inside: '$root' } );
			data.set( 'foo' );

			expect( getData( modelDocument, { withoutSelection: true } ) ).to.equal( 'foo' );
		} );

		it( 'should create a batch', () => {
			schema.allow( { name: '$text', inside: '$root' } );
			data.set( 'foo' );

			expect( count( modelDocument.history.getDeltas() ) ).to.equal( 1 );
		} );

		it( 'should get root name as a parameter', () => {
			schema.allow( { name: '$text', inside: '$root' } );
			data.set( 'main', 'foo' );
			data.set( 'title', 'Bar' );

			expect( getData( modelDocument, { withoutSelection: true, rootName: 'main' } ) ).to.equal( 'foo' );
			expect( getData( modelDocument, { withoutSelection: true, rootName: 'title' } ) ).to.equal( 'Bar' );

			expect( count( modelDocument.history.getDeltas() ) ).to.equal( 2 );
		} );
	} );

	describe( 'get', () => {
		it( 'should get paragraph with text', () => {
			setData( modelDocument, '<paragraph>foo</paragraph>' );

			BuildModelConverterFor( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foo</p>' );
		} );

		it( 'should get empty paragraph', () => {
			setData( modelDocument, '<paragraph></paragraph>' );

			BuildModelConverterFor( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>&nbsp;</p>' );
		} );

		it( 'should get two paragraphs', () => {
			setData( modelDocument, '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			BuildModelConverterFor( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should get text directly in root', () => {
			setData( modelDocument, 'foo' );

			expect( data.get() ).to.equal( 'foo' );
		} );

		it( 'should get paragraphs without bold', () => {
			setData( modelDocument, '<paragraph>foo<$text bold=true>bar</$text></paragraph>' );

			BuildModelConverterFor( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foobar</p>' );
		} );

		it( 'should get paragraphs with bold', () => {
			setData( modelDocument, '<paragraph>foo<$text bold=true>bar</$text></paragraph>' );

			BuildModelConverterFor( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
			BuildModelConverterFor( data.modelToView ).fromAttribute( 'bold' ).toElement( 'b' );

			expect( data.get() ).to.equal( '<p>foo<b>bar</b></p>' );
		} );

		it( 'should get root name as a parameter', () => {
			setData( modelDocument, '<paragraph>foo</paragraph>', { rootName: 'main' } );
			setData( modelDocument, 'Bar', { rootName: 'title' } );

			BuildModelConverterFor( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
			BuildModelConverterFor( data.modelToView ).fromAttribute( 'bold' ).toElement( 'b' );

			expect( data.get() ).to.equal( '<p>foo</p>' );
			expect( data.get( 'main' ) ).to.equal( '<p>foo</p>' );
			expect( data.get( 'title' ) ).to.equal( 'Bar' );
		} );
	} );

	describe( 'destroy', () => {
		it( 'should be there for you', () => {
			// Should not throw.
			data.destroy();

			expect( data ).to.respondTo( 'destroy' );
		} );
	} );
} );
