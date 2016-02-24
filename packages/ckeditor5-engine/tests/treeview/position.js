/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Position from '/ckeditor5/core/treeview/position.js';

describe( 'Position', () => {
	const parentMock = {};

	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			const elem = new Position( parentMock, 5 );

			expect( elem ).to.have.property( 'parent' ).that.equals( parentMock );
			expect( elem ).to.have.property( 'offset' ).that.equals( 5 );
		} );
	} );

	describe( 'getShiftedBy', () => {
		it( 'returns new instance with shifted offset', () => {
			const position = new Position( parentMock, 10 );
			const shifted = position.getShiftedBy( 12 );
			expect( shifted.offset ).to.equal( 22 );
		} );

		it( 'accepts negative values', () => {
			const position = new Position( parentMock, 10 );
			const shifted = position.getShiftedBy( -5 );
			expect( shifted.offset ).to.equal( 5 );
		} );

		it( 'prevents offset to be a negative value', () => {
			const position = new Position( parentMock, 10 );
			const shifted = position.getShiftedBy( -20 );

			expect( shifted.offset ).to.equal( 0 );
		} );
	} );

	describe( 'createFromPosition', () => {
		it( 'creates new Position with same parent and offset', () => {
			const offset = 50;
			const position = new Position( parentMock, offset );
			const newPosition = Position.createFromPosition( position );

			expect( position ).to.not.equal( newPosition );
			expect( position.offset ).to.equal( offset );
			expect( position.parent ).to.equal( parentMock );
		} );
	} );
} );
