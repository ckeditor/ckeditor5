/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

describe( 'bender global utils', () => {
	describe( 'view', () => {
		it( 'should be published in bender object', () => {
			expect( bender.view ).to.be.an( 'object' );
			expect( bender.view ).to.have.property( 'getData' ).that.is.a( 'function' );
			expect( bender.view ).to.have.property( 'setData' ).that.is.a( 'function' );
			expect( bender.view ).to.have.property( 'parse' ).that.is.a( 'function' );
			expect( bender.view ).to.have.property( 'stringify' ).that.is.a( 'function' );
		} );
	} );

	describe( 'model', () => {
		it( 'should be published in bender object', () => {
			expect( bender.model ).to.be.an( 'object' );
			expect( bender.model ).to.have.property( 'getData' ).that.is.a( 'function' );
			expect( bender.model ).to.have.property( 'setData' ).that.is.a( 'function' );
			expect( bender.model ).to.have.property( 'parse' ).that.is.a( 'function' );
			expect( bender.model ).to.have.property( 'stringify' ).that.is.a( 'function' );
		} );
	} );
} );
