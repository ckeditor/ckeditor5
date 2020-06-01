/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../src/model/model';
import Element from '../../src/model/element';
import Text from '../../src/model/text';
import Position from '../../src/model/position';
import Range from '../../src/model/range';

import InsertOperation from '../../src/model/operation/insertoperation';
import MoveOperation from '../../src/model/operation/moveoperation';
import RenameOperation from '../../src/model/operation/renameoperation';
import AttributeOperation from '../../src/model/operation/attributeoperation';
import SplitOperation from '../../src/model/operation/splitoperation';
import MergeOperation from '../../src/model/operation/mergeoperation';

describe( 'Differ', () => {
	let doc, differ, root, model;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		differ = doc.differ;

		root = doc.createRoot();

		root._appendChild( [
			new Element( 'paragraph', null, [
				new Text( 'foo' )
			] ),
			new Element( 'paragraph', null, [
				new Text( 'bar' )
			] )
		] );
	} );

	describe( 'insert', () => {
		// Simple.
		it( 'an element', () => {
			const position = new Position( root, [ 1 ] );

			model.change( () => {
				insert( new Element( 'image' ), position );

				expectChanges( [
					{ type: 'insert', name: 'image', length: 1, position }
				] );
			} );
		} );

		it( 'a non-empty element with attributes', () => {
			const position = new Position( root, [ 1 ] );

			model.change( () => {
				insert(
					new Element( 'image', { src: 'foo.jpg' }, new Element( 'caption', null, new Text( 'bar' ) ) ),
					position
				);

				expectChanges( [
					{ type: 'insert', name: 'image', length: 1, position }
				] );
			} );
		} );

		it( 'multiple elements', () => {
			const position = new Position( root, [ 1 ] );

			model.change( () => {
				insert( [ new Element( 'image' ), new Element( 'paragraph' ) ], position );

				expectChanges( [
					{ type: 'insert', name: 'image', length: 1, position },
					{ type: 'insert', name: 'paragraph', length: 1, position: position.getShiftedBy( 1 ) }
				] );
			} );
		} );

		it( 'a character', () => {
			const position = new Position( root, [ 0, 2 ] );

			model.change( () => {
				insert( new Text( 'x' ), position );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 1, position }
				] );
			} );
		} );

		it( 'multiple characters', () => {
			const position = new Position( root, [ 0, 2 ] );

			model.change( () => {
				insert( new Text( 'xyz' ), position );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 3, position }
				] );
			} );
		} );

		it( 'multiple consecutive characters in multiple operations', () => {
			const position = new Position( root, [ 0, 2 ] );

			model.change( () => {
				insert( new Text( 'xy' ), position );
				insert( new Text( 'z' ), position.getShiftedBy( 2 ) );
				insert( new Text( 'ab' ), position );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 5, position }
				] );
			} );
		} );

		it( 'multiple non-consecutive characters in multiple operations', () => {
			const position = new Position( root, [ 0, 0 ] );

			model.change( () => {
				insert( new Text( 'xy' ), position );
				insert( new Text( 'z' ), position.getShiftedBy( 3 ) );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 2, position },
					{ type: 'insert', name: '$text', length: 1, position: position.getShiftedBy( 3 ) }
				] );
			} );
		} );

		// Combined.
		it( 'node in a new element', () => {
			const image = new Element( 'image' );
			const position = new Position( root, [ 1 ] );

			model.change( () => {
				insert( image, position );

				const caption = new Element( 'caption' );
				insert( caption, Position._createAt( image, 0 ) );

				insert( new Text( 'foo' ), Position._createAt( caption, 0 ) );

				expectChanges( [
					{ type: 'insert', name: 'image', length: 1, position }
				] );
			} );
		} );

		it( 'node in a renamed element', () => {
			const text = new Text( 'xyz', { bold: true } );
			const position = new Position( root, [ 0, 3 ] );

			model.change( () => {
				insert( text, position );
				rename( root.getChild( 0 ), 'listItem' );

				// Note that since renamed element is removed and then re-inserted, there is no diff for text inserted inside it.
				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ) },
					{ type: 'insert', name: 'listItem', length: 1, position: new Position( root, [ 0 ] ) }
				] );
			} );
		} );

		it( 'node in a element with changed attribute', () => {
			const text = new Text( 'xyz', { bold: true } );
			const position = new Position( root, [ 0, 3 ] );
			const range = new Range( Position._createAt( root, 0 ), Position._createAt( root, 1 ) );

			model.change( () => {
				insert( text, position );
				attribute( range, 'align', null, 'center' );

				const diffRange = new Range( Position._createAt( root, 0 ), Position._createAt( root.getChild( 0 ), 0 ) );

				// Compare to scenario above, this time there is only an attribute change on parent element,
				// so there is also a diff for text.
				expectChanges( [
					{ type: 'attribute', range: diffRange, attributeKey: 'align', attributeOldValue: null, attributeNewValue: 'center' },
					{ type: 'insert', name: '$text', length: 3, position }
				] );
			} );
		} );

		it( 'nodes between other inserted nodes', () => {
			model.change( () => {
				insert( new Text( 'xx' ), new Position( root, [ 0, 1 ] ) );
				insert( new Text( 'yy' ), new Position( root, [ 0, 2 ] ) );

				expectChanges( [
					{ type: 'insert', position: new Position( root, [ 0, 1 ] ), length: 4, name: '$text' }
				] );
			} );
		} );

		it( 'nodes before nodes with changed attributes', () => {
			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 1 ), Position._createAt( p1, 3 ) );
			const position = new Position( root, [ 0, 0 ] );

			model.change( () => {
				attribute( range, 'bold', null, true );
				insert( new Text( 'xx' ), position );

				const rangeAfter = new Range( Position._createAt( p1, 3 ), Position._createAt( p1, 5 ) );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 2, position },
					{ type: 'attribute', range: rangeAfter, attributeKey: 'bold', attributeOldValue: null, attributeNewValue: true }
				] );
			} );
		} );

		it( 'nodes between nodes with changed attributes', () => {
			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 1 ), Position._createAt( p1, 3 ) );
			const position = new Position( root, [ 0, 2 ] );

			model.change( () => {
				attribute( range, 'bold', null, true );
				insert( new Text( 'xx' ), position );

				const rangeBefore = new Range( Position._createAt( p1, 1 ), Position._createAt( p1, 2 ) );
				const rangeAfter = new Range( Position._createAt( p1, 4 ), Position._createAt( p1, 5 ) );

				expectChanges( [
					{
						type: 'attribute',
						range: rangeBefore,
						attributeKey: 'bold',
						attributeOldValue: null,
						attributeNewValue: true
					},
					{ type: 'insert', name: '$text', length: 2, position },
					{
						type: 'attribute',
						range: rangeAfter,
						attributeKey: 'bold',
						attributeOldValue: null,
						attributeNewValue: true
					}
				] );
			} );
		} );

		it( 'nodes after nodes with changed attributes', () => {
			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 1 ), Position._createAt( p1, 3 ) );
			const position = new Position( root, [ 0, 3 ] );

			model.change( () => {
				attribute( range, 'bold', null, true );
				insert( new Text( 'xx' ), position );

				expectChanges( [
					{
						type: 'attribute',
						range,
						attributeKey: 'bold',
						attributeOldValue: null,
						attributeNewValue: true
					},
					{ type: 'insert', name: '$text', length: 2, position }
				] );
			} );
		} );
	} );

	describe( 'remove', () => {
		it( 'an element', () => {
			const position = new Position( root, [ 0 ] );

			model.change( () => {
				remove( position, 1 );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position }
				] );
			} );
		} );

		it( 'multiple elements', () => {
			const position = new Position( root, [ 0 ] );

			model.change( () => {
				remove( position, 2 );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position },
					{ type: 'remove', name: 'paragraph', length: 1, position }
				] );
			} );
		} );

		it( 'a character', () => {
			const position = new Position( root, [ 0, 1 ] );

			model.change( () => {
				remove( position, 1 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 1, position }
				] );
			} );
		} );

		it( 'multiple characters', () => {
			const position = new Position( root, [ 0, 1 ] );

			model.change( () => {
				remove( position, 2 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 2, position }
				] );
			} );
		} );

		it( 'multiple consecutive characters in multiple operations', () => {
			const position = new Position( root, [ 0, 0 ] );

			model.change( () => {
				remove( position, 1 );
				remove( position, 1 );
				remove( position, 1 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 3, position }
				] );
			} );
		} );

		it( 'multiple non-consecutive characters in multiple operations', () => {
			const position = new Position( root, [ 0, 0 ] );

			model.change( () => {
				remove( position, 1 );
				remove( position.getShiftedBy( 1 ), 1 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 1, position },
					{ type: 'remove', name: '$text', length: 1, position: position.getShiftedBy( 1 ) }
				] );
			} );
		} );

		it( 'item just before inserted item', () => {
			// This tests proper changes sorting.
			const insertPosition = new Position( root, [ 0, 2 ] );
			const removePosition = new Position( root, [ 0, 1 ] );

			model.change( () => {
				insert( new Text( 'x' ), insertPosition );
				remove( removePosition, 1 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 1, position: removePosition },
					{ type: 'insert', name: '$text', length: 1, position: removePosition }
				] );
			} );
		} );

		it( 'nodes before inserted nodes (together with some inserted nodes)', () => {
			const insertPosition = new Position( root, [ 0, 2 ] );
			const removePosition = new Position( root, [ 0, 1 ] );

			model.change( () => {
				insert( new Text( 'xyz' ), insertPosition );
				remove( removePosition, 2 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 1, position: removePosition },
					{ type: 'insert', name: '$text', length: 2, position: removePosition }
				] );
			} );
		} );

		it( 'inserted nodes and some nodes after inserted nodes', () => {
			const insertPosition = new Position( root, [ 0, 2 ] );
			const removePosition = new Position( root, [ 0, 3 ] );

			model.change( () => {
				insert( new Text( 'xyz' ), insertPosition );
				remove( removePosition, 3 );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 1, position: insertPosition },
					{ type: 'remove', name: '$text', length: 1, position: removePosition }
				] );
			} );
		} );

		it( 'all inserted nodes', () => {
			const insertPosition = new Position( root, [ 0, 2 ] );
			const removePosition = new Position( root, [ 0, 1 ] );

			model.change( () => {
				insert( new Text( 'xy' ), insertPosition );
				remove( removePosition, 4 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 2, position: removePosition }
				] );
			} );
		} );

		it( 'before removed nodes', () => {
			const removePositionA = new Position( root, [ 0, 2 ] );
			const removePositionB = new Position( root, [ 0, 0 ] );

			model.change( () => {
				remove( removePositionA, 1 );
				remove( removePositionB, 1 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 1, position: removePositionB },
					{ type: 'remove', name: '$text', length: 1, position: new Position( root, [ 0, 1 ] ) }
				] );
			} );
		} );

		it( 'before and after removed nodes in one operation', () => {
			const removePositionA = new Position( root, [ 0, 1 ] );
			const removePositionB = new Position( root, [ 0, 0 ] );

			model.change( () => {
				remove( removePositionA, 1 );
				remove( removePositionB, 2 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 3, position: removePositionB }
				] );
			} );
		} );

		it( 'before nodes that changed attributes', () => {
			const position = new Position( root, [ 0, 0 ] );

			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 2 ), Position._createAt( p1, 3 ) );

			model.change( () => {
				attribute( range, 'bold', null, true );
				remove( position, 1 );

				const newRange = new Range( Position._createAt( p1, 1 ), Position._createAt( p1, 2 ) );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 1, position },
					{
						type: 'attribute',
						range: newRange,
						attributeKey: 'bold',
						attributeOldValue: null,
						attributeNewValue: true
					}
				] );
			} );
		} );

		it( 'before nodes that changed attributes together with some changed nodes', () => {
			const position = new Position( root, [ 0, 0 ] );

			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 1 ), Position._createAt( p1, 3 ) );

			model.change( () => {
				attribute( range, 'bold', null, true );
				remove( position, 2 );

				const newRange = new Range( Position._createAt( p1, 0 ), Position._createAt( p1, 1 ) );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 2, position },
					{
						type: 'attribute',
						range: newRange,
						attributeKey: 'bold',
						attributeOldValue: null,
						attributeNewValue: true
					}
				] );
			} );
		} );

		it( 'some changed nodes', () => {
			const position = new Position( root, [ 0, 1 ] );

			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 0 ), Position._createAt( p1, 3 ) );

			model.change( () => {
				attribute( range, 'bold', null, true );
				remove( position, 1 );

				const rangeBefore = new Range( Position._createAt( p1, 0 ), Position._createAt( p1, 1 ) );
				const rangeAfter = new Range( Position._createAt( p1, 1 ), Position._createAt( p1, 2 ) );

				expectChanges( [
					{
						type: 'attribute',
						range: rangeBefore,
						attributeKey: 'bold',
						attributeOldValue: null,
						attributeNewValue: true
					},
					{ type: 'remove', name: '$text', length: 1, position },
					{
						type: 'attribute',
						range: rangeAfter,
						attributeKey: 'bold',
						attributeOldValue: null,
						attributeNewValue: true
					}
				] );
			} );
		} );

		it( 'some changed nodes and some nodes after', () => {
			const position = new Position( root, [ 0, 1 ] );

			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 0 ), Position._createAt( p1, 2 ) );

			model.change( () => {
				attribute( range, 'bold', null, true );
				remove( position, 2 );

				const newRange = new Range( Position._createAt( p1, 0 ), Position._createAt( p1, 1 ) );

				expectChanges( [
					{
						type: 'attribute',
						range: newRange,
						attributeKey: 'bold',
						attributeOldValue: null,
						attributeNewValue: true
					},
					{ type: 'remove', name: '$text', length: 2, position }
				] );
			} );
		} );

		it( 'after changed nodes', () => {
			const position = new Position( root, [ 0, 2 ] );

			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 0 ), Position._createAt( p1, 1 ) );

			model.change( () => {
				attribute( range, 'bold', null, true );
				remove( position, 1 );

				expectChanges( [
					{
						type: 'attribute',
						range,
						attributeKey: 'bold',
						attributeOldValue: null,
						attributeNewValue: true
					},
					{ type: 'remove', name: '$text', length: 1, position }
				] );
			} );
		} );
	} );

	// The only main difference between remove operation and move operation is target position.
	// In differ, graveyard is treated as other roots. In remove suite, simple cases for move are covered.
	// This suite will have only a few cases, focused on things specific to move operation.
	describe( 'move', () => {
		it( 'an element to the same parent - target position is after source position', () => {
			const sourcePosition = new Position( root, [ 0 ] );
			const targetPosition = new Position( root, [ 2 ] );

			model.change( () => {
				move( sourcePosition, 1, targetPosition );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ) },
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) }
				] );
			} );
		} );

		it( 'an element to the same parent - target position is before source position', () => {
			const sourcePosition = new Position( root, [ 1 ] );
			const targetPosition = new Position( root, [ 0 ] );

			model.change( () => {
				move( sourcePosition, 1, targetPosition );

				expectChanges( [
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ) },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 2 ] ) }
				] );
			} );
		} );

		it( 'multiple consecutive characters between different roots in multiple operations', () => {
			const sourcePosition = new Position( root, [ 0, 1 ] );
			const targetPosition = new Position( root, [ 1, 0 ] );

			model.change( () => {
				move( sourcePosition, 1, targetPosition );
				move( sourcePosition, 1, targetPosition.getShiftedBy( 1 ) );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 2, position: sourcePosition },
					{ type: 'insert', name: '$text', length: 2, position: targetPosition }
				] );
			} );
		} );

		it( 'reinsert removed element', () => {
			doc.graveyard._appendChild( new Element( 'listItem' ) );

			const sourcePosition = new Position( doc.graveyard, [ 0 ] );
			const targetPosition = new Position( root, [ 2 ] );

			model.change( () => {
				move( sourcePosition, 1, targetPosition );

				expectChanges( [
					{ type: 'insert', name: 'listItem', length: 1, position: targetPosition }
				] );
			} );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1664
		it( 'move to the same position #1', () => {
			const position = new Position( root, [ 0 ] );

			model.change( () => {
				move( position, 1, position );

				expectChanges( [] );
			} );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1664
		it( 'move to the same position #2', () => {
			const sourcePosition = new Position( root, [ 0 ] );
			const targetPosition = new Position( root, [ 2 ] );

			// Add two more elements to the root, now there are 4 paragraphs.
			root._appendChild( [
				new Element( 'paragraph' ),
				new Element( 'paragraph' )
			] );

			model.change( () => {
				move( sourcePosition, 2, targetPosition );

				expectChanges( [] );
			} );
		} );
	} );

	describe( 'rename', () => {
		it( 'an element', () => {
			model.change( () => {
				rename( root.getChild( 1 ), 'listItem' );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) },
					{ type: 'insert', name: 'listItem', length: 1, position: new Position( root, [ 1 ] ) }
				] );
			} );
		} );

		it( 'inside a new element', () => {
			// Since the rename is inside a new element, it should not be listed on changes list.
			model.change( () => {
				insert( new Element( 'blockQuote', null, new Element( 'paragraph' ) ), new Position( root, [ 2 ] ) );
				rename( root.getChild( 2 ).getChild( 0 ), 'listItem' );

				expectChanges( [
					{ type: 'insert', name: 'blockQuote', length: 1, position: new Position( root, [ 2 ] ) }
				] );
			} );
		} );

		it( 'markers refreshing', () => {
			// Since rename is "translated" to remove+insert pair, we need to refresh all the markers that
			// intersect with the renamed element.

			model.change( () => {
				// Renamed element contains marker.
				model.markers._set( 'markerA', new Range( new Position( root, [ 1, 1 ] ), new Position( root, [ 1, 2 ] ) ) );

				// Marker contains renamed element.
				model.markers._set( 'markerB', new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ) );

				// Intersecting.
				model.markers._set( 'markerC', new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 1, 2 ] ) ) );

				// Not intersecting.
				model.markers._set( 'markerD', new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 1 ] ) ) );
			} );

			const markersToRefresh = [ 'markerA', 'markerB', 'markerC' ];

			model.change( () => {
				rename( root.getChild( 1 ), 'listItem' );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) },
					{ type: 'insert', name: 'listItem', length: 1, position: new Position( root, [ 1 ] ) }
				] );

				const markersToRemove = differ.getMarkersToRemove().map( entry => entry.name );
				const markersToAdd = differ.getMarkersToAdd().map( entry => entry.name );

				expect( markersToRefresh ).to.deep.equal( markersToRemove );
				expect( markersToRefresh ).to.deep.equal( markersToAdd );
			} );
		} );
	} );

	describe( 'attribute', () => {
		const attributeKey = 'key';
		const attributeOldValue = null;
		const attributeNewValue = 'foo';

		it( 'on an element', () => {
			const range = new Range( Position._createAt( root, 0 ), Position._createAt( root, 1 ) );

			model.change( () => {
				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				const diffRange = new Range( Position._createAt( root, 0 ), Position._createAt( root.getChild( 0 ), 0 ) );

				expectChanges( [
					{ type: 'attribute', range: diffRange, attributeKey, attributeOldValue, attributeNewValue }
				] );
			} );
		} );

		it( 'on an element - only one of many attributes changes', () => {
			const range = new Range( Position._createAt( root, 0 ), Position._createAt( root, 1 ) );

			model.change( () => {
				// Set an attribute on an element. It won't change afterwards.
				attribute( range, 'otherAttr', null, true );
			} );

			model.change( () => {
				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				const diffRange = new Range( Position._createAt( root, 0 ), Position._createAt( root.getChild( 0 ), 0 ) );

				expectChanges( [
					{ type: 'attribute', range: diffRange, attributeKey, attributeOldValue, attributeNewValue }
				] );
			} );
		} );

		it( 'on a character', () => {
			const parent = root.getChild( 1 );
			const range = new Range( Position._createAt( parent, 1 ), Position._createAt( parent, 2 ) );

			model.change( () => {
				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				expectChanges( [
					{ type: 'attribute', range, attributeKey, attributeOldValue, attributeNewValue }
				] );
			} );
		} );

		it( 'on a character - case with same characters next to each other', () => {
			const parent = root.getChild( 0 );
			const range = new Range( Position._createAt( parent, 1 ), Position._createAt( parent, 2 ) );

			model.change( () => {
				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				expectChanges( [
					{ type: 'attribute', range, attributeKey, attributeOldValue, attributeNewValue }
				] );
			} );
		} );

		it( 'on multiple characters', () => {
			const parent = root.getChild( 0 );
			const range = new Range( Position._createAt( parent, 0 ), Position._createAt( parent, 3 ) );

			model.change( () => {
				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				expectChanges( [
					{ type: 'attribute', range, attributeKey, attributeOldValue, attributeNewValue }
				] );
			} );
		} );

		it( 'on multiple consecutive characters in multiple operations', () => {
			const parent = root.getChild( 0 );

			const range1 = new Range( Position._createAt( parent, 1 ), Position._createAt( parent, 2 ) );
			const range2 = new Range( Position._createAt( parent, 2 ), Position._createAt( parent, 3 ) );

			model.change( () => {
				attribute( range1, attributeKey, attributeOldValue, attributeNewValue );
				attribute( range2, attributeKey, attributeOldValue, attributeNewValue );

				const range = new Range( Position._createAt( parent, 1 ), Position._createAt( parent, 3 ) );

				expectChanges( [
					{ type: 'attribute', range, attributeKey, attributeOldValue, attributeNewValue }
				] );
			} );
		} );

		it( 'attribute changes intersecting #1', () => {
			const parent = root.getChild( 1 );

			// Be aware that you cannot make an intersecting changes with the same attribute key,
			// cause the value would be incorrect for the common part of the ranges.
			const ranges = [
				[ 0, 2, null, true, 'foo' ],
				[ 1, 3, null, true, 'bar' ]
			];

			model.change( () => {
				for ( const item of ranges ) {
					const range = new Range( Position._createAt( parent, item[ 0 ] ), Position._createAt( parent, item[ 1 ] ) );

					attribute( range, item[ 4 ], item[ 2 ], item[ 3 ] );
				}

				expectChanges( [
					{
						type: 'attribute',
						range: new Range( Position._createAt( parent, 0 ), Position._createAt( parent, 2 ) ),
						attributeKey: 'foo',
						attributeOldValue: null,
						attributeNewValue: true
					},
					{
						type: 'attribute',
						range: new Range( Position._createAt( parent, 1 ), Position._createAt( parent, 3 ) ),
						attributeKey: 'bar',
						attributeOldValue: null,
						attributeNewValue: true
					}
				] );
			} );
		} );

		it( 'attribute changes intersecting #2', () => {
			const parent = root.getChild( 1 );

			// Be aware that you cannot make an intersecting changes with the same attribute key,
			// cause the value would be incorrect for the common part of the ranges.
			const ranges = [
				[ 1, 3, null, true, 'foo' ],
				[ 0, 2, null, true, 'bar' ]
			];

			model.change( () => {
				for ( const item of ranges ) {
					const range = new Range( Position._createAt( parent, item[ 0 ] ), Position._createAt( parent, item[ 1 ] ) );

					attribute( range, item[ 4 ], item[ 2 ], item[ 3 ] );
				}

				expectChanges( [
					{
						type: 'attribute',
						range: new Range( Position._createAt( parent, 0 ), Position._createAt( parent, 1 ) ),
						attributeKey: 'bar',
						attributeOldValue: null,
						attributeNewValue: true
					},
					{
						type: 'attribute',
						range: new Range( Position._createAt( parent, 1 ), Position._createAt( parent, 2 ) ),
						attributeKey: 'foo',
						attributeOldValue: null,
						attributeNewValue: true
					},
					{
						type: 'attribute',
						range: new Range( Position._createAt( parent, 1 ), Position._createAt( parent, 2 ) ),
						attributeKey: 'bar',
						attributeOldValue: null,
						attributeNewValue: true
					},
					{
						type: 'attribute',
						range: new Range( Position._createAt( parent, 2 ), Position._createAt( parent, 3 ) ),
						attributeKey: 'foo',
						attributeOldValue: null,
						attributeNewValue: true
					}
				] );
			} );
		} );

		it( 'attribute changes included in an attribute change #1 - changes are reversed at the end', () => {
			const parent = root.getChild( 1 );

			const ranges = [
				[ 0, 1, null, true ],
				[ 1, 2, null, true ],
				[ 0, 2, true, null ]
			];

			model.change( () => {
				for ( const item of ranges ) {
					const range = new Range( Position._createAt( parent, item[ 0 ] ), Position._createAt( parent, item[ 1 ] ) );

					attribute( range, attributeKey, item[ 2 ], item[ 3 ] );
				}

				expectChanges( [] );
			} );
		} );

		it( 'attribute changes included in an attribute change #2 - changes are re-applied at the end', () => {
			const parent = root.getChild( 1 );

			const ranges = [
				[ 0, 1, null, true ],
				[ 1, 2, null, true ],
				[ 0, 2, true, null ],
				[ 0, 1, null, true ],
				[ 1, 2, null, true ]
			];

			model.change( () => {
				for ( const item of ranges ) {
					const range = new Range( Position._createAt( parent, item[ 0 ] ), Position._createAt( parent, item[ 1 ] ) );

					attribute( range, attributeKey, item[ 2 ], item[ 3 ] );
				}

				expectChanges( [ {
					type: 'attribute',
					range: new Range( Position._createAt( parent, 0 ), Position._createAt( parent, 2 ) ),
					attributeKey,
					attributeOldValue: null,
					attributeNewValue: true
				} ] );
			} );
		} );

		it( 'on multiple non-consecutive characters in multiple operations', () => {
			const parent = root.getChild( 0 );

			const range1 = new Range( Position._createAt( parent, 0 ), Position._createAt( parent, 1 ) );
			const range2 = new Range( Position._createAt( parent, 2 ), Position._createAt( parent, 3 ) );

			model.change( () => {
				// Note "reversed" order of ranges. Further range is changed first.
				attribute( range2, attributeKey, attributeOldValue, attributeNewValue );
				attribute( range1, attributeKey, attributeOldValue, attributeNewValue );

				// Note that changes has been sorted.
				expectChanges( [
					{ type: 'attribute', range: range1, attributeKey, attributeOldValue, attributeNewValue },
					{ type: 'attribute', range: range2, attributeKey, attributeOldValue, attributeNewValue }
				] );
			} );
		} );

		it( 'on range containing various nodes', () => {
			const range = new Range( Position._createAt( root, 0 ), Position._createAt( root, 2 ) );

			model.change( () => {
				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				const p1 = root.getChild( 0 );
				const p2 = root.getChild( 1 );
				const type = 'attribute';

				expectChanges( [
					{
						type,
						range: new Range( Position._createAt( root, 0 ), Position._createAt( p1, 0 ) ),
						attributeKey,
						attributeOldValue,
						attributeNewValue
					},
					{
						type,
						range: new Range( Position._createAt( root, 1 ), Position._createAt( p2, 0 ) ),
						attributeKey,
						attributeOldValue,
						attributeNewValue
					}
				] );
			} );
		} );

		it( 'remove attribute and add attribute on text', () => {
			const p = root.getChild( 1 );

			p.getChild( 0 )._setAttribute( 'bold', true );

			const range = new Range( Position._createAt( p, 1 ), Position._createAt( p, 3 ) );

			model.change( () => {
				attribute( range, 'bold', true, null );
				attribute( range, 'italic', null, true );

				const range1 = new Range( Position._createAt( p, 1 ), Position._createAt( p, 2 ) );
				const range2 = new Range( Position._createAt( p, 2 ), Position._createAt( p, 3 ) );

				// Attribute change glueing does not work 100% correct.
				expectChanges( [
					{
						type: 'attribute',
						range: range1,
						attributeKey: 'bold',
						attributeOldValue: true,
						attributeNewValue: null
					},
					{
						type: 'attribute',
						range: range1,
						attributeKey: 'italic',
						attributeOldValue: null,
						attributeNewValue: true
					},
					{
						type: 'attribute',
						range: range2,
						attributeKey: 'bold',
						attributeOldValue: true,
						attributeNewValue: null
					},
					{
						type: 'attribute',
						range: range2,
						attributeKey: 'italic',
						attributeOldValue: null,
						attributeNewValue: true
					}
				] );
			} );
		} );

		it( 'on some old nodes and inserted nodes', () => {
			const position = new Position( root, [ 0, 1 ] );

			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 0 ), Position._createAt( p1, 2 ) );

			model.change( () => {
				insert( new Text( 'xx' ), position );
				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				const rangeBefore = new Range( Position._createAt( p1, 0 ), Position._createAt( p1, 1 ) );

				expectChanges( [
					{ type: 'attribute', range: rangeBefore, attributeKey, attributeOldValue, attributeNewValue },
					{ type: 'insert', name: '$text', length: 2, position }
				] );
			} );
		} );

		it( 'only on inserted nodes', () => {
			const position = new Position( root, [ 0, 1 ] );

			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 2 ), Position._createAt( p1, 3 ) );

			model.change( () => {
				insert( new Text( 'xxx' ), position );
				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 3, position }
				] );
			} );
		} );

		it( 'on some inserted nodes and old nodes', () => {
			const position = new Position( root, [ 0, 1 ] );

			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 2 ), Position._createAt( p1, 4 ) );

			model.change( () => {
				insert( new Text( 'xx' ), position );
				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				const rangeAfter = new Range( Position._createAt( p1, 3 ), Position._createAt( p1, 4 ) );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 2, position },
					{ type: 'attribute', range: rangeAfter, attributeKey, attributeOldValue, attributeNewValue }
				] );
			} );
		} );

		it( 'over all inserted nodes and some old nodes', () => {
			const position = new Position( root, [ 0, 1 ] );

			const p1 = root.getChild( 0 );
			const range = new Range( Position._createAt( p1, 0 ), Position._createAt( p1, 4 ) );

			model.change( () => {
				insert( new Text( 'xx' ), position );
				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				const rangeBefore = new Range( Position._createAt( p1, 0 ), Position._createAt( p1, 1 ) );
				const rangeAfter = new Range( Position._createAt( p1, 3 ), Position._createAt( p1, 4 ) );

				expectChanges( [
					{ type: 'attribute', range: rangeBefore, attributeKey, attributeOldValue, attributeNewValue },
					{ type: 'insert', name: '$text', length: 2, position },
					{ type: 'attribute', range: rangeAfter, attributeKey, attributeOldValue, attributeNewValue }
				] );
			} );
		} );

		it( 'on some not changed and some changed nodes', () => {
			const p = root.getChild( 0 );

			const rangeA = new Range( Position._createAt( p, 1 ), Position._createAt( p, 3 ) );
			const rangeB = new Range( Position._createAt( p, 0 ), Position._createAt( p, 2 ) );

			model.change( () => {
				attribute( rangeA, 'a', null, true );
				attribute( rangeB, 'b', null, true );

				const type = 'attribute';
				const attributeOldValue = null;
				const attributeNewValue = true;

				// Attribute change glueing does not work 100% correct.
				expectChanges( [
					{
						type,
						range: new Range( Position._createAt( p, 0 ), Position._createAt( p, 1 ) ),
						attributeKey: 'b',
						attributeOldValue,
						attributeNewValue
					},
					{
						type,
						range: new Range( Position._createAt( p, 1 ), Position._createAt( p, 2 ) ),
						attributeKey: 'a',
						attributeOldValue,
						attributeNewValue
					},
					{
						type,
						range: new Range( Position._createAt( p, 1 ), Position._createAt( p, 2 ) ),
						attributeKey: 'b',
						attributeOldValue,
						attributeNewValue
					},
					{
						type,
						range: new Range( Position._createAt( p, 2 ), Position._createAt( p, 3 ) ),
						attributeKey: 'a',
						attributeOldValue,
						attributeNewValue
					}
				] );
			} );
		} );

		it( 'on already changed nodes', () => {
			const p = root.getChild( 1 );

			const rangeA = new Range( Position._createAt( p, 0 ), Position._createAt( p, 3 ) );
			const rangeB = new Range( Position._createAt( p, 1 ), Position._createAt( p, 2 ) );

			model.change( () => {
				attribute( rangeA, 'a', null, true );
				attribute( rangeB, 'b', null, true );

				const type = 'attribute';
				const attributeOldValue = null;
				const attributeNewValue = true;

				// Attribute change glueing does not work 100% correct.
				expectChanges( [
					{
						type,
						range: new Range( Position._createAt( p, 0 ), Position._createAt( p, 2 ) ),
						attributeKey: 'a',
						attributeOldValue,
						attributeNewValue
					},
					{
						type,
						range: new Range( Position._createAt( p, 1 ), Position._createAt( p, 2 ) ),
						attributeKey: 'b',
						attributeOldValue,
						attributeNewValue
					},
					{
						type,
						range: new Range( Position._createAt( p, 2 ), Position._createAt( p, 3 ) ),
						attributeKey: 'a',
						attributeOldValue,
						attributeNewValue
					}
				] );
			} );
		} );

		it( 'on some changed and some not changed nodes', () => {
			const p = root.getChild( 1 );

			const rangeA = new Range( Position._createAt( p, 0 ), Position._createAt( p, 2 ) );
			const rangeB = new Range( Position._createAt( p, 1 ), Position._createAt( p, 3 ) );

			model.change( () => {
				attribute( rangeA, 'a', null, true );
				attribute( rangeB, 'b', null, true );

				const type = 'attribute';
				const attributeOldValue = null;
				const attributeNewValue = true;

				expectChanges( [
					{
						type,
						range: new Range( Position._createAt( p, 0 ), Position._createAt( p, 2 ) ),
						attributeKey: 'a',
						attributeOldValue,
						attributeNewValue
					},
					{
						type,
						range: new Range( Position._createAt( p, 1 ), Position._createAt( p, 3 ) ),
						attributeKey: 'b',
						attributeOldValue,
						attributeNewValue
					}
				] );
			} );
		} );

		it( 'on an element that got some nodes inserted', () => {
			const p = root.getChild( 0 );

			model.change( () => {
				insert( new Text( 'x' ), Position._createAt( p, 3 ) );
				insert( new Text( 'x' ), Position._createAt( p, 4 ) );
				insert( new Text( 'x' ), Position._createAt( p, 5 ) );

				attribute( new Range( Position._createAt( root, 0 ), Position._createAt( root, 1 ) ), 'a', null, true );

				insert( new Text( 'y' ), Position._createAt( p, 6 ) );

				expectChanges( [
					{
						type: 'attribute',
						range: new Range( Position._createAt( root, 0 ), Position._createAt( p, 0 ) ),
						attributeKey: 'a',
						attributeOldValue: null,
						attributeNewValue: true
					},
					{
						type: 'insert',
						position: Position._createAt( p, 3 ),
						length: 4,
						name: '$text'
					}
				] );
			} );
		} );

		it( 'over all changed nodes and some not changed nodes', () => {
			const p = root.getChild( 0 );

			const rangeA = new Range( Position._createAt( p, 1 ), Position._createAt( p, 2 ) );
			const rangeB = new Range( Position._createAt( p, 0 ), Position._createAt( p, 3 ) );

			model.change( () => {
				attribute( rangeA, 'a', null, true );
				attribute( rangeB, 'b', null, true );

				const type = 'attribute';
				const attributeOldValue = null;
				const attributeNewValue = true;

				// Attribute change glueing does not work 100% correct.
				expectChanges( [
					{
						type,
						range: new Range( Position._createAt( p, 0 ), Position._createAt( p, 1 ) ),
						attributeKey: 'b',
						attributeOldValue,
						attributeNewValue
					},
					{
						type,
						range: new Range( Position._createAt( p, 1 ), Position._createAt( p, 2 ) ),
						attributeKey: 'a',
						attributeOldValue,
						attributeNewValue
					},
					{
						type,
						range: new Range( Position._createAt( p, 1 ), Position._createAt( p, 3 ) ),
						attributeKey: 'b',
						attributeOldValue,
						attributeNewValue
					}
				] );
			} );
		} );

		it( 'add attribute after some text was removed', () => {
			const p = root.getChild( 0 );

			const range = new Range( Position._createAt( p, 0 ), Position._createAt( p, 2 ) );
			const position = Position._createAt( p, 1 );

			model.change( () => {
				remove( position, 1 );
				attribute( range, 'a', null, true );

				const type = 'attribute';
				const attributeOldValue = null;
				const attributeNewValue = true;

				// Attribute change glueing does not work 100% correct.
				expectChanges( [
					{
						type,
						range: new Range( Position._createAt( p, 0 ), Position._createAt( p, 1 ) ),
						attributeKey: 'a',
						attributeOldValue,
						attributeNewValue
					},
					{
						type: 'remove',
						position,
						length: 1,
						name: '$text'
					},
					{
						type,
						range: new Range( Position._createAt( p, 1 ), Position._createAt( p, 2 ) ),
						attributeKey: 'a',
						attributeOldValue,
						attributeNewValue
					}
				] );
			} );
		} );
	} );

	describe( 'split', () => {
		it( 'split an element', () => {
			const position = new Position( root, [ 0, 2 ] );

			model.change( () => {
				split( position );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 1, position },
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) }
				] );
			} );
		} );

		it( 'split a new element', () => {
			model.change( () => {
				insert(
					new Element( 'paragraph', null, new Text( 'Ab' ) ),
					new Position( root, [ 0 ] )
				);

				split( new Position( root, [ 0, 1 ] ) );

				expectChanges( [
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ) },
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) }
				] );
			} );
		} );

		it( 'split an element inside a new element', () => {
			model.change( () => {
				insert(
					new Element( 'blockQuote', null, new Element( 'paragraph', null, new Text( 'Ab' ) ) ),
					new Position( root, [ 0 ] )
				);

				split( new Position( root, [ 0, 0, 1 ] ) );

				expectChanges( [
					{ type: 'insert', name: 'blockQuote', length: 1, position: new Position( root, [ 0 ] ) }
				] );
			} );
		} );

		it( 'should correctly mark a change in graveyard', () => {
			model.change( () => {
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 3 ] ) );
			} );

			model.change( () => {
				const position = new Position( root, [ 0, 3 ] );
				const operation = new SplitOperation( position, 3, new Position( doc.graveyard, [ 0 ] ), doc.version );

				model.applyOperation( operation );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( doc.graveyard, [ 0 ] ) },
					{ type: 'remove', name: '$text', length: 3, position: new Position( root, [ 0, 3 ] ) },
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) }
				], true );
			} );
		} );
	} );

	describe( 'merge', () => {
		it( 'merge two elements', () => {
			model.change( () => {
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 3 ] ) );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 3, position: new Position( root, [ 0, 3 ] ) },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) }
				] );
			} );
		} );

		it( 'merge a new element', () => {
			model.change( () => {
				insert( new Element( 'paragraph', null, new Text( 'Ab' ) ), new Position( root, [ 1 ] ) );
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 3 ] ) );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 2, position: new Position( root, [ 0, 3 ] ) }
				] );
			} );
		} );

		it( 'merge into a new element', () => {
			model.change( () => {
				insert( new Element( 'paragraph', null, new Text( 'Ab' ) ), new Position( root, [ 0 ] ) );
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 2 ] ) );

				expectChanges( [
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ) },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) }
				] );
			} );
		} );

		it( 'merge elements inside a new element', () => {
			model.change( () => {
				insert(
					new Element( 'blockQuote', null, [
						new Element( 'paragraph', null, new Text( 'Ab' ) ),
						new Element( 'paragraph', null, new Text( 'Xyz' ) )
					] ),
					new Position( root, [ 0 ] )
				);

				merge( new Position( root, [ 0, 1, 0 ] ), new Position( root, [ 0, 0, 2 ] ) );

				expectChanges( [
					{ type: 'insert', name: 'blockQuote', length: 1, position: new Position( root, [ 0 ] ) }
				] );
			} );
		} );

		it( 'should correctly mark a change in graveyard', () => {
			model.change( () => {
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 3 ] ) );

				expectChanges( [
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( doc.graveyard, [ 0 ] ) },
					{ type: 'insert', name: '$text', length: 3, position: new Position( root, [ 0, 3 ] ) },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) }
				], true );
			} );
		} );
	} );

	describe( 'markers', () => {
		let range, rangeB;

		beforeEach( () => {
			range = new Range( Position._createAt( root, 0 ), Position._createAt( root, 1 ) );
			rangeB = new Range( Position._createAt( root, 1 ), Position._createAt( root, 2 ) );
		} );

		it( 'add marker', () => {
			differ.bufferMarkerChange( 'name', null, range, true );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [] );

			expect( differ.getMarkersToAdd() ).to.deep.equal( [
				{ name: 'name', range }
			] );

			expect( differ.getChangedMarkers() ).to.deep.equal( [
				{
					name: 'name',
					data: {
						oldRange: null,
						newRange: range
					}
				}
			] );
		} );

		it( 'remove marker', () => {
			differ.bufferMarkerChange( 'name', range, null, true );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [
				{ name: 'name', range }
			] );

			expect( differ.getMarkersToAdd() ).to.deep.equal( [] );

			expect( differ.getChangedMarkers() ).to.deep.equal( [
				{
					name: 'name',
					data: {
						oldRange: range,
						newRange: null
					}
				}
			] );
		} );

		it( 'change marker\'s range', () => {
			differ.bufferMarkerChange( 'name', range, rangeB, true );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [
				{ name: 'name', range }
			] );

			expect( differ.getMarkersToAdd() ).to.deep.equal( [
				{ name: 'name', range: rangeB }
			] );

			expect( differ.getChangedMarkers() ).to.deep.equal( [
				{
					name: 'name',
					data: {
						oldRange: range,
						newRange: rangeB
					}
				}
			] );
		} );

		it( 'add marker not affecting data', () => {
			differ.bufferMarkerChange( 'name', range, rangeB, false );

			expect( differ.hasDataChanges() ).to.be.false;
		} );

		it( 'add marker affecting data', () => {
			differ.bufferMarkerChange( 'name', range, rangeB, true );

			expect( differ.hasDataChanges() ).to.be.true;
		} );

		it( 'add marker and remove it', () => {
			differ.bufferMarkerChange( 'name', null, range, true );
			differ.bufferMarkerChange( 'name', range, null, true );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [] );
			expect( differ.getMarkersToAdd() ).to.deep.equal( [] );
			expect( differ.getChangedMarkers() ).to.deep.equal( [] );

			expect( differ.hasDataChanges() ).to.be.false;
		} );

		it( 'add marker and change it', () => {
			differ.bufferMarkerChange( 'name', null, range, true );
			differ.bufferMarkerChange( 'name', range, rangeB, true );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [] );

			expect( differ.getMarkersToAdd() ).to.deep.equal( [
				{ name: 'name', range: rangeB }
			] );

			expect( differ.getChangedMarkers() ).to.deep.equal( [
				{
					name: 'name',
					data: {
						oldRange: null,
						newRange: rangeB
					}
				}
			] );
		} );

		it( 'change marker to not affecting data', () => {
			differ.bufferMarkerChange( 'name', range, rangeB, true );
			differ.bufferMarkerChange( 'name', range, rangeB, false );

			expect( differ.hasDataChanges() ).to.be.false;
		} );

		it( 'change marker and remove it', () => {
			differ.bufferMarkerChange( 'name', range, rangeB, true );
			differ.bufferMarkerChange( 'name', rangeB, null, true );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [
				{ name: 'name', range }
			] );

			expect( differ.getMarkersToAdd() ).to.deep.equal( [] );

			expect( differ.getChangedMarkers() ).to.deep.equal( [
				{
					name: 'name',
					data: {
						oldRange: range,
						newRange: null
					}
				}
			] );

			expect( differ.hasDataChanges() ).to.be.true;
		} );

		it( 'remove marker and add it at same range', () => {
			differ.bufferMarkerChange( 'name', range, null, true );
			differ.bufferMarkerChange( 'name', null, range, true );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [
				{ name: 'name', range }
			] );

			expect( differ.getMarkersToAdd() ).to.deep.equal( [
				{ name: 'name', range }
			] );

			expect( differ.getChangedMarkers() ).to.deep.equal( [
				{
					name: 'name',
					data: {
						oldRange: range,
						newRange: range
					}
				}
			] );
		} );

		it( 'change marker to the same range', () => {
			differ.bufferMarkerChange( 'name', range, range, true );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [
				{ name: 'name', range }
			] );

			expect( differ.getMarkersToAdd() ).to.deep.equal( [
				{ name: 'name', range }
			] );

			expect( differ.getChangedMarkers() ).to.deep.equal( [
				{
					name: 'name',
					data: {
						oldRange: range,
						newRange: range
					}
				}
			] );
		} );
	} );

	describe( 'other cases', () => {
		// #1309.
		it( 'multiple inserts and removes in one element', () => {
			model.change( () => {
				insert( new Text( 'x' ), new Position( root, [ 0, 2 ] ) );
				insert( new Text( 'x' ), new Position( root, [ 0, 3 ] ) );
				move( new Position( root, [ 0, 2 ] ), 1, new Position( root, [ 1, 0 ] ) );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 1, position: new Position( root, [ 0, 2 ] ) },
					{ type: 'insert', name: '$text', length: 1, position: new Position( root, [ 1, 0 ] ) }
				] );
			} );
		} );

		// ckeditor5#733.
		it( 'proper filtering of changes in removed elements', () => {
			// Before fix there was a buggy scenario described in ckeditor5#733.
			// There was this structure: `<paragraph>foo[</paragraph><image /><blockQuote><p>te]xt</p></blockQuote>`
			// On delete of above selection `image` and `paragraph` inside `blockQuote` are removed (it gets merged).
			// However, since `image` was removed first, when checking if `paragraph` is in a removed element,
			// it appeared that `blockQuote` looks like it is removed because it had the same path as the already removed `<image>`.
			// In a result, removing `paragraph` was discarded.
			// The mistake was that the checking for removing was done at incorrect moment.
			root._removeChildren( 0, root.childCount );
			root._appendChild( [
				new Element( 'paragraph', null, new Text( 'foo' ) ),
				new Element( 'image' ),
				new Element( 'blockQuote', null, [
					new Element( 'paragraph', null, new Text( 'text' ) )
				] )
			] );

			model.change( () => {
				// Remove `"te"`.
				remove( new Position( root, [ 2, 0, 0 ] ), 2 );
				// Remove `image` before `blockQuote`.
				remove( new Position( root, [ 1 ] ), 1 );
				// Move `"xt"` to first `paragraph` (merging).
				move( new Position( root, [ 1, 0, 0 ] ), 2, new Position( root, [ 0, 3 ] ) );
				// Remove `paragraph` inside `blockQuote`.
				remove( new Position( root, [ 1, 0 ] ), 1 );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 2, position: new Position( root, [ 0, 3 ] ) },
					{ type: 'remove', name: 'image', length: 1, position: new Position( root, [ 1 ] ) },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1, 0 ] ) }
				] );
			} );
		} );

		// In this scenario we create a new element, then remove something from before it to mess up with offsets,
		// finally we insert some content into a new element. Since we are inserting into a new element, the
		// inserted children should not be shown on changes list.
		it( 'proper filtering of changes in inserted elements', () => {
			root._removeChildren( 0, root.childCount );
			root._appendChild( new Element( 'image' ) );

			const blockQuote = new Element( 'blockQuote', null, new Element( 'paragraph' ) );

			model.change( () => {
				// Insert `blockQuote` with `paragraph` after `image`.
				insert( blockQuote, new Position( root, [ 1 ] ) );
				// Remove `image` from before `blockQuote`.
				remove( new Position( root, [ 0 ] ), 1 );
				// Insert text into `paragraph` in `blockQuote`.
				insert( new Text( 'foo' ), new Position( root, [ 0, 0, 0 ] ) );

				expectChanges( [
					{ type: 'remove', name: 'image', length: 1, position: new Position( root, [ 0 ] ) },
					{ type: 'insert', name: 'blockQuote', length: 1, position: new Position( root, [ 0 ] ) }
				] );
			} );
		} );

		// In this scenario we create a new element, then move another element that was before the new element into
		// the new element. This way we mess up with offsets and insert content into a new element in one operation.
		// Since we are inserting into a new element, the insertion of moved element should not be shown on changes list.
		it( 'proper filtering of changes in inserted elements #2', () => {
			root._removeChildren( 0, root.childCount );
			root._appendChild( new Element( 'image' ) );

			model.change( () => {
				// Insert `div` after `image`.
				insert( new Element( 'div' ), new Position( root, [ 1 ] ) );
				// Move `image` to the new `div`.
				move( new Position( root, [ 0 ] ), 1, new Position( root, [ 1, 0 ] ) );

				expectChanges( [
					{ type: 'remove', name: 'image', length: 1, position: new Position( root, [ 0 ] ) },
					{ type: 'insert', name: 'div', length: 1, position: new Position( root, [ 0 ] ) }
				] );
			} );
		} );

		// #1392.
		it( 'remove is correctly transformed by multiple affecting changes', () => {
			root._appendChild( new Element( 'paragraph', null, new Text( 'xyz' ) ) );

			model.change( writer => {
				rename( root.getChild( 1 ), 'heading' );
				rename( root.getChild( 2 ), 'heading' );
				remove( writer.createPositionAt( root, 0 ), 3 );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ) },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ) },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ) }
				] );
			} );
		} );
	} );

	describe( 'refreshItem()', () => {
		it( 'should mark given element to be removed and added again', () => {
			const p = root.getChild( 0 );

			differ.refreshItem( p );

			expectChanges( [
				{ type: 'remove', name: 'paragraph', length: 1, position: model.createPositionBefore( p ) },
				{ type: 'insert', name: 'paragraph', length: 1, position: model.createPositionBefore( p ) }
			], true );
		} );

		it( 'should mark given text proxy to be removed and added again', () => {
			const p = root.getChild( 0 );
			const range = model.createRangeIn( p );
			const textProxy = [ ...range.getItems() ][ 0 ];

			differ.refreshItem( textProxy );

			expectChanges( [
				{ type: 'remove', name: '$text', length: 3, position: model.createPositionAt( p, 0 ) },
				{ type: 'insert', name: '$text', length: 3, position: model.createPositionAt( p, 0 ) }
			], true );
		} );

		it( 'inside a new element', () => {
			// Since the refreshed element is inside a new element, it should not be listed on changes list.
			model.change( () => {
				insert( new Element( 'blockQuote', null, new Element( 'paragraph' ) ), new Position( root, [ 2 ] ) );

				differ.refreshItem( root.getChild( 2 ).getChild( 0 ) );

				expectChanges( [
					{ type: 'insert', name: 'blockQuote', length: 1, position: new Position( root, [ 2 ] ) }
				] );
			} );
		} );

		it( 'markers refreshing', () => {
			model.change( () => {
				// Refreshed element contains marker.
				model.markers._set( 'markerA', new Range( new Position( root, [ 1, 1 ] ), new Position( root, [ 1, 2 ] ) ) );

				// Marker contains refreshed element.
				model.markers._set( 'markerB', new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ) );

				// Intersecting.
				model.markers._set( 'markerC', new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 1, 2 ] ) ) );

				// Not intersecting.
				model.markers._set( 'markerD', new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 1 ] ) ) );
			} );

			const markersToRefresh = [ 'markerA', 'markerB', 'markerC' ];

			differ.refreshItem( root.getChild( 1 ) );

			expectChanges( [
				{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) },
				{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) }
			] );

			const markersToRemove = differ.getMarkersToRemove().map( entry => entry.name );
			const markersToAdd = differ.getMarkersToAdd().map( entry => entry.name );

			expect( markersToRefresh ).to.deep.equal( markersToRemove );
			expect( markersToRefresh ).to.deep.equal( markersToAdd );
		} );
	} );

	describe( 'getChanges()', () => {
		let position, p1, rangeAttrChange, range;

		beforeEach( () => {
			position = new Position( root, [ 0, 1 ] );
			p1 = root.getChild( 0 );

			range = new Range( Position._createAt( p1, 2 ), Position._createAt( p1, 4 ) );
			rangeAttrChange = new Range( Position._createAt( p1, 3 ), Position._createAt( p1, 4 ) );
		} );

		it( 'should return changes in graveyard if a flag was set up', () => {
			const removePosition = new Position( root, [ 1 ] );

			model.change( () => {
				insert( new Text( 'xx' ), position );
				attribute( range, 'key', null, 'foo' );

				remove( removePosition, 1 );

				expectChanges( [
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( doc.graveyard, [ 0 ] ) },
					{ type: 'insert', name: '$text', length: 2, position },
					{
						type: 'attribute',
						range: rangeAttrChange,
						attributeKey: 'key',
						attributeOldValue: null,
						attributeNewValue: 'foo'
					},
					{ type: 'remove', name: 'paragraph', position: removePosition, length: 1 }
				], true );
			} );
		} );

		// Below tests test caching.
		it( 'should return same change set if was called twice in a row', () => {
			model.change( () => {
				insert( new Text( 'xx' ), position );
				attribute( range, 'key', null, 'foo' );

				const changesA = differ.getChanges();
				const changesB = differ.getChanges();

				expect( changesA ).to.deep.equal( changesB );
			} );
		} );

		it( 'should return same change set if was called twice in a row - graveyard changes', () => {
			model.change( () => {
				insert( new Text( 'xx' ), position );
				attribute( range, 'key', null, 'foo' );

				const removePosition = new Position( root, [ 1 ] );
				remove( removePosition, 1 );

				const changesA = differ.getChanges( { includeChangesInGraveyard: true } );
				const changesB = differ.getChanges( { includeChangesInGraveyard: true } );

				expect( changesA ).to.deep.equal( changesB );
			} );
		} );

		it( 'should return correct changes if change happened between getChanges() calls', () => {
			model.change( () => {
				insert( new Text( 'xx' ), position );
				attribute( range, 'key', null, 'foo' );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 2, position },
					{
						type: 'attribute',
						range: rangeAttrChange,
						attributeKey: 'key',
						attributeOldValue: null,
						attributeNewValue: 'foo'
					}
				] );

				const removePosition = new Position( root, [ 1 ] );
				remove( removePosition, 1 );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 2, position },
					{
						type: 'attribute',
						range: rangeAttrChange,
						attributeKey: 'key',
						attributeOldValue: null,
						attributeNewValue: 'foo'
					},
					{ type: 'remove', name: 'paragraph', position: removePosition, length: 1 }
				] );
			} );
		} );

		it( 'should return correct changes if reset happened between getChanges() calls', () => {
			model.change( () => {
				insert( new Text( 'xx' ), position );
				attribute( range, 'key', null, 'foo' );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 2, position },
					{
						type: 'attribute',
						range: rangeAttrChange,
						attributeKey: 'key',
						attributeOldValue: null,
						attributeNewValue: 'foo'
					}
				] );

				differ.reset();

				const removePosition = new Position( root, [ 1 ] );
				remove( removePosition, 1 );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', position: removePosition, length: 1 }
				] );
			} );
		} );
	} );

	function insert( item, position ) {
		const operation = new InsertOperation( position, item, doc.version );

		model.applyOperation( operation );
	}

	function split( position ) {
		const howMany = position.parent.maxOffset - position.offset;
		const operation = new SplitOperation( position, howMany, null, doc.version );

		model.applyOperation( operation );
	}

	function merge( source, target ) {
		const howMany = source.parent.maxOffset;
		const operation = new MergeOperation( source, howMany, target, new Position( doc.graveyard, [ 0 ] ), doc.version );

		model.applyOperation( operation );
	}

	function remove( sourcePosition, howMany ) {
		const targetPosition = Position._createAt( doc.graveyard, doc.graveyard.maxOffset );
		const operation = new MoveOperation( sourcePosition, howMany, targetPosition, doc.version );

		model.applyOperation( operation );
	}

	function move( sourcePosition, howMany, targetPosition ) {
		const operation = new MoveOperation( sourcePosition, howMany, targetPosition, doc.version );

		model.applyOperation( operation );
	}

	function rename( element, newName ) {
		const operation = new RenameOperation( Position._createBefore( element ), element.name, newName, doc.version );

		model.applyOperation( operation );
	}

	function attribute( range, key, oldValue, newValue ) {
		const operation = new AttributeOperation( range, key, oldValue, newValue, doc.version );

		model.applyOperation( operation );
	}

	function expectChanges( expected, includeChangesInGraveyard = false ) {
		const changes = differ.getChanges( { includeChangesInGraveyard } );

		expect( changes.length ).to.equal( expected.length );

		for ( let i = 0; i < expected.length; i++ ) {
			for ( const key in expected[ i ] ) {
				if ( Object.prototype.hasOwnProperty.call( expected[ i ], key ) ) {
					if ( key == 'position' || key == 'range' ) {
						expect( changes[ i ][ key ].isEqual( expected[ i ][ key ] ), `item ${ i }, key "${ key }"` ).to.be.true;
					} else {
						expect( changes[ i ][ key ], `item ${ i }, key "${ key }"` ).to.equal( expected[ i ][ key ] );
					}
				}
			}
		}
	}
} );
