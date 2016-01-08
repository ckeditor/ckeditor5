/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'core/editorconfig', 'ckeditor' );

let config;

beforeEach( () => {
	const EditorConfig = modules[ 'core/editorconfig' ];

	config = new EditorConfig( {
		test: 1
	} );
} );

describe( 'constructor', () => {
	it( 'should set configurations', () => {
		expect( config ).to.have.property( 'test' ).to.equal( 1 );
	} );
} );

describe( 'get', () => {
	it( 'should retrieve a configuration', () => {
		expect( config.get( 'test' ) ).to.equal( 1 );
	} );

	it( 'should fallback to CKEDITOR.config', () => {
		const CKEDITOR = modules.ckeditor;

		CKEDITOR.config.set( {
			globalConfig: 2
		} );

		expect( config.get( 'globalConfig' ) ).to.equal( 2 );
	} );

	it( 'should return undefined for non existing configuration', () => {
		expect( config.get( 'invalid' ) ).to.be.undefined();
	} );
} );
