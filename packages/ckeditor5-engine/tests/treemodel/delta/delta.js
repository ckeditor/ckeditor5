/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import utils from '/ckeditor5/utils/utils.js';
import Delta from '/ckeditor5/core/treemodel/delta/delta.js';
import Operation from '/ckeditor5/core/treemodel/operation/operation.js';

// Some test examples of operations.
class FooOperation extends Operation {
	constructor( string, baseVersion ) {
		super( baseVersion );
		this.string = string;
	}

	getReversed() {
		/* jshint ignore:start */
		return new BarOperation( this.string, this.baseVersion );
		/* jshint ignore:end */
	}
}

class BarOperation extends FooOperation {
	getReversed() {
		return new FooOperation( this.string, this.baseVersion );
	}
}

describe( 'Delta', () => {
	describe( 'constructor', () => {
		it( 'should create an delta with empty properties', () => {
			const delta = new Delta();

			expect( delta ).to.have.property( 'batch' ).that.is.null;
			expect( delta ).to.have.property( 'operations' ).that.a( 'array' ).and.have.length( 0 );
		} );
	} );

	describe( 'addOperation', () => {
		it( 'should add operation to the delta', () => {
			const delta = new Delta();
			const operation = {};

			delta.addOperation( operation );

			expect( delta.operations ).to.have.length( 1 );
			expect( delta.operations[ 0 ] ).to.equal( operation );
		} );

		it( 'should add delta property to the operation', () => {
			const delta = new Delta();
			const operation = {};

			delta.addOperation( operation );

			expect( operation.delta ).to.equal( delta );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over delta operations', () => {
			const delta = new Delta();

			delta.addOperation( {} );
			delta.addOperation( {} );
			delta.addOperation( {} );

			const count = utils.count( delta.operations );

			expect( count ).to.equal( 3 );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty Delta if there are no operations in delta', () => {
			const delta = new Delta();
			let reversed = delta.getReversed();

			expect( reversed ).to.be.instanceof( Delta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return Delta with all operations reversed and their order reversed', () => {
			const delta = new Delta();
			delta.addOperation( new FooOperation( 'a', 1 ) );
			delta.addOperation( new BarOperation( 'b', 2 ) );

			let reversed = delta.getReversed();

			expect( reversed ).to.be.instanceof( Delta );
			expect( reversed.operations.length ).to.equal( 2 );

			expect( reversed.operations[ 0 ] ).to.be.instanceOf( FooOperation );
			expect( reversed.operations[ 0 ].string ).to.equal( 'b' );
			expect( reversed.operations[ 1 ] ).to.be.instanceOf( BarOperation );
			expect( reversed.operations[ 1 ].string ).to.equal( 'a' );
		} );
	} );
} );
