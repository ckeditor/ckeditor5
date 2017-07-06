/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { getNodesAndText } from '../../../tests/model/_utils/utils';
import Document from '../../../src/model/document';
import Position from '../../../src/model/position';
import Range from '../../../src/model/range';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import RemoveDelta from '../../../src/model/delta/removedelta';

describe( 'Batch', () => {
	let doc, root, div, p, batch, chain, range;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		div = new Element( 'div', [], new Text( 'foobar' ) );
		p = new Element( 'p', [], new Text( 'abcxyz' ) );

		div.insertChildren( 0, [ new Element( 'p', [], new Text( 'gggg' ) ) ] );
		div.insertChildren( 2, [ new Element( 'p', [], new Text( 'hhhh' ) ) ] );

		root.insertChildren( 0, [ div, p ] );

		batch = doc.batch();

		// Range starts in ROOT > DIV > P > gg|gg.
		// Range ends in ROOT > DIV > ...|ar.
		range = new Range( new Position( root, [ 0, 0, 2 ] ), new Position( root, [ 0, 5 ] ) );
	} );

	describe( 'remove', () => {
		it( 'should remove specified node', () => {
			batch.remove( div );

			expect( root.maxOffset ).to.equal( 1 );
			expect( root.childCount ).to.equal( 1 );
			expect( getNodesAndText( Range.createIn( root.getChild( 0 ) ) ) ).to.equal( 'abcxyz' );
		} );

		it( 'should remove any range of nodes', () => {
			batch.remove( range );

			expect( getNodesAndText( Range.createIn( root.getChild( 0 ) ) ) ).to.equal( 'PggParPhhhhP' );
			expect( getNodesAndText( Range.createIn( root.getChild( 1 ) ) ) ).to.equal( 'abcxyz' );
		} );

		it( 'should create minimal number of remove deltas, each with only one operation', () => {
			batch.remove( range );

			expect( batch.deltas.length ).to.equal( 2 );
			expect( batch.deltas[ 0 ].operations.length ).to.equal( 1 );
			expect( batch.deltas[ 1 ].operations.length ).to.equal( 1 );
		} );

		it( 'should be chainable', () => {
			chain = batch.remove( range );

			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.remove( div );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );
} );

describe( 'RemoveDelta', () => {
	it( 'should provide proper className', () => {
		expect( RemoveDelta.className ).to.equal( 'engine.model.delta.RemoveDelta' );
	} );
} );
