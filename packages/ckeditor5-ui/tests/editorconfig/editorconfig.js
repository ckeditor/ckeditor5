/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, beforeEach */

'use strict';

var modules = bender.amd.require( 'editorconfig', 'ckeditor' );

var config;

beforeEach( function() {
	var EditorConfig = modules.editorconfig;

	config = new EditorConfig( {
		test: 1
	} );
} );

describe( 'constructor', function() {
	it( 'should set configurations', function() {
		expect( config ).to.have.property( 'test' ).to.equals( 1 );
	} );
} );

describe( 'get', function() {
	it( 'should retrieve a configuration', function() {
		expect( config.get( 'test' ) ).to.equals( 1 );
	} );

	it( 'should fallback to CKEDITOR.config', function() {
		var CKEDITOR = modules.ckeditor;

		CKEDITOR.config.set( {
			globalConfig: 2
		} );

		expect( config.get( 'globalConfig' ) ).to.equals( 2 );
	} );

	it( 'should return undefined for non existing configuration', function() {
		expect( config.get( 'invalid' ) ).to.be.undefined();
	} );
} );
