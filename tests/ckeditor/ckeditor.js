/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'ckeditor' );

describe( 'isDebug', () => {
	it( 'is a boolean', () => {
		const CKEDITOR = modules.ckeditor;

		expect( CKEDITOR.isDebug ).to.be.a( 'boolean' );
	} );
} );
