/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, beforeEach, bender, sinon */

'use strict';

var modules = bender.amd.require( 'mvc/model', 'eventinfo' );

var Car, car;

describe( 'Model', function() {
	beforeEach( 'Create a test model instance', function() {
		var Model = modules[ 'mvc/model' ];

		Car = Model.extend();

		car = new Car( {
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

	describe( 'set', function() {
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

		it( 'should fire "change"', function() {
			var EventInfo = modules.eventinfo;

			var spy = sinon.spy();
			var spyColor = sinon.spy();
			var spyYear = sinon.spy();
			var spyWheels = sinon.spy();

			car.on( 'change', spy );
			car.on( 'change:color', spyColor );
			car.on( 'change:year', spyYear );
			car.on( 'change:wheels', spyWheels );

			// Set property in all possible ways.
			car.color = 'blue';
			car.set( { year: 2003 } );
			car.set( 'wheels', 4 );

			// Check number of calls.
			sinon.assert.calledThrice( spy );
			sinon.assert.calledOnce( spyColor );
			sinon.assert.calledOnce( spyYear );
			sinon.assert.calledOnce( spyWheels );

			// Check context.
			sinon.assert.alwaysCalledOn( spy, car );
			sinon.assert.calledOn( spyColor, car );
			sinon.assert.calledOn( spyYear, car );
			sinon.assert.calledOn( spyWheels, car );

			// Check params.
			sinon.assert.calledWithExactly( spy, sinon.match.instanceOf( EventInfo ), 'color', 'blue', 'red' );
			sinon.assert.calledWithExactly( spy, sinon.match.instanceOf( EventInfo ), 'year', 2003, 2015 );
			sinon.assert.calledWithExactly( spy, sinon.match.instanceOf( EventInfo ), 'wheels', 4, sinon.match.typeOf( 'undefined' ) );
			sinon.assert.calledWithExactly( spyColor, sinon.match.instanceOf( EventInfo ), 'blue', 'red' );
			sinon.assert.calledWithExactly( spyYear, sinon.match.instanceOf( EventInfo ), 2003, 2015 );
			sinon.assert.calledWithExactly( spyWheels, sinon.match.instanceOf( EventInfo ), 4, sinon.match.typeOf( 'undefined' ) );
		} );

		it( 'should not fire "change" for same attribute value', function() {
			var spy = sinon.spy();
			var spyColor = sinon.spy();

			car.on( 'change', spy );
			car.on( 'change:color', spyColor );

			// Set property in all possible ways.
			car.color = 'red';
			car.set( 'color', 'red' );
			car.set( { color: 'red' } );

			sinon.assert.notCalled( spy );
			sinon.assert.notCalled( spyColor );
		} );
	} );

	describe( 'extend', function() {
		it( 'should create new Model based classes', function() {
			var Model = modules[ 'mvc/model' ];

			var Truck = Car.extend();

			var truck = new Truck();

			expect( truck ).to.be.an.instanceof( Car );
			expect( truck ).to.be.an.instanceof( Model );
		} );
	} );
} );
