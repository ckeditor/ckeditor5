/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelConversionDispatcher from '../../src/conversion/modelconversiondispatcher';
import ModelDocument from '../../src/model/document';
import ModelText from '../../src/model/text';
import ModelElement from '../../src/model/element';
import ModelRange from '../../src/model/range';
import ModelPosition from '../../src/model/position';
import RemoveOperation from '../../src/model/operation/removeoperation';
import NoOperation from '../../src/model/operation/nooperation';
import RenameOperation from '../../src/model/operation/renameoperation';
import AttributeOperation from '../../src/model/operation/attributeoperation';
import { wrapInDelta } from '../../tests/model/_utils/utils';

import ViewContainerElement from '../../src/view/containerelement';

describe( 'ModelConversionDispatcher', () => {
	let dispatcher, doc, root, gyPos;

	beforeEach( () => {
		doc = new ModelDocument();
		dispatcher = new ModelConversionDispatcher( doc );
		root = doc.createRoot();

		gyPos = new ModelPosition( doc.graveyard, [ 0 ] );
	} );

	describe( 'constructor()', () => {
		it( 'should create ModelConversionDispatcher with given api', () => {
			const apiObj = {};
			const dispatcher = new ModelConversionDispatcher( doc, { apiObj } );

			expect( dispatcher.conversionApi.apiObj ).to.equal( apiObj );
		} );
	} );

	describe( 'convertChange', () => {
		// We will do integration tests here. Unit tests will be done for methods that are used
		// by `convertChange` internally. This way we will have two kinds of tests.

		let image, imagePos;

		beforeEach( () => {
			image = new ModelElement( 'image' );
			root.appendChildren( [ image, new ModelText( 'foobar' ) ] );

			imagePos = ModelPosition.createBefore( image );

			dispatcher.listenTo( doc, 'change', ( evt, type, changes ) => {
				dispatcher.convertChange( type, changes );
			} );
		} );

		it( 'should fire insert and addAttribute callbacks for insertion changes', () => {
			const cbInsertText = sinon.spy();
			const cbInsertImage = sinon.spy();
			const cbAddAttribute = sinon.spy();

			dispatcher.on( 'insert:$text', cbInsertText );
			dispatcher.on( 'insert:image', cbInsertImage );
			dispatcher.on( 'addAttribute:key:$text', cbAddAttribute );

			const insertedText = new ModelText( 'foo', { key: 'value' } );
			doc.batch().insert( ModelPosition.createFromParentAndOffset( root, 0 ), insertedText );

			expect( cbInsertText.called ).to.be.true;
			expect( cbAddAttribute.called ).to.be.true;
			expect( cbInsertImage.called ).to.be.false;
		} );

		it( 'should fire insert and addAttribute callbacks for reinsertion changes', () => {
			image.setAttribute( 'key', 'value' );

			// We will just create reinsert operation by reverting remove operation
			// because creating reinsert change is tricky and not available through batch API.
			const removeOperation = new RemoveOperation( imagePos, 1, gyPos, 0 );

			// Let's apply remove operation so reinsert operation won't break.
			doc.applyOperation( wrapInDelta( removeOperation ) );

			const cbInsertText = sinon.spy();
			const cbInsertImage = sinon.spy();
			const cbAddAttribute = sinon.spy();

			dispatcher.on( 'insert:$text', cbInsertText );
			dispatcher.on( 'insert:image', cbInsertImage );
			dispatcher.on( 'addAttribute:key:image', cbAddAttribute );

			doc.applyOperation( wrapInDelta( removeOperation.getReversed() ) );

			expect( cbInsertImage.called ).to.be.true;
			expect( cbAddAttribute.called ).to.be.true;
			expect( cbInsertText.called ).to.be.false;
		} );

		it( 'should fire remove callback for remove changes', () => {
			const cbRemove = sinon.spy();

			dispatcher.on( 'remove', cbRemove );

			doc.batch().remove( image );

			expect( cbRemove.called ).to.be.true;
		} );

		it( 'should fire addAttribute callbacks for add attribute change', () => {
			const cbAddText = sinon.spy();
			const cbAddImage = sinon.spy();

			dispatcher.on( 'addAttribute:key:$text', cbAddText );
			dispatcher.on( 'addAttribute:key:image', cbAddImage );

			doc.batch().setAttribute( image, 'key', 'value' );

			// Callback for adding attribute on text not called.
			expect( cbAddText.called ).to.be.false;
			expect( cbAddImage.calledOnce ).to.be.true;

			doc.batch().setAttribute( ModelRange.createFromParentsAndOffsets( root, 3, root, 4 ), 'key', 'value' );

			expect( cbAddText.calledOnce ).to.be.true;
			// Callback for adding attribute on image not called this time.
			expect( cbAddImage.calledOnce ).to.be.true;
		} );

		it( 'should fire changeAttribute callbacks for change attribute change', () => {
			const cbChangeText = sinon.spy();
			const cbChangeImage = sinon.spy();

			dispatcher.on( 'changeAttribute:key:$text', cbChangeText );
			dispatcher.on( 'changeAttribute:key:image', cbChangeImage );

			doc.batch().setAttribute( image, 'key', 'value' ).setAttribute( image, 'key', 'newValue' );

			// Callback for adding attribute on text not called.
			expect( cbChangeText.called ).to.be.false;
			expect( cbChangeImage.calledOnce ).to.be.true;

			const range = ModelRange.createFromParentsAndOffsets( root, 3, root, 4 );
			doc.batch().setAttribute( range, 'key', 'value' ).setAttribute( range, 'key', 'newValue' );

			expect( cbChangeText.calledOnce ).to.be.true;
			// Callback for adding attribute on image not called this time.
			expect( cbChangeImage.calledOnce ).to.be.true;
		} );

		it( 'should fire removeAttribute callbacks for remove attribute change', () => {
			const cbRemoveText = sinon.spy();
			const cbRemoveImage = sinon.spy();

			dispatcher.on( 'removeAttribute:key:$text', cbRemoveText );
			dispatcher.on( 'removeAttribute:key:image', cbRemoveImage );

			doc.batch().setAttribute( image, 'key', 'value' ).removeAttribute( image, 'key' );

			// Callback for adding attribute on text not called.
			expect( cbRemoveText.called ).to.be.false;
			expect( cbRemoveImage.calledOnce ).to.be.true;

			const range = ModelRange.createFromParentsAndOffsets( root, 3, root, 4 );
			doc.batch().setAttribute( range, 'key', 'value' ).removeAttribute( range, 'key' );

			expect( cbRemoveText.calledOnce ).to.be.true;
			// Callback for adding attribute on image not called this time.
			expect( cbRemoveImage.calledOnce ).to.be.true;
		} );

		it( 'should not fire any event if not recognized event type was passed', () => {
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertChange( 'unknown', { foo: 'bar' } );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should not fire any event if changed range in graveyard root and change type is different than remove', () => {
			sinon.spy( dispatcher, 'fire' );

			const gyNode = new ModelElement( 'image' );
			doc.graveyard.appendChildren( gyNode );

			doc.batch().setAttribute( gyNode, 'key', 'value' );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should not fire any event if remove operation moves nodes between graveyard holders', () => {
			// This may happen during OT.
			sinon.spy( dispatcher, 'fire' );

			const gyNode = new ModelElement( 'image' );
			doc.graveyard.appendChildren( gyNode );

			doc.batch().remove( gyNode );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should not fire any event if element in graveyard was removed', () => {
			// This may happen during OT.
			sinon.spy( dispatcher, 'fire' );

			const gyNode = new ModelElement( 'image' );
			doc.graveyard.appendChildren( gyNode );

			doc.batch().rename( gyNode, 'p' );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should not fire any event after NoOperation is applied', () => {
			sinon.spy( dispatcher, 'fire' );

			doc.applyOperation( wrapInDelta( new NoOperation( 0 ) ) );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should not fire any event after RenameOperation with same old and new value is applied', () => {
			sinon.spy( dispatcher, 'fire' );

			root.removeChildren( 0, root.childCount );
			root.appendChildren( [ new ModelElement( 'paragraph' ) ] );

			doc.applyOperation( wrapInDelta( new RenameOperation( new ModelPosition( root, [ 0 ] ), 'paragraph', 'paragraph', 0 ) ) );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should not fire any event after AttributeOperation with same old an new value is applied', () => {
			sinon.spy( dispatcher, 'fire' );

			root.removeChildren( 0, root.childCount );
			root.appendChildren( [ new ModelElement( 'paragraph', { foo: 'bar' } ) ] );

			const range = new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 0, 0 ] ) );
			doc.applyOperation( wrapInDelta( new AttributeOperation( range, 'foo', 'bar', 'bar', 0 ) ) );

			expect( dispatcher.fire.called ).to.be.false;
		} );
	} );

	describe( 'convertInsert', () => {
		it( 'should fire event with correct parameters for every item in passed range', () => {
			root.appendChildren( [
				new ModelText( 'foo', { bold: true } ),
				new ModelElement( 'image' ),
				new ModelText( 'bar' ),
				new ModelElement( 'paragraph', { class: 'nice' }, new ModelText( 'xx', { italic: true } ) )
			] );

			const range = ModelRange.createIn( root );
			const loggedEvents = [];

			// We will check everything connected with insert event:
			dispatcher.on( 'insert', ( evt, data, consumable ) => {
				// Check if the item is correct.
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				// Check if the range is correct.
				const log = 'insert:' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				// Check if the event name is correct.
				expect( evt.name ).to.equal( 'insert:' + ( data.item.name || '$text' ) );
				// Check if model consumable is correct.
				expect( consumable.consume( data.item, 'insert' ) ).to.be.true;
			} );

			// Same here.
			dispatcher.on( 'addAttribute', ( evt, data, consumable ) => {
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				const key = data.attributeKey;
				const value = data.attributeNewValue;
				const log = 'addAttribute:' + key + ':' + value + ':' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				expect( evt.name ).to.equal( 'addAttribute:' + key + ':' + ( data.item.name || '$text' ) );
				expect( consumable.consume( data.item, 'addAttribute:' + key ) ).to.be.true;
			} );

			dispatcher.convertInsertion( range );

			// Check the data passed to called events and the order of them.
			expect( loggedEvents ).to.deep.equal( [
				'insert:$text:foo:0:3',
				'addAttribute:bold:true:$text:foo:0:3',
				'insert:image:3:4',
				'insert:$text:bar:4:7',
				'insert:paragraph:7:8',
				'addAttribute:class:nice:paragraph:7:8',
				'insert:$text:xx:7,0:7,2',
				'addAttribute:italic:true:$text:xx:7,0:7,2'
			] );
		} );

		it( 'should not fire events for already consumed parts of model', () => {
			root.appendChildren( [
				new ModelElement( 'image', { src: 'foo.jpg', title: 'bar', bold: true }, [
					new ModelElement( 'caption', {}, new ModelText( 'title' ) )
				] )
			] );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'insert:image', ( evt, data, consumable ) => {
				consumable.consume( data.item.getChild( 0 ), 'insert' );
				consumable.consume( data.item, 'addAttribute:bold' );
			} );

			const range = ModelRange.createIn( root );

			dispatcher.convertInsertion( range );

			expect( dispatcher.fire.calledWith( 'insert:image' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'addAttribute:src:image' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'addAttribute:title:image' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'insert:$text' ) ).to.be.true;

			expect( dispatcher.fire.calledWith( 'addAttribute:bold:image' ) ).to.be.false;
			expect( dispatcher.fire.calledWith( 'insert:caption' ) ).to.be.false;
		} );

		it( 'should fire marker converter if content is inserted into marker', () => {
			const convertMarkerSpy = sinon.spy( dispatcher, 'convertMarker' );
			const paragraph1 = new ModelElement( 'paragraph', null, new ModelText( 'foo' ) );
			const paragraph2 = new ModelElement( 'paragraph', null, new ModelText( 'bar' ) );
			root.appendChildren( [ paragraph1, paragraph2 ] );

			const markerRange = ModelRange.createFromParentsAndOffsets( root, 0, root, 2 );
			doc.markers.set( 'marker', markerRange );

			const insertionRange = ModelRange.createOn( paragraph2 );
			dispatcher.convertInsertion( insertionRange );

			sinon.assert.calledOnce( convertMarkerSpy );
			const callArgs = convertMarkerSpy.args[ 0 ];
			expect( callArgs[ 0 ] ).to.equal( 'addMarker' );
			expect( callArgs[ 1 ] ).to.equal( 'marker' );
			expect( callArgs[ 2 ].isEqual( markerRange.getIntersection( insertionRange ) ) ).to.be.true;
		} );

		it( 'should fire marker converter if content has marker', () => {
			const convertMarkerSpy = sinon.spy( dispatcher, 'convertMarker' );
			const paragraph1 = new ModelElement( 'paragraph', null, new ModelText( 'foo' ) );
			const paragraph2 = new ModelElement( 'paragraph', null, new ModelText( 'bar' ) );
			root.appendChildren( [ paragraph1, paragraph2 ] );

			const markerRange = ModelRange.createIn( paragraph2 );
			doc.markers.set( 'marker', markerRange );

			const insertionRange = ModelRange.createOn( paragraph2 );
			dispatcher.convertInsertion( insertionRange );

			sinon.assert.calledOnce( convertMarkerSpy );
			const callArgs = convertMarkerSpy.args[ 0 ];
			expect( callArgs[ 0 ] ).to.equal( 'addMarker' );
			expect( callArgs[ 1 ] ).to.equal( 'marker' );
			expect( callArgs[ 2 ].isEqual( markerRange ) ).to.be.true;
		} );

		it( 'should not fire marker conversion if content is inserted into element with custom highlight handling', () => {
			sinon.spy( dispatcher, 'convertMarker' );

			const text = new ModelText( 'abc' );
			const caption = new ModelElement( 'caption', null, text );
			const image = new ModelElement( 'image', null, caption );
			root.appendChildren( [ image ] );

			// Create view elements that will be "mapped" to model elements.
			const viewCaption = new ViewContainerElement( 'caption' );
			const viewFigure = new ViewContainerElement( 'figure', null, viewCaption );

			// Create custom highlight handler mock.
			viewFigure.setCustomProperty( 'addHighlight', () => {} );
			viewFigure.setCustomProperty( 'removeHighlight', () => {} );

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

			const markerRange = ModelRange.createFromParentsAndOffsets( root, 0, root, 1 );
			doc.markers.set( 'marker', markerRange );

			const insertionRange = ModelRange.createFromParentsAndOffsets( caption, 1, caption, 2 );
			dispatcher.convertInsertion( insertionRange );

			expect( dispatcher.convertMarker.called ).to.be.false;
		} );

		it( 'should fire marker conversion if inserted into element with highlight handling but element is not in marker range', () => {
			sinon.spy( dispatcher, 'convertMarker' );

			const text = new ModelText( 'abc' );
			const caption = new ModelElement( 'caption', null, text );
			const image = new ModelElement( 'image', null, caption );
			root.appendChildren( [ image ] );

			// Create view elements that will be "mapped" to model elements.
			const viewCaption = new ViewContainerElement( 'caption' );
			const viewFigure = new ViewContainerElement( 'figure', null, viewCaption );

			// Create custom highlight handler mock.
			viewFigure.setCustomProperty( 'addHighlight', () => {} );
			viewFigure.setCustomProperty( 'removeHighlight', () => {} );

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

			const markerRange = ModelRange.createFromParentsAndOffsets( caption, 0, caption, 3 );
			doc.markers.set( 'marker', markerRange );

			const insertionRange = ModelRange.createFromParentsAndOffsets( caption, 2, caption, 3 );
			dispatcher.convertInsertion( insertionRange );

			expect( dispatcher.convertMarker.called ).to.be.true;
		} );
	} );

	describe( 'convertMove', () => {
		let loggedEvents;

		beforeEach( () => {
			loggedEvents = [];

			dispatcher.on( 'remove', ( evt, data ) => {
				const log = 'remove:' + data.sourcePosition.path + ':' + data.item.offsetSize;
				loggedEvents.push( log );
			} );

			dispatcher.on( 'insert', ( evt, data ) => {
				const log = 'insert:' + data.range.start.path + ':' + data.range.end.path;
				loggedEvents.push( log );
			} );
		} );

		it( 'should first fire remove and then insert if moving "right"', () => {
			// <root>[ab]cd^ef</root> -> <root>cdabef</root>
			root.appendChildren( new ModelText( 'cdabef' ) );

			const sourcePosition = ModelPosition.createFromParentAndOffset( root, 0 );
			const movedRange = ModelRange.createFromParentsAndOffsets( root, 2, root, 4 );

			dispatcher.convertMove( sourcePosition, movedRange );

			// after remove: cdef
			// after insert: cd[ab]ef
			expect( loggedEvents ).to.deep.equal( [ 'remove:0:2', 'insert:2:4' ] );
		} );

		it( 'should first fire insert and then remove if moving "left"', () => {
			// <root>ab^cd[ef]</root> -> <root>abefcd</root>
			root.appendChildren( new ModelText( 'abefcd' ) );

			const sourcePosition = ModelPosition.createFromParentAndOffset( root, 4 );
			const movedRange = ModelRange.createFromParentsAndOffsets( root, 2, root, 4 );

			dispatcher.convertMove( sourcePosition, movedRange );

			// after insert: ab[ef]cd[ef]
			// after remove: ab[ef]cd
			expect( loggedEvents ).to.deep.equal( [ 'insert:2:4', 'remove:6:2' ] );
		} );

		it( 'should first fire insert and then remove when moving like in unwrap', () => {
			// <root>a^<w>[xyz]</w>b</root> -> <root>axyz<w></w>b</root>
			root.appendChildren( [
				new ModelText( 'axyz' ),
				new ModelElement( 'w' ),
				new ModelText( 'b' )
			] );

			const sourcePosition = new ModelPosition( root, [ 1, 0 ] );
			const movedRange = ModelRange.createFromParentsAndOffsets( root, 1, root, 4 );

			dispatcher.convertMove( sourcePosition, movedRange );

			// before:       a<w>[xyz]</w>b
			// after insert: a[xyz]<w>[xyz]</w>b
			// after remove: a[xyz]<w></w>b
			expect( loggedEvents ).to.deep.equal( [ 'insert:1:4', 'remove:4,0:3' ] );
		} );

		it( 'should first fire remove and then insert when moving like in wrap', () => {
			// <root>a[xyz]<w>^</w>b</root> -> <root>a<w>xyz</w>b</root>
			root.appendChildren( [
				new ModelText( 'a' ),
				new ModelElement( 'w', null, [ new ModelText( 'xyz' ) ] ),
				new ModelText( 'b' )
			] );

			const sourcePosition = ModelPosition.createFromParentAndOffset( root, 1 );
			const movedRange = ModelRange.createFromPositionAndShift( new ModelPosition( root, [ 1, 0 ] ), 3 );

			dispatcher.convertMove( sourcePosition, movedRange );

			// before:       a[xyz]<w></w>b
			// after remove: a<w></w>b
			// after insert: a<w>[xyz]</w>b
			expect( loggedEvents ).to.deep.equal( [ 'remove:1:3', 'insert:1,0:1,3' ] );
		} );
	} );

	describe( 'convertRemove', () => {
		it( 'should fire event for removed range', () => {
			root.appendChildren( new ModelText( 'foo' ) );
			doc.graveyard.appendChildren( new ModelText( 'bar' ) );

			const range = ModelRange.createFromParentsAndOffsets( doc.graveyard, 0, doc.graveyard, 3 );
			const loggedEvents = [];

			dispatcher.on( 'remove', ( evt, data ) => {
				const log = 'remove:' + data.sourcePosition.path + ':' + data.item.offsetSize;
				loggedEvents.push( log );
			} );

			dispatcher.convertRemove( ModelPosition.createFromParentAndOffset( root, 3 ), range );

			expect( loggedEvents ).to.deep.equal( [ 'remove:3:3' ] );
		} );
	} );

	describe( 'convertAttribute', () => {
		it( 'should fire event for every item in passed range', () => {
			root.appendChildren( [
				new ModelText( 'foo', { bold: true } ),
				new ModelElement( 'image', { bold: true } ),
				new ModelElement( 'paragraph', { bold: true, class: 'nice' }, new ModelText( 'xx', { bold: true, italic: true } ) )
			] );

			const range = ModelRange.createIn( root );
			const loggedEvents = [];

			dispatcher.on( 'addAttribute', ( evt, data, consumable ) => {
				const itemId = data.item.name ? data.item.name : '$text:' + data.item.data;
				const key = data.attributeKey;
				const value = data.attributeNewValue;
				const log = 'addAttribute:' + key + ':' + value + ':' + itemId + ':' + data.range.start.path + ':' + data.range.end.path;

				loggedEvents.push( log );

				expect( evt.name ).to.equal( 'addAttribute:' + key + ':' + ( data.item.name || '$text' ) );
				expect( consumable.consume( data.item, 'addAttribute:' + key ) ).to.be.true;
			} );

			dispatcher.convertAttribute( 'addAttribute', range, 'bold', null, true );

			expect( loggedEvents ).to.deep.equal( [
				'addAttribute:bold:true:$text:foo:0:3',
				'addAttribute:bold:true:image:3:4',
				'addAttribute:bold:true:paragraph:4:5',
				'addAttribute:bold:true:$text:xx:4,0:4,2'
			] );
		} );

		it( 'should not fire events for already consumed parts of model', () => {
			root.appendChildren( [
				new ModelElement( 'element', null, new ModelElement( 'inside' ) )
			] );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'removeAttribute:attr:element', ( evt, data, consumable ) => {
				consumable.consume( data.item.getChild( 0 ), 'removeAttribute:attr' );
			} );

			const range = ModelRange.createIn( root );

			dispatcher.convertAttribute( 'removeAttribute', range, 'attr', 'value', null );

			expect( dispatcher.fire.calledWith( 'removeAttribute:attr:element' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'removeAttribute:attr:inside' ) ).to.be.false;
		} );
	} );

	describe( 'convertSelection', () => {
		beforeEach( () => {
			dispatcher.off( 'selection' );

			root.appendChildren( new ModelText( 'foobar' ) );
			doc.selection.setRanges( [
				new ModelRange( new ModelPosition( root, [ 1 ] ), new ModelPosition( root, [ 3 ] ) ),
				new ModelRange( new ModelPosition( root, [ 4 ] ), new ModelPosition( root, [ 5 ] ) )
			] );
		} );

		it( 'should fire selection event', () => {
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertSelection( doc.selection, [] );

			expect( dispatcher.fire.calledWith(
				'selection',
				{ selection: sinon.match.instanceOf( doc.selection.constructor ) }
			) ).to.be.true;
		} );

		it( 'should prepare correct list of consumable values', () => {
			doc.enqueueChanges( () => {
				doc.batch()
					.setAttribute( ModelRange.createIn( root ), 'bold', true )
					.setAttribute( ModelRange.createFromParentsAndOffsets( root, 4, root, 5 ), 'italic', true );
			} );

			dispatcher.on( 'selection', ( evt, data, consumable ) => {
				expect( consumable.test( data.selection, 'selection' ) ).to.be.true;
				expect( consumable.test( data.selection, 'selectionAttribute:bold' ) ).to.be.true;
				expect( consumable.test( data.selection, 'selectionAttribute:italic' ) ).to.be.null;
			} );

			dispatcher.convertSelection( doc.selection, [] );
		} );

		it( 'should fire attributes events for selection', () => {
			sinon.spy( dispatcher, 'fire' );

			doc.enqueueChanges( () => {
				doc.batch()
					.setAttribute( ModelRange.createIn( root ), 'bold', true )
					.setAttribute( ModelRange.createFromParentsAndOffsets( root, 4, root, 5 ), 'italic', true );
			} );

			dispatcher.convertSelection( doc.selection, [] );

			expect( dispatcher.fire.calledWith( 'selectionAttribute:bold' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'selectionAttribute:italic' ) ).to.be.false;
		} );

		it( 'should not fire attributes events if attribute has been consumed', () => {
			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'selection', ( evt, data, consumable ) => {
				consumable.consume( data.selection, 'selectionAttribute:bold' );
			} );

			doc.enqueueChanges( () => {
				doc.batch()
					.setAttribute( ModelRange.createIn( root ), 'bold', true )
					.setAttribute( ModelRange.createFromParentsAndOffsets( root, 4, root, 5 ), 'italic', true );
			} );

			dispatcher.convertSelection( doc.selection, [] );

			expect( dispatcher.fire.calledWith( 'selectionAttribute:bold' ) ).to.be.false;
		} );

		it( 'should fire events for each marker which contains selection', () => {
			doc.markers.set( 'name', ModelRange.createFromParentsAndOffsets( root, 0, root, 2 ) );

			sinon.spy( dispatcher, 'fire' );

			const markers = Array.from( doc.markers.getMarkersAtPosition( doc.selection.getFirstPosition() ) );
			dispatcher.convertSelection( doc.selection, markers );

			expect( dispatcher.fire.calledWith( 'selectionMarker:name' ) ).to.be.true;
		} );

		it( 'should not fire event for marker if selection is in a element with custom highlight handling', () => {
			// Clear after `beforeEach`.
			root.removeChildren( 0, root.childCount );

			const text = new ModelText( 'abc' );
			const caption = new ModelElement( 'caption', null, text );
			const image = new ModelElement( 'image', null, caption );
			root.appendChildren( [ image ] );

			// Create view elements that will be "mapped" to model elements.
			const viewCaption = new ViewContainerElement( 'caption' );
			const viewFigure = new ViewContainerElement( 'figure', null, viewCaption );

			// Create custom highlight handler mock.
			viewFigure.setCustomProperty( 'addHighlight', () => {} );
			viewFigure.setCustomProperty( 'removeHighlight', () => {} );

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

			doc.markers.set( 'name', ModelRange.createFromParentsAndOffsets( root, 0, root, 1 ) );
			doc.selection.setRanges( [ ModelRange.createFromParentsAndOffsets( caption, 1, caption, 1 ) ] );

			sinon.spy( dispatcher, 'fire' );

			const markers = Array.from( doc.markers.getMarkersAtPosition( doc.selection.getFirstPosition() ) );

			dispatcher.convertSelection( doc.selection, markers );

			expect( dispatcher.fire.calledWith( 'selectionMarker:name' ) ).to.be.false;
		} );

		it( 'should not fire events if information about marker has been consumed', () => {
			doc.markers.set( 'foo', ModelRange.createFromParentsAndOffsets( root, 0, root, 2 ) );
			doc.markers.set( 'bar', ModelRange.createFromParentsAndOffsets( root, 0, root, 2 ) );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'selectionMarker:foo', ( evt, data, consumable ) => {
				consumable.consume( data.selection, 'selectionMarker:bar' );
			} );

			const markers = Array.from( doc.markers.getMarkersAtPosition( doc.selection.getFirstPosition() ) );
			dispatcher.convertSelection( doc.selection, markers );

			expect( dispatcher.fire.calledWith( 'selectionMarker:foo' ) ).to.be.true;
			expect( dispatcher.fire.calledWith( 'selectionMarker:bar' ) ).to.be.false;
		} );
	} );

	describe( 'convertMarker', () => {
		let range;

		beforeEach( () => {
			const element = new ModelElement( 'paragraph', null, [ new ModelText( 'foo bar baz' ) ] );
			root.appendChildren( [ element ] );

			range = ModelRange.createFromParentsAndOffsets( element, 0, element, 4 );
		} );

		it( 'should fire event based on passed parameters', () => {
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarker( 'addMarker', 'name', range );

			expect( dispatcher.fire.calledWith( 'addMarker:name' ) ).to.be.true;

			dispatcher.convertMarker( 'removeMarker', 'name', range );

			expect( dispatcher.fire.calledWith( 'removeMarker:name' ) ).to.be.true;
		} );

		it( 'should not convert marker if it is added in graveyard', () => {
			const gyRange = ModelRange.createFromParentsAndOffsets( doc.graveyard, 0, doc.graveyard, 0 );
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarker( 'addMarker', 'name', gyRange );

			expect( dispatcher.fire.called ).to.be.false;

			dispatcher.convertMarker( 'removeMarker', 'name', gyRange );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should not convert marker if it is not in model root', () => {
			const element = new ModelElement( 'element', null, new ModelText( 'foo' ) );
			const eleRange = ModelRange.createFromParentsAndOffsets( element, 1, element, 2 );
			sinon.spy( dispatcher, 'fire' );

			dispatcher.convertMarker( 'addMarker', 'name', eleRange );

			expect( dispatcher.fire.called ).to.be.false;

			dispatcher.convertMarker( 'removeMarker', 'name', eleRange );

			expect( dispatcher.fire.called ).to.be.false;
		} );

		it( 'should prepare consumable values', () => {
			dispatcher.on( 'addMarker:name', ( evt, data, consumable ) => {
				expect( consumable.test( data.item, 'addMarker:name' ) ).to.be.true;
			} );

			dispatcher.on( 'removeMarker:name', ( evt, data, consumable ) => {
				expect( consumable.test( data.item, 'removeMarker:name' ) ).to.be.true;
			} );

			dispatcher.convertMarker( 'addMarker', 'name', range );
			dispatcher.convertMarker( 'removeMarker', 'name', range );
		} );

		it( 'should fire conversion for each item in the range', () => {
			const element = new ModelElement( 'paragraph', null, [ new ModelText( 'foo bar baz' ) ] );
			root.appendChildren( [ element ] );
			range = ModelRange.createIn( root );

			const addMarkerData = [];
			const removeMarkerData = [];

			dispatcher.on( 'addMarker:name', ( evt, data ) => addMarkerData.push( data ) );
			dispatcher.on( 'removeMarker:name', ( evt, data ) => removeMarkerData.push( data ) );

			dispatcher.convertMarker( 'addMarker', 'name', range );
			dispatcher.convertMarker( 'removeMarker', 'name', range );

			// Check if events for all elements were fired.
			let i = 0;
			for ( const val of range ) {
				const nodeInRange = val.item;
				const addData = addMarkerData[ i ];
				const removeData = removeMarkerData[ i ];

				expect( addData.markerName ).to.equal( 'name' );
				expect( addData.markerRange ).to.equal( range );
				expect( addData.range.isEqual( ModelRange.createOn( nodeInRange ) ) );

				expect( removeData.markerName ).to.equal( 'name' );
				expect( removeData.markerRange ).to.equal( range );
				expect( removeData.range.isEqual( ModelRange.createOn( nodeInRange ) ) );

				if ( nodeInRange.is( 'textProxy' ) ) {
					expect( nodeInRange.data ).to.equal( addData.item.data );
					expect( nodeInRange.data ).to.equal( removeData.item.data );
				} else {
					expect( nodeInRange ).to.equal( addData.item );
					expect( nodeInRange ).to.equal( removeData.item );
				}

				i++;
			}
		} );

		it( 'should not fire events for already consumed items', () => {
			const element = new ModelElement( 'paragraph', null, [ new ModelText( 'foo bar baz' ) ] );
			root.appendChildren( [ element ] );
			const range = ModelRange.createIn( root );
			const addMarkerSpy = sinon.spy( ( evt, data, consumable ) => {
				// Consume all items in marker range.
				for ( const value of data.markerRange ) {
					consumable.consume( value.item, 'addMarker:marker' );
				}
			} );

			const removeMarkerSpy = sinon.spy( ( evt, data, consumable ) => {
				// Consume all items in marker range.
				for ( const value of data.markerRange ) {
					consumable.consume( value.item, 'removeMarker:marker' );
				}
			} );

			dispatcher.on( 'addMarker:marker', addMarkerSpy );
			dispatcher.on( 'addMarker:marker', removeMarkerSpy );

			dispatcher.convertMarker( 'addMarker', 'marker', range );
			dispatcher.convertMarker( 'removeMarker', 'marker', range );

			sinon.assert.calledOnce( addMarkerSpy );
			sinon.assert.calledOnce( removeMarkerSpy );
		} );

		it( 'should fire event for collapsed marker', () => {
			const range = ModelRange.createFromParentsAndOffsets( root, 1, root, 1 );
			const addMarkerSpy = sinon.spy( ( evt, data, consumable ) => {
				expect( data.markerRange ).to.equal( range );
				expect( data.markerName ).to.equal( 'marker' );
				expect( consumable.test( data.markerRange, evt.name ) ).to.be.true;
			} );
			const removeMarkerSpy = sinon.spy( ( evt, data, consumable ) => {
				expect( data.markerRange ).to.equal( range );
				expect( data.markerName ).to.equal( 'marker' );
				expect( consumable.test( data.markerRange, evt.name ) ).to.be.true;
			} );

			dispatcher.on( 'addMarker:marker', addMarkerSpy );
			dispatcher.on( 'addMarker:marker', removeMarkerSpy );

			dispatcher.convertMarker( 'addMarker', 'marker', range );
			dispatcher.convertMarker( 'removeMarker', 'marker', range );

			sinon.assert.calledOnce( addMarkerSpy );
			sinon.assert.calledOnce( removeMarkerSpy );
		} );
	} );
} );
