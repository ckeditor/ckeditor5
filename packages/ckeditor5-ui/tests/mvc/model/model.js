/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, beforeEach, bender, sinon */

'use strict';

var modules = bender.amd.require( 'mvc/model', 'eventinfo' );

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
			sinon.assert.calledWithExactly( spy, sinon.match.instanceOf( EventInfo ), car, 'color', 'blue', 'red' );
			sinon.assert.calledWithExactly( spy, sinon.match.instanceOf( EventInfo ), car, 'year', 2003, 2015 );
			sinon.assert.calledWithExactly( spy, sinon.match.instanceOf( EventInfo ), car, 'wheels', 4, sinon.match.typeOf( 'undefined' ) );
			sinon.assert.calledWithExactly( spyColor, sinon.match.instanceOf( EventInfo ), car, 'blue', 'red' );
			sinon.assert.calledWithExactly( spyYear, sinon.match.instanceOf( EventInfo ), car, 2003, 2015 );
			sinon.assert.calledWithExactly( spyWheels, sinon.match.instanceOf( EventInfo ), car, 4, sinon.match.typeOf( 'undefined' ) );
		} );
	} );
} );
