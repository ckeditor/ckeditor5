/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'ckeditor' );
let CKEDITOR;

before( () => {
	CKEDITOR = modules.ckeditor;
} );

describe( 'CKEDITOR', () => {
	it( 'is an object', () => {
		expect( CKEDITOR ).to.be.an( 'object' );
	} );
} );