/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document, delta */

/* bender-include: ../../_tools/tools.js */

'use strict';

const getIteratorCount = bender.tools.core.getIteratorCount;

const modules = bender.amd.require(
	'document/transaction',
	'document/document',
	'document/text',
	'document/attribute',
	'document/range',
	'document/position',
	'document/element',
	'document/character' );

describe( 'Transaction', () => {
	let Transaction, Document, Text, Attribute, Range, Position, Element, Character;

	let doc, root, transaction;

	before( () => {
		Transaction = modules[ 'document/transaction' ];
		Document = modules[ 'document/document' ];
		Text = modules[ 'document/text' ];
		Attribute = modules[ 'document/attribute' ];
		Range = modules[ 'document/range' ];
		Position = modules[ 'document/position' ];
		Element = modules[ 'document/element' ];
		Character = modules[ 'document/character' ];
	} );

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		transaction = doc.createTransaction();
	} );

	function getOperationsCount() {
		let count = 0;

		for ( let delta of transaction.deltas ) {
			count += getIteratorCount( delta.operations );
		}

		return count;
	}

	describe( 'change attribute on node', () => {
		let node, character;

		beforeEach( () => {
			node = new Element( 'p', [ new Attribute( 'a', 1 ) ] );
			character = new Character( 'c', [ new Attribute( 'a', 1 ) ] );
			root.insertChildren( 0, [ node, character ] );
		} );

		describe( 'setAttr', () => {
			it( 'should create the attribute on element', () => {
				transaction.setAttr( 'b', 2, node );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( node.getAttr( 'b' ) ).to.equal( 2 );
			} );

			it( 'should change the attribute of element', () => {
				transaction.setAttr( 'a', 2, node );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( node.getAttr( 'a' ) ).to.equal( 2 );
			} );

			it( 'should create the attribute on character', () => {
				transaction.setAttr( 'b', 2, character );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( character.getAttr( 'b' ) ).to.equal( 2 );
			} );

			it( 'should change the attribute of character', () => {
				transaction.setAttr( 'a', 2, character );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( character.getAttr( 'a' ) ).to.equal( 2 );
			} );

			it( 'should do nothing if the attribute value is the same', () => {
				transaction.setAttr( 'a', 1, node );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( node.getAttr( 'a' ) ).to.equal( 1 );
			} );

			it( 'should be chainable', () => {
				const chain = transaction.setAttr( 'b', 2, node );
				expect( chain ).to.equal( transaction );
			} );
		} );

		describe( 'removeAttr', () => {
			it( 'should remove the attribute from element', () => {
				transaction.removeAttr( 'a', node );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( node.getAttr( 'a' ) ).to.be.null;
			} );

			it( 'should remove the attribute from character', () => {
				transaction.removeAttr( 'a', character );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( character.getAttr( 'a' ) ).to.be.null;
			} );

			it( 'should do nothing if the attribute is not set', () => {
				transaction.removeAttr( 'b', node );
				expect( getOperationsCount() ).to.equal( 0 );
			} );

			it( 'should be chainable', () => {
				const chain = transaction.removeAttr( 'a', node );
				expect( chain ).to.equal( transaction );
			} );
		} );
	} );

	describe( 'change attribute on range', () => {
		beforeEach( () => {
			root.insertChildren( 0, [
				new Text( 'xxx', [ new Attribute( 'a', 1 ) ] ),
				'xxx',
				new Text( 'xxx', [ new Attribute( 'a', 1 ) ] ),
				new Text( 'xxx', [ new Attribute( 'a', 2 ) ] ),
				'xxx',
				new Text( 'xxx', [ new Attribute( 'a', 1 ) ] )
			] );
		} );

		function getRange( startIndex, endIndex ) {
			return new Range(
					Position.createFromParentAndOffset( root, startIndex ),
					Position.createFromParentAndOffset( root, endIndex )
				);
		}

		function getChangesAttrsCount() {
			let count = 0;

			for ( let delta of transaction.deltas ) {
				for ( let operation of delta.operations ) {
					count += getIteratorCount( operation.range );
				}
			}

			return count;
		}

		function getCompressedAttrs() {
			// default: 111---111222---111
			const range = Range.createFromElement( root );

			return Array.from( range ).map( value => value.node.getAttr( 'a' ) || '-' ).join( '' );
		}

		describe( 'setAttr', () => {
			it( 'should set the attribute on the range', () => {
				transaction.setAttr( 'a', 3, getRange( 3, 6 ) );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 3 );
				expect( getCompressedAttrs() ).to.equal( '111333111222---111' );
			} );

			it( 'should split the operations if parts of the range have different attributes', () => {
				transaction.setAttr( 'a', 3, getRange( 4, 14 ) );
				expect( getOperationsCount() ).to.equal( 4 );
				expect( getChangesAttrsCount() ).to.equal( 10 );
				expect( getCompressedAttrs() ).to.equal( '111-3333333333-111' );
			} );

			it( 'should split the operations if parts of the part of the range have the attribute', () => {
				transaction.setAttr( 'a', 2, getRange( 4, 14 ) );
				expect( getOperationsCount() ).to.equal( 3 );
				expect( getChangesAttrsCount() ).to.equal( 7 );
				expect( getCompressedAttrs() ).to.equal( '111-2222222222-111' );
			} );

			it( 'should strip the range if the beginning have the attribute', () => {
				transaction.setAttr( 'a', 1, getRange( 1, 5 ) );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 2 );
				expect( getCompressedAttrs() ).to.equal( '11111-111222---111' );
			} );

			it( 'should strip the range if the ending have the attribute', () => {
				transaction.setAttr( 'a', 1, getRange( 13, 17 ) );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 2 );
				expect( getCompressedAttrs() ).to.equal( '111---111222-11111' );
			} );

			it( 'should do nothing if the range has attribute', () => {
				transaction.setAttr( 'a', 1, getRange( 0, 3 ) );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---111' );
			} );

			it( 'should create a proper operations for the mixed range', () => {
				transaction.setAttr( 'a', 1, getRange( 0, 18 ) );
				expect( getOperationsCount() ).to.equal( 3 );
				expect( getChangesAttrsCount() ).to.equal( 9 );
				expect( getCompressedAttrs() ).to.equal( '111111111111111111' );
			} );

			it( 'should be chainable', () => {
				const chain = transaction.setAttr( 'a', 3, getRange( 3, 6 ) );
				expect( chain ).to.equal( transaction );
			} );
		} );

		describe( 'removeAttr', () => {
			it( 'should remove the attribute on the range', () => {
				transaction.removeAttr( 'a', getRange( 0, 2 ) );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 2 );
				expect( getCompressedAttrs() ).to.equal( '--1---111222---111' );
			} );

			it( 'should split the operations if parts of the range have different attributes', () => {
				transaction.removeAttr( 'a', getRange( 7, 11 ) );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 4 );
				expect( getCompressedAttrs() ).to.equal( '111---1----2---111' );
			} );

			it( 'should split the operations if parts of the part of the range have no attribute', () => {
				transaction.removeAttr( 'a', getRange( 1, 7 ) );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 3 );
				expect( getCompressedAttrs() ).to.equal( '1------11222---111' );
			} );

			it( 'should strip the range if the beginning have no attribute', () => {
				transaction.removeAttr( 'a', getRange( 4, 12 ) );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 6 );
				expect( getCompressedAttrs() ).to.equal( '111------------111' );
			} );

			it( 'should strip the range if the ending have no attribute', () => {
				transaction.removeAttr( 'a', getRange( 7, 15 ) );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 5 );
				expect( getCompressedAttrs() ).to.equal( '111---1--------111' );
			} );

			it( 'should do nothing if the range has no attribute', () => {
				transaction.removeAttr( 'a', getRange( 4, 5 ) );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---111' );
			} );

			it( 'should create a proper operations for the mixed range', () => {
				transaction.removeAttr( 'a', getRange( 3, 15 ) );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 6 );
				expect( getCompressedAttrs() ).to.equal( '111------------111' );
			} );

			it( 'should be chainable', () => {
				const chain = transaction.removeAttr( 'a', getRange( 0, 2 ) );
				expect( chain ).to.equal( transaction );
			} );
		} );
	} );
} );