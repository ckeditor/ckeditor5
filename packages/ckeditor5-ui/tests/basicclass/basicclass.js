/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, bender */

'use strict';

var modules = bender.amd.require( 'basicclass' );

describe( 'extend', function() {
	it( 'should extend classes', function() {
		var BasicClass = modules.basicclass;

		var Truck = BasicClass.extend( {
			loadContainers: function() {}
		} );

		var volvoTruck = new Truck();

		expect( volvoTruck ).to.be.an.instanceof( Truck );
		expect( volvoTruck ).to.be.an.instanceof( BasicClass );
		expect( volvoTruck ).to.have.property( 'loadContainers' ).to.be.a( 'function' );

		var Spacecraft = Truck.extend( {
			jumpToHyperspace: function() {}
		} );

		var falcon = new Spacecraft();
		expect( falcon ).to.be.an.instanceof( Spacecraft );
		expect( falcon ).to.be.an.instanceof( Truck );
		expect( falcon ).to.be.an.instanceof( BasicClass );
		expect( falcon ).to.have.property( 'loadContainers' ).to.be.a( 'function' );
		expect( falcon ).to.have.property( 'jumpToHyperspace' ).to.be.a( 'function' );
	} );

	it( 'should extend the prototype and add statics', function() {
		var BasicClass = modules.basicclass;

		var Truck = BasicClass.extend( {
			property1: 1,
			property2: function() {}
		}, {
			static1: 1,
			static2: function() {}
		} );

		expect( Truck ).to.have.property( 'static1' ).to.equals( 1 );
		expect( Truck ).to.have.property( 'static2' ).to.be.a( 'function' );

		var truck = new Truck();

		expect( truck ).to.have.property( 'property1' ).to.equals( 1 );
		expect( truck ).to.have.property( 'property2' ).to.be.a( 'function' );
	} );

	it( 'should use a custom constructor', function() {
		var BasicClass = modules.basicclass;

		function customConstructor() {}

		var Truck = BasicClass.extend( {
			constructor: customConstructor
		} );

		expect( Truck ).to.equals( customConstructor );
		expect( Truck.prototype ).to.not.have.ownProperty( 'constructor' );

		expect( new Truck() ).to.be.an.instanceof( Truck );
		expect( new Truck() ).to.be.an.instanceof( BasicClass );
	} );
} );

describe( 'BasicClass', function() {
	it( 'should be an event emitter', function() {
		var BasicClass = modules.basicclass;

		var basic = new BasicClass();

		expect( basic ).to.have.property( 'fire' ).to.be.a( 'function' );
	} );
} );
