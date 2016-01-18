/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import testUtils from '/tests/_utils/utils.js';
import Model from '/ckeditor5/core/model.js';
import EventInfo from '/ckeditor5/core/eventinfo.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

let Car, car;

testUtils.createSinonSandbox();

describe( 'Model', () => {
	beforeEach( 'Create a test model instance', () => {
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
			car.normalProperty = 1;

			expect( () => {
				car.set( 'normalProperty', 2 );
			} ).to.throw( CKEditorError, /^model-set-cannot-override/ );

			expect( car ).to.have.property( 'normalProperty', 1 );
		} );

		it( 'should throw when overriding already existing property (in the prototype)', () => {
			class Car extends Model {
				method() {}
			}

			car = new Car();

			expect( () => {
				car.set( 'method', 2 );
			} ).to.throw( CKEditorError, /^model-set-cannot-override/ );

			expect( car.method ).to.be.a( 'function' );
		} );

		it( 'should allow setting attributes with undefined value', () => {
			let spy = sinon.spy();

			car.on( 'change', spy );
			car.set( 'seats', undefined );

			sinon.assert.calledOnce( spy );
			expect( car._attributes ).to.contain.keys( 'seats' );
			expect( car.seats ).to.be.undefined;

			car.set( 'seats', 5 );

			sinon.assert.calledTwice( spy );
			expect( car._attributes ).to.have.property( 'seats', 5 );
		} );
	} );

	describe( 'extend', () => {
		it( 'should create new Model based classes', () => {
			class Truck extends Car {}

			let truck = new Truck();

			expect( truck ).to.be.an.instanceof( Car );
			expect( truck ).to.be.an.instanceof( Model );
		} );
	} );

	describe( 'bind', () => {
		it( 'should chain for a single attribute', () => {
			expect( car.bind( 'color' ) ).to.contain.keys( 'to' );
		} );

		it( 'should chain for multiple attributes', () => {
			expect( car.bind( 'color', 'year' ) ).to.contain.keys( 'to' );
		} );

		it( 'should chain for nonexistent attributes', () => {
			expect( car.bind( 'nonexistent' ) ).to.contain.keys( 'to' );
		} );

		it( 'should throw when attributes are not strings', () => {
			expect( () => {
				car.bind();
			} ).to.throw( CKEditorError, /model-bind-wrong-attrs/ );

			expect( () => {
				car.bind( new Date() );
			} ).to.throw( CKEditorError, /model-bind-wrong-attrs/ );

			expect( () => {
				car.bind( 'color', new Date() );
			} ).to.throw( CKEditorError, /model-bind-wrong-attrs/ );
		} );

		it( 'should throw when the same attribute is used than once', () => {
			expect( () => {
				car.bind( 'color', 'color' );
			} ).to.throw( CKEditorError, /model-bind-duplicate-attrs/ );
		} );

		it( 'should throw when binding the same attribute more than once', () => {
			expect( () => {
				car.bind( 'color' );
				car.bind( 'color' );
			} ).to.throw( CKEditorError, /model-bind-rebind/ );
		} );

		describe( 'to', () => {
			it( 'should not chain', () => {
				expect(
					car.bind( 'color' ).to( new Model( { color: 'red' } ) )
				).to.be.undefined;
			} );

			it( 'should throw when arguments are of invalid type', () => {
				expect( () => {
					car = new Car();

					car.bind( 'color' ).to();
				} ).to.throw( CKEditorError, /model-bind-to-parse-error/ );

				expect( () => {
					car = new Car();

					car.bind( 'color' ).to( new Model(), new Date() );
				} ).to.throw( CKEditorError, /model-bind-to-parse-error/ );

				expect( () => {
					car = new Car( { color: 'red' } );

					car.bind( 'color' ).to( new Model(), 'color', new Date() );
				} ).to.throw( CKEditorError, /model-bind-to-parse-error/ );
			} );

			it( 'should throw when binding multiple attributes to multiple models', () => {
				let vehicle = new Car();
				const car1 = new Car( { color: 'red', year: 1943 } );
				const car2 = new Car( { color: 'yellow', year: 1932 } );

				expect( () => {
					vehicle.bind( 'color', 'year' ).to( car1, 'color', car2, 'year' );
				} ).to.throw( CKEditorError, /model-bind-to-no-callback/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year' ).to( car1, car2 );
				} ).to.throw( CKEditorError, /model-bind-to-no-callback/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year' ).to( car1, car2, 'year' );
				} ).to.throw( CKEditorError, /model-bind-to-no-callback/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year' ).to( car1, 'color', car2 );
				} ).to.throw( CKEditorError, /model-bind-to-no-callback/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year', 'custom' ).to( car, car );
				} ).to.throw( CKEditorError, /model-bind-to-no-callback/ );
			} );

			it( 'should throw when binding multiple attributes but passed a callback', () => {
				let vehicle = new Car();

				expect( () => {
					vehicle.bind( 'color', 'year' ).to( car, () => {} );
				} ).to.throw( CKEditorError, /model-bind-to-extra-callback/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year' ).to( car, car, () => {} );
				} ).to.throw( CKEditorError, /model-bind-to-extra-callback/ );
			} );

			it( 'should throw when binding a single attribute but multiple callbacks', () => {
				let vehicle = new Car();

				expect( () => {
					vehicle.bind( 'color' ).to( car, () => {}, () => {} );
				} ).to.throw( CKEditorError, /model-bind-to-parse-error/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color' ).to( car, car, () => {}, () => {} );
				} ).to.throw( CKEditorError, /model-bind-to-parse-error/ );
			} );

			it( 'should throw when a number of attributes does not match', () => {
				let vehicle = new Car();

				expect( () => {
					vehicle.bind( 'color' ).to( car, 'color', 'year' );
				} ).to.throw( CKEditorError, /model-bind-to-attrs-length/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year' ).to( car, 'color' );
				} ).to.throw( CKEditorError, /model-bind-to-attrs-length/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color' ).to( car, 'color', 'year', () => {} );
				} ).to.throw( CKEditorError, /model-bind-to-attrs-length/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color' ).to( car, 'color', car, 'color', 'year', () => {} );
				} ).to.throw( CKEditorError, /model-bind-to-attrs-length/ );
			} );

			it( 'should throw when attributes don\'t exist in to() model', () => {
				const vehicle = new Car();

				expect( () => {
					vehicle.bind( 'color' ).to( car, 'nonexistent in car' );
				} ).to.throw( CKEditorError, /model-bind-to-missing-attr/ );

				expect( () => {
					vehicle.bind( 'nonexistent in car' ).to( car );
				} ).to.throw( CKEditorError, /model-bind-to-missing-attr/ );

				expect( () => {
					vehicle.bind( 'year' ).to( car, 'color', car, 'nonexistent in car', () => {} );
				} ).to.throw( CKEditorError, /model-bind-to-missing-attr/ );
			} );

			it( 'should set new model attributes', () => {
				const car = new Car( { color: 'green', year: 2001, type: 'pickup' } );
				const vehicle = new Car( { 'not involved': true } );

				vehicle.bind( 'color', 'year', 'type' ).to( car );

				expect( vehicle._attributes ).to.have.keys( 'color', 'year', 'type', 'not involved' );
			} );

			it( 'should work when no attribute specified #1', () => {
				const vehicle = new Car();

				vehicle.bind( 'color' ).to( car );

				assertBinding( vehicle,
					{ color: car.color, year: undefined },
					[
						[ car, { color: 'blue', year: 1969 } ]
					],
					{ color: 'blue', year: undefined }
				);
			} );

			it( 'should work for a single attribute', () => {
				const vehicle = new Car();

				vehicle.bind( 'color' ).to( car, 'color' );

				assertBinding( vehicle,
					{ color: car.color, year: undefined },
					[
						[ car, { color: 'blue', year: 1969 } ]
					],
					{ color: 'blue', year: undefined }
				);
			} );

			it( 'should work for multiple attributes', () => {
				const vehicle = new Car();

				vehicle.bind( 'color', 'year' ).to( car, 'color', 'year' );

				assertBinding( vehicle,
					{ color: car.color, year: car.year },
					[
						[ car, { color: 'blue', year: 1969 } ]
					],
					{ color: 'blue', year: 1969 }
				);
			} );

			it( 'should work for attributes that don\'t exist in the model', () => {
				const vehicle = new Car();

				vehicle.bind( 'nonexistent in vehicle' ).to( car, 'color' );

				assertBinding( vehicle,
					{ 'nonexistent in vehicle': car.color, color: undefined },
					[
						[ car, { color: 'blue', year: 1969 } ]
					],
					{ 'nonexistent in vehicle': 'blue', color: undefined }
				);
			} );

			it( 'should work when using the same attribute name more than once', () => {
				const vehicle = new Car();

				vehicle.bind( 'color', 'year' ).to( car, 'year', 'year' );

				assertBinding( vehicle,
					{ color: car.year, year: car.year },
					[
						[ car, { color: 'blue', year: 1969 } ]
					],
					{ color: 1969, year: 1969 }
				);
			} );

			it( 'should work when binding more that once', () => {
				const vehicle = new Car();

				vehicle.bind( 'color' ).to( car, 'color' );
				vehicle.bind( 'year' ).to( car, 'year' );

				assertBinding( vehicle,
					{ color: car.color, year: car.year },
					[
						[ car, { color: 'blue', year: 1969 } ]
					],
					{ color: 'blue', year: 1969 }
				);
			} );

			it( 'should work with callback – set a new model attribute', () => {
				const vehicle = new Car();
				const car1 = new Car( { type: 'pickup' } );
				const car2 = new Car( { type: 'truck' } );

				vehicle.bind( 'type' )
					.to( car1, car2, ( ...args ) => args.join( '' ) );

				expect( vehicle._attributes ).to.have.keys( [ 'type' ] );
			} );

			it( 'should work with callback #1', () => {
				const vehicle = new Car();
				const car1 = new Car( { color: 'black' } );
				const car2 = new Car( { color: 'brown' } );

				vehicle.bind( 'color' )
					.to( car1, car2, ( ...args ) => args.join( '' ) );

				assertBinding( vehicle,
					{ color: car1.color + car2.color, year: undefined },
					[
						[ car1, { color: 'black', year: 1930 } ],
						[ car2, { color: 'green', year: 1950 } ]
					],
					{ color: 'blackgreen', year: undefined }
				);
			} );

			it( 'should work with callback #2', () => {
				const vehicle = new Car();
				const car1 = new Car( { color: 'black' } );
				const car2 = new Car( { color: 'brown' } );

				vehicle.bind( 'color' )
					.to( car1, 'color', car2, 'color', ( ...args ) => args.join( '' ) );

				assertBinding( vehicle,
					{ color: car1.color + car2.color, year: undefined },
					[
						[ car1, { color: 'black', year: 1930 } ],
						[ car2, { color: 'green', year: 1950 } ]
					],
					{ color: 'blackgreen', year: undefined }
				);
			} );

			it( 'should work with callback #3', () => {
				const vehicle = new Car();
				const car1 = new Car( { color: 'black' } );
				const car2 = new Car( { color: 'brown' } );
				const car3 = new Car( { color: 'yellow' } );

				vehicle.bind( 'color' )
					.to( car1, car2, car3, ( ...args ) => args.join( '' ) );

				assertBinding( vehicle,
					{ color: car1.color + car2.color + car3.color, year: undefined },
					[
						[ car1, { color: 'black', year: 1930 } ],
						[ car2, { color: 'green', year: 1950 } ]
					],
					{ color: 'blackgreenyellow', year: undefined }
				);
			} );

			it( 'should work with callback #4', () => {
				const vehicle = new Car();
				const car1 = new Car( { color: 'black' } );
				const car2 = new Car( { lightness: 'bright' } );
				const car3 = new Car( { color: 'yellow' } );

				vehicle.bind( 'color' )
					.to( car1, car2, 'lightness', car3, ( ...args ) => args.join( '' ) );

				assertBinding( vehicle,
					{ color: car1.color + car2.lightness + car3.color, year: undefined },
					[
						[ car1, { color: 'black', year: 1930 } ],
						[ car2, { color: 'green', year: 1950 } ]
					],
					{ color: 'blackbrightyellow', year: undefined }
				);
			} );

			it( 'should work with callback #5', () => {
				const vehicle = new Car();
				const car1 = new Car( { hue: 'reds' } );
				const car2 = new Car( { lightness: 'bright' } );

				vehicle.bind( 'color' )
					.to( car1, 'hue', car2, 'lightness', ( ...args ) => args.join( '' ) );

				assertBinding( vehicle,
					{ color: car1.hue + car2.lightness, year: undefined },
					[
						[ car1, { hue: 'greens', year: 1930 } ],
						[ car2, { lightness: 'dark', year: 1950 } ]
					],
					{ color: 'greensdark', year: undefined }
				);
			} );

			it( 'should work with callback #6', () => {
				const vehicle = new Car();
				const car1 = new Car( { hue: 'reds' } );

				vehicle.bind( 'color' )
					.to( car1, 'hue', ( h ) => h.toUpperCase() );

				assertBinding( vehicle,
					{ color: car1.hue.toUpperCase(), year: undefined },
					[
						[ car1, { hue: 'greens', year: 1930 } ]
					],
					{ color: 'GREENS', year: undefined }
				);
			} );

			it( 'should work with callback #7', () => {
				const vehicle = new Car();
				const car1 = new Car( { color: 'red', year: 1943 } );
				const car2 = new Car( { color: 'yellow', year: 1932 } );

				vehicle.bind( 'custom' )
					.to( car1, 'color', car2, 'year', ( ...args ) => args.join( '/' ) );

				assertBinding( vehicle,
					{ color: undefined, year: undefined, 'custom': car1.color + '/' + car2.year },
					[
						[ car1, { color: 'blue', year: 2100 } ],
						[ car2, { color: 'violet', year: 1969 } ]
					],
					{ color: undefined, year: undefined, 'custom': 'blue/1969' }
				);
			} );

			it( 'should work with callback #8', () => {
				const vehicle = new Car();
				const car1 = new Car( { color: 'red', year: 1943 } );
				const car2 = new Car( { color: 'yellow', year: 1932 } );
				const car3 = new Car( { hue: 'reds' } );

				vehicle.bind( 'custom' )
					.to( car1, 'color', car2, 'year', car3, 'hue', ( ...args ) => args.join( '/' ) );

				assertBinding( vehicle,
					{ color: undefined, year: undefined, hue: undefined, 'custom': car1.color + '/' + car2.year + '/' + car3.hue },
					[
						[ car1, { color: 'blue', year: 2100 } ],
						[ car2, { color: 'violet', year: 1969 } ]
					],
					{ color: undefined, year: undefined, hue: undefined, 'custom': 'blue/1969/reds' }
				);
			} );

			it( 'should work with callback – binding more that once #1', () => {
				const vehicle = new Car();
				const car1 = new Car( { hue: 'reds', produced: 1920 } );
				const car2 = new Car( { lightness: 'bright', sold: 1921 } );

				vehicle.bind( 'color' )
					.to( car1, 'hue', car2, 'lightness', ( ...args ) => args.join( '' ) );

				vehicle.bind( 'year' )
					.to( car1, 'produced', car2, 'sold', ( ...args ) => args.join( '/' ) );

				assertBinding( vehicle,
					{ color: car1.hue + car2.lightness, year: car1.produced + '/' + car2.sold },
					[
						[ car1, { hue: 'greens', produced: 1930 } ],
						[ car2, { lightness: 'dark', sold: 2000 } ]
					],
					{ color: 'greensdark', year: '1930/2000' }
				);
			} );

			it( 'should work with callback – binding more that once #2', () => {
				const vehicle = new Car();
				const car1 = new Car( { hue: 'reds', produced: 1920 } );
				const car2 = new Car( { lightness: 'bright', sold: 1921 } );

				vehicle.bind( 'color' )
					.to( car1, 'hue', car2, 'lightness', ( ...args ) => args.join( '' ) );

				vehicle.bind( 'year' )
					.to( car1, 'produced', car2, 'sold', ( ...args ) => args.join( '/' ) );

				vehicle.bind( 'mix' )
					.to( car1, 'hue', car2, 'sold', ( ...args ) => args.join( '+' ) );

				assertBinding( vehicle,
					{
						color: car1.hue + car2.lightness,
						year: car1.produced + '/' + car2.sold,
						mix: car1.hue + '+' + car2.sold
					},
					[
						[ car1, { hue: 'greens', produced: 1930 } ],
						[ car2, { lightness: 'dark', sold: 2000 } ]
					],
					{
						color: 'greensdark',
						year: '1930/2000',
						mix: 'greens+2000'
					}
				);
			} );

			it( 'should work with callback – binding more that once #3', () => {
				const vehicle = new Car();
				const car1 = new Car( { hue: 'reds', produced: 1920 } );
				const car2 = new Car( { lightness: 'bright', sold: 1921 } );

				vehicle.bind( 'color' )
					.to( car1, 'hue', car2, 'lightness', ( ...args ) => args.join( '' ) );

				vehicle.bind( 'custom1' ).to( car1, 'hue' );

				vehicle.bind( 'year' )
					.to( car1, 'produced', car2, 'sold', ( ...args ) => args.join( '/' ) );

				vehicle.bind( 'custom2', 'custom3' ).to( car1, 'produced', 'hue' );

				assertBinding( vehicle,
					{
						color: car1.hue + car2.lightness,
						year: car1.produced + '/' + car2.sold,
						custom1: car1.hue,
						custom2: car1.produced,
						custom3: car1.hue
					},
					[
						[ car1, { hue: 'greens', produced: 1930 } ],
						[ car2, { lightness: 'dark', sold: 2000 } ]
					],
					{
						color: 'greensdark',
						year: '1930/2000',
						custom1: 'greens',
						custom2: 1930,
						custom3: 'greens'
					}
				);
			} );

			it( 'should fire a single change event per bound attribute', () => {
				const vehicle = new Car();
				const car = new Car( { color: 'red', year: 1943 } );
				const spy = sinon.spy();

				vehicle.on( 'change', spy );

				vehicle.bind( 'color', 'year' ).to( car );

				car.color = 'violet';
				car.custom = 'foo';
				car.year = 2001;

				expect( spy.args.map( args => args[ 1 ] ) )
					.to.have.members( [ 'color', 'year', 'color', 'year' ] );
			} );
		} );
	} );

	describe( 'unbind', () => {
		it( 'should throw when non-string attribute is passed', () => {
			expect( () => {
				car.unbind( new Date() );
			} ).to.throw( CKEditorError, /model-unbind-wrong-attrs/ );
		} );

		it( 'should remove all bindings', () => {
			const vehicle = new Car();

			vehicle.bind( 'color', 'year' ).to( car, 'color', 'year' );
			vehicle.unbind();

			assertBinding( vehicle,
				{ color: 'red', year: 2015 },
				[
					[ car, { color: 'blue', year: 1969 } ]
				],
				{ color: 'red', year: 2015 }
			);
		} );

		it( 'should remove bindings of certain attributes', () => {
			const vehicle = new Car();
			const car = new Car( { color: 'red', year: 2000, torque: 160 } );

			vehicle.bind( 'color', 'year', 'torque' ).to( car );
			vehicle.unbind( 'year', 'torque' );

			assertBinding( vehicle,
				{ color: 'red', year: 2000, torque: 160 },
				[
					[ car, { color: 'blue', year: 1969, torque: 220 } ]
				],
				{ color: 'blue', year: 2000, torque: 160 }
			);
		} );

		it( 'should remove bindings of certain attributes, callback', () => {
			const vehicle = new Car();
			const car1 = new Car( { color: 'red' } );
			const car2 = new Car( { color: 'blue' } );

			vehicle.bind( 'color' ).to( car1, car2, ( c1, c2 ) => c1 + c2 );
			vehicle.unbind( 'color' );

			assertBinding( vehicle,
				{ color: 'redblue' },
				[
					[ car1, { color: 'green' } ],
					[ car2, { color: 'violet' } ]
				],
				{ color: 'redblue' }
			);
		} );

		it( 'should process the internal structure and listeners correctly', () => {
			const model = new Model();

			const bound1 = new Model( { b1a: 'foo' } );
			const bound2 = new Model( { b2b: 42, 'b2c': 'bar' } );
			const bound3 = new Model( { b3d: 'baz' } );

			model.bind( 'a' ).to( bound1, 'b1a' );
			model.bind( 'b', 'c' ).to( bound2, 'b2b', 'b2c' );
			model.bind( 'd', 'e' ).to( bound3, 'b3d', 'b3d' );

			assertStructure( model,
				[ 'a', 'b', 'c', 'd', 'e' ],
				[ bound1, bound2, bound3 ],
				[
					{ b1a: [ 'a' ] },
					{ b2b: [ 'b' ], b2c: [ 'c' ] },
					{ b3d: [ 'd', 'e' ] }
				]
			);

			model.unbind( 'c', 'd' );

			assertStructure( model,
				[ 'a', 'b', 'e' ],
				[ bound1, bound2, bound3 ],
				[
					{ b1a: [ 'a' ] },
					{ b2b: [ 'b' ] },
					{ b3d: [ 'e' ] }
				]
			);

			model.unbind( 'b' );

			assertStructure( model,
				[ 'a', 'e' ],
				[ bound1, bound3 ],
				[
					{ b1a: [ 'a' ] },
					{ b3d: [ 'e' ] }
				]
			);

			model.unbind();

			assertStructure( model, [], [], [] );
		} );
	} );

	// Syntax given that model `A` is bound to models [`B`, `C`, ...]:
	//
	//		assertBinding( A,
	//			{ initial `A` attributes },
	//			[
	//				[ B, { new `B` attributes } ],
	//				[ C, { new `C` attributes } ],
	//				...
	//			],
	//			{ `A` attributes after [`B`, 'C', ...] changed }
	//		);
	//
	function assertBinding( model, stateBefore, data, stateAfter ) {
		let key, pair;

		for ( key in stateBefore ) {
			expect( model[ key ] ).to.be.equal( stateBefore[ key ] );
		}

		// Change attributes of bound models.
		for ( pair of data ) {
			for ( key in pair[ 1 ] ) {
				pair[ 0 ][ key ] = pair[ 1 ][ key ];
			}
		}

		for ( key in stateAfter ) {
			expect( model[ key ] ).to.be.equal( stateAfter[ key ] );
		}
	}

	function assertStructure( model, expectedBoundAttributes, expectedBoundModels, expectedBindings ) {
		const boundModels = [ ...model._boundModels.keys() ];

		// Check model._boundAttributes object.
		if ( expectedBoundAttributes.length ) {
			expect( model._boundAttributes ).to.have.keys( expectedBoundAttributes );
		} else {
			expect( model._boundAttributes ).to.be.empty;
		}

		// Check model._boundModels models.
		expect( boundModels ).to.have.members( expectedBoundModels );

		// Check model._listeningTo models.
		boundModels.map( boundModel => {
			expect( model._listeningTo ).to.have.ownProperty( boundModel._emitterId );
		} );

		// Check model._boundModels bindings.
		expectedBindings.forEach( ( binding, index ) => {
			const bindingKeys = Object.keys( binding );

			expect( model._boundModels.get( expectedBoundModels[ index ] ) ).to.have.keys( bindingKeys );

			bindingKeys.forEach( key => {
				const entries = [ ...model._boundModels.get( expectedBoundModels[ index ] )[ key ] ];

				expect( entries.map( e => e.attr ) ).to.have.members( binding[ key ] );
			} );
		} );
	}
} );
