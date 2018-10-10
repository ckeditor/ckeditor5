/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DowncastDispatcher from '../../src/conversion/downcastdispatcher';
import Model from '../../src/model/model';
import ModelText from '../../src/model/text';
import ModelElement from '../../src/model/element';
import ModelRange from '../../src/model/range';
import ModelPosition from '../../src/model/position';

import View from '../../src/view/view';
import ViewContainerElement from '../../src/view/containerelement';

describe( 'DowncastDispatcher', () => {
	let dispatcher, doc, root, differStub, model, view;

	beforeEach( () => {
		model = new Model();
		view = new View();
		doc = model.document;
		dispatcher = new DowncastDispatcher();
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

			const position = new ModelPosition( root, [ 0 ] );
			const range = ModelRange.createFromPositionAndShift( position, 1 );

			differStub.getChanges = () => [ { type: 'insert', position, length: 1 } ];

			view.change( writer => {
				dispatcher.convertChanges( differStub, writer );
			} );

			expect( dispatcher.convertInsert.calledOnce ).to.be.true;
			expect( dispatcher.convertInsert.firstCall.args[ 0 ].isEqual( range ) ).to.be.true;
		} );

		it( 'should call convertRemove for remove change', () => {
			sinon.stub( dispatcher, 'convertRemove' );

			const position = new ModelPosition( root, [ 0 ] );

			differStub.getChanges = () => [ { type: 'remove', position, length: 2, name: '$text' } ];

			view.change( writer => {
				dispatcher.convertChanges( differStub, writer );
			} );

			expect( dispatcher.convertRemove.calledWith( position, 2, '$text' ) ).to.be.true;
		} );

		it( 'should call convertAttribute for attribute change', () => {
			sinon.stub( dispatcher, 'convertAttribute' );

			const position = new ModelPosition( root, [ 0 ] );
			const range = ModelRange.createFromPositionAndShift( position, 1 );

			differStub.getChanges = () => [
				{ type: 'attribute', position, range, attributeKey: 'key', attributeOldValue: null, attributeNewValue: 'foo' }
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, writer );
			} );

			expect( dispatcher.convertAttribute.calledWith( range, 'key', null, 'foo' ) ).to.be.true;
		} );

		it( 'should handle multiple changes', () => {
			sinon.stub( dispatcher, 'convertInsert' );
			sinon.stub( dispatcher, 'convertRemove' );
			sinon.stub( dispatcher, 'convertAttribute' );

			const position = new ModelPosition( root, [ 0 ] );
			const range = ModelRange.createFromPositionAndShift( position, 1 );

			differStub.getChanges = () => [
				{ type: 'insert', position, length: 1 },
				{ type: 'attribute', position, range, attributeKey: 'key', attributeOldValue: null, attributeNewValue: 'foo' },
				{ type: 'remove', position, length: 1, name: 'paragraph' },
				{ type: 'insert', position, length: 3 },
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, writer );
			} );

			expect( dispatcher.convertInsert.calledTwice ).to.be.true;
			expect( dispatcher.convertRemove.calledOnce ).to.be.true;
			expect( dispatcher.convertAttribute.calledOnce ).to.be.true;
		} );

		it( 'should call convertMarkerAdd when markers are added', () => {
			sinon.stub( dispatcher, 'convertMarkerAdd' );

			const fooRange = ModelRange.createFromParentsAndOffsets( root, 0, root, 1 );
			const barRange = ModelRange.createFromParentsAndOffsets( root, 3, root, 6 );

			differStub.getMarkersToAdd = () => [
				{ name: 'foo', range: fooRange },
				{ name: 'bar', range: barRange }
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, writer );
			} );

			expect( dispatcher.convertMarkerAdd.calledWith( 'foo', fooRange ) );
			expect( dispatcher.convertMarkerAdd.calledWith( 'bar', barRange ) );
		} );

		it( 'should call convertMarkerRemove when markers are removed', () => {
			sinon.stub( dispatcher, 'convertMarkerRemove' );

			const fooRange = ModelRange.createFromParentsAndOffsets( root, 0, root, 1 );
			const barRange = ModelRange.createFromParentsAndOffsets( root, 3, root, 6 );

			differStub.getMarkersToRemove = () => [
				{ name: 'foo', range: fooRange },
				{ name: 'bar', range: barRange }
			];

			view.change( writer => {
				dispatcher.convertChanges( differStub, writer );
			} );

			expect( dispatcher.convertMarkerRemove.calledWith( 'foo', fooRange ) );
			expect( dispatcher.convertMarkerRemove.calledWith( 'bar', barRange ) );
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

			const range = ModelRange.createIn( root );
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

			const range = ModelRange.createIn( root );

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

			dispatcher.convertRemove( ModelPosition._createAt( root, 3 ), 3, '$text' );

			expect( loggedEvents ).to.deep.equal( [ 'remove:3:3' ] );
		} );
	} );

	describe( 'convertSelection', () => {
		beforeEach( () => {
			dispatcher.off( 'selection' );

			root._appendChild( new ModelText( 'foobar' ) );
			model.change( writer => {
				writer.setSelection( [
					new ModelRange( new ModelPosition( root, [ 1 ] ), new ModelPosition( root, [ 3 ] ) ),
					new ModelRange( new ModelPosition( root, [ 4 ] ), new ModelPosition( root, [ 5 ] ) )
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
				writer.setAttribute( 'bold', true, ModelRange.createIn( root ) );
				writer.setAttribute( 'italic', true, ModelRange.createFromParentsAndOffsets( root, 4, root, 5 ) );
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
				writer.setAttribute( 'bold', true, ModelRange.createIn( root ) );
				writer.setAttribute( 'italic', true, ModelRange.createFromParentsAndOffsets( root, 4, root, 5 ) );
			} );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertSelection( doc.selection, model.markers, [] );

			expect( dispatcher.fire.calledWith( 'attribute:bold' ) ).to.be.false;
			expect( dispatcher.fire.calledWith( 'attribute:italic' ) ).to.be.false;
		} );

		it( 'should fire attributes events for collapsed selection', () => {
			model.change( writer => {
				writer.setSelection(
					new ModelRange( new ModelPosition( root, [ 2 ] ), new ModelPosition( root, [ 2 ] ) )
				);
			} );

			model.change( writer => {
				writer.setAttribute( 'bold', true, ModelRange.createIn( root ) );
			} );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertSelection( doc.selection, model.markers, [] );

			expect( dispatcher.fire.calledWith( 'attribute:bold' ) ).to.be.true;
		} );

		it( 'should not fire attributes events if attribute has been consumed', () => {
			model.change( writer => {
				writer.setSelection(
					new ModelRange( new ModelPosition( root, [ 2 ] ), new ModelPosition( root, [ 2 ] ) )
				);
			} );

			model.change( writer => {
				writer.setAttribute( 'bold', true, ModelRange.createIn( root ) );
				writer.setAttribute( 'italic', true, ModelRange.createFromParentsAndOffsets( root, 4, root, 5 ) );
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
					new ModelRange( new ModelPosition( root, [ 1 ] ), new ModelPosition( root, [ 1 ] ) )
				);
				const range = ModelRange.createFromParentsAndOffsets( root, 0, root, 2 );
				writer.addMarker( 'name', { range, usingOperation: false } );
			} );

			sinon.spy( dispatcher, 'fire' );

			const markers = Array.from( model.markers.getMarkersAtPosition( doc.selection.getFirstPosition() ) );
			dispatcher.convertSelection( doc.selection, model.markers, markers );

			expect( dispatcher.fire.calledWith( 'addMarker:name' ) ).to.be.true;
		} );

		it( 'should not fire events for markers for non-collapsed selection', () => {
			model.change( writer => {
				const range = ModelRange.createFromParentsAndOffsets( root, 0, root, 2 );
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
			const viewCaption = new ViewContainerElement( 'caption' );
			const viewFigure = new ViewContainerElement( 'figure', null, viewCaption );

			// Create custom highlight handler mock.
			viewFigure._setCustomProperty( 'addHighlight', () => { } );
			viewFigure._setCustomProperty( 'removeHighlight', () => { } );

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
				const range = ModelRange.createFromParentsAndOffsets( root, 0, root, 1 );
				writer.addMarker( 'name', { range, usingOperation: false } );
				writer.setSelection( ModelRange.createFromParentsAndOffsets( caption, 1, caption, 1 ) );
			} );
			sinon.spy( dispatcher, 'fire' );

			const markers = Array.from( model.markers.getMarkersAtPosition( doc.selection.getFirstPosition() ) );

			dispatcher.convertSelection( doc.selection, model.markers, markers );

			expect( dispatcher.fire.calledWith( 'addMarker:name' ) ).to.be.false;
		} );

		it( 'should not fire events if information about marker has been consumed', () => {
			model.change( writer => {
				writer.setSelection(
					new ModelRange( new ModelPosition( root, [ 1 ] ), new ModelPosition( root, [ 1 ] ) )
				);

				const range = ModelRange.createFromParentsAndOffsets( root, 0, root, 2 );
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
		let range, element, text;

		beforeEach( () => {
			text = new ModelText( 'foo bar baz' );
			element = new ModelElement( 'paragraph', null, [ text ] );
			root._appendChild( [ element ] );

			range = ModelRange.createFromParentsAndOffsets( element, 0, element, 4 );
		} );

		it( 'should fire addMarker event', () => {
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarkerAdd( 'name', range );

			expect( dispatcher.fire.calledWith( 'addMarker:name' ) ).to.be.true;
		} );

		it( 'should not convert marker if it is in graveyard', () => {
			const gyRange = ModelRange.createFromParentsAndOffsets( doc.graveyard, 0, doc.graveyard, 0 );
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarkerAdd( 'name', gyRange );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should not convert marker if it is not in model root', () => {
			const element = new ModelElement( 'element', null, new ModelText( 'foo' ) );
			const eleRange = ModelRange.createFromParentsAndOffsets( element, 1, element, 2 );
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarkerAdd( 'name', eleRange );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should fire conversion for each item in the range', () => {
			range = ModelRange.createIn( root );

			const items = [];

			dispatcher.on( 'addMarker:name', ( evt, data, conversionApi ) => {
				expect( data.markerName ).to.equal( 'name' );
				expect( data.markerRange.isEqual( range ) ).to.be.true;
				expect( conversionApi.consumable.test( data.item, 'addMarker:name' ) );

				items.push( data.item );
			} );

			dispatcher.convertMarkerAdd( 'name', range );

			expect( items[ 0 ] ).to.equal( element );
			expect( items[ 1 ].data ).to.equal( text.data );
		} );

		it( 'should be possible to override', () => {
			range = ModelRange.createIn( root );

			const addMarkerSpy = sinon.spy();
			const highAddMarkerSpy = sinon.spy();

			dispatcher.on( 'addMarker:marker', addMarkerSpy );

			dispatcher.on( 'addMarker:marker', evt => {
				highAddMarkerSpy();

				evt.stop();
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

			range = ModelRange.createFromParentsAndOffsets( element, 0, element, 4 );
		} );

		it( 'should fire removeMarker event', () => {
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarkerRemove( 'name', range );

			expect( dispatcher.fire.calledWith( 'removeMarker:name' ) ).to.be.true;
		} );

		it( 'should not convert marker if it is in graveyard', () => {
			const gyRange = ModelRange.createFromParentsAndOffsets( doc.graveyard, 0, doc.graveyard, 0 );
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarkerRemove( 'name', gyRange );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should not convert marker if it is not in model root', () => {
			const element = new ModelElement( 'element', null, new ModelText( 'foo' ) );
			const eleRange = ModelRange.createFromParentsAndOffsets( element, 1, element, 2 );
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarkerRemove( 'name', eleRange );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should fire conversion for the range', () => {
			range = ModelRange.createIn( root );

			dispatcher.on( 'addMarker:name', ( evt, data ) => {
				expect( data.markerName ).to.equal( 'name' );
				expect( data.markerRange.isEqual( range ) ).to.be.true;
			} );

			dispatcher.convertMarkerRemove( 'name', range );
		} );

		it( 'should be possible to override', () => {
			range = ModelRange.createIn( root );

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
