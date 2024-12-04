/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../src/model/model.js';
import Element from '../../src/model/element.js';
import Text from '../../src/model/text.js';
import Position from '../../src/model/position.js';
import Range from '../../src/model/range.js';

import InsertOperation from '../../src/model/operation/insertoperation.js';
import MoveOperation from '../../src/model/operation/moveoperation.js';
import RenameOperation from '../../src/model/operation/renameoperation.js';
import AttributeOperation from '../../src/model/operation/attributeoperation.js';
import SplitOperation from '../../src/model/operation/splitoperation.js';
import MergeOperation from '../../src/model/operation/mergeoperation.js';
import RootOperation from '../../src/model/operation/rootoperation.js';

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
		it( 'an element', () => {
			const position = new Position( root, [ 1 ] );
			const element = new Element( 'imageBlock' );

			model.change( () => {
				insert( element, position );

				expectChanges( [
					{ type: 'insert', name: 'imageBlock', length: 1, position, action: 'insert' }
				] );
			} );
		} );

		it( 'a non-empty element with attributes', () => {
			const position = new Position( root, [ 1 ] );
			const element = new Element( 'imageBlock', { src: 'foo.jpg' }, new Element( 'caption', null, new Text( 'bar' ) ) );

			model.change( () => {
				insert( element, position );

				const attributes = new Map( [ [ 'src', 'foo.jpg' ] ] );

				expectChanges( [
					{ type: 'insert', name: 'imageBlock', length: 1, position, attributes, action: 'insert' }
				] );
			} );
		} );

		it( 'multiple elements', () => {
			const position = new Position( root, [ 1 ] );
			const image = new Element( 'imageBlock' );
			const paragraph = new Element( 'paragraph' );

			model.change( () => {
				insert( [ image, paragraph ], position );

				expectChanges( [
					{ type: 'insert', name: 'imageBlock', length: 1, position, action: 'insert' },
					{ type: 'insert', name: 'paragraph', length: 1, position: position.getShiftedBy( 1 ), action: 'insert' }
				] );
			} );
		} );

		it( 'a character', () => {
			const position = new Position( root, [ 0, 2 ] );

			model.change( () => {
				insert( new Text( 'x' ), position );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 1, position, action: 'insert' }
				] );
			} );
		} );

		it( 'multiple characters', () => {
			const position = new Position( root, [ 0, 2 ] );

			model.change( () => {
				insert( new Text( 'xyz' ), position );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 3, position, action: 'insert' }
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
					{ type: 'insert', name: '$text', length: 5, position, action: 'insert' }
				] );
			} );
		} );

		it( 'multiple non-consecutive characters in multiple operations', () => {
			const position = new Position( root, [ 0, 0 ] );

			model.change( () => {
				insert( new Text( 'xy' ), position );
				insert( new Text( 'z' ), position.getShiftedBy( 3 ) );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 2, position, action: 'insert' },
					{ type: 'insert', name: '$text', length: 1, position: position.getShiftedBy( 3 ), action: 'insert' }
				] );
			} );
		} );

		// Combined.
		it( 'node in a new element', () => {
			const image = new Element( 'imageBlock' );
			const position = new Position( root, [ 1 ] );

			model.change( () => {
				insert( image, position );

				const caption = new Element( 'caption' );
				insert( caption, Position._createAt( image, 0 ) );

				insert( new Text( 'foo' ), Position._createAt( caption, 0 ) );

				expectChanges( [
					{ type: 'insert', name: 'imageBlock', length: 1, position, action: 'insert' }
				] );
			} );
		} );

		it( 'node in a renamed element', () => {
			const text = new Text( 'xyz', { bold: true } );
			const position = new Position( root, [ 0, 3 ] );
			const element = root.getChild( 0 );

			model.change( () => {
				insert( text, position );
				rename( element, 'listItem' );

				// Note that since renamed element is removed and then re-inserted, there is no diff for text inserted inside it.
				expectChanges( [
					{
						type: 'remove',
						action: 'rename',
						name: 'paragraph',
						length: 1,
						position: new Position( root, [ 0 ] ),
						attributes: new Map()
					},
					{
						type: 'insert',
						action: 'rename',
						name: 'listItem',
						length: 1,
						position: new Position( root, [ 0 ] ),
						before: {
							name: 'paragraph',
							attributes: new Map()
						}
					}
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
					{ type: 'insert', name: '$text', length: 3, position, attributes: new Map( [ [ 'bold', true ] ] ), action: 'insert' }
				] );
			} );
		} );

		it( 'nodes between other inserted nodes', () => {
			model.change( () => {
				insert( new Text( 'xx' ), new Position( root, [ 0, 1 ] ) );
				insert( new Text( 'yy' ), new Position( root, [ 0, 2 ] ) );

				expectChanges( [
					{ type: 'insert', position: new Position( root, [ 0, 1 ] ), length: 4, name: '$text', action: 'insert' }
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
					{ type: 'insert', name: '$text', length: 2, position, action: 'insert' },
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

		it( 'inside non-loaded root - not buffered', () => {
			root._isLoaded = false;

			const position = new Position( root, [ 0 ] );

			model.change( () => {
				insert( new Element( 'imageBlock' ), position );

				expectChanges( [] );
			} );
		} );
	} );

	describe( 'remove', () => {
		it( 'an element', () => {
			const position = new Position( root, [ 0 ] );

			model.change( () => {
				remove( position, 1 );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position, action: 'remove' }
				] );
			} );
		} );

		it( 'multiple elements', () => {
			const position = new Position( root, [ 0 ] );

			model.change( () => {
				remove( position, 2 );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position, action: 'remove' },
					{ type: 'remove', name: 'paragraph', length: 1, position, action: 'remove' }
				] );
			} );
		} );

		it( 'element with attributes', () => {
			const position = new Position( root, [ 0 ] );
			const range = new Range( Position._createAt( root, 0 ), Position._createAt( root, 1 ) );

			model.change( () => {
				attribute( range, 'align', null, 'center' );
			} );

			model.change( () => {
				remove( position, 1 );

				const attributes = new Map( [ [ 'align', 'center' ] ] );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position, attributes, action: 'remove' }
				] );
			} );
		} );

		it( 'a character', () => {
			const position = new Position( root, [ 0, 1 ] );

			model.change( () => {
				remove( position, 1 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 1, position, action: 'remove' }
				] );
			} );
		} );

		it( 'multiple characters', () => {
			const position = new Position( root, [ 0, 1 ] );

			model.change( () => {
				remove( position, 2 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 2, position, action: 'remove' }
				] );
			} );
		} );

		it( 'characters with attributes', () => {
			const position = new Position( root, [ 0, 0 ] );
			const range = new Range( Position._createAt( root.getChild( 0 ), 0 ), Position._createAt( root.getChild( 0 ), 2 ) );

			model.change( () => {
				attribute( range, 'bold', null, true );
			} );

			model.change( () => {
				remove( position, 2 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 2, position, attributes: new Map( [ [ 'bold', true ] ] ), action: 'remove' }
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
					{ type: 'remove', name: '$text', length: 3, position, action: 'remove' }
				] );
			} );
		} );

		it( 'multiple non-consecutive characters in multiple operations', () => {
			const position = new Position( root, [ 0, 0 ] );

			model.change( () => {
				remove( position, 1 );
				remove( position.getShiftedBy( 1 ), 1 );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 1, position, action: 'remove' },
					{ type: 'remove', name: '$text', length: 1, position: position.getShiftedBy( 1 ), action: 'remove' }
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
					{ type: 'remove', name: '$text', length: 1, position: removePosition, action: 'remove' },
					{ type: 'insert', name: '$text', length: 1, position: removePosition, action: 'insert' }
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
					{ type: 'remove', name: '$text', length: 1, position: removePosition, action: 'remove' },
					{ type: 'insert', name: '$text', length: 2, position: removePosition, action: 'insert' }
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
					{ type: 'insert', name: '$text', length: 1, position: insertPosition, action: 'insert' },
					{ type: 'remove', name: '$text', length: 1, position: removePosition, action: 'remove' }
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
					{ type: 'remove', name: '$text', length: 2, position: removePosition, action: 'remove' }
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
					{ type: 'remove', name: '$text', length: 1, position: removePositionB, action: 'remove' },
					{ type: 'remove', name: '$text', length: 1, position: new Position( root, [ 0, 1 ] ), action: 'remove' }
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
					{ type: 'remove', name: '$text', length: 3, position: removePositionB, action: 'remove' }
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
					{ type: 'remove', name: '$text', length: 1, position, action: 'remove' },
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
					{ type: 'remove', name: '$text', length: 2, position, action: 'remove' },
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
					{ type: 'remove', name: '$text', length: 1, position, action: 'remove' },
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
					{ type: 'remove', name: '$text', length: 2, position, action: 'remove' }
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
					{ type: 'remove', name: '$text', length: 1, position, action: 'remove' }
				] );
			} );
		} );

		it( 'from non-loaded root - not buffered', () => {
			root._isLoaded = false;

			const position = new Position( root, [ 0 ] );

			model.change( () => {
				remove( position, 1 );

				expectChanges( [] );
			} );
		} );

		it( 'action is remove if the renamed element was removed', () => {
			const position = new Position( root, [ 0 ] );
			const element = root.getChild( 0 );

			rename( element, 'listItem' );
			remove( position, 1 );

			expectChanges( [
				{
					type: 'remove',
					action: 'remove',
					name: 'paragraph',
					position: new Position( root, [ 0 ] ),
					attributes: new Map( [] ),
					length: 1
				}
			] );
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
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ), action: 'remove' },
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ), action: 'insert' }
				] );
			} );
		} );

		it( 'an element to the same parent - target position is before source position', () => {
			const sourcePosition = new Position( root, [ 1 ] );
			const targetPosition = new Position( root, [ 0 ] );

			model.change( () => {
				move( sourcePosition, 1, targetPosition );

				expectChanges( [
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ), action: 'insert' },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 2 ] ), action: 'remove' }
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
					{ type: 'remove', name: '$text', length: 2, position: sourcePosition, action: 'remove' },
					{ type: 'insert', name: '$text', length: 2, position: targetPosition, action: 'insert' }
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
					{ type: 'insert', name: 'listItem', length: 1, position: targetPosition, action: 'insert' }
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

		it( 'inside non-loaded root - not buffered', () => {
			root._isLoaded = false;

			const sourcePosition = new Position( root, [ 0 ] );
			const targetPosition = new Position( root, [ 2 ] );

			model.change( () => {
				move( sourcePosition, 1, targetPosition );

				expectChanges( [] );
			} );
		} );

		it( 'into non-loaded root - partially not buffered', () => {
			const newRoot = model.document.createRoot( '$root', 'new' );
			newRoot._isLoaded = false;

			const sourcePosition = new Position( root, [ 0 ] );
			const targetPosition = new Position( newRoot, [ 0 ] );

			model.change( () => {
				move( sourcePosition, 1, targetPosition );

				expectChanges( [
					// Only buffer "remove" from the loaded root.
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ), action: 'remove' }
				] );
			} );
		} );

		it( 'from non-loaded root - partially not buffered', () => {
			const newRoot = model.document.createRoot( '$root', 'new' );

			root._isLoaded = false;

			const sourcePosition = new Position( root, [ 0 ] );
			const targetPosition = new Position( newRoot, [ 0 ] );

			model.change( () => {
				move( sourcePosition, 1, targetPosition );

				expectChanges( [
					// Only buffer "insert" to the loaded root.
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( newRoot, [ 0 ] ), action: 'insert' }
				] );
			} );
		} );
	} );

	describe( 'rename', () => {
		it( 'an element', () => {
			model.change( () => {
				const element = root.getChild( 1 );
				const before = {
					name: 'paragraph',
					attributes: new Map()
				};

				rename( element, 'listItem' );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ), action: 'rename' },
					{ type: 'insert', name: 'listItem', length: 1, position: new Position( root, [ 1 ] ), action: 'rename', before }
				] );
			} );
		} );

		it( 'element double rename', () => {
			model.change( () => {
				const element = root.getChild( 1 );
				const before = {
					name: 'paragraph',
					attributes: new Map()
				};

				rename( element, 'listItem' );
				rename( element, 'heading' );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ), action: 'rename' },
					{ type: 'insert', name: 'heading', length: 1, position: new Position( root, [ 1 ] ), action: 'rename', before }
				] );
			} );
		} );

		it( 'inside a new element', () => {
			// Since the rename is inside a new element, it should not be listed on changes list.
			model.change( () => {
				insert( new Element( 'blockQuote', null, new Element( 'paragraph' ) ), new Position( root, [ 2 ] ) );
				rename( root.getChild( 2 ).getChild( 0 ), 'listItem' );

				expectChanges( [
					{ type: 'insert', name: 'blockQuote', length: 1, position: new Position( root, [ 2 ] ), action: 'insert' }
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

				const before = { name: 'paragraph', attributes: new Map() };

				expectChanges( [
					{ type: 'remove', action: 'rename', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) },
					{ type: 'insert', action: 'rename', name: 'listItem', length: 1, position: new Position( root, [ 1 ] ), before }
				] );

				const markersToRemove = differ.getMarkersToRemove().map( entry => entry.name );
				const markersToAdd = differ.getMarkersToAdd().map( entry => entry.name );

				expect( markersToRefresh ).to.deep.equal( markersToRemove );
				expect( markersToRefresh ).to.deep.equal( markersToAdd );
			} );
		} );

		it( 'inside a non-loaded root - not buffered', () => {
			root._isLoaded = false;

			model.change( () => {
				rename( root.getChild( 1 ), 'listItem' );

				expectChanges( [] );
			} );
		} );

		it( 'data of the renamed node is available for insert diff item', () => {
			const element = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'test', 123, element );
			} );

			model.change( writer => {
				rename( element, 'listItem' );
				writer.setAttribute( 'test', 777, element );

				expectChanges( [
					{
						type: 'remove',
						action: 'rename',
						name: 'paragraph',
						length: 1,
						position: new Position( root, [ 0 ] ),
						attributes: new Map( [ [ 'test', 123 ] ] )
					},
					{
						type: 'insert',
						action: 'rename',
						name: 'listItem',
						length: 1,
						position: new Position( root, [ 0 ] ),
						attributes: new Map( [ [ 'test', 777 ] ] ),
						before: {
							name: 'paragraph',
							attributes: new Map( [ [ 'test', 123 ] ] )
						}
					}
				] );
			} );
		} );

		it( 'inserted element is renamed', () => {
			const element = new Element( 'paragraph' );
			const position = new Position( root, [ 0 ] );

			model.change( () => {
				insert( element, position );
				rename( element, 'listItem' );

				expectChanges( [
					{
						type: 'insert',
						action: 'insert', // Stays as `insert`, as the end result is an insert, even though the element was renamed too.
						before: undefined, // Not available since this is not marked as `rename` but as `insert`.
						name: 'listItem', // This is the value after changes, so it is `'listItem'` after being renamed from `'paragraph'`.
						length: 1,
						position: new Position( root, [ 0 ] ),
						attributes: new Map( [] )
					}
				] );
			} );
		} );

		it( 'refreshed element is renamed', () => {
			model.change( () => {
				const element = root.getChild( 1 );
				differ._refreshItem( element );

				rename( element, 'listItem' );

				expectChanges( [
					{
						type: 'remove',
						action: 'rename',
						name: 'paragraph', // Data before any change happened.
						length: 1,
						position: new Position( root, [ 1 ] ),
						attributes: new Map( [] )
					},
					{
						type: 'insert',
						action: 'rename', // Becomes `rename` as the end result is a rename, not a refresh (rename overwrites refresh).
						before: { name: 'paragraph', attributes: new Map() }, // Data before any change happened.
						name: 'listItem', // This is the value after changes, so it is `'listItem'` after being renamed from `'paragraph'`.
						length: 1,
						position: new Position( root, [ 1 ] ),
						attributes: new Map( [] )
					}
				] );
			} );
		} );

		it( 'renamed element is refreshed', () => {
			// This is the same case as above but the changes are done in a reverse order.
			// The expected changes are the same as above.
			model.change( () => {
				const element = root.getChild( 1 );

				rename( element, 'listItem' );

				differ._refreshItem( element );

				expectChanges( [
					{
						type: 'remove',
						action: 'rename',
						name: 'paragraph', // Data before any change happened.
						length: 1,
						position: new Position( root, [ 1 ] ),
						attributes: new Map( [] )
					},
					{
						type: 'insert',
						action: 'rename', // Becomes `rename` as the end result is a rename, not a refresh (rename overwrites refresh).
						before: { name: 'paragraph', attributes: new Map() }, // Data before any change happened.
						name: 'listItem', // This is the value after changes, so it is `'listItem'` after being renamed from `'paragraph'`.
						length: 1,
						position: new Position( root, [ 1 ] ),
						attributes: new Map( [] )
					}
				] );
			} );
		} );

		it( 'renamed element is removed', () => {
			model.change( () => {
				const element = root.getChild( 1 );

				rename( element, 'listItem' );
				remove( new Position( root, [ 1 ] ), 1 );

				expectChanges( [
					{
						type: 'remove',
						action: 'remove', // Becomes `remove` as the end result is a remove, not a rename (remove overwrites rename).
						name: 'paragraph', // Data before any change happened (the element was a paragraph before renamed and removed).
						length: 1,
						position: new Position( root, [ 1 ] ),
						attributes: new Map( [] )
					}
				] );
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
					{ type: 'insert', name: '$text', length: 2, position, action: 'insert' }
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
					{ type: 'insert', name: '$text', length: 3, position, action: 'insert' }
				] );
			} );
		} );

		it( 'on a node inside an inserted element', () => {
			const position = new Position( root, [ 0 ] );

			model.change( () => {
				const p = new Element( 'paragraph', null, new Text( 'xxx' ) );
				insert( p, position );

				const range = new Range( Position._createAt( p, 1 ), Position._createAt( p, 2 ) );

				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				expectChanges( [
					{ type: 'insert', name: 'paragraph', length: 1, position, action: 'insert' }
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
					{ type: 'insert', name: '$text', length: 2, position, action: 'insert' },
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
					{ type: 'insert', name: '$text', length: 2, position, action: 'insert' },
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
						name: '$text',
						action: 'insert'
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
						name: '$text',
						action: 'remove'
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

		it( 'inside a non-loaded root - not buffered', () => {
			root._isLoaded = false;

			const range = new Range( Position._createAt( root, 0 ), Position._createAt( root, 1 ) );

			model.change( () => {
				attribute( range, attributeKey, attributeOldValue, attributeNewValue );

				expectChanges( [] );
			} );
		} );

		// See: https://github.com/ckeditor/ckeditor5/issues/16819
		it( 'on element with very long text should have batched instructions together during generating diff from changes', () => {
			const MAX_PUSH_CALL_STACK_ARGS = 1500;

			const p = root.getChild( 0 );
			const veryLongString = 'a'.repeat( 300 );

			model.change( () => {
				insert( veryLongString, Position._createAt( p, 0 ) );
			} );

			const pushSpy = sinon.spy( Array.prototype, 'push' );

			model.change( writer => {
				writer.setAttribute( attributeKey, true, writer.createRangeIn( p ) );
			} );

			// Let's check if appended instructions has been batched together in single `.push()` call.
			const instructionsDiff = pushSpy.args.find( args => (
				args.length >= 300 &&
					args.length < MAX_PUSH_CALL_STACK_ARGS &&
					args.every( ch => ch === 'a' )
			) );

			expect( instructionsDiff ).not.to.be.undefined;
			pushSpy.restore();
		} );

		// See: https://github.com/ckeditor/ckeditor5/issues/16819
		it( 'on element with very long text should not have batched instructions together during generating diff from changes ' +
				'that are larger than max push call stack args count', () => {
			const MAX_PUSH_CALL_STACK_ARGS = 1500;

			const p = root.getChild( 0 );
			const veryLongString = 'a'.repeat( MAX_PUSH_CALL_STACK_ARGS + 10 );

			model.change( () => {
				insert( veryLongString, Position._createAt( p, 0 ) );
			} );

			const pushSpy = sinon.spy( Array.prototype, 'push' );

			model.change( writer => {
				writer.setAttribute( attributeKey, true, writer.createRangeIn( p ) );
			} );

			// Let's check if appended instructions has been NOT batched together in single `.push()` call.
			const instructionsDiff = pushSpy.args.find( args => (
				args.length > MAX_PUSH_CALL_STACK_ARGS &&
				args.every( ch => ch === 'a' )
			) );

			expect( instructionsDiff ).to.be.undefined;
			pushSpy.restore();
		} );
	} );

	describe( 'split', () => {
		it( 'split an element', () => {
			const position = new Position( root, [ 0, 2 ] );

			model.change( () => {
				split( position );

				expectChanges( [
					{ type: 'remove', name: '$text', length: 1, position, action: 'remove' },
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ), action: 'insert' }
				] );
			} );
		} );

		it( 'split a new element', () => {
			model.change( () => {
				const element = new Element( 'paragraph', null, new Text( 'Ab' ) );

				insert( element, new Position( root, [ 0 ] ) );
				split( new Position( root, [ 0, 1 ] ) );

				expectChanges( [
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ), action: 'insert' },
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ), action: 'insert' }
				] );
			} );
		} );

		it( 'split an element inside a new element', () => {
			model.change( () => {
				const blockQuote = new Element( 'blockQuote', null, new Element( 'paragraph', null, new Text( 'Ab' ) ) );

				insert( blockQuote, new Position( root, [ 0 ] ) );
				split( new Position( root, [ 0, 0, 1 ] ) );

				expectChanges( [
					{ type: 'insert', name: 'blockQuote', length: 1, position: new Position( root, [ 0 ] ), action: 'insert' }
				] );
			} );
		} );

		it( 'split an element with renamed element after split position', () => {
			const elA = new Element( 'paragraph', null, new Text( 'A' ) );
			const elB = new Element( 'paragraph', null, new Text( 'B' ) );

			model.change( () => {
				insert( new Element( 'blockQuote', null, [ elA, elB ] ), new Position( root, [ 0 ] ) );
			} );

			model.change( () => {
				rename( elB, 'listItem' );
				split( new Position( root, [ 0, 1 ] ) );

				expectChanges( [
					{
						type: 'remove',
						name: 'paragraph', // Element name before any changes.
						length: 1,
						position: new Position( root, [ 0, 1 ] ),
						action: 'remove' // The end result is the `paragraph` was removed from the blockquote (split overwrites rename).
					},
					{ type: 'insert', name: 'blockQuote', length: 1, position: new Position( root, [ 1 ] ), action: 'insert' }
				] );
			} );
		} );

		it( 'should correctly mark a change in graveyard', () => {
			model.change( () => {
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 3 ] ) );
			} );

			model.change( () => {
				const position = new Position( root, [ 0, 3 ] );
				const insertionPosition = SplitOperation.getInsertionPosition( position );

				const gyPosition = new Position( doc.graveyard, [ 0 ] );
				const operation = new SplitOperation( position, 3, insertionPosition, gyPosition, doc.version );

				model.applyOperation( operation );

				expectChanges( [
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( doc.graveyard, [ 0 ] ), action: 'remove' },
					{ type: 'remove', name: '$text', length: 3, position: new Position( root, [ 0, 3 ] ), action: 'remove' },
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ), action: 'insert' }
				], true );
			} );
		} );

		it( 'inside a non-loaded root - not buffered', () => {
			root._isLoaded = false;

			const position = new Position( root, [ 0, 2 ] );

			model.change( () => {
				split( position );

				expectChanges( [] );
			} );
		} );
	} );

	describe( 'merge', () => {
		it( 'merge two elements', () => {
			model.change( () => {
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 3 ] ) );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 3, position: new Position( root, [ 0, 3 ] ), action: 'insert' },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ), action: 'remove' }
				] );
			} );
		} );

		it( 'merge a new element', () => {
			model.change( () => {
				insert( new Element( 'paragraph', null, new Text( 'Ab' ) ), new Position( root, [ 1 ] ) );
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 3 ] ) );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 2, position: new Position( root, [ 0, 3 ] ), action: 'insert' }
				] );
			} );
		} );

		it( 'merge into a new element', () => {
			model.change( () => {
				const newP = new Element( 'paragraph', null, new Text( 'Ab' ) );

				insert( newP, new Position( root, [ 0 ] ) );
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 2 ] ) );

				expectChanges( [
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ), action: 'insert' },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ), action: 'remove' }
				] );
			} );
		} );

		it( 'merge elements inside a new element', () => {
			model.change( () => {
				const blockQuote = new Element( 'blockQuote', null, [
					new Element( 'paragraph', null, new Text( 'Ab' ) ),
					new Element( 'paragraph', null, new Text( 'Xyz' ) )
				] );

				insert( blockQuote, new Position( root, [ 0 ] ) );

				merge( new Position( root, [ 0, 1, 0 ] ), new Position( root, [ 0, 0, 2 ] ) );

				expectChanges( [
					{ type: 'insert', name: 'blockQuote', length: 1, position: new Position( root, [ 0 ] ), action: 'insert' }
				] );
			} );
		} );

		it( 'merge element with renamed item inside', () => {
			const elA = new Element( 'paragraph', null, new Text( 'A' ) );
			const elB = new Element( 'paragraph', null, new Text( 'B' ) );

			model.change( () => {
				insert( new Element( 'blockQuote', null, [ elA ] ), new Position( root, [ 0 ] ) );
				insert( new Element( 'blockQuote', null, [ elB ] ), new Position( root, [ 1 ] ) );
			} );

			// Model is:
			// <blockQuote><paragraph>A</paragraph></blockQuote><blockQuote><paragraph>B</paragraph></blockQuote>
			//
			// We rename second paragraph to `listItem` and merge `blockQuote`s.
			//
			model.change( () => {
				rename( elB, 'listItem' );
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 1 ] ) );

				expectChanges( [
					{
						type: 'insert',
						name: 'listItem',
						length: 1,
						position: new Position( root, [ 0, 1 ] ),
						action: 'insert', // The end result is a new `listItem` inserted to the first blockquote (merge overwrites rename).
						before: undefined // Since this is marked as action `'insert'`, `before` is not available.
					},
					{ type: 'remove', name: 'blockQuote', length: 1, position: new Position( root, [ 1 ] ), action: 'remove' }
				] );
			} );
		} );

		it( 'merge element with refreshed item inside', () => {
			// This is the same case as above but refresh is used instead of rename.
			const elA = new Element( 'paragraph', null, new Text( 'A' ) );
			const elB = new Element( 'paragraph', null, new Text( 'B' ) );

			model.change( () => {
				insert( new Element( 'blockQuote', null, [ elA ] ), new Position( root, [ 0 ] ) );
				insert( new Element( 'blockQuote', null, [ elB ] ), new Position( root, [ 1 ] ) );
			} );

			// Model is:
			// <blockQuote><paragraph>A</paragraph></blockQuote><blockQuote><paragraph>B</paragraph></blockQuote>
			//
			// We rename second paragraph to `listItem` and merge `blockQuote`s.
			//
			model.change( () => {
				differ._refreshItem( elB );
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 1 ] ) );

				expectChanges( [
					{
						type: 'insert',
						name: 'paragraph',
						length: 1,
						position: new Position( root, [ 0, 1 ] ),
						action: 'insert', // The end result is a new `listItem` inserted to the first blockquote (merge overwrites refresh).
						before: undefined // Since this is marked as action `'insert'`, `before` is not available.
					},
					{ type: 'remove', name: 'blockQuote', length: 1, position: new Position( root, [ 1 ] ), action: 'remove' }
				] );
			} );
		} );

		it( 'should correctly mark a change in graveyard', () => {
			model.change( () => {
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 3 ] ) );

				expectChanges( [
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( doc.graveyard, [ 0 ] ), action: 'insert' },
					{ type: 'insert', name: '$text', length: 3, position: new Position( root, [ 0, 3 ] ), action: 'insert' },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ), action: 'remove' }
				], true );
			} );
		} );

		it( 'inside a non-loaded root - not buffered', () => {
			root._isLoaded = false;

			model.change( () => {
				merge( new Position( root, [ 1, 0 ] ), new Position( root, [ 0, 3 ] ) );

				expectChanges( [] );
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
			differ.bufferMarkerChange( 'name', { range: null, affectsData: true }, { range, affectsData: true } );

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

		it( 'add marker not affecting data', () => {
			differ.bufferMarkerChange( 'name', { range: null, affectsData: false }, { range, affectsData: false } );

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
			differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range: null, affectsData: true } );

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
			differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range: rangeB, affectsData: true } );

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

		it( 'add marker and remove it', () => {
			differ.bufferMarkerChange( 'name', { range: null, affectsData: true }, { range, affectsData: true } );
			differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range: null, affectsData: true } );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [] );
			expect( differ.getMarkersToAdd() ).to.deep.equal( [] );
			expect( differ.getChangedMarkers() ).to.deep.equal( [] );
		} );

		it( 'add marker and change range', () => {
			differ.bufferMarkerChange( 'name', { range: null, affectsData: true }, { range, affectsData: true } );
			differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range: rangeB, affectsData: true } );

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

		it( 'add marker and change affectsData', () => {
			differ.bufferMarkerChange( 'name', { range: null, affectsData: false }, { range, affectsData: false } );
			differ.bufferMarkerChange( 'name', { range, affectsData: false }, { range, affectsData: true } );

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

		describe( 'hasDataChanges()', () => {
			it( 'should return `true` when the range changes and the marker affects data', () => {
				differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range: rangeB, affectsData: true } );

				expect( differ.hasDataChanges() ).to.be.true;
			} );

			it( 'should return `false` when the range does not change', () => {
				differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range, affectsData: true } );

				expect( differ.hasDataChanges() ).to.be.false;
			} );

			it( 'should return `false` when multiple changes result in not changed range', () => {
				differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range: rangeB, affectsData: true } );
				differ.bufferMarkerChange( 'name', { range: rangeB, affectsData: true }, { range, affectsData: true } );

				expect( differ.hasDataChanges() ).to.be.false;
			} );

			it( 'should return `true` when marker stops affecting data', () => {
				differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range, affectsData: false } );

				expect( differ.hasDataChanges() ).to.be.true;
			} );

			it( 'should return `true` when marker starts affecting data', () => {
				differ.bufferMarkerChange( 'name', { range, affectsData: false }, { range, affectsData: true } );

				expect( differ.hasDataChanges() ).to.be.true;
			} );

			it( 'should return `false` when multiple marker changes do not change affecting data (which is false)', () => {
				differ.bufferMarkerChange( 'name', { range, affectsData: false }, { range: rangeB, affectsData: true } );
				differ.bufferMarkerChange( 'name', { range: rangeB, affectsData: true }, { range: rangeB, affectsData: false } );

				expect( differ.hasDataChanges() ).to.be.false;
			} );

			it( 'should return `true` if at least one marker changed', () => {
				differ.bufferMarkerChange( 'nameA', { range, affectsData: true }, { range, affectsData: true } );
				differ.bufferMarkerChange( 'nameB', { range, affectsData: true }, { range: rangeB, affectsData: true } );
				differ.bufferMarkerChange( 'nameC', { range, affectsData: true }, { range, affectsData: true } );

				expect( differ.hasDataChanges() ).to.be.true;
			} );
		} );

		it( 'change marker and remove it', () => {
			differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range: rangeB, affectsData: true } );
			differ.bufferMarkerChange( 'name', { range: rangeB, affectsData: true }, { range: null, affectsData: true } );

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
			differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range: null, affectsData: true } );
			differ.bufferMarkerChange( 'name', { range: null, affectsData: true }, { range, affectsData: true } );

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
			differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range, affectsData: true } );

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

		it( 'add marker inside a non-loaded root - not buffered', () => {
			root._isLoaded = false;

			differ.bufferMarkerChange( 'name', { range: null, affectsData: true }, { range, affectsData: true } );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [] );
			expect( differ.getMarkersToAdd() ).to.deep.equal( [] );
			expect( differ.getChangedMarkers() ).to.deep.equal( [] );
		} );

		it( 'remove marker inside a non-loaded root - not buffered', () => {
			root._isLoaded = false;

			differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range: null, affectsData: true } );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [] );
			expect( differ.getMarkersToAdd() ).to.deep.equal( [] );
			expect( differ.getChangedMarkers() ).to.deep.equal( [] );
		} );

		it( 'move marker from a loaded to a non-loaded root - partially not buffered', () => {
			const newRoot = model.document.createRoot( '$root', 'new' );
			newRoot._isLoaded = false;

			const newRange = new Range( Position._createAt( newRoot, 0 ), Position._createAt( newRoot, 0 ) );

			differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range: newRange, affectsData: true } );

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

		it( 'move marker from a non-loaded to a loaded root - partially not buffered', () => {
			const newRoot = model.document.createRoot( '$root', 'new' );
			const newRange = new Range( Position._createAt( newRoot, 0 ), Position._createAt( newRoot, 0 ) );

			root._isLoaded = false;

			differ.bufferMarkerChange( 'name', { range, affectsData: true }, { range: newRange, affectsData: true } );

			expect( differ.getMarkersToRemove() ).to.deep.equal( [] );

			expect( differ.getMarkersToAdd() ).to.deep.equal( [
				{ name: 'name', range: newRange }
			] );

			expect( differ.getChangedMarkers() ).to.deep.equal( [
				{
					name: 'name',
					data: {
						oldRange: null,
						newRange
					}
				}
			] );
		} );
	} );

	describe( 'roots', () => {
		it( 'add root', () => {
			model.change( writer => {
				writer.addRoot( 'new' );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( { name: 'new', state: 'attached' } );
				expect( differ.hasDataChanges() ).to.be.true;
				expect( differ.isEmpty ).to.be.false;
			} );
		} );

		it( 'add root operation when root is attached should be ignored by differ', () => {
			// This may happen during RTC when joining an editing session when a root was added during that editing session.
			model.change( writer => {
				const operation = new RootOperation( 'main', '$root', true, model.document, model.document.version );

				writer.batch.addOperation( operation );
				model.applyOperation( operation );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 0 );
				expect( differ.hasDataChanges() ).to.be.false;
				expect( differ.isEmpty ).to.be.true;
			} );
		} );

		it( 'detach root', () => {
			model.change( writer => {
				writer.detachRoot( 'main' );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( { name: 'main', state: 'detached' } );
				expect( differ.hasDataChanges() ).to.be.true;
				expect( differ.isEmpty ).to.be.false;
			} );
		} );

		it( 'detach root operation when root is not attached should be ignored by differ', () => {
			// This may happen during RTC when joining an editing session when a root was detached during that editing session.
			model.change( writer => {
				const operation = new RootOperation( 'new', '$root', false, model.document, model.document.version );

				writer.batch.addOperation( operation );
				model.applyOperation( operation );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 0 );
				expect( differ.hasDataChanges() ).to.be.false;
				expect( differ.isEmpty ).to.be.true;
			} );
		} );

		it( 'add root, then detach root, then add root', () => {
			model.change( writer => {
				writer.addRoot( 'new' );
				writer.detachRoot( 'new' );

				let rootChanges = differ.getChangedRoots();
				expect( rootChanges.length ).to.equal( 0 );
				expect( differ.hasDataChanges() ).to.be.false;
				expect( differ.isEmpty ).to.be.true;

				writer.addRoot( 'new' );

				rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( { name: 'new', state: 'attached' } );
				expect( differ.hasDataChanges() ).to.be.true;
				expect( differ.isEmpty ).to.be.false;
			} );
		} );

		it( 'correctly resets after change block', () => {
			model.change( writer => {
				writer.addRoot( 'new' );
			} );

			expect( differ.getChangedRoots().length ).to.equal( 0 );
			expect( differ.hasDataChanges() ).to.be.false;
			expect( differ.isEmpty ).to.be.true;
		} );

		it( 'detach root, then add root, then detach root', () => {
			// Adding a new root, so we operate on a clean root.
			// 'main' root contains a paragraph and changes results, which does not contain only root stuff anymore.
			model.change( writer => {
				writer.addRoot( 'main2', 'div' ); // Setting different element name to avoid autoparagraphing.
			} );

			model.change( writer => {
				writer.detachRoot( 'main2' );
				writer.addRoot( 'main2' );

				let rootChanges = differ.getChangedRoots();
				expect( rootChanges.length ).to.equal( 0 );
				expect( differ.hasDataChanges() ).to.be.false;
				expect( differ.isEmpty ).to.be.true;

				writer.detachRoot( 'main2' );

				rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( { name: 'main2', state: 'detached' } );
				expect( differ.hasDataChanges() ).to.be.true;
				expect( differ.isEmpty ).to.be.false;
			} );
		} );

		it( 'multiple roots added and detached', () => {
			// Add extra root to have more things to remove.
			model.change( writer => {
				writer.addRoot( 'main2' );
			} );

			model.change( writer => {
				writer.addRoot( 'new' );
				writer.detachRoot( 'main' );
				writer.detachRoot( 'main2' );
				writer.addRoot( 'new2' );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 4 );
				expect( rootChanges[ 0 ] ).to.deep.equal( { name: 'new', state: 'attached' } );
				expect( rootChanges[ 1 ] ).to.deep.equal( { name: 'main', state: 'detached' } );
				expect( rootChanges[ 2 ] ).to.deep.equal( { name: 'main2', state: 'detached' } );
				expect( rootChanges[ 3 ] ).to.deep.equal( { name: 'new2', state: 'attached' } );
				expect( differ.hasDataChanges() ).to.be.true;
				expect( differ.isEmpty ).to.be.false;
			} );
		} );

		it( 'add attribute', () => {
			const root = model.document.getRoot();

			model.change( writer => {
				writer.setAttribute( 'key', 'foo', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( { name: 'main', attributes: { key: { oldValue: null, newValue: 'foo' } } } );
				expect( differ.hasDataChanges() ).to.be.true;
				expect( differ.isEmpty ).to.be.false;
			} );
		} );

		it( 'remove attribute', () => {
			const root = model.document.getRoot();

			model.change( writer => {
				writer.setAttribute( 'key', 'foo', root );
			} );

			model.change( writer => {
				writer.removeAttribute( 'key', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( { name: 'main', attributes: { key: { oldValue: 'foo', newValue: null } } } );
				expect( differ.hasDataChanges() ).to.be.true;
				expect( differ.isEmpty ).to.be.false;
			} );
		} );

		it( 'change attribute', () => {
			const root = model.document.getRoot();

			model.change( writer => {
				writer.setAttribute( 'key', 'foo', root );
			} );

			model.change( writer => {
				writer.setAttribute( 'key', 'bar', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( { name: 'main', attributes: { key: { oldValue: 'foo', newValue: 'bar' } } } );
				expect( differ.hasDataChanges() ).to.be.true;
				expect( differ.isEmpty ).to.be.false;
			} );
		} );

		it( 'add then remove attribute', () => {
			const root = model.document.getRoot();

			model.change( writer => {
				writer.setAttribute( 'key', 'foo', root );
				writer.removeAttribute( 'key', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 0 );
				expect( differ.hasDataChanges() ).to.be.false;
				expect( differ.isEmpty ).to.be.true;
			} );
		} );

		it( 'should not delete changedRoots for a custom root', () => {
			model.change( writer => {
				const customRoot = writer.addRoot( 'customRoot' );
				writer.setAttribute( 'key', 'foo', customRoot );
				writer.removeAttribute( 'key', customRoot );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( differ.hasDataChanges() ).to.be.true;
				expect( differ.isEmpty ).to.be.false;
			} );
		} );

		it( 'add then change attribute', () => {
			const root = model.document.getRoot();

			model.change( writer => {
				writer.setAttribute( 'key', 'foo', root );
				writer.setAttribute( 'key', 'bar', root );
				writer.setAttribute( 'key', 'baz', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( { name: 'main', attributes: { key: { oldValue: null, newValue: 'baz' } } } );
				expect( differ.hasDataChanges() ).to.be.true;
				expect( differ.isEmpty ).to.be.false;
			} );
		} );

		it( 'change then change back attribute', () => {
			const root = model.document.getRoot();

			model.change( writer => {
				writer.setAttribute( 'key', 'foo', root );
			} );

			model.change( writer => {
				writer.setAttribute( 'key', 'bar', root );
				writer.setAttribute( 'key', 'foo', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 0 );
				expect( differ.hasDataChanges() ).to.be.false;
				expect( differ.isEmpty ).to.be.true;
			} );
		} );

		it( 'change multiple attributes', () => {
			const root = model.document.getRoot();

			model.change( writer => {
				writer.setAttribute( 'key', 'foo', root );
			} );

			model.change( writer => {
				writer.setAttribute( 'key', 'bar', root );
				writer.setAttribute( 'abc', 'xyz', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( {
					name: 'main',
					attributes: {
						abc: { oldValue: null, newValue: 'xyz' },
						key: { oldValue: 'foo', newValue: 'bar' }
					}
				} );
			} );
		} );

		it( 'change attributes on added root', () => {
			model.change( writer => {
				const root = writer.addRoot( 'root' );

				writer.setAttribute( 'key', 'foo', root );
				writer.setAttribute( 'abc', 'xyz', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( {
					name: 'root',
					state: 'attached'
				} );
			} );
		} );

		it( 'change attributes on detached root', () => {
			const root = model.document.getRoot();

			model.change( writer => {
				writer.setAttribute( 'key', 'foo', root );
			} );

			model.change( writer => {
				writer.detachRoot( root );

				writer.removeAttribute( 'key', root );
				writer.setAttribute( 'abc', 'xyz', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( {
					name: 'main',
					state: 'detached'
				} );
			} );
		} );

		it( 'change attribute then attach root', () => {
			const root = model.document.getRoot();

			model.change( writer => {
				writer.detachRoot( root );
			} );

			model.change( writer => {
				writer.setAttribute( 'foo', 'bar', root );
				writer.addRoot( 'main' );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( {
					name: 'main',
					state: 'attached'
				} );
			} );
		} );

		it( 'change attribute then detach root', () => {
			const root = model.document.getRoot();

			model.change( writer => {
				writer.setAttribute( 'foo', 'bar', root );
				writer.detachRoot( root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( {
					name: 'main',
					state: 'detached'
				} );
			} );
		} );

		it( 'change attributes on detached and then re-attached root', () => {
			const root = model.document.getRoot();

			model.change( writer => {
				writer.setAttribute( 'key', 'foo', root );
			} );

			model.change( writer => {
				writer.detachRoot( root );

				writer.removeAttribute( 'key', root );
				writer.setAttribute( 'abc', 'xyz', root );

				writer.addRoot( 'main' );

				writer.setAttribute( 'abc', 'abc', root );
				writer.setAttribute( 'xxx', 'yyy', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( {
					name: 'main',
					attributes: {
						abc: { oldValue: null, newValue: 'abc' },
						key: { oldValue: 'foo', newValue: null },
						xxx: { oldValue: null, newValue: 'yyy' }
					}
				} );
			} );
		} );

		it( 'change attributes on multiple roots', () => {
			const root = model.document.getRoot();
			let root2;

			model.change( writer => {
				writer.setAttribute( 'key', 'foo', root );
				root2 = writer.addRoot( 'root' );
			} );

			model.change( writer => {
				writer.removeAttribute( 'key', root );
				writer.setAttribute( 'abc', 'xyz', root2 );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 2 );
				expect( rootChanges[ 0 ] ).to.deep.equal( {
					name: 'main',
					attributes: {
						key: { oldValue: 'foo', newValue: null }
					}
				} );
				expect( rootChanges[ 1 ] ).to.deep.equal( {
					name: 'root',
					attributes: {
						abc: { oldValue: null, newValue: 'xyz' }
					}
				} );
			} );
		} );

		it( 'detach non-loaded root - not buffered', () => {
			root._isLoaded = false;

			model.change( writer => {
				writer.detachRoot( 'main' );

				const rootChanges = differ.getChangedRoots();

				expectChanges( [] );

				expect( rootChanges.length ).to.equal( 0 );
			} );
		} );

		it( 'change attributes on non-loaded root - not buffered', () => {
			root._isLoaded = false;

			model.change( writer => {
				writer.setAttribute( 'foo', 'foo', root );
				writer.setAttribute( 'bar', 'bar', root );
				writer.setAttribute( 'baz', 'baz', root );

				writer.removeAttribute( 'baz', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 0 );
			} );

			model.change( writer => {
				writer.setAttribute( 'foo', 'xyz', root );
				writer.removeAttribute( 'bar', root );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'other cases', () => {
		// See https://github.com/ckeditor/ckeditor5/issues/4284.
		it( 'multiple inserts and removes in one element', () => {
			model.change( () => {
				insert( new Text( 'x' ), new Position( root, [ 0, 2 ] ) );
				insert( new Text( 'x' ), new Position( root, [ 0, 3 ] ) );
				move( new Position( root, [ 0, 2 ] ), 1, new Position( root, [ 1, 0 ] ) );

				expectChanges( [
					{ type: 'insert', name: '$text', length: 1, position: new Position( root, [ 0, 2 ] ), action: 'insert' },
					{ type: 'insert', name: '$text', length: 1, position: new Position( root, [ 1, 0 ] ), action: 'insert' }
				] );
			} );
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/733.
		it( 'proper filtering of changes in removed elements', () => {
			// Before fix there was a buggy scenario described in ckeditor5#733.
			// There was this structure: `<paragraph>foo[</paragraph><imageBlock /><blockQuote><p>te]xt</p></blockQuote>`
			// On delete of above selection `image` and `paragraph` inside `blockQuote` are removed (it gets merged).
			// However, since `image` was removed first, when checking if `paragraph` is in a removed element,
			// it appeared that `blockQuote` looks like it is removed because it had the same path as the already removed `<imageBlock>`.
			// In a result, removing `paragraph` was discarded.
			// The mistake was that the checking for removing was done at incorrect moment.
			const imageBlock = new Element( 'imageBlock' );
			const paragraph = new Element( 'paragraph', null, new Text( 'text' ) );

			root._removeChildren( 0, root.childCount );
			root._appendChild( [
				new Element( 'paragraph', null, new Text( 'foo' ) ),
				imageBlock,
				new Element( 'blockQuote', null, paragraph )
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
					{ type: 'insert', name: '$text', length: 2, position: new Position( root, [ 0, 3 ] ), action: 'insert' },
					{ type: 'remove', name: 'imageBlock', length: 1, position: new Position( root, [ 1 ] ), action: 'remove' },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 1, 0 ] ), action: 'remove' }
				] );
			} );
		} );

		// In this scenario we create a new element, then remove something from before it to mess up with offsets,
		// finally we insert some content into a new element. Since we are inserting into a new element, the
		// inserted children should not be shown on changes list.
		it( 'proper filtering of changes in inserted elements', () => {
			const imageBlock = new Element( 'imageBlock' );

			root._removeChildren( 0, root.childCount );
			root._appendChild( imageBlock );

			const blockQuote = new Element( 'blockQuote', null, new Element( 'paragraph' ) );

			model.change( () => {
				// Insert `blockQuote` with `paragraph` after `image`.
				insert( blockQuote, new Position( root, [ 1 ] ) );
				// Remove `image` from before `blockQuote`.
				remove( new Position( root, [ 0 ] ), 1 );
				// Insert text into `paragraph` in `blockQuote`.
				insert( new Text( 'foo' ), new Position( root, [ 0, 0, 0 ] ) );

				expectChanges( [
					{ type: 'remove', name: 'imageBlock', length: 1, position: new Position( root, [ 0 ] ), action: 'remove' },
					{ type: 'insert', name: 'blockQuote', length: 1, position: new Position( root, [ 0 ] ), action: 'insert' }
				] );
			} );
		} );

		// In this scenario we create a new element, then move another element that was before the new element into
		// the new element. This way we mess up with offsets and insert content into a new element in one operation.
		// Since we are inserting into a new element, the insertion of moved element should not be shown on changes list.
		it( 'proper filtering of changes in inserted elements #2', () => {
			const imageBlock = new Element( 'imageBlock' );

			root._removeChildren( 0, root.childCount );
			root._appendChild( imageBlock );

			model.change( () => {
				// Insert `div` after `image`.
				const div = new Element( 'div' );
				insert( div, new Position( root, [ 1 ] ) );
				// Move `image` to the new `div`.
				move( new Position( root, [ 0 ] ), 1, new Position( root, [ 1, 0 ] ) );

				expectChanges( [
					{ type: 'remove', name: 'imageBlock', length: 1, position: new Position( root, [ 0 ] ), action: 'remove' },
					{ type: 'insert', name: 'div', length: 1, position: new Position( root, [ 0 ] ), action: 'insert' }
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
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ), action: 'remove' },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ), action: 'remove' },
					{ type: 'remove', name: 'paragraph', length: 1, position: new Position( root, [ 0 ] ), action: 'remove' }
				] );
			} );
		} );
	} );

	describe( '_bufferRootLoad()', () => {
		let newRoot, rangeA, rangeB;

		beforeEach( () => {
			model.change( writer => {
				newRoot = model.document.createRoot( '$root', 'new' );
				newRoot._isLoaded = false;

				writer.insertElement( 'heading2', newRoot, 0 );
				writer.insertElement( 'paragraph', newRoot, 1 );

				rangeA = writer.createRangeIn( newRoot.getChild( 0 ) );
				rangeB = writer.createRangeIn( newRoot );
				writer.addMarker( 'markerA', { range: rangeA, usingOperation: true } );
				writer.addMarker( 'markerB', { range: rangeB, usingOperation: true } );

				writer.setAttribute( 'foo', 'foo', newRoot );
				writer.setAttribute( 'bar', 'bar', newRoot );

				// Marker in a different root.
				writer.addMarker( 'marker', { range: writer.createRangeIn( root ), usingOperation: true } );
			} );
		} );

		it( 'should buffer root state attached', () => {
			model.change( () => {
				newRoot._isLoaded = true;
				differ._bufferRootLoad( newRoot );

				const changes = differ.getChangedRoots();

				expect( changes.length ).to.equal( 1 );
				expect( changes[ 0 ] ).to.deep.equal( { name: 'new', state: 'attached' } );
			} );
		} );

		it( 'should buffer all root content as inserted', () => {
			model.change( () => {
				newRoot._isLoaded = true;
				differ._bufferRootLoad( newRoot );

				expectChanges( [
					{ type: 'insert', name: 'heading2', length: 1, position: new Position( newRoot, [ 0 ] ), action: 'insert' },
					{ type: 'insert', name: 'paragraph', length: 1, position: new Position( newRoot, [ 1 ] ), action: 'insert' }
				] );
			} );
		} );

		it( 'should buffer all markers inside the root as inserted', () => {
			model.change( () => {
				newRoot._isLoaded = true;
				differ._bufferRootLoad( newRoot );

				expect( differ.getMarkersToRemove() ).to.deep.equal( [] );

				expect( differ.getMarkersToAdd() ).to.deep.equal( [
					{ name: 'markerA', range: rangeA },
					{ name: 'markerB', range: rangeB }
				] );

				expect( differ.getChangedMarkers() ).to.deep.equal( [
					{
						name: 'markerA',
						data: {
							oldRange: null,
							newRange: rangeA
						}
					},
					{
						name: 'markerB',
						data: {
							oldRange: null,
							newRange: rangeB
						}
					}
				] );
			} );
		} );

		it( 'should not buffer any changes if the root is detached', () => {
			model.change( writer => {
				writer.detachRoot( newRoot );
			} );

			model.change( () => {
				newRoot._isLoaded = true;
				differ._bufferRootLoad( newRoot );

				expectChanges( [] );
				expect( differ.getChangedMarkers() ).to.deep.equal( [] );
				expect( differ.getChangedRoots().length ).to.equal( 0 );
				expect( differ.hasDataChanges() ).to.be.false;
			} );
		} );

		it( 'should not buffer any root-related changes if the root is detached after it is loaded', () => {
			model.change( writer => {
				newRoot._isLoaded = true;
				differ._bufferRootLoad( newRoot );
				writer.detachRoot( newRoot );

				expectChanges( [] );
				expect( differ.getChangedMarkers() ).to.deep.equal( [] );
				expect( differ.getChangedRoots().length ).to.equal( 0 );

				// It has changes in graveyard!
				expect( differ.hasDataChanges() ).to.be.false;
			} );
		} );

		it( 'should work well with changes that happens after the root was loaded', () => {
			model.change( writer => {
				newRoot._isLoaded = true;
				differ._bufferRootLoad( newRoot );

				// Remove `paragraph` and add an `imageBlock` before `heading2`.
				writer.remove( newRoot.getChild( 1 ) );
				writer.insertElement( 'imageBlock', newRoot, 0 );

				// Do some attribute changes. This should result in NO buffered attribute changes.
				// We don't return buffered attribute changes if the root was attached!
				writer.removeAttribute( 'foo', newRoot );
				writer.setAttribute( 'bar', 'xyz', newRoot );
				writer.setAttribute( 'baz', 'baz', newRoot );

				// Do some marker changes.
				// `markerA` was in the `heading2` which was moved, so let's refresh it.
				const newRangeA = writer.createRangeIn( newRoot.getChild( 1 ) );
				// `markerB` will be removed.
				writer.removeMarker( 'markerB' );
				// `markerC` will be added on the new `imageBlock` and should be [ 0 ] - [ 1 ].
				const rangeC = writer.createRangeOn( newRoot.getChild( 0 ) );
				writer.addMarker( 'markerC', { range: rangeC, usingOperation: true } );

				expectChanges( [
					{ type: 'insert', name: 'imageBlock', length: 1, position: new Position( newRoot, [ 0 ] ) },
					{ type: 'insert', name: 'heading2', length: 1, position: new Position( newRoot, [ 1 ] ) }
				] );

				const rootChanges = differ.getChangedRoots();

				expect( rootChanges.length ).to.equal( 1 );
				expect( rootChanges[ 0 ] ).to.deep.equal( { name: 'new', state: 'attached' } );

				expect( differ.getMarkersToRemove() ).to.deep.equal( [] );

				expect( differ.getMarkersToAdd() ).to.deep.equal( [
					{ name: 'markerA', range: newRangeA },
					{ name: 'markerC', range: rangeC }
				] );

				expect( differ.getChangedMarkers() ).to.deep.equal( [
					{
						name: 'markerA',
						data: {
							oldRange: null,
							newRange: newRangeA
						}
					},
					{
						name: 'markerC',
						data: {
							oldRange: null,
							newRange: rangeC
						}
					}
				] );
			} );
		} );
	} );

	describe( '#_refreshItem()', () => {
		it( 'should mark given element to be removed and added again', () => {
			const p = root.getChild( 0 );
			const before = { name: 'paragraph', attributes: new Map() };

			differ._refreshItem( p );

			expectChanges( [
				{ type: 'remove', action: 'refresh', name: 'paragraph', length: 1, position: model.createPositionBefore( p ) },
				{ type: 'insert', action: 'refresh', name: 'paragraph', length: 1, position: model.createPositionBefore( p ), before }
			], true );

			const refreshedItems = Array.from( differ.getRefreshedItems() );
			expect( refreshedItems ).to.deep.equal( [ p ] );
		} );

		it( 'should mark given text proxy to be removed and added again', () => {
			const p = root.getChild( 0 );
			const range = model.createRangeIn( p );
			const textProxy = [ ...range.getItems() ][ 0 ];

			differ._refreshItem( textProxy );

			// When text is refreshed its actions are still remove and insert.
			expectChanges( [
				{ type: 'remove', action: 'remove', name: '$text', length: 3, position: model.createPositionAt( p, 0 ) },
				{ type: 'insert', action: 'insert', name: '$text', length: 3, position: model.createPositionAt( p, 0 ) }
			], true );

			const refreshedItems = Array.from( differ.getRefreshedItems() );
			expect( refreshedItems ).to.deep.equal( [ textProxy ] );
		} );

		it( 'inside a new element', () => {
			// Since the refreshed element is inside a new element, it should not be listed on changes list.
			model.change( () => {
				const blockQuote = new Element( 'blockQuote', null, new Element( 'paragraph' ) );

				insert( blockQuote, new Position( root, [ 2 ] ) );

				differ._refreshItem( root.getChild( 2 ).getChild( 0 ) );

				expectChanges( [
					{ type: 'insert', name: 'blockQuote', length: 1, position: new Position( root, [ 2 ] ), action: 'insert' }
				] );

				const refreshedItems = Array.from( differ.getRefreshedItems() );
				expect( refreshedItems ).to.deep.equal( [] );
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
			const element = root.getChild( 1 );
			const before = { name: 'paragraph', attributes: new Map() };

			differ._refreshItem( element );

			expectChanges( [
				{ type: 'remove', action: 'refresh', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ) },
				{ type: 'insert', action: 'refresh', name: 'paragraph', length: 1, position: new Position( root, [ 1 ] ), before }
			] );

			const markersToRemove = differ.getMarkersToRemove().map( entry => entry.name );
			const markersToAdd = differ.getMarkersToAdd().map( entry => entry.name );

			expect( markersToRefresh ).to.deep.equal( markersToRemove );
			expect( markersToRefresh ).to.deep.equal( markersToAdd );
		} );

		it( 'inserted element is refreshed', () => {
			const element = new Element( 'paragraph' );
			const position = new Position( root, [ 0 ] );

			model.change( () => {
				insert( element, position );

				differ._refreshItem( element );

				expectChanges( [
					{
						type: 'insert',
						action: 'insert', // Stays as `insert`, as the end result is an insert, even though the element was refreshed too.
						name: 'paragraph',
						length: 1,
						position: new Position( root, [ 0 ] ),
						attributes: new Map( [] ),
						before: undefined
					}
				] );
			} );
		} );

		it( 'refreshed element is removed', () => {
			model.change( () => {
				const p = root.getChild( 0 );

				differ._refreshItem( p );

				remove( new Position( root, [ 0 ] ), 1 );

				expectChanges( [
					{
						type: 'remove',
						action: 'remove', // The end result is `remove` (remove overwrites refresh).
						name: 'paragraph',
						length: 1,
						position: new Position( root, [ 0 ] ),
						attributes: new Map( [] )
					}
				] );
			} );
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
		const insertionPosition = SplitOperation.getInsertionPosition( position );
		const operation = new SplitOperation( position, howMany, insertionPosition, null, doc.version );

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

		expect( changes.length, 'changes length' ).to.equal( expected.length );

		for ( let i = 0; i < expected.length; i++ ) {
			for ( const key in expected[ i ] ) {
				if ( Object.prototype.hasOwnProperty.call( expected[ i ], key ) ) {
					if ( key == 'position' || key == 'range' ) {
						expect( changes[ i ][ key ].isEqual( expected[ i ][ key ] ), `item ${ i }, key "${ key }"` ).to.be.true;
					} else if ( key == 'attributes' || key == 'before' || key == 'action' ) {
						expect( changes[ i ][ key ], `item ${ i }, key "${ key }"` ).to.deep.equal( expected[ i ][ key ] );
					} else {
						expect( changes[ i ][ key ], `item ${ i }, key "${ key }"` ).to.equal( expected[ i ][ key ] );
					}
				}
			}
		}
	}
} );
