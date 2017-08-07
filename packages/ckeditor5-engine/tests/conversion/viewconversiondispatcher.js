/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewConversionDispatcher from '../../src/conversion/viewconversiondispatcher';
import ViewContainerElement from '../../src/view/containerelement';
import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewText from '../../src/view/text';

import ModelText from '../../src/model/text';
import ModelElement from '../../src/model/element';
import ModelDocumentFragment from '../../src/model/documentfragment';
import { stringify } from '../../src/dev-utils/model';

import log from '@ckeditor/ckeditor5-utils/src/log';

// Stored in case it is silenced and has to be restored.
const logWarn = log.warn;

describe( 'ViewConversionDispatcher', () => {
	afterEach( () => {
		log.warn = logWarn;
	} );

	describe( 'constructor()', () => {
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
			silenceWarnings();

			sinon.spy( dispatcher, 'fire' );

			const viewP = new ViewContainerElement( 'p' );
			dispatcher.convert( viewP );

			expect( dispatcher.fire.calledWith( 'viewCleanup', viewP ) ).to.be.true;
		} );

		it( 'should fire proper events', () => {
			silenceWarnings();

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
			const spy = sinon.spy();
			const viewText = new ViewText( 'foobar' );

			dispatcher.on( 'text', ( evt, data, consumable, conversionApi ) => {
				// Check if this method has been fired.
				spy();

				// Check correctness of passed parameters.
				expect( evt.name ).to.equal( 'text' );
				expect( data.input ).to.equal( viewText );
				expect( data.foo ).to.equal( 'bar' );

				// Check whether consumable has appropriate value to consume.
				expect( consumable.consume( data.input ) ).to.be.true;

				// Check whether conversionApi of `dispatcher` has been passed.
				expect( conversionApi ).to.equal( dispatcher.conversionApi );

				// Set conversion result to `output` property of `data`.
				// Later we will check if it was returned by `convert` method.
				data.output = new ModelText( data.foo );
			} );

			// Use `additionalData` parameter to check if it was passed to the event.
			const conversionResult = dispatcher.convert( viewText, { foo: 'bar' } );

			// Check conversion result.
			// Result should be wrapped in document fragment.
			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'bar' );
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should convert ViewContainerElement', () => {
			const spy = sinon.spy();
			const viewElement = new ViewContainerElement( 'p', { attrKey: 'attrValue' } );

			dispatcher.on( 'element', ( evt, data, consumable, conversionApi ) => {
				// Check if this method has been fired.
				spy();

				// Check correctness of passed parameters.
				expect( evt.name ).to.equal( 'element:p' );
				expect( data.input ).to.equal( viewElement );
				expect( data.foo ).to.equal( 'bar' );

				// Check whether consumable has appropriate value to consume.
				expect( consumable.consume( data.input, { name: true } ) ).to.be.true;
				expect( consumable.consume( data.input, { attribute: 'attrKey' } ) ).to.be.true;

				// Check whether conversionApi of `dispatcher` has been passed.
				expect( conversionApi ).to.equal( dispatcher.conversionApi );

				// Set conversion result to `output` property of `data`.
				// Later we will check if it was returned by `convert` method.
				data.output = new ModelElement( 'paragraph' );
			} );

			// Use `additionalData` parameter to check if it was passed to the event.
			const conversionResult = dispatcher.convert( viewElement, { foo: 'bar' } );

			// Check conversion result.
			// Result should be wrapped in document fragment.
			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ).name ).to.equal( 'paragraph' );
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should convert ViewDocumentFragment', () => {
			const spy = sinon.spy();
			const viewFragment = new ViewDocumentFragment();

			dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
				// Check if this method has been fired.
				spy();

				// Check correctness of passed parameters.
				expect( evt.name ).to.equal( 'documentFragment' );
				expect( data.input ).to.equal( viewFragment );
				expect( data.foo ).to.equal( 'bar' );

				// Check whether consumable has appropriate value to consume.
				expect( consumable.consume( data.input ) ).to.be.true;

				// Check whether conversionApi of `dispatcher` has been passed.
				expect( conversionApi ).to.equal( dispatcher.conversionApi );

				// Set conversion result to `output` property of `data`.
				// Later we will check if it was returned by `convert` method.
				data.output = new ModelDocumentFragment( [ new ModelText( 'foo' ) ] );
			} );

			// Use `additionalData` parameter to check if it was passed to the event.
			const conversionResult = dispatcher.convert( viewFragment, { foo: 'bar' } );

			// Check conversion result.
			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foo' );
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should extract temporary markers elements from converter element and create static markers list', () => {
			const viewFragment = new ViewDocumentFragment();

			dispatcher.on( 'documentFragment', ( evt, data ) => {
				data.output = new ModelDocumentFragment( [
					new ModelText( 'fo' ),
					new ModelElement( '$marker', { 'data-name': 'marker1' } ),
					new ModelText( 'o' ),
					new ModelElement( '$marker', { 'data-name': 'marker2' } ),
					new ModelText( 'b' ),
					new ModelElement( '$marker', { 'data-name': 'marker1' } ),
					new ModelText( 'ar' ),
				] );
			} );

			const conversionResult = dispatcher.convert( viewFragment );

			expect( conversionResult.markers.size ).to.equal( 2 );
			expect( stringify( conversionResult, conversionResult.markers.get( 'marker1' ) ) ).to.deep.equal( 'fo[ob]ar' );
			expect( stringify( conversionResult, conversionResult.markers.get( 'marker2' ) ) ).to.deep.equal( 'foo[]bar' );
		} );
	} );

	describe( 'conversionApi', () => {
		let spy, spyP, spyText, viewP, viewText, modelP, modelText, consumableMock, dispatcher,
			spyNull, spyArray, viewDiv, viewNull, viewArray;

		beforeEach( () => {
			spy = sinon.spy();
			spyP = sinon.spy();
			spyText = sinon.spy();

			viewP = new ViewContainerElement( 'p' );
			viewText = new ViewText( 'foobar' );
			modelP = new ModelElement( 'paragraph' );
			modelText = new ModelText( 'foobar' );

			consumableMock = {};

			dispatcher = new ViewConversionDispatcher();

			dispatcher.on( 'element:p', ( evt, data, consumable ) => {
				spyP();

				expect( data.foo ).to.equal( 'bar' );
				expect( consumable ).to.equal( consumableMock );

				data.output = modelP;
			} );

			dispatcher.on( 'text', ( evt, data, consumable ) => {
				spyText();

				expect( data.foo ).to.equal( 'bar' );
				expect( consumable ).to.equal( consumableMock );

				data.output = modelText;
			} );

			spyNull = sinon.spy();
			spyArray = sinon.spy();

			viewDiv = new ViewContainerElement( 'div' ); // Will not be recognized and not converted.
			viewNull = new ViewContainerElement( 'null' ); // Will return `null` in `data.output` upon conversion.
			viewArray = new ViewContainerElement( 'array' ); // Will return an array in `data.output` upon conversion.

			dispatcher.on( 'element:null', ( evt, data ) => {
				spyNull();

				data.output = null;
			} );

			dispatcher.on( 'element:array', ( evt, data ) => {
				spyArray();

				data.output = [ new ModelText( 'foo' ) ];
			} );
		} );

		describe( 'convertItem', () => {
			it( 'should pass consumable and additional data to proper converter and return data.output', () => {
				silenceWarnings();

				dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
					spy();

					expect( conversionApi.convertItem( viewP, consumableMock, data ) ).to.equal( modelP );
					expect( conversionApi.convertItem( viewText, consumableMock, data ) ).to.equal( modelText );
				} );

				dispatcher.convert( new ViewDocumentFragment(), { foo: 'bar' } );

				expect( spy.calledOnce ).to.be.true;
				expect( spyP.calledOnce ).to.be.true;
				expect( spyText.calledOnce ).to.be.true;
			} );

			it( 'should do nothing if element was not converted', () => {
				sinon.stub( log, 'warn' );

				dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
					spy();

					expect( conversionApi.convertItem( viewDiv ) ).to.equal( null );
					expect( conversionApi.convertItem( viewNull ) ).to.equal( null );
				} );

				dispatcher.convert( new ViewDocumentFragment() );

				expect( spy.calledOnce ).to.be.true;
				expect( spyNull.calledOnce ).to.be.true;
				expect( log.warn.called ).to.be.false;

				log.warn.restore();
			} );

			it( 'should return null if element was incorrectly converted and log a warning', () => {
				sinon.stub( log, 'warn' );

				dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
					spy();

					expect( conversionApi.convertItem( viewArray ) ).to.equal( null );
				} );

				dispatcher.convert( new ViewDocumentFragment() );

				expect( spy.calledOnce ).to.be.true;
				expect( spyArray.calledOnce ).to.be.true;
				expect( log.warn.calledOnce ).to.be.true;

				log.warn.restore();
			} );
		} );

		describe( 'convertChildren', () => {
			it( 'should fire conversion for all children of passed element and return conversion results ' +
				'wrapped in document fragment', () => {
				silenceWarnings();

				dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
					spy();

					const result = conversionApi.convertChildren( data.input, consumableMock, data );

					expect( result ).to.be.instanceof( ModelDocumentFragment );
					expect( result.childCount ).to.equal( 2 );
					expect( result.getChild( 0 ) ).to.equal( modelP );
					expect( result.getChild( 1 ) ).to.equal( modelText );
				} );

				dispatcher.convert( new ViewDocumentFragment( [ viewP, viewText ] ), { foo: 'bar' } );

				expect( spy.calledOnce ).to.be.true;
				expect( spyP.calledOnce ).to.be.true;
				expect( spyText.calledOnce ).to.be.true;
			} );

			it( 'should filter out incorrectly converted elements and log warnings', () => {
				sinon.stub( log, 'warn' );

				dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
					spy();

					const result = conversionApi.convertChildren( data.input, consumableMock, data );

					expect( result ).to.be.instanceof( ModelDocumentFragment );
					expect( result.childCount ).to.equal( 2 );
					expect( result.getChild( 0 ) ).to.equal( modelP );
					expect( result.getChild( 1 ) ).to.equal( modelText );
				} );

				dispatcher.convert( new ViewDocumentFragment( [ viewArray, viewP, viewDiv, viewText, viewNull ] ), { foo: 'bar' } );

				expect( spy.calledOnce ).to.be.true;
				expect( spyNull.calledOnce ).to.be.true;
				expect( spyArray.calledOnce ).to.be.true;
				expect( log.warn.calledOnce ).to.be.true;

				log.warn.restore();
			} );
		} );
	} );

	// Silences warnings that pop up in tests. Use when the test checks a specific functionality and we are not interested in those logs.
	// No need to restore `log.warn` - it is done in `afterEach()`.
	function silenceWarnings() {
		log.warn = () => {};
	}
} );
