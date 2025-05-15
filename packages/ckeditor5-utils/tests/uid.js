/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import uid from '../src/uid.js';

describe( 'utils', () => {
	describe( 'uid', () => {
		afterEach( () => {
			sinon.restore();
		} );

		it( 'should return different ids', () => {
			const id1 = uid();
			const id2 = uid();
			const id3 = uid();

			expect( id1 ).to.be.a( 'string' );
			expect( id2 ).to.be.a( 'string' ).to.not.equal( id1 ).to.not.equal( id3 );
			expect( id3 ).to.be.a( 'string' ).to.not.equal( id1 ).to.not.equal( id2 );

			const uuidRegex = /^e[a-f0-9]{32}$/;

			expect( id1 ).to.match( uuidRegex );
			expect( id2 ).to.match( uuidRegex );
			expect( id3 ).to.match( uuidRegex );
		} );

		it( 'should not use Math.random()', () => {
			const spy = sinon.spy( Math, 'random' );

			uid();

			expect( spy.notCalled ).to.be.true;
		} );
	} );
} );
