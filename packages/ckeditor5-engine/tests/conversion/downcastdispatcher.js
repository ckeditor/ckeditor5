/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DowncastDispatcher from '../../src/conversion/downcastdispatcher';
import Mapper from '../../src/conversion/mapper';

import Model from '../../src/model/model';
import ModelText from '../../src/model/text';
import ModelElement from '../../src/model/element';
import ModelRange from '../../src/model/range';

import View from '../../src/view/view';
import ViewContainerElement from '../../src/view/containerelement';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'DowncastDispatcher', () => {
	let dispatcher, doc, root, differStub, model, view, mapper;

	beforeEach( () => {
		model = new Model();
		view = new View( new StylesProcessor() );
		doc = model.document;
		mapper = new Mapper();
		dispatcher = new DowncastDispatcher( { mapper } );
		root = doc.createRoot();

		differStub = {
			getMarkersToRemove: () => [],
			getChanges: () => [],
			getMarkersToAdd: () => []
		};
	} );

	describe( 'constructor()', () => {
		it( 'should create DowncastDispatcher with given api', () => {
			const apiObj = {};
			const dispatcher = new DowncastDispatcher( { apiObj } );

			expect( dispatcher.conversionApi.apiObj ).to.equal( apiObj );
		} );
	} );

	describe( 'convertChanges', () => {
		it( 'should call convertInsert for insert change', () => {
			sinon.stub( dispatcher, 'convertInsert' );

			const position = model.createPositionFromPath( root, [ 0 ] );
			const range = ModelRange._createFromPositionAndShift( position, 1 );

			differStub.getChanges = () => [ { type: 'insert', position, length: 1 } ];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher.convertInsert.calledOnce ).to.be.true;
			expect( dispatcher.convertInsert.firstCall.args[ 0 ].isEqual( range ) ).to.be.true;
		} );

		it( 'should call convertRemove for remove change', () => {
			sinon.stub( dispatcher, 'convertRemove' );

			const position = model.createPositionFromPath( root, [ 0 ] );

			differStub.getChanges = () => [ { type: 'remove', position, length: 2, name: '$text' } ];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher.convertRemove.calledWith( position, 2, '$text' ) ).to.be.true;
		} );

		it( 'should call convertAttribute for attribute change', () => {
			sinon.stub( dispatcher, 'convertAttribute' );

			const position = model.createPositionFromPath( root, [ 0 ] );
			const range = ModelRange._createFromPositionAndShift( position, 1 );

			differStub.getChanges = () => [
				{ type: 'attribute', position, range, attributeKey: 'key', attributeOldValue: null, attributeNewValue: 'foo' }
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher.convertAttribute.calledWith( range, 'key', null, 'foo' ) ).to.be.true;
		} );

		it( 'should handle multiple changes', () => {
			sinon.stub( dispatcher, 'convertInsert' );
			sinon.stub( dispatcher, 'convertRemove' );
			sinon.stub( dispatcher, 'convertAttribute' );

			const position = model.createPositionFromPath( root, [ 0 ] );
			const range = ModelRange._createFromPositionAndShift( position, 1 );

			differStub.getChanges = () => [
				{ type: 'insert', position, length: 1 },
				{ type: 'attribute', position, range, attributeKey: 'key', attributeOldValue: null, attributeNewValue: 'foo' },
				{ type: 'remove', position, length: 1, name: 'paragraph' },
				{ type: 'insert', position, length: 3 },
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher.convertInsert.calledTwice ).to.be.true;
			expect( dispatcher.convertRemove.calledOnce ).to.be.true;
			expect( dispatcher.convertAttribute.calledOnce ).to.be.true;
		} );

		it( 'should call convertMarkerAdd when markers are added', () => {
			sinon.stub( dispatcher, 'convertMarkerAdd' );

			const fooRange = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 1 ) );
			const barRange = model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 6 ) );

			differStub.getMarkersToAdd = () => [
				{ name: 'foo', range: fooRange },
				{ name: 'bar', range: barRange }
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher.convertMarkerAdd.calledWith( 'foo', fooRange ) );
			expect( dispatcher.convertMarkerAdd.calledWith( 'bar', barRange ) );
		} );

		it( 'should call convertMarkerRemove when markers are removed', () => {
			sinon.stub( dispatcher, 'convertMarkerRemove' );

			const fooRange = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 1 ) );
			const barRange = model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 6 ) );

			differStub.getMarkersToRemove = () => [
				{ name: 'foo', range: fooRange },
				{ name: 'bar', range: barRange }
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher.convertMarkerRemove.calledWith( 'foo', fooRange ) );
			expect( dispatcher.convertMarkerRemove.calledWith( 'bar', barRange ) );
		} );

		it( 'should re-render markers which view elements got unbound during conversion', () => {
			sinon.stub( dispatcher, 'convertMarkerRemove' );
			sinon.stub( dispatcher, 'convertMarkerAdd' );

			const fooRange = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 1 ) );
			const barRange = model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 6 ) );

			model.markers._set( 'foo', fooRange );
			model.markers._set( 'bar', barRange );

			// Stub `Mapper#flushUnboundMarkerNames`.
			dispatcher.conversionApi.mapper.flushUnboundMarkerNames = () => [ 'foo', 'bar' ];

			view.change( writer => {
				dispatcher.convertChanges( differStub, model.markers, writer );
			} );

			expect( dispatcher.convertMarkerRemove.calledWith( 'foo', fooRange ) );
			expect( dispatcher.convertMarkerRemove.calledWith( 'bar', barRange ) );
			expect( dispatcher.convertMarkerAdd.calledWith( 'foo', fooRange ) );
			expect( dispatcher.convertMarkerAdd.calledWith( 'bar', barRange ) );
		} );
	} );

	describe( 'convertInsert', () => {
		it( 'should fire event with correct parameters for every item in passed range', () => {
			root._appendChild( [
				new ModelText( 'foo', { bold: true } ),
				new ModelElement( 'image' ),
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

			dispatcher.convertInsert( range );

			// Check the data passed to called events and the order of them.
			expect( loggedEvents ).to.deep.equal( [
				'insert:$text:foo:0:3',
				'attribute:bold:true:$text:foo:0:3',
				'insert:image:3:4',
				'insert:$text:bar:4:7',
				'insert:paragraph:7:8',
				'attribute:class:nice:paragraph:7:8',
				'insert:$text:xx:7,0:7,2',
				'attribute:italic:true:$text:xx:7,0:7,2'
			] );
		} );

		it( 'should not fire events for already consumed parts of model', () => {
			root._appendChild( [
				new ModelElement( 'image', { src: 'foo.jpg', title: 'bar', bold: true }, [
					new ModelElement( 'caption', {}, new ModelText( 'title' ) )
				] )
			] );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'insert:image', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item.getChild( 0 ), 'insert' );
				conversionApi.consumable.consume( data.item, 'attribute:bold' );
			} );

			const range = model.createRangeIn( root );

			dispatcher.convertInsert( range );

			expect( dispatcher.fire.calledWith( 'insert:image' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'attribute:src:image' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'attribute:title:image' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'insert:$text' ) ).to.be.true;

			expect( dispatcher.fire.calledWith( 'attribute:bold:image' ) ).to.be.false;
			expect( dispatcher.fire.calledWith( 'insert:caption' ) ).to.be.false;
		} );
	} );

	describe( 'convertRemove', () => {
		it( 'should fire event for removed range', () => {
			const loggedEvents = [];

			dispatcher.on( 'remove:$text', ( evt, data ) => {
				const log = 'remove:' + data.position.path + ':' + data.length;
				loggedEvents.push( log );
			} );

			dispatcher.convertRemove( model.createPositionAt( root, 3 ), 3, '$text' );

			expect( loggedEvents ).to.deep.equal( [ 'remove:3:3' ] );
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

		it( 'should fire selection event', () => {
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertSelection( doc.selection, model.markers, [] );

			expect( dispatcher.fire.calledWith(
				'selection',
				{ selection: sinon.match.instanceOf( doc.selection.constructor ) }
			) ).to.be.true;
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
		} );

		it( 'should not fire event for marker if selection is in a element with custom highlight handling', () => {
			// Clear after `beforeEach`.
			root._removeChildren( 0, root.childCount );

			const text = new ModelText( 'abc' );
			const caption = new ModelElement( 'caption', null, text );
			const image = new ModelElement( 'image', null, caption );
			root._appendChild( [ image ] );

			// Create view elements that will be "mapped" to model elements.
			const viewCaption = new ViewContainerElement( view.document, 'caption' );
			const viewFigure = new ViewContainerElement( view.document, 'figure', null, viewCaption );

			// Create custom highlight handler mock.
			viewFigure._setCustomProperty( 'addHighlight', () => {} );
			viewFigure._setCustomProperty( 'removeHighlight', () => {} );

			// Create mapper mock.
			dispatcher.conversionApi.mapper = {
				toViewElement( modelElement ) {
					if ( modelElement == image ) {
						return viewFigure;
					} else if ( modelElement == caption ) {
						return viewCaption;
					}
				}
			};

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 0 ), writer.createPositionAt( root, 1 ) );
				writer.addMarker( 'name', { range, usingOperation: false } );
				writer.setSelection( caption, 1 );
			} );
			sinon.spy( dispatcher, 'fire' );

			const markers = Array.from( model.markers.getMarkersAtPosition( doc.selection.getFirstPosition() ) );

			dispatcher.convertSelection( doc.selection, model.markers, markers );

			expect( dispatcher.fire.calledWith( 'addMarker:name' ) ).to.be.false;
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
		} );
	} );

	describe( 'convertMarkerAdd', () => {
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

			dispatcher.convertMarkerAdd( 'name', range );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should not convert marker if it is in graveyard', () => {
			const gyRange = model.createRange( model.createPositionAt( doc.graveyard, 0 ), model.createPositionAt( doc.graveyard, 0 ) );
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarkerAdd( 'name', gyRange );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should not convert marker if it is not in model root', () => {
			const element = new ModelElement( 'element', null, new ModelText( 'foo' ) );
			const eleRange = model.createRange( model.createPositionAt( element, 1 ), model.createPositionAt( element, 2 ) );
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarkerAdd( 'name', eleRange );

			expect( dispatcher.fire.called ).to.be.false;
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

			dispatcher.convertMarkerAdd( 'name', range );

			expect( spyWholeRange.calledOnce ).to.be.true;
			expect( spyItems.calledTwice ).to.be.true;

			expect( items[ 0 ] ).to.equal( element );
			expect( items[ 1 ].data ).to.equal( text.data );
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

			dispatcher.convertMarkerAdd( 'name', range );

			expect( spyItems.called ).to.be.false;
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

			dispatcher.convertMarkerAdd( 'marker', range );

			expect( addMarkerSpy.called ).to.be.false;
			expect( highAddMarkerSpy.calledOnce ).to.be.true;
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

			dispatcher.convertMarkerAdd( 'marker', range );

			expect( addMarkerSpy.called ).to.be.false;

			// Called once for each item, twice total.
			expect( highAddMarkerSpy.calledTwice ).to.be.true;
		} );
	} );

	describe( 'convertMarkerRemove', () => {
		let range, element, text;

		beforeEach( () => {
			text = new ModelText( 'foo bar baz' );
			element = new ModelElement( 'paragraph', null, [ text ] );
			root._appendChild( [ element ] );

			range = model.createRange( model.createPositionAt( element, 0 ), model.createPositionAt( element, 4 ) );
		} );

		it( 'should fire removeMarker event', () => {
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarkerRemove( 'name', range );

			expect( dispatcher.fire.calledWith( 'removeMarker:name' ) ).to.be.true;
		} );

		it( 'should not convert marker if it is in graveyard', () => {
			const gyRange = model.createRange( model.createPositionAt( doc.graveyard, 0 ), model.createPositionAt( doc.graveyard, 0 ) );
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarkerRemove( 'name', gyRange );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should not convert marker if it is not in model root', () => {
			const element = new ModelElement( 'element', null, new ModelText( 'foo' ) );
			const eleRange = model.createRange( model.createPositionAt( element, 1 ), model.createPositionAt( element, 2 ) );
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarkerRemove( 'name', eleRange );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should fire conversion for the range', () => {
			range = model.createRangeIn( root );

			dispatcher.on( 'addMarker:name', ( evt, data ) => {
				expect( data.markerName ).to.equal( 'name' );
				expect( data.markerRange.isEqual( range ) ).to.be.true;
			} );

			dispatcher.convertMarkerRemove( 'name', range );
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

			dispatcher.convertMarkerRemove( 'marker', range );

			expect( removeMarkerSpy.called ).to.be.false;
			expect( highRemoveMarkerSpy.calledOnce ).to.be.true;
		} );
	} );
} );
