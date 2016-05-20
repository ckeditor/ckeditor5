/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: conversion */

'use strict';

import ViewConversionDispatcher from '/ckeditor5/engine/conversion/viewconversiondispatcher.js';
import ViewContainerElement from '/ckeditor5/engine/view/containerelement.js';
import ViewDocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import ViewText from '/ckeditor5/engine/view/text.js';

import ModelSchema from '/ckeditor5/engine/model/schema.js';
import ModelDocumentFragment from '/ckeditor5/engine/model/documentfragment.js';
import ModelElement from '/ckeditor5/engine/model/element.js';
import ModelText from '/ckeditor5/engine/model/text.js';

import { convertToModelFragment, convertText } from '/ckeditor5/engine/conversion/view-to-model-converters.js';

let dispatcher, schema, objWithContext;

beforeEach( () => {
	schema = new ModelSchema();
	schema.registerItem( 'paragraph', '$block' );
	schema.allow( { name: '$text', inside: '$root' } );
	objWithContext = { context: [ '$root' ] };
	dispatcher = new ViewConversionDispatcher( { schema } );
} );

describe( 'convertText', () => {
	it( 'should return converter converting ViewText to ModelText', () => {
		const viewText = new ViewText( 'foobar' );

		dispatcher.on( 'text', convertText() );

		const result = dispatcher.convert( viewText, objWithContext );

		expect( result ).to.be.instanceof( ModelText );
		expect( result.text ).to.equal( 'foobar' );
	} );

	it( 'should not convert already consumed texts', () => {
		const viewText = new ViewText( 'foofuckbafuckr' );

		// Default converter for elements. Returns just converted children. Added with late priority.
		dispatcher.on( 'text', convertText(), dispatcher, 9999 );
		// Added with sooner priority. Should make the above converter not fire.
		dispatcher.on( 'text', ( evt, data, consumable ) => {
			if ( consumable.consume( data.input ) ) {
				data.output = new ModelText( data.input.data.replace( /fuck/gi, '****' ) );
			}
		} );

		const result = dispatcher.convert( viewText, objWithContext );

		expect( result ).to.be.instanceof( ModelText );
		expect( result.text ).to.equal( 'foo****ba****r' );
	} );

	it( 'should not convert text if it is wrong with schema', () => {
		schema.disallow( { name: '$text', inside: '$root' } );

		const viewText = new ViewText( 'foobar' );
		dispatcher.on( 'text', convertText() );

		let result = dispatcher.convert( viewText, objWithContext );

		expect( result ).to.be.null;

		result = dispatcher.convert( viewText, { context: [ '$block' ] } );
		expect( result ).to.be.instanceof( ModelText );
		expect( result.text ).to.equal( 'foobar' );
	} );
} );

describe( 'convertToModelFragment', () => {
	it( 'should return converter converting whole ViewDocumentFragment to ModelDocumentFragment', () => {
		const viewFragment = new ViewDocumentFragment( [
			new ViewContainerElement( 'p', null, new ViewText( 'foo' ) ),
			new ViewText( 'bar' )
		] );

		// To get any meaningful results we have to actually convert something.
		dispatcher.on( 'text', convertText() );
		// This way P element won't be converted per-se but will fire converting it's children.
		dispatcher.on( 'element', convertToModelFragment() );
		dispatcher.on( 'documentFragment', convertToModelFragment() );

		const result = dispatcher.convert( viewFragment, objWithContext );

		expect( result ).to.be.instanceof( ModelDocumentFragment );
		expect( result.getChildCount() ).to.equal( 6 );
		expect( result.getChild( 0 ).character ).to.equal( 'f' );
		expect( result.getChild( 1 ).character ).to.equal( 'o' );
		expect( result.getChild( 2 ).character ).to.equal( 'o' );
		expect( result.getChild( 3 ).character ).to.equal( 'b' );
		expect( result.getChild( 4 ).character ).to.equal( 'a' );
		expect( result.getChild( 5 ).character ).to.equal( 'r' );
	} );

	it( 'should not convert already consumed (converted) changes', () => {
		const viewP = new ViewContainerElement( 'p', null, new ViewText( 'foo' ) );

		// To get any meaningful results we have to actually convert something.
		dispatcher.on( 'text', convertText() );
		// Default converter for elements. Returns just converted children. Added with late priority.
		dispatcher.on( 'element', convertToModelFragment(), dispatcher, 9999 );
		// Added with sooner priority. Should make the above converter not fire.
		dispatcher.on( 'element:p', ( evt, data, consumable, conversionApi ) => {
			if ( consumable.consume( data.input, { name: true } ) ) {
				data.output = new ModelElement( 'paragraph' );

				data.context.push( data.output );
				data.output.appendChildren( conversionApi.convertChildren( data.input, consumable, data ) );
				data.context.pop();
			}
		} );

		const result = dispatcher.convert( viewP, objWithContext );

		expect( result ).to.be.instanceof( ModelElement );
		expect( result.name ).to.equal( 'paragraph' );
		expect( result.getChildCount() ).to.equal( 3 );
		expect( result.getChild( 0 ).character ).to.equal( 'f' );
		expect( result.getChild( 1 ).character ).to.equal( 'o' );
		expect( result.getChild( 2 ).character ).to.equal( 'o' );
	} );
} );
