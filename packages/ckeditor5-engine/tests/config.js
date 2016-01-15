/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Config from '/ckeditor5/core/config.js';

let config;

beforeEach( () => {
	config = new Config( {
		creator: 'inline',
		language: 'pl',
		resize: {
			minHeight: 300,
			maxHeight: 800,
			icon: {
				path: 'xyz'
			}
		},
		toolbar: 'top'
	} );
} );

describe( 'constructor', () => {
	it( 'should set configurations', () => {
		expect( config ).to.have.property( 'creator' ).to.equal( 'inline' );
		expect( config ).to.have.property( 'language' ).to.equal( 'pl' );
		expect( config ).to.have.property( 'resize' ).to.have.property( 'minheight' ).to.equal( 300 );
		expect( config ).to.have.property( 'resize' ).to.have.property( 'maxheight' ).to.equal( 800 );
		expect( config ).to.have.property( 'resize' ).to.have.property( 'icon' )
			.to.have.property( 'path' ).to.equal( 'xyz' );
		expect( config ).to.have.property( 'toolbar' ).to.equal( 'top' );
	} );

	it( 'should work with no parameters', () => {
		// No error should be thrown.
		config = new Config();
	} );
} );

describe( 'set', () => {
	it( 'should create Config instances for objects', () => {
		expect( config.resize ).to.be.an.instanceof( Config );
		expect( config.resize.icon ).to.be.an.instanceof( Config );
	} );

	it( 'should set configurations when passing objects', () => {
		config.set( {
			option1: 1,
			option2: {
				subOption21: 21
			}
		} );

		expect( config )
			.to.have.property( 'option1' ).to.equal( 1 );

		expect( config )
			.to.have.property( 'option2' )
			.to.have.property( 'suboption21' ).to.equal( 21 );
	} );

	it( 'should set configurations when passing name and value', () => {
		config.set( 'something', 'anything' );

		expect( config ).to.have.property( 'something' ).to.equal( 'anything' );
	} );

	it( 'should set configurations when passing name.with.deep and value', () => {
		config.set( 'color.red', 'f00' );
		config.set( 'background.color.blue', '00f' );

		expect( config )
			.to.have.property( 'color' )
			.to.have.property( 'red' ).to.equal( 'f00' );

		expect( config )
			.to.have.property( 'background' )
			.to.have.property( 'color' )
			.to.have.property( 'blue' ).to.equal( '00f' );
	} );

	it( 'should override and expand deep configurations', () => {
		config.set( {
			resize: {
				minHeight: 400,		// Override
				hidden: true,		// Expand
				icon: {
					path: 'abc',	// Override
					url: true		// Expand
				}
			}
		} );

		expect( config ).to.have.property( 'resize' );
		expect( config.resize ).to.have.property( 'minheight' ).to.equal( 400 );
		expect( config.resize ).to.have.property( 'maxheight' ).to.equal( 800 );	// Not touched
		expect( config.resize ).to.have.property( 'hidden' ).to.equal( true );

		expect( config.resize ).to.have.property( 'icon' );
		expect( config.resize.icon ).to.have.property( 'path' ).to.equal( 'abc' );
		expect( config.resize.icon ).to.have.property( 'url' ).to.equal( true );
	} );

	it( 'should replace a simple entry with a Config instance', () => {
		config.set( 'test', 1 );
		config.set( 'test', {
			prop: 1
		} );

		expect( config.test ).to.be.an.instanceof( Config );
		expect( config.test.prop ).to.equal( 1 );
	} );

	it( 'should replace a simple entry with a Config instance when passing an object', () => {
		config.set( 'test', 1 );
		config.set( {
			test: {
				prop: 1
			}
		} );

		expect( config.test ).to.be.an.instanceof( Config );
		expect( config.test.prop ).to.equal( 1 );
	} );

	it( 'should replace a simple entry with a Config instance when passing a name.with.deep', () => {
		config.set( 'test.prop', 1 );
		config.set( 'test.prop.value', 1 );

		expect( config.test ).to.be.an.instanceof( Config );
		expect( config.test.prop ).to.be.an.instanceof( Config );
		expect( config.test.prop.value ).to.equal( 1 );
	} );

	it( 'should not create Config instances for non-pure objects', () => {
		function SomeClass() {}

		config.set( 'date', new Date() );
		config.set( {
			instance: new SomeClass()
		} );

		expect( config.date ).to.be.an.instanceof( Date );
		expect( config.instance ).to.be.an.instanceof( SomeClass );
	} );

	it( 'should set `null` for undefined value', () => {
		config.set( 'test' );

		expect( config.test ).to.be.null();
		expect( config.get( 'test' ) ).to.be.null();
	} );
} );

describe( 'get', () => {
	it( 'should retrieve a configuration', () => {
		expect( config.get( 'creator' ) ).to.equal( 'inline' );
	} );

	it( 'should retrieve a deep configuration', () => {
		expect( config.get( 'resize.minheight' ) ).to.equal( 300 );
		expect( config.get( 'resize.icon.path' ) ).to.equal( 'xyz' );
	} );

	it( 'should retrieve a subset of the configuration', () => {
		let resizeConfig = config.get( 'resize' );

		expect( resizeConfig ).to.have.property( 'minheight' ).to.equal( 300 );
		expect( resizeConfig ).to.have.property( 'maxheight' ).to.equal( 800 );
		expect( resizeConfig ).to.have.property( 'icon' ).to.have.property( 'path' ).to.equal( 'xyz' );

		let iconConfig = resizeConfig.get( 'icon' );

		expect( iconConfig ).to.have.property( 'path' ).to.equal( 'xyz' );
	} );

	it( 'should retrieve values case-insensitively', () => {
		expect( config.get( 'Creator' ) ).to.equal( 'inline' );
		expect( config.get( 'CREATOR' ) ).to.equal( 'inline' );
		expect( config.get( 'resize.minHeight' ) ).to.equal( 300 );
		expect( config.get( 'resize.MINHEIGHT' ) ).to.equal( 300 );
	} );

	it( 'should return undefined for non existing configuration', () => {
		expect( config.get( 'invalid' ) ).to.be.undefined();
	} );

	it( 'should return undefined for non existing deep configuration', () => {
		expect( config.get( 'resize.invalid.value' ) ).to.be.undefined();
	} );
} );

describe( 'define', () => {
	it( 'should create the definition property', () => {
		expect( config ).to.not.have.property( 'definition' );

		config.define( 'test', 1 );

		expect( config ).to.have.property( 'definition' );
	} );

	it( 'should set configurations in the definition property', () => {
		config.define( 'test1', 1 );

		// This is for Code Coverage to ensure that it works when `definition` is already defined.
		config.define( 'test2', 2 );

		expect( config.definition ).to.have.property( 'test1' ).to.equal( 1 );
		expect( config.definition ).to.have.property( 'test2' ).to.equal( 2 );
	} );

	it( 'should set configurations passed as object in the definition property', () => {
		config.define( {
			test: 1
		} );

		expect( config.definition ).to.have.property( 'test' ).to.equal( 1 );
	} );

	it( 'should not define main config properties but still be retrieved with get()', () => {
		config.define( 'test', 1 );

		expect( config ).to.not.have.property( 'test' );
		expect( config.get( 'test' ) ).to.equal( 1 );
	} );

	it( 'should be overridden by set()', () => {
		config.define( 'test', 1 );
		config.set( 'test', 2 );

		expect( config ).to.have.property( 'test' ).to.equal( 2 );
		expect( config.get( 'test' ) ).to.equal( 2 );
	} );
} );
