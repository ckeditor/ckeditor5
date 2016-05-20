/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: conversion */

'use strict';

import ViewConversionDispatcher from '/ckeditor5/engine/conversion/viewconversiondispatcher.js';
import ViewContainerElement from '/ckeditor5/engine/view/containerelement.js';
import ViewAttributeElement from '/ckeditor5/engine/view/attributeelement.js';
import ViewDocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import ViewText from '/ckeditor5/engine/view/text.js';

describe( 'ViewConversionDispatcher', () => {
	describe( 'constructor', () => {
		it( 'should create ViewConversionDispatcher with passed api', () => {
			const apiObj = {};
			const dispatcher = new ViewConversionDispatcher( { apiObj } );

			expect( dispatcher.conversionApi.apiObj ).to.equal( apiObj );
			expect( dispatcher.conversionApi ).to.have.property( 'convertItem' ).that.is.instanceof( Function );
			expect( dispatcher.conversionApi ).to.have.property( 'convertChildren' ).that.is.instanceof( Function );
		} );
	} );

	describe( 'convert', () => {
		let dispatcher;

		beforeEach( () => {
			dispatcher = new ViewConversionDispatcher();
		} );

		it( 'should fire viewCleanup event on converted view part', () => {
			sinon.spy( dispatcher, 'fire' );

			const viewP = new ViewContainerElement( 'p' );
			dispatcher.convert( viewP );

			expect( dispatcher.fire.calledWith( 'viewCleanup', viewP ) ).to.be.true;
		} );

		it( 'should fire proper events', () => {
			const viewText = new ViewText( 'foobar' );
			const viewElement = new ViewContainerElement( 'p', null, viewText );
			const viewFragment = new ViewDocumentFragment( viewElement );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.convert( viewText );
			dispatcher.convert( viewElement );
			dispatcher.convert( viewFragment );

			expect( dispatcher.fire.calledWith( 'text' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'element:p' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'documentFragment' ) ).to.be.true;
		} );

		it( 'should convert ViewText', () => {
			const viewText = new ViewText( 'foobar' );

			dispatcher.on( 'text', ( evt, data, consumable, conversionApi ) => {
				const result = {
					eventName: evt.name,
					input: data.input,
					// Check whether additional data has been passed.
					foo: data.foo
				};

				// Check whether consumable has appropriate value to consume.
				expect( consumable.consume( data.input ) ).to.be.true;

				// Check whether conversionApi of `dispatcher` has been passed.
				expect( conversionApi ).to.equal( dispatcher.conversionApi );

				// Set conversion result to `output` property of `data`.
				// Later we will check if it was returned by `convert` method.
				data.output = result;
			} );

			// Use `additionalData` parameter to check if it was passed to the event.
			const result = dispatcher.convert( viewText, { foo: 'bar' } );

			// Check conversion result.
			expect( result ).to.deep.equal( {
				eventName: 'text',
				input: viewText,
				foo: 'bar'
			} );
		} );

		it( 'should convert ViewContainerElement', () => {
			const viewElement = new ViewContainerElement( 'p', { attrKey: 'attrValue' } );

			dispatcher.on( 'element', ( evt, data, consumable, conversionApi ) => {
				const result = {
					eventName: evt.name,
					input: data.input,
					// Check whether additional data has been passed.
					foo: data.foo
				};

				// Check whether consumable has appropriate value to consume.
				expect( consumable.consume( data.input, { name: true } ) ).to.be.true;
				expect( consumable.consume( data.input, { attribute: 'attrKey' } ) ).to.be.true;

				// Check whether conversionApi of `dispatcher` has been passed.
				expect( conversionApi ).to.equal( dispatcher.conversionApi );

				// Set conversion result to `output` property of `data`.
				// Later we will check if it was returned by `convert` method.
				data.output = result;
			} );

			// Use `additionalData` parameter to check if it was passed to the event.
			const result = dispatcher.convert( viewElement, { foo: 'bar' } );

			// Check conversion result.
			expect( result ).to.deep.equal( {
				eventName: 'element:p',
				input: viewElement,
				foo: 'bar'
			} );
		} );

		it( 'should convert ViewDocumentFragment', () => {
			const viewFragment = new ViewDocumentFragment();

			dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
				const result = {
					eventName: evt.name,
					input: data.input,
					// Check whether additional data has been passed.
					foo: data.foo
				};

				// Check whether consumable has appropriate value to consume.
				expect( consumable.consume( data.input ) ).to.be.true;

				// Check whether conversionApi of `dispatcher` has been passed.
				expect( conversionApi ).to.equal( dispatcher.conversionApi );

				// Set conversion result to `output` property of `data`.
				// Later we will check if it was returned by `convert` method.
				data.output = result;
			} );

			// Use `additionalData` parameter to check if it was passed to the event.
			const result = dispatcher.convert( viewFragment, { foo: 'bar' } );

			// Check conversion result.
			expect( result ).to.deep.equal( {
				eventName: 'documentFragment',
				input: viewFragment,
				foo: 'bar'
			} );
		} );
	} );

	describe( 'conversionApi#convertItem', () => {
		it( 'should convert view elements and view text', () => {
			const dispatcher = new ViewConversionDispatcher();
			const viewFragment = new ViewDocumentFragment( [
				new ViewContainerElement( 'p' ), new ViewText( 'foobar' )
			] );

			dispatcher.on( 'text', ( evt, data ) => {
				data.output = { text: data.input.data };
			} );

			dispatcher.on( 'element:p', ( evt, data ) => {
				data.output = { name: 'p' };
			} );

			dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
				data.output = [];

				for ( let child of data.input.getChildren() ) {
					data.output.push( conversionApi.convertItem( child ) );
				}
			} );

			const result = dispatcher.convert( viewFragment );

			expect( result ).to.deep.equal( [
				{ name: 'p' },
				{ text: 'foobar' }
			] );
		} );
	} );

	describe( 'conversionApi#convertChildren', () => {
		it( 'should fire proper events for all children of passed view part', () => {
			const dispatcher = new ViewConversionDispatcher();
			const viewFragment = new ViewDocumentFragment( [
				new ViewContainerElement( 'p' ), new ViewText( 'foobar' )
			] );

			dispatcher.on( 'text', ( evt, data ) => {
				data.output = { text: data.input.data };
			} );

			dispatcher.on( 'element:p', ( evt, data ) => {
				data.output = { name: 'p' };
			} );

			dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
				data.output = conversionApi.convertChildren( data.input );
			} );

			const result = dispatcher.convert( viewFragment );

			expect( result ).to.deep.equal( [
				{ name: 'p' },
				{ text: 'foobar' }
			] );
		} );

		it( 'should flatten structure of non-converted elements', () => {
			const dispatcher = new ViewConversionDispatcher();

			dispatcher.on( 'text', ( evt, data ) => {
				data.output = data.input.data;
			} );

			dispatcher.on( 'element', ( evt, data, consumable, conversionApi ) => {
				data.output = conversionApi.convertChildren( data.input, consumable );
			} );

			const viewStructure = new ViewContainerElement( 'div', null, [
				new ViewContainerElement( 'p', null, [
					new ViewContainerElement( 'span', { class: 'nice' }, [
						new ViewAttributeElement( 'a', { href: 'foo.html' }, new ViewText( 'foo' ) ),
						new ViewText( ' bar ' ),
						new ViewAttributeElement( 'i', null, new ViewText( 'xyz' ) )
					] )
				] ),
				new ViewContainerElement( 'p', null, [
					new ViewAttributeElement( 'strong', null, [
						new ViewText( 'aaa ' ),
						new ViewAttributeElement( 'span', null, new ViewText( 'bbb' ) ),
						new ViewText( ' ' ),
						new ViewAttributeElement( 'a', { href: 'bar.html' }, new ViewText( 'ccc' ) )
					] )
				] )
			] );

			expect( dispatcher.convert( viewStructure ) ).to.deep.equal( [ 'foo', ' bar ', 'xyz', 'aaa ', 'bbb', ' ', 'ccc' ] );
		} );
	} );
} );
