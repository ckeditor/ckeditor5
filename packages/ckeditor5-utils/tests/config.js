/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Config from '/ckeditor5/utils/config.js';

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
		expect( config.get( 'creator' ) ).to.equal( 'inline' );
		expect( config.get( 'language' ) ).to.equal( 'pl' );
		expect( config.get( 'resize' ) ).to.deep.equal( {
			minheight: 300,
			maxheight: 800,
			icon: {
				path: 'xyz'
			}
		} );
		expect( config.get( 'toolbar' ) ).to.equal( 'top' );
	} );

	it( 'should work with no parameters', () => {
		// No error should be thrown.
		config = new Config();
	} );
} );

describe( 'set', () => {
	it( 'should set configurations when passing objects', () => {
		config.set( {
			option1: 1,
			option2: {
				subOption21: 21
			}
		} );

		expect( config.get( 'option1' ) ).to.equal( 1 );
		expect( config.get( 'option2.suboption21' ) ).to.equal( 21 );
	} );

	it( 'should set configurations when passing name and value', () => {
		config.set( 'something', 'anything' );

		expect( config.get( 'something' ) ).to.equal( 'anything' );
	} );

	it( 'should set configurations when passing name.with.deep and value', () => {
		config.set( 'color.red', 'f00' );
		config.set( 'background.color.blue', '00f' );

		expect( config.get( 'color.red' ) ).to.equal( 'f00' );
		expect( config.get( 'background.color.blue' ) ).to.equal( '00f' );
	} );

	it( 'should replace a simple entry with a Config instance', () => {
		config.set( 'test', 1 );
		config.set( 'test', {
			prop: 1
		} );

		expect( config.get( 'test' ) ).to.be.an( 'object' );
		expect( config.get( 'test.prop' ) ).to.equal( 1 );
	} );

	it( 'should replace a simple entry with a Config instance when passing an object', () => {
		config.set( 'test', 1 );
		config.set( {
			test: {
				prop: 1
			}
		} );

		expect( config.get( 'test' ) ).to.be.an( 'object' );
		expect( config.get( 'test.prop' ) ).to.equal( 1 );
	} );

	it( 'should replace a simple entry with a Config instance when passing a name.with.deep', () => {
		config.set( 'test.prop', 1 );
		config.set( 'test.prop.value', 1 );

		expect( config.get( 'test' ) ).to.be.an( 'object' );
		expect( config.get( 'test.prop' ) ).to.be.an( 'object' );
		expect( config.get( 'test.prop.value' ) ).to.equal( 1 );
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

		expect( config.get( 'resize' ) ).to.be.deep.equal( {
			minheight: 400,		// Overridden
			maxheight: 800,		// The same
			hidden: true,		// Expanded
			icon: {
				path: 'abc',	// Overridden
				url: true		// Expanded
			}
		} );
	} );

	it( 'should override and expand Config instance when passing an object', () => {
		config.set( 'resize', {
			minHeight: 400,		// Override
			hidden: true,		// Expand
			icon: {
				path: 'abc',	// Override
				url: true		// Expand
			}
		} );

		expect( config.get( 'resize' ) ).to.deep.equal( {
			minheight: 400,		// Overridden
			maxheight: 800,		// The same
			hidden: true,		// Expanded
			icon: {
				path: 'abc',	// Overridden
				url: true		// Expanded
			}
		} );
	} );

	it( 'should not create Config instances for non-pure objects', () => {
		function SomeClass() {}

		config.set( 'date', new Date() );
		config.set( {
			instance: new SomeClass()
		} );

		expect( config.get( 'date' ) ).to.be.an.instanceof( Date );
		expect( config.get( 'instance' ) ).to.be.an.instanceof( SomeClass );
	} );
} );

describe( 'define', () => {
	it( 'should set configurations when passing objects', () => {
		config.set( {
			option1: 1,
			option2: {
				subOption21: 21
			}
		} );

		expect( config.get( 'option1' ) ).to.equal( 1 );
		expect( config.get( 'option2.suboption21' ) ).to.equal( 21 );
	} );

	it( 'should set configurations when passing name and value', () => {
		config.set( 'something', 'anything' );

		expect( config.get( 'something' ) ).to.equal( 'anything' );
	} );

	it( 'should set configurations when passing name.with.deep and value', () => {
		config.set( 'color.red', 'f00' );
		config.set( 'background.color.blue', '00f' );

		expect( config.get( 'color.red' ) ).to.equal( 'f00' );
		expect( config.get( 'background.color.blue' ) ).to.equal( '00f' );
	} );

	it( 'should not replace already defined values', () => {
		config.define( 'language', 'en' );
		config.define( 'resize.minHeight', 400 );
		config.define( 'resize.icon', 'some value' );

		expect( config.get( 'language' ) ).to.equal( 'pl' );
		expect( config.get( 'resize.icon' ) ).to.be.an( 'object' );
		expect( config.get( 'resize.minheight' ) ).to.equal( 300 );
	} );

	it( 'should expand but not override deep configurations', () => {
		config.define( {
			resize: {
				minHeight: 400,		// Override
				hidden: true,		// Expand
				icon: {
					path: 'abc',	// Override
					url: true		// Expand
				}
			}
		} );

		expect( config.get( 'resize' ) ).to.be.deep.equal( {
			minheight: 300,		// The same
			maxheight: 800,		// The same
			hidden: true,		// Expanded
			icon: {
				path: 'xyz',	// The same
				url: true		// Expanded
			}
		} );
	} );

	it( 'should expand but not override Config instance when passing an object', () => {
		config.define( 'resize', {
			minHeight: 400,		// Override
			hidden: true,		// Expand
			icon: {
				path: 'abc',	// Override
				url: true		// Expand
			}
		} );

		expect( config.get( 'resize' ) ).to.be.deep.equal( {
			minheight: 300,		// The same
			maxheight: 800,		// The same
			hidden: true,		// Expanded
			icon: {
				path: 'xyz',	// The same
				url: true		// Expanded
			}
		} );
	} );

	it( 'should not create Config instances for non-pure objects', () => {
		function SomeClass() {}

		config.define( 'date', new Date() );
		config.define( {
			instance: new SomeClass()
		} );

		expect( config.get( 'date' ) ).to.be.an.instanceof( Date );
		expect( config.get( 'instance' ) ).to.be.an.instanceof( SomeClass );
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

	it( 'should retrieve a object of the configuration', () => {
		let resizeConfig = config.get( 'resize' );

		expect( resizeConfig ).to.be.an( 'object' );
		expect( resizeConfig.minheight ).equal( 300 );
		expect( resizeConfig.maxheight ).to.equal( 800 );
		expect( resizeConfig.icon ).to.be.an( 'object' );

		expect( resizeConfig.icon ).to.be.an( 'object' );
	} );

	it( 'should retrieve values case-insensitively', () => {
		expect( config.get( 'Creator' ) ).to.equal( 'inline' );
		expect( config.get( 'CREATOR' ) ).to.equal( 'inline' );
		expect( config.get( 'resize.minHeight' ) ).to.equal( 300 );
		expect( config.get( 'resize.MINHEIGHT' ) ).to.equal( 300 );
	} );

	it( 'should return undefined for non existing configuration', () => {
		expect( config.get( 'invalid' ) ).to.be.undefined;
	} );

	it( 'should return undefined for empty configuration', () => {
		config = new Config();

		expect( config.get( 'invalid' ) ).to.be.undefined;
		expect( config.get( 'deep.invalid' ) ).to.be.undefined;
	} );

	it( 'should return undefined for non existing deep configuration', () => {
		expect( config.get( 'resize.invalid.value' ) ).to.be.undefined;
	} );

	it( 'should not be possible to retrieve value directly from config object', () => {
		expect( config.creator ).to.be.undefined;
		expect( () => {
			config.resize.maxheight;
		} ).to.throw();
	} );
} );
