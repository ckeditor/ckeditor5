/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

const modules = bender.amd.require(
	'core/treeview/position'
);

describe( 'Position', () => {
	let Position;

	before( () => {
		Position = modules[ 'core/treeview/position' ];
	} );

	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			const parentMock = {};
			const elem = new Position( parentMock, 5 );

			expect( elem ).to.have.property( 'parent' ).that.equals( parentMock );
			expect( elem ).to.have.property( 'offset' ).that.equals( 5 );
		} );
	} );
} );