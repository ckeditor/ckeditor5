/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'ckeditor5/path' );
let path;

before( () => {
	path = modules[ 'ckeditor5/path' ];
} );

describe( 'getModulePath()', () => {
	it( 'generates path for the main file', () => {
		const p = path.getModulePath( 'ckeditor' );

		expect( p ).to.equal( 'ckeditor.js' );
	} );

	it( 'generates path for modules within ckeditor5 package', () => {
		const p = path.getModulePath( 'ckeditor5/foo' );

		expect( p ).to.equal( 'ckeditor5/foo.js' );
	} );

	it( 'generates path for modules within the core package', () => {
		const p = path.getModulePath( 'core/ui/controller' );

		expect( p ).to.equal( 'ckeditor5-core/ui/controller.js' );
	} );

	it( 'generates path for modules within some package', () => {
		const p = path.getModulePath( 'some/ba' );

		expect( p ).to.equal( 'ckeditor5-some/ba.js' );
	} );

	it( 'generates path from simplified feature name', () => {
		const p = path.getModulePath( 'foo' );

		expect( p ).to.equal( 'ckeditor5-foo/foo.js' );
	} );
} );