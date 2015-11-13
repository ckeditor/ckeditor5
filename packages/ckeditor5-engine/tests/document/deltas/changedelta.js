/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document, delta */

'use strict';

const modules = bender.amd.require(
	'document/transaction',
	'document/document',
	'document/text',
	'document/attribute',
	'document/range',
	'document/position' );

describe( 'Transaction', () => {
	let Transaction, Document, Text, Attribute, Range, Position;

	let doc, root, transaction;

	before( () => {
		Transaction = modules[ 'document/transaction' ];
		Document = modules[ 'document/document' ];
		Text = modules[ 'document/text' ];
		Attribute = modules[ 'document/attribute' ];
		Range = modules[ 'document/range' ];
		Position = modules[ 'document/position' ];
	} );

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		root.insertChildren( 0, [
			new Text( 'xxx', [ new Attribute( 'a', 1 ) ] ),
			'xxx',
			new Text( 'xxx', [ new Attribute( 'a', 1 ) ] ),
			new Text( 'xxx', [ new Attribute( 'a', 2 ) ] ),
			'xxx',
			new Text( 'xxx', [ new Attribute( 'a', 1 ) ] )
		] );

		transaction = doc.makeTransaction();
	} );

	function getRange( startIndex, endIndex ) {
		return new Range(
				Position.createFromParentAndOffset( root, startIndex ),
				Position.createFromParentAndOffset( root, endIndex )
			);
	}

	function getOperationsCount() {
		let count = 0;

		for ( let delta of transaction ) {
			for ( let operation of delta ) {
				count++;
			}
		}

		return count;
	}

	function getChangesAttrsCount() {
		let count = 0;

		for ( let delta of transaction ) {
			for ( let operation of delta ) {
				for ( let value of operation.range ) {
					count++;
				}
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
	} );
} );