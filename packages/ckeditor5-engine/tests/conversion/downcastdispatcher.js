/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';

import DowncastDispatcher from '../../src/conversion/downcastdispatcher.js';
import Mapper from '../../src/conversion/mapper.js';

import Model from '../../src/model/model.js';
import ModelText from '../../src/model/text.js';
import ModelElement from '../../src/model/element.js';
import ModelRootElement from '../../src/model/rootelement.js';
import ModelDocumentFragment from '../../src/model/documentfragment.js';
import ModelRange from '../../src/model/range.js';
import ModelConsumable from '../../src/conversion/modelconsumable.js';

import View from '../../src/view/view.js';
import ViewRootEditableElement from '../../src/view/rooteditableelement.js';
import ViewContainerElement from '../../src/view/containerelement.js';
import DowncastWriter from '../../src/view/downcastwriter.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { insertAttributesAndChildren } from '../../src/conversion/downcasthelpers.js';

describe( 'DowncastDispatcher', () => {
	let dispatcher, doc, root, differStub, model, view, mapper, apiObj;

	beforeEach( () => {
		model = new Model();
		view = new View( new StylesProcessor() );
		doc = model.document;
		mapper = new Mapper();
		apiObj = {};
		dispatcher = new DowncastDispatcher( { mapper, apiObj } );
		root = doc.createRoot();

		// Bind view root and model root. This is normally done by the `EditingController`, but it is not used here.
		const viewRoot = new ViewRootEditableElement( view.document, root.name );
		viewRoot.rootName = root.rootName;
		mapper.bindElements( root, viewRoot );

		dispatcher.on( 'insert', insertAttributesAndChildren(), { priority: 'lowest' } );

		differStub = {
			getMarkersToRemove: () => [],
			getChanges: () => [],
			getMarkersToAdd: () => [],
			getRefreshedItems: () => []
		};
	} );

	describe( 'constructor()', () => {
		it( 'should create DowncastDispatcher with given api template', () => {
			const apiObj = {};
			const dispatcher = new DowncastDispatcher( { apiObj } );

			expect( dispatcher._conversionApi.apiObj ).to.equal( apiObj );
		} );
	} );

	describe( 'convertChanges', () => {
		it( 'should call _convertInsert for insert change', () => {
			let spyConsumableVerify;

			sinon.stub( dispatcher, '_convertInsert' ).callsFake( ( range, conversionApi ) => {
				spyConsumableVerify = spyConsumableVerify || sinon.spy( conversionApi.consumable, 'verifyAllConsumed' );
			} );
			sinon.stub( mapper, 'flushDeferredBindings' );

			const position = model.createPositionFromPath( root, [ 0 ] );
			const range = ModelRange._createFromPositionAndShift( position, 1 );

			differStub.getChanges = () => [ { type: 'insert', position, length: 1 } ];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher._convertInsert.calledOnce ).to.be.true;
			expect( dispatcher._convertInsert.firstCall.args[ 0 ].isEqual( range ) ).to.be.true;

			assertConversionApi( dispatcher._convertInsert.firstCall.args[ 1 ] );

			expect( mapper.flushDeferredBindings.calledOnce ).to.be.true;
			expect( spyConsumableVerify.calledOnce ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should call _convertReinsert for reinsert change', () => {
			sinon.stub( dispatcher, '_convertReinsert' );
			sinon.stub( mapper, 'flushDeferredBindings' );

			const position = model.createPositionFromPath( root, [ 0 ] );
			const range = ModelRange._createFromPositionAndShift( position, 1 );

			differStub.getChanges = () => [ { type: 'reinsert', position, length: 1 } ];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher._convertReinsert.calledOnce ).to.be.true;
			expect( dispatcher._convertReinsert.firstCall.args[ 0 ].isEqual( range ) ).to.be.true;

			assertConversionApi( dispatcher._convertReinsert.firstCall.args[ 1 ] );

			expect( mapper.flushDeferredBindings.calledOnce ).to.be.true;
			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should call _convertRemove for remove change', () => {
			sinon.stub( dispatcher, '_convertRemove' );
			sinon.stub( mapper, 'flushDeferredBindings' );

			const position = model.createPositionFromPath( root, [ 0 ] );

			differStub.getChanges = () => [ { type: 'remove', position, length: 2, name: '$text' } ];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher._convertRemove.calledWith( position, 2, '$text' ) ).to.be.true;

			assertConversionApi( dispatcher._convertRemove.firstCall.args[ 3 ] );

			expect( mapper.flushDeferredBindings.calledOnce ).to.be.true;
			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should call _convertAttribute for attribute change', () => {
			sinon.stub( dispatcher, '_convertAttribute' );
			sinon.stub( mapper, 'flushDeferredBindings' );

			const position = model.createPositionFromPath( root, [ 0 ] );
			const range = ModelRange._createFromPositionAndShift( position, 1 );

			differStub.getChanges = () => [
				{ type: 'attribute', position, range, attributeKey: 'key', attributeOldValue: null, attributeNewValue: 'foo' }
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher._convertAttribute.calledWith( range, 'key', null, 'foo' ) ).to.be.true;

			assertConversionApi( dispatcher._convertAttribute.firstCall.args[ 4 ] );

			expect( mapper.flushDeferredBindings.calledOnce ).to.be.true;
			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should handle multiple changes', () => {
			sinon.stub( dispatcher, '_convertInsert' );
			sinon.stub( dispatcher, '_convertReinsert' );
			sinon.stub( dispatcher, '_convertRemove' );
			sinon.stub( dispatcher, '_convertAttribute' );
			sinon.stub( mapper, 'flushDeferredBindings' );

			const position = model.createPositionFromPath( root, [ 0 ] );
			const range = ModelRange._createFromPositionAndShift( position, 1 );

			differStub.getChanges = () => [
				{ type: 'insert', position, length: 1 },
				{ type: 'reinsert', position, length: 1 },
				{ type: 'attribute', position, range, attributeKey: 'key', attributeOldValue: null, attributeNewValue: 'foo' },
				{ type: 'remove', position, length: 1, name: 'paragraph' },
				{ type: 'insert', position, length: 3 }
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher._convertInsert.calledTwice ).to.be.true;
			expect( dispatcher._convertReinsert.calledOnce ).to.be.true;
			expect( dispatcher._convertRemove.calledOnce ).to.be.true;
			expect( dispatcher._convertAttribute.calledOnce ).to.be.true;

			expect( mapper.flushDeferredBindings.calledOnce ).to.be.true;
			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should fire "reduceChanges" event and use replaced changes', () => {
			sinon.stub( dispatcher, '_convertInsert' );
			sinon.stub( dispatcher, '_convertReinsert' );
			sinon.stub( dispatcher, '_convertRemove' );
			sinon.stub( dispatcher, '_convertAttribute' );
			sinon.stub( mapper, 'flushDeferredBindings' );

			const position = model.createPositionFromPath( root, [ 0 ] );
			const range = ModelRange._createFromPositionAndShift( position, 1 );

			differStub.getChanges = () => [
				{ type: 'insert', position, length: 1 },
				{ type: 'attribute', position, range, attributeKey: 'key', attributeOldValue: null, attributeNewValue: 'foo' }
			];

			dispatcher.on( 'reduceChanges', ( evt, data ) => {
				data.changes = [
					{ type: 'insert', position, length: 1 },
					{ type: 'remove', position, length: 1 },
					{ type: 'reinsert', position, length: 1 }
				];
			} );

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher._convertInsert.calledOnce ).to.be.true;
			expect( dispatcher._convertReinsert.calledOnce ).to.be.true;
			expect( dispatcher._convertRemove.calledOnce ).to.be.true;
			expect( dispatcher._convertAttribute.notCalled ).to.be.true;

			expect( mapper.flushDeferredBindings.calledOnce ).to.be.true;
			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should call _convertMarkerAdd when markers are added', () => {
			sinon.stub( dispatcher, '_convertMarkerAdd' );
			sinon.stub( mapper, 'flushDeferredBindings' );

			const fooRange = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 1 ) );
			const barRange = model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 6 ) );

			differStub.getMarkersToAdd = () => [
				{ name: 'foo', range: fooRange },
				{ name: 'bar', range: barRange }
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher._convertMarkerAdd.calledWith( 'foo', fooRange ) );
			expect( dispatcher._convertMarkerAdd.calledWith( 'bar', barRange ) );

			assertConversionApi( dispatcher._convertMarkerAdd.firstCall.args[ 2 ] );
			assertConversionApi( dispatcher._convertMarkerAdd.secondCall.args[ 2 ] );

			expect( mapper.flushDeferredBindings.calledOnce ).to.be.true;
			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should call _convertMarkerRemove when markers are removed', () => {
			sinon.stub( dispatcher, '_convertMarkerRemove' );
			sinon.stub( mapper, 'flushDeferredBindings' );

			const fooRange = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 1 ) );
			const barRange = model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 6 ) );

			differStub.getMarkersToRemove = () => [
				{ name: 'foo', range: fooRange },
				{ name: 'bar', range: barRange }
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher._convertMarkerRemove.calledWith( 'foo', fooRange ) );
			expect( dispatcher._convertMarkerRemove.calledWith( 'bar', barRange ) );

			assertConversionApi( dispatcher._convertMarkerRemove.firstCall.args[ 2 ] );
			assertConversionApi( dispatcher._convertMarkerRemove.secondCall.args[ 2 ] );

			expect( mapper.flushDeferredBindings.calledOnce ).to.be.true;
			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should re-render markers which view elements got unbound during conversion', () => {
			sinon.stub( dispatcher, '_convertMarkerRemove' );
			sinon.stub( dispatcher, '_convertMarkerAdd' );
			sinon.stub( mapper, 'flushDeferredBindings' );

			const fooRange = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 1 ) );
			const barRange = model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 6 ) );

			model.markers._set( 'foo', fooRange );
			model.markers._set( 'bar', barRange );

			// Stub `Mapper#flushUnboundMarkerNames`.
			dispatcher._conversionApi.mapper.flushUnboundMarkerNames = () => [ 'foo', 'bar' ];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher._convertMarkerRemove.calledWith( 'foo', fooRange ) );
			expect( dispatcher._convertMarkerRemove.calledWith( 'bar', barRange ) );
			expect( dispatcher._convertMarkerAdd.calledWith( 'foo', fooRange ) );
			expect( dispatcher._convertMarkerAdd.calledWith( 'bar', barRange ) );

			assertConversionApi( dispatcher._convertMarkerRemove.firstCall.args[ 2 ] );
			assertConversionApi( dispatcher._convertMarkerRemove.secondCall.args[ 2 ] );
			assertConversionApi( dispatcher._convertMarkerAdd.firstCall.args[ 2 ] );
			assertConversionApi( dispatcher._convertMarkerAdd.secondCall.args[ 2 ] );

			expect( mapper.flushDeferredBindings.calledOnce ).to.be.true;
			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		// https://github.com/ckeditor/ckeditor5/issues/15411.
		it( 'should properly handle markers in reconverted elements', () => {
			// This test is very silly, but it is very difficult to test it when you have to operate on mocks and stubs :/.
			// There are simply too many things to set up and mock.
			//
			// So, we will stub the key things that caused the bug, but this is basically a direct test of the source code of `change()`,
			// instead of testing the results we check whether two methods are called in a correct order.
			//
			// Still, maybe this is better than no test, at the very least it will start to fail if someone refactors code incorrectly.
			//
			const range = model.createRange(
				model.createPositionFromPath( root, [ 0, 2 ] ),
				model.createPositionFromPath( root, [ 0, 4 ] )
			);

			model.markers._set( 'markerName', range, false, false );

			sinon.stub( mapper, 'flushDeferredBindings' ).callsFake( () => {
				// Using private property here.
				// Add `'markerName'` to markers to refresh.
				mapper._unboundMarkerNames.add( 'markerName' );
			} );

			sinon.stub( dispatcher, '_convertMarkerRemove' );
			sinon.stub( dispatcher, '_convertMarkerAdd' );

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			const unboundMarkers = mapper.flushUnboundMarkerNames();

			expect( unboundMarkers.length ).to.equal( 0 );
			expect( dispatcher._convertMarkerRemove.calledWith( 'markerName', range ) );
			expect( dispatcher._convertMarkerAdd.calledWith( 'markerName', range ) );
		} );
	} );

	describe( 'convert', () => {
		it( 'should fire event with correct parameters for every item in passed range', () => {
			root._appendChild( [
				new ModelText( 'foo', { bold: true } ),
				new ModelElement( 'imageBlock' ),
				new ModelText( 'bar' ),
				new ModelElement( 'paragraph', { class: 'nice' }, new ModelText( 'xx', { italic: true } ) )
			] );

			const range = model.createRangeIn( root );
			const loggedEvents = [];

			// We will check everything connected with insert event:
			dispatcher.on( 'insert', ( evt, data, conversionApi ) => {
				// Check if the item is correct.
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				// Check if the range is correct.
				const log = 'insert:' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				// Check if the event name is correct.
				expect( evt.name ).to.equal( 'insert:' + ( data.item.name || '$text' ) );
				// Check if model consumable is correct.
				expect( conversionApi.consumable.consume( data.item, 'insert' ) ).to.be.true;
			} );

			// Same here.
			dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				const key = data.attributeKey;
				const value = data.attributeNewValue;
				const log = 'attribute:' + key + ':' + value + ':' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				expect( evt.name ).to.equal( 'attribute:' + key + ':' + ( data.item.name || '$text' ) );
				expect( conversionApi.consumable.consume( data.item, 'attribute:' + key ) ).to.be.true;
			} );

			dispatcher.convert( range, [] );

			// Check the data passed to called events and the order of them.
			expect( loggedEvents ).to.deep.equal( [
				'insert:$text:foo:0:3',
				'attribute:bold:true:$text:foo:0:3',
				'insert:imageBlock:3:4',
				'insert:$text:bar:4:7',
				'insert:paragraph:7:8',
				'attribute:class:nice:paragraph:7:8',
				'insert:$text:xx:7,0:7,2',
				'attribute:italic:true:$text:xx:7,0:7,2'
			] );

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not fire same events multiple times', () => {
			root._appendChild( [
				new ModelElement( 'imageBlock', { src: 'foo.jpg', title: 'bar', bold: true }, [
					new ModelElement( 'caption', {}, new ModelText( 'title' ) )
				] )
			] );

			const loggedEvents = [];

			dispatcher.on( 'insert', ( evt, data, conversionApi ) => {
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				const log = 'insert:' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				conversionApi.consumable.consume( data.item, evt.name );
			} );

			dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				const key = data.attributeKey;
				const value = data.attributeNewValue;
				const log = 'attribute:' + key + ':' + value + ':' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				conversionApi.consumable.consume( data.item, evt.name );
			} );

			dispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
				conversionApi.convertAttributes( data.item );
				conversionApi.convertChildren( data.item );
			} );

			const range = model.createRangeIn( root );

			dispatcher.convert( range, [] );

			expect( loggedEvents ).to.deep.equal( [
				'insert:imageBlock:0:1',
				'attribute:src:foo.jpg:imageBlock:0:1',
				'attribute:title:bar:imageBlock:0:1',
				'attribute:bold:true:imageBlock:0:1',
				'insert:caption:0,0:0,1',
				'insert:$text:title:0,0,0:0,0,5'
			] );

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should call _convertMarkerAdd for all provided markers', () => {
			sinon.stub( dispatcher, '_convertMarkerAdd' );

			const fooRange = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 1 ) );
			const barRange = model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 6 ) );

			const markers = new Map( [
				[ 'foo', fooRange ],
				[ 'bar', barRange ]
			] );

			const range = model.createRangeIn( root );

			view.change( writer => {
				dispatcher.convert( range, markers, writer );
			} );

			expect( dispatcher._convertMarkerAdd.calledWith( 'foo', fooRange ) );
			expect( dispatcher._convertMarkerAdd.calledWith( 'bar', barRange ) );

			assertConversionApi( dispatcher._convertMarkerAdd.firstCall.args[ 2 ] );
			assertConversionApi( dispatcher._convertMarkerAdd.secondCall.args[ 2 ] );

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should pass options object to conversionApi', () => {
			sinon.stub( dispatcher, '_convertInsert' );
			sinon.stub( dispatcher, '_convertMarkerAdd' );

			const position = model.createPositionFromPath( root, [ 0 ] );
			const range = ModelRange._createFromPositionAndShift( position, 1 );

			const fooRange = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 1 ) );
			const barRange = model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 6 ) );

			const markers = new Map( [
				[ 'foo', fooRange ],
				[ 'bar', barRange ]
			] );

			const options = {};

			view.change( writer => {
				dispatcher.convert( range, markers, writer, options );
			} );

			expect( dispatcher._convertInsert.calledOnce ).to.be.true;
			expect( dispatcher._convertInsert.firstCall.args[ 0 ].isEqual( range ) ).to.be.true;

			expect( dispatcher._convertMarkerAdd.calledWith( 'foo', fooRange ) );
			expect( dispatcher._convertMarkerAdd.calledWith( 'bar', barRange ) );

			assertConversionApi( dispatcher._convertInsert.firstCall.args[ 1 ] );
			assertConversionApi( dispatcher._convertMarkerAdd.firstCall.args[ 2 ] );
			assertConversionApi( dispatcher._convertMarkerAdd.secondCall.args[ 2 ] );

			expect( dispatcher._convertInsert.firstCall.args[ 1 ].options ).to.equal( options );
			expect( dispatcher._convertMarkerAdd.firstCall.args[ 2 ].options ).to.equal( options );
			expect( dispatcher._convertMarkerAdd.firstCall.args[ 2 ].options ).to.equal( options );

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should be possible to listen for the insert event with the lowest priority to get subtree converted', () => {
			root._appendChild( [
				new ModelElement( 'imageBlock', { src: 'foo.jpg' }, [
					new ModelElement( 'caption', {}, new ModelText( 'title' ) )
				] )
			] );

			const range = model.createRangeIn( root );
			const spyBefore = sinon.spy();
			const spyAfter = sinon.spy();

			dispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			} );

			dispatcher.on( 'insert:caption', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			} );

			dispatcher.on( 'insert:$text', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			} );

			dispatcher.on( 'attribute:src:imageBlock', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			} );

			dispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
				spyBefore();

				expect( conversionApi.consumable.test( data.item, 'insert' ) ).to.be.true;
				expect( conversionApi.consumable.test( data.item, 'attribute:src' ) ).to.be.true;
				expect( conversionApi.consumable.test( data.item.getChild( 0 ), 'insert' ) ).to.be.true;
			}, { priority: 'highest' } );

			dispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
				spyAfter();

				expect( conversionApi.consumable.test( data.item, 'insert' ) ).to.be.false;
				expect( conversionApi.consumable.test( data.item, 'attribute:src' ) ).to.be.false;
				expect( conversionApi.consumable.test( data.item.getChild( 0 ), 'insert' ) ).to.be.false;
			}, { priority: 'lowest' } );

			dispatcher.convert( range, [] );

			expect( spyBefore.calledOnce ).to.be.true;
			expect( spyAfter.calledOnce ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should throw if not all insert events were consumed', () => {
			root._appendChild( [
				new ModelElement( 'imageBlock', { src: 'foo.jpg' }, [
					new ModelElement( 'caption', {}, new ModelText( 'title' ) )
				] )
			] );

			const range = model.createRangeIn( root );
			let spy;

			dispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
				spy = sinon.spy( conversionApi.consumable, 'verifyAllConsumed' );
			} );

			expect( () => {
				dispatcher.convert( range, [] );
			} ).to.throw( CKEditorError, 'conversion-model-consumable-not-consumed' );

			expect( spy.calledOnce ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );
	} );

	describe( '_convertInsert', () => {
		it( 'should fire event with correct parameters for every item in passed range', () => {
			root._appendChild( [
				new ModelText( 'foo', { bold: true } ),
				new ModelElement( 'imageBlock', null, new ModelElement( 'caption' ) ),
				new ModelText( 'bar' ),
				new ModelElement( 'paragraph', { class: 'nice' }, new ModelText( 'xx', { italic: true } ) )
			] );

			const range = model.createRangeIn( root );
			const loggedEvents = [];

			// We will check everything connected with insert event:
			dispatcher.on( 'insert', ( evt, data, conversionApi ) => {
				// Check if the item is correct.
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				// Check if the range is correct.
				const log = 'insert:' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				// Check if the event name is correct.
				expect( evt.name ).to.equal( 'insert:' + ( data.item.name || '$text' ) );
				// Check if model consumable is correct.
				expect( conversionApi.consumable.consume( data.item, 'insert' ) ).to.be.true;
				expect( data ).to.not.have.property( 'reconversion' );
			} );

			// Same here.
			dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				const key = data.attributeKey;
				const value = data.attributeNewValue;
				const log = 'attribute:' + key + ':' + value + ':' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				expect( evt.name ).to.equal( 'attribute:' + key + ':' + ( data.item.name || '$text' ) );
				expect( conversionApi.consumable.consume( data.item, 'attribute:' + key ) ).to.be.true;
			} );

			view.change( writer => {
				dispatcher._convertInsert( range, dispatcher._createConversionApi( writer ) );
			} );

			// Check the data passed to called events and the order of them.
			expect( loggedEvents ).to.deep.equal( [
				'insert:$text:foo:0:3',
				'attribute:bold:true:$text:foo:0:3',
				'insert:imageBlock:3:4',
				'insert:caption:3,0:3,1',
				'insert:$text:bar:4:7',
				'insert:paragraph:7:8',
				'attribute:class:nice:paragraph:7:8',
				'insert:$text:xx:7,0:7,2',
				'attribute:italic:true:$text:xx:7,0:7,2'
			] );

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should fire events only for shallow range', () => {
			// Set new dispatcher without convert attributes and children handler.
			dispatcher = new DowncastDispatcher( { mapper, apiObj } );

			root._appendChild( [
				new ModelText( 'foo', { bold: true } ),
				new ModelElement( 'imageBlock', null, new ModelElement( 'caption' ) ),
				new ModelText( 'bar' ),
				new ModelElement( 'paragraph', { class: 'nice' }, new ModelText( 'xx', { italic: true } ) )
			] );

			const range = model.createRangeIn( root );
			const loggedEvents = [];
			let consumable;

			// We will check everything connected with insert event:
			dispatcher.on( 'insert', ( evt, data, conversionApi ) => {
				// Check if the item is correct.
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				// Check if the range is correct.
				const log = 'insert:' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				// Check if the event name is correct.
				expect( evt.name ).to.equal( 'insert:' + ( data.item.name || '$text' ) );
				// Check if model consumable is correct.
				expect( conversionApi.consumable.consume( data.item, 'insert' ) ).to.be.true;
				expect( data ).to.not.have.property( 'reconversion' );

				consumable = conversionApi.consumable;
			} );

			// Same here.
			dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				const key = data.attributeKey;
				const value = data.attributeNewValue;
				const log = 'attribute:' + key + ':' + value + ':' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				expect( evt.name ).to.equal( 'attribute:' + key + ':' + ( data.item.name || '$text' ) );
				expect( conversionApi.consumable.consume( data.item, 'attribute:' + key ) ).to.be.true;
			} );

			view.change( writer => {
				dispatcher._convertInsert( range, dispatcher._createConversionApi( writer ) );
			} );

			// Check the data passed to called events and the order of them.
			expect( loggedEvents ).to.deep.equal( [
				'insert:$text:foo:0:3',
				'insert:imageBlock:3:4',
				'insert:$text:bar:4:7',
				'insert:paragraph:7:8'
			] );

			// Consumable should be populated with all the events (even those nested).
			expect( consumable.test( root.getChild( 1 ).getChild( 0 ), 'insert' ) ).to.be.true;
			expect( consumable.test( root.getChild( 3 ), 'attribute:class:paragraph' ) ).to.be.true;
			expect( consumable.test( root.getChild( 1 ), 'insert' ) ).to.be.false;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not fire same events multiple times', () => {
			root._appendChild( [
				new ModelElement( 'imageBlock', { src: 'foo.jpg', title: 'bar', bold: true }, [
					new ModelElement( 'caption', {}, new ModelText( 'title' ) )
				] )
			] );

			const loggedEvents = [];

			dispatcher.on( 'insert', ( evt, data ) => {
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				const log = 'insert:' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );
			} );

			dispatcher.on( 'attribute', ( evt, data ) => {
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				const key = data.attributeKey;
				const value = data.attributeNewValue;
				const log = 'attribute:' + key + ':' + value + ':' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );
			} );

			dispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
				conversionApi.convertAttributes( data.item );
				conversionApi.convertChildren( data.item );
			} );

			dispatcher.on( 'insert:caption', ( evt, data, conversionApi ) => {
				conversionApi.convertAttributes( data.item );
				conversionApi.convertChildren( data.item );
			} );

			const range = model.createRangeIn( root );

			view.change( writer => {
				dispatcher._convertInsert( range, dispatcher._createConversionApi( writer ) );
			} );

			expect( loggedEvents ).to.deep.equal( [
				'insert:imageBlock:0:1',
				'attribute:src:foo.jpg:imageBlock:0:1',
				'attribute:title:bar:imageBlock:0:1',
				'attribute:bold:true:imageBlock:0:1',
				'insert:caption:0,0:0,1',
				'insert:$text:title:0,0,0:0,0,5'
			] );

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not add consumable item if it was added already in consumable', () => {
			root._appendChild( [
				new ModelElement( 'imageBlock', {}, [
					new ModelElement( 'caption', {}, new ModelText( 'title' ) )
				] )
			] );

			const loggedEvents = [];

			// We will check everything connected with insert event:
			dispatcher.on( 'insert', ( evt, data, conversionApi ) => {
				// Check if the item is correct.
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				// Check if the range is correct.
				const log = 'insert:' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				// Check if the event name is correct.
				expect( evt.name ).to.equal( 'insert:' + ( data.item.name || '$text' ) );
				// Check if model consumable is correct.
				expect( conversionApi.consumable.test( data.item, 'insert' ) ).to.be.true;
				expect( data ).to.not.have.property( 'reconversion' );
			} );

			dispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
				if ( conversionApi.consumable.consume( data.item, 'insert' ) ) {
					conversionApi.convertItem( data.item );
				}
			} );

			dispatcher.on( 'insert:caption', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'insert' );
			} );

			dispatcher.on( 'insert:$text', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'insert' );
			} );

			const range = model.createRangeIn( root );

			view.change( writer => {
				dispatcher._convertInsert( range, dispatcher._createConversionApi( writer ) );
			} );

			expect( loggedEvents ).to.deep.equal( [
				'insert:imageBlock:0:1',
				'insert:caption:0,0:0,1',
				'insert:$text:title:0,0,0:0,0,5'
			] );
		} );

		it( 'should be possible to listen for the insert event with the lowest priority to get subtree converted', () => {
			root._appendChild( [
				new ModelElement( 'imageBlock', { src: 'foo.jpg' }, [
					new ModelElement( 'caption', {}, new ModelText( 'title' ) )
				] )
			] );

			const range = model.createRangeIn( root );
			const spyBefore = sinon.spy();
			const spyAfter = sinon.spy();

			dispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			} );

			dispatcher.on( 'insert:caption', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			} );

			dispatcher.on( 'insert:$text', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			} );

			dispatcher.on( 'attribute:src:imageBlock', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			} );

			dispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
				spyBefore();

				expect( conversionApi.consumable.test( data.item, 'insert' ) ).to.be.true;
				expect( conversionApi.consumable.test( data.item, 'attribute:src' ) ).to.be.true;
				expect( conversionApi.consumable.test( data.item.getChild( 0 ), 'insert' ) ).to.be.true;
			}, { priority: 'highest' } );

			dispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
				spyAfter();

				expect( conversionApi.consumable.test( data.item, 'insert' ) ).to.be.false;
				expect( conversionApi.consumable.test( data.item, 'attribute:src' ) ).to.be.false;
				expect( conversionApi.consumable.test( data.item.getChild( 0 ), 'insert' ) ).to.be.false;
			}, { priority: 'lowest' } );

			view.change( writer => {
				dispatcher._convertInsert( range, dispatcher._createConversionApi( writer ) );
			} );

			expect( spyBefore.calledOnce ).to.be.true;
			expect( spyAfter.calledOnce ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );
	} );

	describe( '_convertReinsert', () => {
		it( 'should fire event with correct parameters for every item in passed range (shallow)', () => {
			root._appendChild( [
				new ModelText( 'foo', { bold: true } ),
				new ModelElement( 'imageBlock', null, new ModelElement( 'caption' ) ),
				new ModelText( 'bar' ),
				new ModelElement( 'paragraph', { class: 'nice' }, new ModelText( 'xx', { italic: true } ) )
			] );

			const range = model.createRangeIn( root );
			const loggedEvents = [];

			// We will check everything connected with insert event:
			dispatcher.on( 'insert', ( evt, data, conversionApi ) => {
				// Check if the item is correct.
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				// Check if the range is correct.
				const log = 'insert:' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				// Check if the event name is correct.
				expect( evt.name ).to.equal( 'insert:' + ( data.item.name || '$text' ) );
				// Check if model consumable is correct.
				expect( conversionApi.consumable.consume( data.item, 'insert' ) ).to.be.true;
				expect( data ).to.have.property( 'reconversion' ).to.be.true;
			} );

			// Same here.
			dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				const key = data.attributeKey;
				const value = data.attributeNewValue;
				const log = 'attribute:' + key + ':' + value + ':' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				expect( evt.name ).to.equal( 'attribute:' + key + ':' + ( data.item.name || '$text' ) );
				expect( conversionApi.consumable.consume( data.item, 'attribute:' + key ) ).to.be.true;
			} );

			view.change( writer => {
				dispatcher._convertReinsert( range, dispatcher._createConversionApi( writer ) );
			} );

			// Check the data passed to called events and the order of them.
			expect( loggedEvents ).to.deep.equal( [
				'insert:$text:foo:0:3',
				'attribute:bold:true:$text:foo:0:3',
				'insert:imageBlock:3:4',
				'insert:$text:bar:4:7',
				'insert:paragraph:7:8',
				'attribute:class:nice:paragraph:7:8'
			] );

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );
	} );

	describe( '_convertRemove', () => {
		it( 'should fire event for removed range', () => {
			const loggedEvents = [];

			dispatcher.on( 'remove:$text', ( evt, data ) => {
				const log = 'remove:' + data.position.path + ':' + data.length;
				loggedEvents.push( log );
			} );

			dispatcher._convertRemove( model.createPositionAt( root, 3 ), 3, '$text' );

			expect( loggedEvents ).to.deep.equal( [ 'remove:3:3' ] );

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );
	} );

	describe( 'convertSelection', () => {
		beforeEach( () => {
			dispatcher.off( 'selection' );

			root._appendChild( new ModelText( 'foobar' ) );
			model.change( writer => {
				writer.setSelection( [
					writer.createRange( writer.createPositionFromPath( root, [ 1 ] ), writer.createPositionFromPath( root, [ 3 ] ) ),
					writer.createRange( writer.createPositionFromPath( root, [ 4 ] ), writer.createPositionFromPath( root, [ 5 ] ) )
				] );
			} );
		} );

		it( 'should fire cleanSelection event before selection events', () => {
			sinon.spy( dispatcher, 'fire' );
			const spy = sinon.spy();

			dispatcher.on( 'cleanSelection', spy );
			dispatcher.on( 'selection', () => {
				// Check if the `cleanSelection` event was already called.
				expect( spy.called ).to.be.true;
			} );

			dispatcher.convertSelection( doc.selection, model.markers, [] );

			expect( dispatcher.fire.calledWith(
				'cleanSelection',
				{ selection: sinon.match.instanceOf( doc.selection.constructor ) }
			) ).to.be.true;
		} );

		it( 'should fire selection event', () => {
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertSelection( doc.selection, model.markers, [] );

			expect( dispatcher.fire.calledWith(
				'selection',
				{ selection: sinon.match.instanceOf( doc.selection.constructor ) }
			) ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not fire selection event if model document selection is in a root that does not have a mapped view root', () => {
			const spyClean = sinon.spy();
			const spySelection = sinon.spy();

			dispatcher.on( 'cleanSelection', spyClean );
			dispatcher.on( 'selection', spySelection );

			model.change( writer => {
				const newRoot = new ModelRootElement( model.document, '$root', 'foo' );

				writer.setSelection( writer.createRangeIn( newRoot ) );
			} );

			dispatcher.convertSelection( doc.selection, model.markers, [] );

			expect( spyClean.calledOnce ).to.be.true;
			expect( spySelection.called ).to.be.false;
		} );

		it( 'should prepare correct list of consumable values', () => {
			model.change( writer => {
				writer.setAttribute( 'bold', true, writer.createRangeIn( root ) );
				writer.setAttribute( 'italic', true,
					writer.createRange( writer.createPositionAt( root, 4 ), writer.createPositionAt( root, 5 ) )
				);
			} );

			dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.selection, 'selection' ) ).to.be.true;
				expect( conversionApi.consumable.test( data.selection, 'attribute:bold' ) ).to.be.true;
				expect( conversionApi.consumable.test( data.selection, 'attribute:italic' ) ).to.be.null;
			} );

			dispatcher.convertSelection( doc.selection, model.markers, [] );

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not fire attributes events for non-collapsed selection', () => {
			model.change( writer => {
				writer.setAttribute( 'bold', true, writer.createRangeIn( root ) );
				writer.setAttribute( 'italic', true,
					writer.createRange( writer.createPositionAt( root, 4 ), writer.createPositionAt( root, 5 ) )
				);
			} );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertSelection( doc.selection, model.markers, [] );

			expect( dispatcher.fire.calledWith( 'attribute:bold' ) ).to.be.false;
			expect( dispatcher.fire.calledWith( 'attribute:italic' ) ).to.be.false;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should fire attributes events for collapsed selection', () => {
			model.change( writer => {
				writer.setSelection(
					writer.createRange( writer.createPositionFromPath( root, [ 2 ] ), writer.createPositionFromPath( root, [ 2 ] ) )
				);
			} );

			model.change( writer => {
				writer.setAttribute( 'bold', true, writer.createRangeIn( root ) );
			} );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertSelection( doc.selection, model.markers, [] );

			expect( dispatcher.fire.calledWith( 'attribute:bold:$text' ) ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not fire attributes events if attribute has been consumed', () => {
			model.change( writer => {
				writer.setSelection(
					writer.createRange( writer.createPositionFromPath( root, [ 2 ] ), writer.createPositionFromPath( root, [ 2 ] ) )
				);
			} );

			model.change( writer => {
				writer.setAttribute( 'bold', true, writer.createRangeIn( root ) );
				writer.setAttribute( 'italic', true,
					writer.createRange( writer.createPositionAt( root, 4 ), writer.createPositionAt( root, 5 ) )
				);
			} );

			dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.selection, 'attribute:bold' );
			} );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertSelection( doc.selection, model.markers, [] );

			expect( dispatcher.fire.calledWith( 'attribute:bold' ) ).to.be.false;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should fire events for markers for collapsed selection', () => {
			model.change( writer => {
				writer.setSelection(
					writer.createRange( writer.createPositionFromPath( root, [ 1 ] ), writer.createPositionFromPath( root, [ 1 ] ) )
				);
				const range = writer.createRange( writer.createPositionAt( root, 0 ), writer.createPositionAt( root, 2 ) );
				writer.addMarker( 'name', { range, usingOperation: false } );
			} );

			sinon.spy( dispatcher, 'fire' );

			const markers = Array.from( model.markers.getMarkersAtPosition( doc.selection.getFirstPosition() ) );
			dispatcher.convertSelection( doc.selection, model.markers, markers );

			expect( dispatcher.fire.calledWith( 'addMarker:name' ) ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should fire events for all markers of the same group for collapsed selection', () => {
			model.change( writer => {
				writer.setSelection(
					writer.createRange( writer.createPositionFromPath( root, [ 1 ] ), writer.createPositionFromPath( root, [ 1 ] ) )
				);
				writer.addMarker( 'name:1', {
					range: writer.createRange( writer.createPositionAt( root, 0 ), writer.createPositionAt( root, 2 ) ),
					usingOperation: false
				} );
				writer.addMarker( 'name:2', {
					range: writer.createRange( writer.createPositionAt( root, 0 ), writer.createPositionAt( root, 3 ) ),
					usingOperation: false
				} );
			} );

			dispatcher.on( 'addMarker', ( evt, data, { consumable } ) => consumable.consume( data.item, evt.name ) );

			sinon.spy( dispatcher, 'fire' );

			const markers = Array.from( model.markers.getMarkersAtPosition( doc.selection.getFirstPosition() ) );
			dispatcher.convertSelection( doc.selection, model.markers, markers );

			expect( dispatcher.fire.calledWith( 'addMarker:name:1' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'addMarker:name:2' ) ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not fire events for markers for non-collapsed selection', () => {
			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 0 ), writer.createPositionAt( root, 2 ) );
				writer.addMarker( 'name', { range, usingOperation: false } );
			} );

			sinon.spy( dispatcher, 'fire' );

			const markers = Array.from( model.markers.getMarkersAtPosition( doc.selection.getFirstPosition() ) );
			dispatcher.convertSelection( doc.selection, model.markers, markers );

			expect( dispatcher.fire.calledWith( 'addMarker:name' ) ).to.be.false;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not fire event for marker if selection is in a element with custom highlight handling', () => {
			// Clear after `beforeEach`.
			root._removeChildren( 0, root.childCount );

			const text = new ModelText( 'abc' );
			const caption = new ModelElement( 'caption', null, text );
			const image = new ModelElement( 'imageBlock', null, caption );
			root._appendChild( [ image ] );

			// Create view elements that will be "mapped" to model elements.
			const viewCaption = new ViewContainerElement( view.document, 'caption' );
			const viewFigure = new ViewContainerElement( view.document, 'figure', null, viewCaption );

			// Create custom highlight handler mock.
			viewFigure._setCustomProperty( 'addHighlight', () => {} );
			viewFigure._setCustomProperty( 'removeHighlight', () => {} );

			mapper.bindElements( image, viewFigure );
			mapper.bindElements( caption, viewCaption );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 0 ), writer.createPositionAt( root, 1 ) );
				writer.addMarker( 'name', { range, usingOperation: false } );
				writer.setSelection( caption, 1 );
			} );
			sinon.spy( dispatcher, 'fire' );

			const markers = Array.from( model.markers.getMarkersAtPosition( doc.selection.getFirstPosition() ) );

			dispatcher.convertSelection( doc.selection, model.markers, markers );

			expect( dispatcher.fire.calledWith( 'addMarker:name' ) ).to.be.false;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not fire events if information about marker has been consumed', () => {
			model.change( writer => {
				writer.setSelection(
					writer.createRange( writer.createPositionFromPath( root, [ 1 ] ), writer.createPositionFromPath( root, [ 1 ] ) )
				);

				const range = writer.createRange( writer.createPositionAt( root, 0 ), writer.createPositionAt( root, 2 ) );
				writer.addMarker( 'foo', { range, usingOperation: false } );
				writer.addMarker( 'bar', { range, usingOperation: false } );
			} );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'addMarker:foo', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'addMarker:bar' );
			} );

			const markers = Array.from( model.markers.getMarkersAtPosition( doc.selection.getFirstPosition() ) );
			dispatcher.convertSelection( doc.selection, model.markers, markers );

			expect( dispatcher.fire.calledWith( 'addMarker:foo' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'addMarker:bar' ) ).to.be.false;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );
	} );

	describe( '_convertMarkerAdd', () => {
		let element, text;

		beforeEach( () => {
			text = new ModelText( 'foo bar baz' );
			element = new ModelElement( 'paragraph', null, [ text ] );
			root._appendChild( [ element ] );
		} );

		it( 'should fire addMarker event for whole collapsed marker', () => {
			const range = model.createRange( model.createPositionAt( element, 2 ), model.createPositionAt( element, 2 ) );

			const spy = sinon.spy();

			dispatcher.on( 'addMarker:name', ( evt, data ) => {
				spy();

				expect( data.markerName ).to.equal( 'name' );
				expect( data.markerRange.isEqual( range ) ).to.be.true;
			} );

			dispatcher._convertMarkerAdd( 'name', range, dispatcher._createConversionApi() );

			expect( spy.calledOnce ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should convert marker in document fragment', () => {
			const text = new ModelText( 'foo' );
			const docFrag = new ModelDocumentFragment( text );
			const eleRange = model.createRange( model.createPositionAt( docFrag, 1 ), model.createPositionAt( docFrag, 2 ) );
			sinon.spy( dispatcher, 'fire' );

			dispatcher._convertMarkerAdd( 'name', eleRange, dispatcher._createConversionApi() );

			expect( dispatcher.fire.called ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not convert marker if it is in graveyard', () => {
			const gyRange = model.createRange( model.createPositionAt( doc.graveyard, 0 ), model.createPositionAt( doc.graveyard, 0 ) );
			sinon.spy( dispatcher, 'fire' );

			dispatcher._convertMarkerAdd( 'name', gyRange, dispatcher._createConversionApi() );

			expect( dispatcher.fire.called ).to.be.false;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should fire addMarker event for whole non-collapsed marker and for each item in the range', () => {
			const range = model.createRangeIn( root );

			const spyWholeRange = sinon.spy();

			dispatcher.on( 'addMarker:name', ( evt, data ) => {
				if ( !data.item ) {
					spyWholeRange();

					expect( data.markerName ).to.equal( 'name' );
					expect( data.markerRange.isEqual( range ) ).to.be.true;
				}
			} );

			const spyItems = sinon.spy();
			const items = [];

			dispatcher.on( 'addMarker:name', ( evt, data, conversionApi ) => {
				if ( data.item ) {
					spyItems();

					expect( data.markerName ).to.equal( 'name' );
					expect( data.markerRange.isEqual( range ) ).to.be.true;
					expect( conversionApi.consumable.test( data.item, 'addMarker:name' ) );

					items.push( data.item );
				}
			} );

			dispatcher._convertMarkerAdd( 'name', range, dispatcher._createConversionApi() );

			expect( spyWholeRange.calledOnce ).to.be.true;
			expect( spyItems.calledTwice ).to.be.true;

			expect( items[ 0 ] ).to.equal( element );
			expect( items[ 1 ].data ).to.equal( text.data );

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not fire conversion for non-collapsed marker items if marker was consumed in earlier event', () => {
			const range = model.createRangeIn( root );

			dispatcher.on( 'addMarker:name', ( evt, data, conversionApi ) => {
				if ( !data.item ) {
					conversionApi.consumable.consume( data.markerRange, evt.name );
				}
			}, { priority: 'high' } );

			const spyItems = sinon.spy();

			dispatcher.on( 'addMarker:name', ( evt, data ) => {
				if ( data.item ) {
					spyItems();
				}
			} );

			dispatcher._convertMarkerAdd( 'name', range, dispatcher._createConversionApi() );

			expect( spyItems.called ).to.be.false;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should be possible to override #1', () => {
			const range = model.createRangeIn( root );

			const addMarkerSpy = sinon.spy();
			const highAddMarkerSpy = sinon.spy();

			dispatcher.on( 'addMarker:marker', ( evt, data ) => {
				if ( !data.item ) {
					addMarkerSpy();
				}
			} );

			dispatcher.on( 'addMarker:marker', ( evt, data ) => {
				if ( !data.item ) {
					highAddMarkerSpy();

					evt.stop();
				}
			}, { priority: 'high' } );

			dispatcher._convertMarkerAdd( 'marker', range, dispatcher._createConversionApi() );

			expect( addMarkerSpy.called ).to.be.false;
			expect( highAddMarkerSpy.calledOnce ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should be possible to override #2', () => {
			const range = model.createRangeIn( root );

			const addMarkerSpy = sinon.spy();
			const highAddMarkerSpy = sinon.spy();

			dispatcher.on( 'addMarker:marker', ( evt, data ) => {
				if ( data.item ) {
					addMarkerSpy();
				}
			} );

			dispatcher.on( 'addMarker:marker', ( evt, data ) => {
				if ( data.item ) {
					highAddMarkerSpy();

					evt.stop();
				}
			}, { priority: 'high' } );

			dispatcher._convertMarkerAdd( 'marker', range, dispatcher._createConversionApi() );

			expect( addMarkerSpy.called ).to.be.false;

			// Called once for each item, twice total.
			expect( highAddMarkerSpy.calledTwice ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );
	} );

	describe( '_convertMarkerRemove', () => {
		let range, element, text;

		beforeEach( () => {
			text = new ModelText( 'foo bar baz' );
			element = new ModelElement( 'paragraph', null, [ text ] );
			root._appendChild( [ element ] );

			range = model.createRange( model.createPositionAt( element, 0 ), model.createPositionAt( element, 4 ) );
		} );

		it( 'should fire removeMarker event', () => {
			sinon.spy( dispatcher, 'fire' );

			dispatcher._convertMarkerRemove( 'name', range, dispatcher._createConversionApi() );

			expect( dispatcher.fire.calledWith( 'removeMarker:name' ) ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should not convert marker if it is in graveyard', () => {
			const gyRange = model.createRange( model.createPositionAt( doc.graveyard, 0 ), model.createPositionAt( doc.graveyard, 0 ) );
			sinon.spy( dispatcher, 'fire' );

			dispatcher._convertMarkerRemove( 'name', gyRange, dispatcher._createConversionApi() );

			expect( dispatcher.fire.called ).to.be.false;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should convert marker in document fragment', () => {
			const text = new ModelText( 'foo' );
			const docFrag = new ModelDocumentFragment( text );
			const eleRange = model.createRange( model.createPositionAt( docFrag, 1 ), model.createPositionAt( docFrag, 2 ) );
			sinon.spy( dispatcher, 'fire' );

			dispatcher._convertMarkerRemove( 'name', eleRange, dispatcher._createConversionApi() );

			expect( dispatcher.fire.called ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should fire conversion for the range', () => {
			range = model.createRangeIn( root );

			dispatcher.on( 'addMarker:name', ( evt, data ) => {
				expect( data.markerName ).to.equal( 'name' );
				expect( data.markerRange.isEqual( range ) ).to.be.true;
			} );

			dispatcher._convertMarkerRemove( 'name', range, dispatcher._createConversionApi() );

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );

		it( 'should be possible to override', () => {
			range = model.createRangeIn( root );

			const removeMarkerSpy = sinon.spy();
			const highRemoveMarkerSpy = sinon.spy();

			dispatcher.on( 'removeMarker:marker', removeMarkerSpy );

			dispatcher.on( 'removeMarker:marker', evt => {
				highRemoveMarkerSpy();

				evt.stop();
			}, { priority: 'high' } );

			dispatcher._convertMarkerRemove( 'marker', range, dispatcher._createConversionApi() );

			expect( removeMarkerSpy.called ).to.be.false;
			expect( highRemoveMarkerSpy.calledOnce ).to.be.true;

			expect( dispatcher._conversionApi.writer ).to.be.undefined;
			expect( dispatcher._conversionApi.consumable ).to.be.undefined;
		} );
	} );

	function assertConversionApi( conversionApi ) {
		expect( conversionApi ).to.have.property( 'writer' ).that.is.instanceof( DowncastWriter );
		expect( conversionApi ).to.have.property( 'consumable' ).that.is.instanceof( ModelConsumable );
		expect( conversionApi ).to.have.property( 'mapper' ).that.is.equal( mapper );
		expect( conversionApi ).to.have.property( 'apiObj' ).that.is.equal( apiObj );
	}
} );
