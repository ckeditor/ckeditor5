/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document, delta */

'use strict';

var modules = bender.amd.require(
	'document/transaction',
	'document/document',
	'document/text',
	'document/attribute',
	'document/range',
	'document/position' );

describe( 'Transaction', () => {
	var Transaction, Document, Text, Attribute, Range, Position;

	var doc, root, transaction;

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
		var count = 0;

		for ( var delta of transaction ) {
			for ( var operation of delta ) {
				count++;
			}
		}

		return count;
	}

	function assertAttrs( expected ) {
		var range = Range.createFromElement( root );
		var actual = Array.from( range ).map( value => value.node.getAttr( 'a' ) || '-' ).join( '' );

		// actual: 111---111222---111
		expect( actual ).to.be.deep.equal( expected );
	}

	describe( 'setAttr', () => {
		it( 'should set the attribute on the range', () => {
			transaction.setAttr( new Attribute( 'a', 3 ), getRange( 3, 6 ) );
			expect( getOperationsCount() ).
			assertAttrs( '111333111222---111' );
		} );

		it( 'should split the operations if parts of the range have different attributes', () => {
			transaction.setAttr( new Attribute( 'a', 3 ), getRange( 4, 14 ) );
			assertAttrs( '111-3333333333-111' );
		} );

		it( 'should split the operations if parts of the part of the range have the attribute', () => {
			transaction.setAttr( new Attribute( 'a', 2 ), getRange( 4, 14 ) );
			assertAttrs( '111-2222222222-111' );
		} );

		it( 'should strip the range if the beginning have the attribute', () => {
			transaction.setAttr( new Attribute( 'a', 1 ), getRange( 1, 5 ) );
			assertAttrs( '11111-111222---111' );
		} );

		it( 'should strip the range if the ending have the attribute', () => {
			transaction.setAttr( new Attribute( 'a', 3 ), getRange( 13, 17 ) );
			assertAttrs( '111---111222-11111' );
		} );

		it( 'should do nothing if the range has attribute', () => {
			transaction.setAttr( new Attribute( 'a', 3 ), getRange( 0, 3 ) );
			assertAttrs( '111---111222---111' );
		} );

		it( 'should create a proper operations for the mixed range', () => {
			transaction.setAttr( new Attribute( 'a', 1 ), getRange( 0, 18 ) );
			assertAttrs( '111111111111111111' );
		} );
	} );


	describe( 'removeAttr', () => {
		it( 'should remove the attribute on the range', () => {
			transaction.removeAttr( 'a', getRange( 0, 2 ) );
			assertAttrs( '--1---111222---111' );
		} );

		it( 'should split the operations if parts of the range have different attributes', () => {
			transaction.removeAttr( 'a', getRange( 7, 11 ) );
			assertAttrs( '111---1----2---111' );
		} );

		it( 'should split the operations if parts of the part of the range have no attribute', () => {
			transaction.removeAttr( 'a', getRange( 1, 7 ) );
			assertAttrs( '1------11222---111' );
		} );

		it( 'should strip the range if the beginning have no attribute', () => {
			transaction.removeAttr( 'a', getRange( 4, 12 ) );
			assertAttrs( '111------------111' );
		} );

		it( 'should strip the range if the ending have no attribute', () => {
			transaction.removeAttr( 'a', getRange( 7, 15 ) );
			assertAttrs( '111---1--------111' );
		} );

		it( 'should do nothing if the range has no attribute', () => {
			transaction.removeAttr( 'a', getRange( 4, 5 ) );
			assertAttrs( '111---111222---111' );
		} );

		it( 'should create a proper operations for the mixed range', () => {
			transaction.removeAttr( 'a', getRange( 3, 15 ) );
			assertAttrs( '111------------111' );
		} );
	} );
} );