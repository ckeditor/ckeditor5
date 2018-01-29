/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewConversionDispatcher from '../../src/conversion/viewconversiondispatcher';
import ViewContainerElement from '../../src/view/containerelement';
import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewText from '../../src/view/text';

import Model from '../../src/model/model';
import ModelText from '../../src/model/text';
import ModelTextProxy from '../../src/model/textproxy';
import ModelElement from '../../src/model/element';
import ModelDocumentFragment from '../../src/model/documentfragment';
import ModelPosition from '../../src/model/position';
import ModelRange from '../../src/model/range';
import ModelWriter from '../../src/model/writer';

import first from '@ckeditor/ckeditor5-utils/src/first';
import log from '@ckeditor/ckeditor5-utils/src/log';

// Stored in case it is silenced and has to be restored.
const logWarn = log.warn;

describe( 'ViewConversionDispatcher', () => {
	let model;

	beforeEach( () => {
		model = new Model();
		log.warn = logWarn;
	} );

	describe( 'constructor()', () => {
		it( 'should create ViewConversionDispatcher with passed api', () => {
			const apiObj = {};
			const dispatcher = new ViewConversionDispatcher( model, { apiObj } );

			expect( dispatcher.conversionApi.apiObj ).to.equal( apiObj );
			expect( dispatcher.conversionApi ).to.have.property( 'convertItem' ).that.is.instanceof( Function );
			expect( dispatcher.conversionApi ).to.have.property( 'convertChildren' ).that.is.instanceof( Function );
			expect( dispatcher.conversionApi ).to.have.property( 'splitToAllowedParent' ).that.is.instanceof( Function );
		} );
	} );

	describe( 'convert()', () => {
		let dispatcher;

		beforeEach( () => {
			dispatcher = new ViewConversionDispatcher( model );
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
				expect( data.position ).to.instanceof( ModelPosition );

				// Check whether consumable has appropriate value to consume.
				expect( consumable.consume( data.input ) ).to.be.true;

				// Check whether conversionApi of `dispatcher` has been passed.
				expect( conversionApi ).to.equal( dispatcher.conversionApi );

				const text = conversionApi.writer.createText( data.input.data );
				conversionApi.writer.insert( text, data.position );

				// Set conversion result to `output` property of `data`.
				// Later we will check if it was returned by `convert` method.
				data.output = ModelRange.createOn( text );
			} );

			const conversionResult = dispatcher.convert( viewText );

			// Check conversion result.
			// Result should be wrapped in document fragment.
			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foobar' );
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
				expect( data.position ).to.instanceof( ModelPosition );

				// Check whether consumable has appropriate value to consume.
				expect( consumable.consume( data.input, { name: true } ) ).to.be.true;
				expect( consumable.consume( data.input, { attribute: 'attrKey' } ) ).to.be.true;

				// Check whether conversionApi of `dispatcher` has been passed.
				expect( conversionApi ).to.equal( dispatcher.conversionApi );

				const paragraph = conversionApi.writer.createElement( 'paragraph' );
				conversionApi.writer.insert( paragraph, data.position );

				// Set conversion result to `output` property of `data`.
				// Later we will check if it was returned by `convert` method.
				data.output = ModelRange.createOn( paragraph );
			} );

			// Use `additionalData` parameter to check if it was passed to the event.
			const conversionResult = dispatcher.convert( viewElement );

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
				expect( data.position ).to.instanceof( ModelPosition );

				// Check whether consumable has appropriate value to consume.
				expect( consumable.consume( data.input ) ).to.be.true;

				// Check whether conversionApi of `dispatcher` has been passed.
				expect( conversionApi ).to.equal( dispatcher.conversionApi );

				const text = conversionApi.writer.createText( 'foo' );
				conversionApi.writer.insert( text, data.position );

				// Set conversion result to `output` property of `data`.
				// Later we will check if it was returned by `convert` method.
				data.output = ModelRange.createOn( text );
			} );

			// Use `additionalData` parameter to check if it was passed to the event.
			const conversionResult = dispatcher.convert( viewFragment );

			// Check conversion result.
			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foo' );
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should add contextual properties to conversion api', () => {
			const viewElement = new ViewContainerElement( 'p', null, new ViewText( 'foobar' ) );

			// To be sure that both converters was called.
			const spy = sinon.spy();

			// To check that the same batch is used across conversion.
			let batch;

			// Contextual properties of ConversionApi should be undefined/empty before conversion.
			expect( dispatcher.conversionApi.writer ).to.not.ok;
			expect( dispatcher.conversionApi.data ).to.not.ok;
			expect( dispatcher._splitElements.size ).to.equal( 0 );

			dispatcher.on( 'element', ( evt, data, consumable, conversionApi ) => {
				// Check conversion api params.
				expect( conversionApi.writer ).to.instanceof( ModelWriter );
				expect( dispatcher._splitElements ).to.instanceof( Set );
				expect( dispatcher._splitElements.size ).to.equal( 0 );
				expect( conversionApi.data ).to.deep.equal( {} );

				// Remember writer batch to check in next converter that is exactly the same batch.
				batch = conversionApi.writer.batch;

				// Add some data to conversion API to verify them in next converter.
				// Set some custom data to conversion api data object.
				conversionApi.data.foo = 'bar';

				// Do the conversion.
				const paragraph = conversionApi.writer.createElement( 'paragraph' );
				conversionApi.writer.insert( paragraph, data.position );

				// Add empty element and mark as a split result to check in next converter.
				const splitElement = conversionApi.writer.createElement( 'paragraph' );
				dispatcher._splitElements.add( splitElement );
				conversionApi.writer.insert( splitElement, ModelPosition.createAfter( paragraph ) );

				// Convert children - this wil call second converter.
				conversionApi.convertChildren( data.input, consumable, ModelPosition.createAt( paragraph ) );

				data.output = ModelRange.createOn( paragraph );

				spy();
			} );

			dispatcher.on( 'text', ( evt, data, consumable, conversionApi ) => {
				// The same batch is used in converters during one conversion.
				expect( conversionApi.writer.batch ).to.equal( batch );

				// Data set by previous converter are remembered.
				expect( conversionApi.data ).to.deep.equal( { foo: 'bar' } );

				// Split element is remembered as well.
				expect( dispatcher._splitElements.size ).to.equal( 1 );

				spy();
			} );

			dispatcher.convert( viewElement );

			// To be sure that both converters was called.
			sinon.assert.calledTwice( spy );

			// Contextual properties of ConversionApi should be cleared after conversion.
			expect( dispatcher.conversionApi.writer ).to.not.ok;
			expect( dispatcher.conversionApi.data ).to.not.ok;
			expect( dispatcher._splitElements.size ).to.equal( 0 );
		} );

		it( 'should remove empty elements that was created as a result of split', () => {
			const viewElement = new ViewContainerElement( 'p' );

			// To be sure that converter was called.
			const spy = sinon.spy();

			dispatcher.on( 'element', ( evt, data, consumable, conversionApi ) => {
				// First let's convert target element.
				const paragraph = conversionApi.writer.createElement( 'paragraph' );
				conversionApi.writer.insert( paragraph, data.position );

				// Then add some elements and mark as split.

				// Create and insert empty split element before target element.
				const emptySplit = conversionApi.writer.createElement( 'paragraph' );
				conversionApi.writer.insert( emptySplit, ModelPosition.createAfter( paragraph ) );

				// Create and insert not empty split after target element.
				const notEmptySplit = conversionApi.writer.createElement( 'paragraph' );
				conversionApi.writer.appendText( 'foo', notEmptySplit );
				conversionApi.writer.insert( notEmptySplit, ModelPosition.createAfter( emptySplit ) );

				// Create and insert split with other split inside (both should be removed)
				const outerSplit = conversionApi.writer.createElement( 'paragraph' );
				const innerSplit = conversionApi.writer.createElement( 'paragraph' );
				conversionApi.writer.append( innerSplit, outerSplit );
				conversionApi.writer.insert( outerSplit, ModelPosition.createBefore( paragraph ) );

				dispatcher._splitElements.add( emptySplit );
				dispatcher._splitElements.add( notEmptySplit );
				dispatcher._splitElements.add( outerSplit );
				dispatcher._splitElements.add( innerSplit );

				data.output = ModelRange.createOn( paragraph );

				// We have the following result:
				// <p><p></p></p>[<p></p>]<p></p><p>foo</p>
				// Everything out of selected range is a result of the split.

				spy();
			} );

			const result = dispatcher.convert( viewElement );

			// Empty split elements should be removed and we should have the following result:
			// [<p></p>]<p>foo</p>
			expect( result.childCount ).to.equal( 2 );
			expect( result.getChild( 0 ).name ).to.equal( 'paragraph' );
			expect( result.getChild( 0 ).childCount ).to.equal( 0 );
			expect( result.getChild( 1 ).name ).to.equal( 'paragraph' );
			expect( result.getChild( 1 ).childCount ).to.equal( 1 );
			expect( result.getChild( 1 ).getChild( 0 ).data ).to.equal( 'foo' );
		} );

		it( 'should extract temporary markers elements from converter element and create static markers list', () => {
			const viewFragment = new ViewDocumentFragment();

			dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
				const fragment = new ModelDocumentFragment( [
					new ModelText( 'fo' ),
					new ModelElement( '$marker', { 'data-name': 'marker1' } ),
					new ModelText( 'o' ),
					new ModelElement( '$marker', { 'data-name': 'marker2' } ),
					new ModelText( 'b' ),
					new ModelElement( '$marker', { 'data-name': 'marker1' } ),
					new ModelText( 'ar' ),
				] );

				conversionApi.writer.insert( fragment, data.position );

				data.output = ModelRange.createIn( data.position.parent );
			} );

			const conversionResult = dispatcher.convert( viewFragment );

			expect( conversionResult.markers.size ).to.equal( 2 );

			const marker1 = conversionResult.markers.get( 'marker1' );
			const marker2 = conversionResult.markers.get( 'marker2' );

			expect( marker1.start.path ).to.deep.equal( [ 2 ] );
			expect( marker1.end.path ).to.deep.equal( [ 4 ] );
			expect( marker2.start.path ).to.deep.equal( marker2.end.path ).to.deep.equal( [ 3 ] );
		} );
	} );

	describe( 'conversionApi', () => {
		let spy, spyP, spyText, viewP, viewText, modelP, modelText, consumableMock, rootMock, dispatcher,
			spyNull, spyArray, viewDiv, viewNull, viewArray;

		beforeEach( () => {
			spy = sinon.spy();
			spyP = sinon.spy();
			spyText = sinon.spy();

			viewP = new ViewContainerElement( 'p' );
			viewText = new ViewText( 'foobar' );
			modelP = new ModelElement( 'paragraph' );
			modelText = new ModelText( 'foobar' );

			// Put nodes to documentFragment, this will mock root element and makes possible to create range on them.
			rootMock = new ModelDocumentFragment( [ modelP, modelText ] );

			consumableMock = {};

			dispatcher = new ViewConversionDispatcher( model, { schema: model.schema } );

			dispatcher.on( 'element:p', ( evt, data, consumable ) => {
				spyP();

				expect( consumable ).to.equal( consumableMock );

				data.output = ModelRange.createOn( modelP );
			} );

			dispatcher.on( 'text', ( evt, data, consumable ) => {
				spyText();

				expect( consumable ).to.equal( consumableMock );

				data.output = ModelRange.createOn( modelText );
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

		describe( 'convertItem()', () => {
			it( 'should pass consumable and additional data to proper converter and return data.output', () => {
				silenceWarnings();

				dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
					spy();

					const result1 = conversionApi.convertItem( viewP, consumableMock, data.position );
					expect( result1 ).instanceof( ModelRange );
					expect( result1.start.path ).to.deep.equal( [ 0 ] );
					expect( result1.end.path ).to.deep.equal( [ 1 ] );
					expect( first( result1.getItems() ) ).to.equal( modelP );

					const result2 = conversionApi.convertItem( viewText, consumableMock, data.position );
					expect( result2 ).instanceof( ModelRange );
					expect( result2.start.path ).to.deep.equal( [ 1 ] );
					expect( result2.end.path ).to.deep.equal( [ 7 ] );
					expect( first( result2.getItems() ) ).to.instanceof( ModelTextProxy );
					expect( first( result2.getItems() ).data ).to.equal( 'foobar' );
				} );

				dispatcher.convert( new ViewDocumentFragment() );

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

		describe( 'convertChildren()', () => {
			it( 'should fire conversion for all children of passed element and return conversion results ' +
				'wrapped in document fragment', () => {
				silenceWarnings();

				dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
					spy();

					const result = conversionApi.convertChildren( data.input, consumableMock, ModelPosition.createAt( rootMock ) );

					expect( result ).to.be.instanceof( ModelRange );
					expect( result.start.path ).to.deep.equal( [ 0 ] );
					expect( result.end.path ).to.deep.equal( [ 7 ] );
					expect( Array.from( result.getItems() ) ).to.length( 2 );
					expect( Array.from( result.getItems() )[ 0 ] ).to.equal( modelP );
					expect( Array.from( result.getItems() )[ 1 ] ).to.instanceof( ModelTextProxy );
					expect( Array.from( result.getItems() )[ 1 ].data ).to.equal( 'foobar' );
				} );

				dispatcher.convert( new ViewDocumentFragment( [ viewP, viewText ] ) );

				expect( spy.calledOnce ).to.be.true;
				expect( spyP.calledOnce ).to.be.true;
				expect( spyText.calledOnce ).to.be.true;
			} );

			it( 'should filter out incorrectly converted elements and log warnings', () => {
				sinon.stub( log, 'warn' );

				dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
					spy();

					const result = conversionApi.convertChildren( data.input, consumableMock, ModelPosition.createAt( rootMock ) );

					expect( result ).to.be.instanceof( ModelRange );
					expect( result.start.path ).to.deep.equal( [ 0 ] );
					expect( result.end.path ).to.deep.equal( [ 7 ] );
					expect( Array.from( result.getItems() ) ).to.length( 2 );
					expect( Array.from( result.getItems() )[ 0 ] ).to.equal( modelP );
					expect( Array.from( result.getItems() )[ 1 ] ).to.instanceof( ModelTextProxy );
					expect( Array.from( result.getItems() )[ 1 ].data ).to.equal( 'foobar' );
				} );

				dispatcher.convert( new ViewDocumentFragment( [ viewArray, viewP, viewDiv, viewText, viewNull ] ) );

				expect( spy.calledOnce ).to.be.true;
				expect( spyNull.calledOnce ).to.be.true;
				expect( spyArray.calledOnce ).to.be.true;
				expect( log.warn.calledOnce ).to.be.true;

				log.warn.restore();
			} );
		} );

		describe( 'splitToAllowedParent()', () => {
			beforeEach( () => {
				model.schema.register( 'paragraph', {
					allowIn: '$root'
				} );
			} );

			it( 'should return current position if element is allowed on this position', () => {
				const spy = sinon.spy();

				model.schema.register( 'span', {
					allowIn: 'paragraph'
				} );

				dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
					const paragraph = conversionApi.writer.createElement( 'paragraph' );
					const span = conversionApi.writer.createElement( 'span' );
					const position = ModelPosition.createAt( paragraph );

					const result = conversionApi.splitToAllowedParent( span, position );

					expect( result ).to.deep.equal( { position } );
					spy();
				} );

				dispatcher.convert( new ViewDocumentFragment() );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should split position to allowed ancestor if element is allowed in one of ancestors', () => {
				const spy = sinon.spy();

				model.schema.register( 'section', {
					allowIn: '$root'
				} );
				model.schema.register( 'span', {
					allowIn: 'paragraph'
				} );
				model.schema.extend( 'paragraph', {
					allowIn: 'section'
				} );

				dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
					const section = conversionApi.writer.createElement( 'section' );
					const paragraph = conversionApi.writer.createElement( 'paragraph' );
					const span = conversionApi.writer.createElement( 'span' );
					conversionApi.writer.insert( paragraph, section );
					conversionApi.writer.insert( span, paragraph );

					const position = ModelPosition.createAt( span );

					const paragraph2 = conversionApi.writer.createElement( 'paragraph' );
					const result = conversionApi.splitToAllowedParent( paragraph2, position );

					expect( result ).to.deep.equal( {
						position: ModelPosition.createAfter( paragraph ),
						endElement: paragraph.parent.getChild( 1 ).getChild( 0 )
					} );

					spy();
				} );

				dispatcher.convert( new ViewDocumentFragment() );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should return null if element is not allowed in position and any of ancestors', () => {
				const spy = sinon.spy();

				model.schema.register( 'span' );

				dispatcher.on( 'documentFragment', ( evt, data, consumable, conversionApi ) => {
					const paragraph = conversionApi.writer.createElement( 'paragraph' );
					const span = conversionApi.writer.createElement( 'span' );
					const position = ModelPosition.createAt( paragraph );

					const result = conversionApi.splitToAllowedParent( span, position );

					expect( result ).to.null;
					spy();
				} );

				dispatcher.convert( new ViewDocumentFragment() );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	// Silences warnings that pop up in tests. Use when the test checks a specific functionality and we are not interested in those logs.
	// No need to restore `log.warn` - it is done in `afterEach()`.
	function silenceWarnings() {
		log.warn = () => {};
	}
} );
