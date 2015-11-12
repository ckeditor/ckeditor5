/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'model', 'eventinfo', 'ckeditorerror' );

let Car, car;

describe( 'Model', () => {
	beforeEach( 'Create a test model instance', () => {
		const Model = modules.model;

		Car = class extends Model {};

		car = new Car( {
			color: 'red',
			year: 2015
		} );
	} );

	//////////

	it( 'should set _attributes on creation', () => {
		expect( car._attributes ).to.deep.equal( {
			color: 'red',
			year: 2015
		} );
	} );

	it( 'should get correctly after set', () => {
		car.color = 'blue';

		expect( car.color ).to.equal( 'blue' );
		expect( car._attributes.color ).to.equal( 'blue' );
	} );

	it( 'should get correctly after setting _attributes', () => {
		car._attributes.color = 'blue';

		expect( car.color ).to.equal( 'blue' );
	} );

	it( 'should add properties on creation', () => {
		let car = new Car( null, {
			prop: 1
		} );

		expect( car ).to.have.property( 'prop' ).to.equal( 1 );
	} );

	//////////

	describe( 'set', () => {
		it( 'should work when passing an object', () => {
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

		it( 'should work when passing a key/value pair', () => {
			car.set( 'color', 'blue' );
			car.set( 'wheels', 4 );

			expect( car._attributes ).to.deep.equal( {
				color: 'blue',
				year: 2015,
				wheels: 4
			} );
		} );

		it( 'should fire the "change" event', () => {
			const EventInfo = modules.eventinfo;

			let spy = sinon.spy();
			let spyColor = sinon.spy();
			let spyYear = sinon.spy();
			let spyWheels = sinon.spy();

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

		it( 'should not fire the "change" event for the same attribute value', () => {
			let spy = sinon.spy();
			let spyColor = sinon.spy();

			car.on( 'change', spy );
			car.on( 'change:color', spyColor );

			// Set the "color" property in all possible ways.
			car.color = 'red';
			car.set( 'color', 'red' );
			car.set( { color: 'red' } );

			sinon.assert.notCalled( spy );
			sinon.assert.notCalled( spyColor );
		} );

		it( 'should throw when overriding already existing property', () => {
			const CKEditorError = modules.ckeditorerror;

			car.normalProperty = 1;

			expect( () => {
				car.set( 'normalProperty', 2 );
			} ).to.throw( CKEditorError, /^model-set-cannot-override/ );

			expect( car ).to.have.property( 'normalProperty', 1 );
		} );

		it( 'should throw when overriding already existing property (in the prototype)', () => {
			const CKEditorError = modules.ckeditorerror;
			const Model = modules.model;

			class Car extends Model {
				method() {}
			}

			car = new Car();

			expect( () => {
				car.set( 'method', 2 );
			} ).to.throw( CKEditorError, /^model-set-cannot-override/ );

			expect( car.method ).to.be.a( 'function' );
		} );
	} );

	describe( 'extend', () => {
		it( 'should create new Model based classes', () => {
			const Model = modules.model;

			class Truck extends Car {}

			let truck = new Truck();

			expect( truck ).to.be.an.instanceof( Car );
			expect( truck ).to.be.an.instanceof( Model );
		} );
	} );
} );
