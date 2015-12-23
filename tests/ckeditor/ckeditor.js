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

describe( 'isDebug', () => {
	it( 'is a boolean', () => {
		expect( CKEDITOR.isDebug ).to.be.a( 'boolean' );
	} );
} );

describe( 'getModulePath()', () => {
	it( 'generates path for the main file', () => {
		const path = CKEDITOR.getModulePath( 'ckeditor' );

		expect( path ).to.equal( 'ckeditor.js' );
	} );

	it( 'generates path for modules within ckeditor5 package', () => {
		const path = CKEDITOR.getModulePath( 'ckeditor5/foo' );

		expect( path ).to.equal( 'ckeditor5/foo.js' );
	} );

	it( 'generates path for modules within the core package', () => {
		const path = CKEDITOR.getModulePath( 'core/ui/controller' );

		expect( path ).to.equal( 'ckeditor5-core/ui/controller.js' );
	} );

	it( 'generates path for modules within some package', () => {
		const path = CKEDITOR.getModulePath( 'some/ba' );

		expect( path ).to.equal( 'ckeditor5-some/ba.js' );
	} );

	it( 'generates path from simplified feature name', () => {
		const path = CKEDITOR.getModulePath( 'foo' );

		expect( path ).to.equal( 'ckeditor5-foo/foo.js' );
	} );
} );