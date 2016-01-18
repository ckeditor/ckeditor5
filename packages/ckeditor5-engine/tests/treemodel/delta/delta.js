/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import coreTestUtils from '/tests/core/_utils/utils.js';
import Delta from '/ckeditor5/core/treemodel/delta/delta.js';

const getIteratorCount = coreTestUtils.getIteratorCount;

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

			const count = getIteratorCount( delta.operations );

			expect( count ).to.equal( 3 );
		} );
	} );
} );
