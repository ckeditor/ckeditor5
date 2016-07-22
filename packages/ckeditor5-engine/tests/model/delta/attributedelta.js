/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, delta */

import count from '/ckeditor5/utils/count.js';
import Document from '/ckeditor5/engine/model/document.js';
import Text from '/ckeditor5/engine/model/text.js';
import Range from '/ckeditor5/engine/model/range.js';
import Position from '/ckeditor5/engine/model/position.js';
import Element from '/ckeditor5/engine/model/element.js';

import AttributeDelta from '/ckeditor5/engine/model/delta/attributedelta.js';
import { RootAttributeDelta } from '/ckeditor5/engine/model/delta/attributedelta.js';
import AttributeOperation from '/ckeditor5/engine/model/operation/attributeoperation.js';

let doc, root;

beforeEach( () => {
	doc = new Document();
	root = doc.createRoot();
} );

describe( 'Batch', () => {
	let batch;

	const correctDeltaMatcher = sinon.match( ( operation ) => {
		return operation.delta && operation.delta.batch && operation.delta.batch == batch;
	} );

	beforeEach( () => {
		batch = doc.batch();
	} );

	function getOperationsCount() {
		let totalNumber = 0;

		for ( let delta of batch.deltas ) {
			totalNumber += count( delta.operations );
		}

		return totalNumber;
	}

	describe( 'change attribute on node', () => {
		let node, text;

		beforeEach( () => {
			node = new Element( 'p', { a: 1 } );
			text = new Text( 'c', { a: 1 } );

			root.insertChildren( 0, [ node, text ] );
		} );

		describe( 'setAttribute', () => {
			it( 'should create the attribute on element', () => {
				batch.setAttribute( node, 'b', 2 );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( node.getAttribute( 'b' ) ).to.equal( 2 );
			} );

			it( 'should change the attribute of element', () => {
				batch.setAttribute( node, 'a', 2 );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( node.getAttribute( 'a' ) ).to.equal( 2 );
			} );

			it( 'should create the attribute on text node', () => {
				batch.setAttr( text, 'b', 2 );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( root.getChild( 1 ).getAttribute( 'b' ) ).to.equal( 2 );
			} );

			it( 'should change the attribute of text node', () => {
				batch.setAttr( text, 'a', 2 );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( root.getChild( 1 ).getAttribute( 'a' ) ).to.equal( 2 );
			} );

			it( 'should do nothing if the attribute value is the same', () => {
				batch.setAttribute( node, 'a', 1 );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( node.getAttribute( 'a' ) ).to.equal( 1 );
			} );

			it( 'should be chainable', () => {
				const chain = batch.setAttribute( node, 'b', 2 );
				expect( chain ).to.equal( batch );
			} );

			it( 'should add delta to batch and operation to delta before applying operation', () => {
				sinon.spy( doc, 'applyOperation' );
				batch.setAttribute( node, 'b', 2 );

				expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should remove the attribute from element', () => {
				batch.removeAttribute( node, 'a' );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( node.getAttribute( 'a' ) ).to.be.undefined;
			} );

			it( 'should remove the attribute from character', () => {
				batch.removeAttr( text, 'a' );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( root.getChild( 1 ).getAttribute( 'a' ) ).to.be.undefined;
			} );

			it( 'should do nothing if the attribute is not set', () => {
				batch.removeAttribute( node, 'b' );
				expect( getOperationsCount() ).to.equal( 0 );
			} );

			it( 'should be chainable', () => {
				const chain = batch.removeAttribute( node, 'a' );
				expect( chain ).to.equal( batch );
			} );

			it( 'should add delta to batch and operation to delta before applying operation', () => {
				sinon.spy( doc, 'applyOperation' );
				batch.removeAttribute( node, 'a' );

				expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
			} );
		} );
	} );

	describe( 'change attribute on range', () => {
		beforeEach( () => {
			root.insertChildren( 0, [
				new Text( 'xxx', { a: 1 } ),
				new Text( 'xxx' ),
				new Text( 'xxx', { a: 1 } ),
				new Text( 'xxx', { a: 2 } ),
				new Text( 'xxx' ),
				new Text( 'xxx', { a: 1 } ),
				new Element( 'e', { a: 2 }, new Text( 'xxx' ) ),
				new Text( 'xxx' )
			] );
		} );

		function getRange( startIndex, endIndex ) {
			return new Range(
				Position.createFromParentAndOffset( root, startIndex ),
				Position.createFromParentAndOffset( root, endIndex )
			);
		}

		function getChangesAttrsCount() {
			let totalNumber = 0;

			for ( let delta of batch.deltas ) {
				for ( let operation of delta.operations ) {
					totalNumber += count( operation.range.getItems( { singleCharacters: true } ) );
				}
			}

			return totalNumber;
		}

		function getCompressedAttrs() {
			// default: 111---111222---1112------
			const range = Range.createFromElement( root );

			return Array.from( range.getItems( { singleCharacters: true } ) )
				.map( item => item.getAttribute( 'a' ) || '-' )
				.join( '' );
		}

		describe( 'setAttribute', () => {
			it( 'should set the attribute on the range', () => {
				batch.setAttribute( getRange( 3, 6 ), 'a', 3 );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 3 );
				expect( getCompressedAttrs() ).to.equal( '111333111222---1112------' );
			} );

			it( 'should split the operations if parts of the range have different attributes', () => {
				batch.setAttribute( getRange( 4, 14 ), 'a', 3 );
				expect( getOperationsCount() ).to.equal( 4 );
				expect( getChangesAttrsCount() ).to.equal( 10 );
				expect( getCompressedAttrs() ).to.equal( '111-3333333333-1112------' );
			} );

			it( 'should split the operations if parts of the part of the range have the attribute', () => {
				batch.setAttribute( getRange( 4, 14 ), 'a', 2 );
				expect( getOperationsCount() ).to.equal( 3 );
				expect( getChangesAttrsCount() ).to.equal( 7 );
				expect( getCompressedAttrs() ).to.equal( '111-2222222222-1112------' );
			} );

			it( 'should strip the range if the beginning have the attribute', () => {
				batch.setAttribute( getRange( 1, 5 ), 'a', 1 );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 2 );
				expect( getCompressedAttrs() ).to.equal( '11111-111222---1112------' );
			} );

			it( 'should strip the range if the ending have the attribute', () => {
				batch.setAttribute( getRange( 13, 17 ), 'a', 1 );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 2 );
				expect( getCompressedAttrs() ).to.equal( '111---111222-111112------' );
			} );

			it( 'should do nothing if the range has attribute', () => {
				batch.setAttribute( getRange( 0, 3 ), 'a', 1 );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should not check range\'s start position node when creating operations', () => {
				let range = new Range(
					new Position( root, [ 18, 1 ] ),
					new Position( root, [ 19 ] )
				);

				batch.setAttribute( range, 'a', 1 );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 2 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112-11---' );
			} );

			it( 'should not change elements attribute if range contains closing tag', () => {
				let range = new Range(
					new Position( root, [ 18, 1 ] ),
					new Position( root, [ 21 ] )
				);

				batch.setAttribute( range, 'a', 1 );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 4 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112-1111-' );
			} );

			it( 'should not create an operation if the range contains only closing tag', () => {
				let range = new Range(
					new Position( root, [ 18, 3 ] ),
					new Position( root, [ 19 ] )
				);

				batch.setAttribute( range, 'a', 3 );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should not create an operation if is collapsed', () => {
				batch.setAttribute( getRange( 3, 3 ), 'a', 1 );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should create a proper operations for the mixed range', () => {
				batch.setAttribute( getRange( 0, 20 ), 'a', 1 );
				expect( getOperationsCount() ).to.equal( 5 );
				expect( getChangesAttrsCount() ).to.equal( 14 );
				expect( getCompressedAttrs() ).to.equal( '11111111111111111111111--' );
			} );

			it( 'should be chainable', () => {
				const chain = batch.setAttribute( getRange( 3, 6 ), 'a', 3 );
				expect( chain ).to.equal( batch );
			} );

			it( 'should add delta to batch and operation to delta before applying operation', () => {
				sinon.spy( doc, 'applyOperation' );
				batch.setAttribute( getRange( 3, 6 ), 'a', 3 );

				expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should remove the attribute on the range', () => {
				batch.removeAttribute( getRange( 0, 2 ), 'a' );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 2 );
				expect( getCompressedAttrs() ).to.equal( '--1---111222---1112------' );
			} );

			it( 'should split the operations if parts of the range have different attributes', () => {
				batch.removeAttribute( getRange( 7, 11 ), 'a' );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 4 );
				expect( getCompressedAttrs() ).to.equal( '111---1----2---1112------' );
			} );

			it( 'should split the operations if parts of the part of the range have no attribute', () => {
				batch.removeAttribute( getRange( 1, 7 ), 'a' );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 3 );
				expect( getCompressedAttrs() ).to.equal( '1------11222---1112------' );
			} );

			it( 'should strip the range if the beginning have no attribute', () => {
				batch.removeAttribute( getRange( 4, 12 ), 'a' );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 6 );
				expect( getCompressedAttrs() ).to.equal( '111------------1112------' );
			} );

			it( 'should strip the range if the ending have no attribute', () => {
				batch.removeAttribute( getRange( 7, 15 ), 'a' );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 5 );
				expect( getCompressedAttrs() ).to.equal( '111---1--------1112------' );
			} );

			it( 'should do nothing if the range has no attribute', () => {
				batch.removeAttribute( getRange( 4, 5 ), 'a' );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should not check range\'s start position node when creating operations', () => {
				let range = new Range(
					new Position( root, [ 18, 3 ] ),
					new Position( root, [ 19 ] )
				);

				batch.removeAttribute( range, 'a' );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getChangesAttrsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should not apply operation twice in the range contains opening and closing tags', () => {
				batch.removeAttribute( getRange( 18, 22 ), 'a' );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 1 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---111-------' );
			} );

			it( 'should not create an operation if range is collapsed', () => {
				batch.removeAttribute( getRange( 3, 3 ), 'a' );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should create a proper operations for the mixed range', () => {
				batch.removeAttribute( getRange( 3, 15 ), 'a' );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 6 );
				expect( getCompressedAttrs() ).to.equal( '111------------1112------' );
			} );

			it( 'should be chainable', () => {
				const chain = batch.removeAttribute( getRange( 0, 2 ), 'a' );
				expect( chain ).to.equal( batch );
			} );

			it( 'should add delta to batch and operation to delta before applying operation', () => {
				sinon.spy( doc, 'applyOperation' );
				batch.removeAttribute( getRange( 0, 2 ), 'a' );

				expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
			} );
		} );
	} );

	describe( 'change attribute on root element', () => {
		describe( 'setAttribute', () => {
			it( 'should create the attribute on root', () => {
				batch.setAttribute( root, 'b', 2  );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( root.getAttribute( 'b' ) ).to.equal( 2 );
			} );

			it( 'should change the attribute of root', () => {
				batch.setAttribute( root, 'a', 2 );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( root.getAttribute( 'a' ) ).to.equal( 2 );
			} );

			it( 'should do nothing if the attribute value is the same', () => {
				batch.setAttribute( root, 'a', 1 );
				expect( getOperationsCount() ).to.equal( 1 );
				batch.setAttribute( root, 'a', 1 );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( root.getAttribute( 'a' ) ).to.equal( 1 );
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should remove the attribute from root', () => {
				batch.setAttribute( root, 'a', 1 );
				batch.removeAttribute( root, 'a' );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( root.getAttribute( 'a' ) ).to.be.undefined;
			} );

			it( 'should do nothing if the attribute is not set', () => {
				batch.removeAttribute( root, 'b' );
				expect( getOperationsCount() ).to.equal( 0 );
			} );
		} );
	} );
} );

describe( 'AttributeDelta', () => {
	let delta;

	beforeEach( () => {
		delta = new AttributeDelta();
	} );

	describe( 'key', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( delta.key ).to.be.null;
		} );

		it( 'should be equal to attribute operations key that are in delta', () => {
			let range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) );
			delta.addOperation( new AttributeOperation( range, 'key', 'old', 'new', 0 ) );

			expect( delta.key ).to.equal( 'key' );
		} );
	} );

	describe( 'value', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( delta.value ).to.be.null;
		} );

		it( 'should be equal to the value set by the delta operations', () => {
			let range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) );
			delta.addOperation( new AttributeOperation( range, 'key', 'old', 'new', 0 ) );

			expect( delta.value ).to.equal( 'new' );
		} );
	} );

	describe( 'range', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( delta.range ).to.be.null;
		} );

		it( 'should be equal to the range on which delta operates', () => {
			// Delta operates on range [ 1 ] to [ 6 ] but omits [ 4 ] - [ 5 ] for "a reason".
			// Still the range should be from [ 1 ] to [ 6 ]. Delta may not apply anything on [ 4 ] - [ 5 ]
			// because it already has proper attribute.
			let rangeA = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) );
			let rangeB = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );
			let rangeC = new Range( new Position( root, [ 5 ] ), new Position( root, [ 6 ] ) );

			delta.addOperation( new AttributeOperation( rangeA, 'key', 'oldA', 'new', 0 ) );
			delta.addOperation( new AttributeOperation( rangeB, 'key', 'oldB', 'new', 1 ) );
			delta.addOperation( new AttributeOperation( rangeC, 'key', 'oldC', 'new', 2 ) );

			expect( delta.range.start.path ).to.deep.equal( [ 1 ] );
			expect( delta.range.end.path ).to.deep.equal( [ 6 ] );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty AttributeDelta if there are no operations in delta', () => {
			let reversed = delta.getReversed();

			expect( reversed ).to.be.instanceof( AttributeDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct AttributeDelta', () => {
			let rangeA = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) );
			let rangeB = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );

			delta.addOperation( new AttributeOperation( rangeA, 'key', 'oldA', 'new', 0 ) );
			delta.addOperation( new AttributeOperation( rangeB, 'key', 'oldB', 'new', 1 ) );

			let reversed = delta.getReversed();

			expect( reversed ).to.be.instanceof( AttributeDelta );
			expect( reversed.operations.length ).to.equal( 2 );

			// Remember about reversed operations order.
			expect( reversed.operations[ 0 ] ).to.be.instanceof( AttributeOperation );
			expect( reversed.operations[ 0 ].range.isEqual( rangeB ) ).to.be.true;
			expect( reversed.operations[ 0 ].key ).to.equal( 'key' );
			expect( reversed.operations[ 0 ].oldValue ).to.equal( 'new' );
			expect( reversed.operations[ 0 ].newValue ).to.equal( 'oldB' );

			expect( reversed.operations[ 1 ] ).to.be.instanceof( AttributeOperation );
			expect( reversed.operations[ 1 ].range.isEqual( rangeA ) ).to.be.true;
			expect( reversed.operations[ 1 ].key ).to.equal( 'key' );
			expect( reversed.operations[ 1 ].oldValue ).to.equal( 'new' );
			expect( reversed.operations[ 1 ].newValue ).to.equal( 'oldA' );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( AttributeDelta.className ).to.equal( 'engine.model.delta.AttributeDelta' );
	} );
} );

describe( 'RootAttributeDelta', () => {
	it( 'should provide proper className', () => {
		expect( RootAttributeDelta.className ).to.equal( 'engine.model.delta.RootAttributeDelta' );
	} );
} );
