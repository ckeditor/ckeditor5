/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, bender */

'use strict';

var modules = bender.amd.require( 'utils' );

describe( 'extendMixin', function() {
	it( 'should extend classes', function() {
		var utils = modules.utils;

		function Car( name ) {
			this.name = name;
		}

		Car.prototype.addGas = function() {};

		Car.extend = utils.extendMixin;

		var Truck = Car.extend( {
			loadContainers: function() {}
		} );

		var volvoTruck = new Truck( 'Volvo' );

		expect( volvoTruck ).to.be.an.instanceof( Truck );
		expect( volvoTruck ).to.be.an.instanceof( Car );
		expect( volvoTruck ).to.have.property( 'name' ).to.equals( 'Volvo' );
		expect( volvoTruck ).to.have.property( 'addGas' ).to.be.a( 'function' );
		expect( volvoTruck ).to.have.property( 'loadContainers' ).to.be.a( 'function' );

		var Spacecraft = Truck.extend( {
			jumpToHyperspace: function() {}
		} );

		var falcon = new Spacecraft( 'Millennium Falcon' );
		expect( falcon ).to.be.an.instanceof( Spacecraft );
		expect( falcon ).to.be.an.instanceof( Truck );
		expect( falcon ).to.be.an.instanceof( Car );
		expect( falcon ).to.have.property( 'name' ).to.equals( 'Millennium Falcon' );
		expect( falcon ).to.have.property( 'addGas' ).to.be.a( 'function' );
		expect( falcon ).to.have.property( 'loadContainers' ).to.be.a( 'function' );
		expect( falcon ).to.have.property( 'jumpToHyperspace' ).to.be.a( 'function' );
	} );
} );

describe( 'spy', function() {
	it( 'should register calls', function() {
		var utils = modules.utils;

		var fn1 = utils.spy();
		var fn2 = utils.spy();

		fn1();

		expect( fn1.called ).to.be.true();
		expect( fn2.called ).to.not.be.true();
	} );
} );

describe( 'uid', function() {
	it( 'should return different ids', function() {
		var utils = modules.utils;

		var id1 = utils.uid();
		var id2 = utils.uid();
		var id3 = utils.uid();

		expect( id1 ).to.be.a( 'number' );
		expect( id2 ).to.be.a( 'number' ).to.not.equal( id1 ).to.not.equal( id3 );
		expect( id3 ).to.be.a( 'number' ).to.not.equal( id1 ).to.not.equal( id2 );
	} );
} );
