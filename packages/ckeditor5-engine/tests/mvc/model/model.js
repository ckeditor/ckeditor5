/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, beforeEach, bender */

'use strict';

var modules = bender.amd.require( 'mvc/model' );

var car;

describe( 'Model', function() {
	beforeEach( 'Create a test model instance', function() {
		var Model = modules[ 'mvc/model' ];

		car = new Model( {
			color: 'red',
			year: 2015
		} );
	} );

	//////////

	it( 'should set _attributes on creation', function() {
		expect( car._attributes ).to.deep.equal( {
			color: 'red',
			year: 2015
		} );
	} );

	it( 'should get correctly after set', function() {
		car.color = 'blue';

		expect( car.color ).to.equal( 'blue' );
		expect( car._attributes.color ).to.equal( 'blue' );
	} );

	it( 'should get correctly after setting _attributes', function() {
		car._attributes.color = 'blue';

		expect( car.color ).to.equal( 'blue' );
	} );

	//////////

	describe( 'set()', function() {
		it( 'should work when passing an object', function() {
			car.set( {
				color: 'blue',	// Override
				wheels: 4,
				seats: 5
			} );

			expect( car._attributes ).to.deep.equal( {
				color: 'blue',
				year: 2015,
				wheels: 4,
				seats: 5
			} );
		} );

		it( 'should work when passing key/value', function() {
			car.set( 'color', 'blue' );
			car.set( 'wheels', 4 );

			expect( car._attributes ).to.deep.equal( {
				color: 'blue',
				year: 2015,
				wheels: 4
			} );
		} );
	} );
} );
