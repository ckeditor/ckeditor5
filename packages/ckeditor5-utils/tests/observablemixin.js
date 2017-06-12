/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import utilsTestUtils from '../tests/_utils/utils';
import ObservableMixin from '../src/observablemixin';
import EmitterMixin from '../src/emittermixin';
import EventInfo from '../src/eventinfo';
import CKEditorError from '../src/ckeditorerror';
import mix from '../src/mix';

const assertBinding = utilsTestUtils.assertBinding;

testUtils.createSinonSandbox();

describe( 'ObservableMixin', () => {
	it( 'exists', () => {
		expect( ObservableMixin ).to.be.an( 'object' );
	} );

	it( 'mixes in EmitterMixin', () => {
		expect( ObservableMixin ).to.have.property( 'on', EmitterMixin.on );
	} );

	it( 'implements set, bind, and unbind methods', () => {
		expect( ObservableMixin ).to.contain.keys( 'set', 'bind', 'unbind' );
	} );
} );

describe( 'Observable', () => {
	class Observable {
		constructor( attrs ) {
			if ( attrs ) {
				this.set( attrs );
			}
		}
	}
	mix( Observable, ObservableMixin );

	let Car, car;

	beforeEach( () => {
		Car = class extends Observable {};

		car = new Car( {
			color: 'red',
			year: 2015
		} );
	} );

	it( 'should set attributes on creation', () => {
		expect( car ).to.have.property( 'color', 'red' );
		expect( car ).to.have.property( 'year', 2015 );
	} );

	it( 'should get correctly after set', () => {
		car.color = 'blue';

		expect( car.color ).to.equal( 'blue' );
	} );

	describe( 'set()', () => {
		it( 'should work when passing an object', () => {
			car.set( {
				color: 'blue',	// Override
				wheels: 4,
				seats: 5
			} );

			expect( car ).to.deep.equal( {
				color: 'blue',
				year: 2015,
				wheels: 4,
				seats: 5
			} );
		} );

		it( 'should work when passing a key/value pair', () => {
			car.set( 'color', 'blue' );
			car.set( 'wheels', 4 );

			expect( car ).to.deep.equal( {
				color: 'blue',
				year: 2015,
				wheels: 4
			} );
		} );

		it( 'should fire the "change" event', () => {
			const spy = sinon.spy();
			const spyColor = sinon.spy();
			const spyYear = sinon.spy();
			const spyWheels = sinon.spy();

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
			sinon.assert.calledWithExactly( spyColor, sinon.match.instanceOf( EventInfo ), 'color', 'blue', 'red' );
			sinon.assert.calledWithExactly( spyYear, sinon.match.instanceOf( EventInfo ), 'year', 2003, 2015 );
			sinon.assert.calledWithExactly(
				spyWheels, sinon.match.instanceOf( EventInfo ),
				'wheels', 4, sinon.match.typeOf( 'undefined' )
			);
		} );

		it( 'should not fire the "change" event for the same attribute value', () => {
			const spy = sinon.spy();
			const spyColor = sinon.spy();

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
			} ).to.throw( CKEditorError, /^observable-set-cannot-override/ );

			expect( car ).to.have.property( 'normalProperty', 1 );
		} );

		it( 'should throw when overriding already existing property (in the prototype)', () => {
			class Car extends Observable {
				method() {}
			}

			car = new Car();

			expect( () => {
				car.set( 'method', 2 );
			} ).to.throw( CKEditorError, /^observable-set-cannot-override/ );

			expect( car.method ).to.be.a( 'function' );
		} );

		it( 'should allow setting attributes with undefined value', () => {
			const spy = sinon.spy();

			car.on( 'change', spy );
			car.set( 'seats', undefined );

			sinon.assert.calledOnce( spy );
			expect( car ).to.contain.keys( 'seats' );
			expect( car.seats ).to.be.undefined;

			car.set( 'seats', 5 );

			sinon.assert.calledTwice( spy );
			expect( car ).to.have.property( 'seats', 5 );
		} );
	} );

	describe( 'bind()', () => {
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
			} ).to.throw( CKEditorError, /observable-bind-wrong-attrs/ );

			expect( () => {
				car.bind( new Date() );
			} ).to.throw( CKEditorError, /observable-bind-wrong-attrs/ );

			expect( () => {
				car.bind( 'color', new Date() );
			} ).to.throw( CKEditorError, /observable-bind-wrong-attrs/ );
		} );

		it( 'should throw when the same attribute is used than once', () => {
			expect( () => {
				car.bind( 'color', 'color' );
			} ).to.throw( CKEditorError, /observable-bind-duplicate-attrs/ );
		} );

		it( 'should throw when binding the same attribute more than once', () => {
			expect( () => {
				car.bind( 'color' );
				car.bind( 'color' );
			} ).to.throw( CKEditorError, /observable-bind-rebind/ );
		} );

		describe( 'to()', () => {
			it( 'should not chain', () => {
				expect(
					car.bind( 'color' ).to( new Observable( { color: 'red' } ) )
				).to.be.undefined;
			} );

			it( 'should throw when arguments are of invalid type - empty', () => {
				expect( () => {
					car = new Car();

					car.bind( 'color' ).to();
				} ).to.throw( CKEditorError, /observable-bind-to-parse-error/ );
			} );

			it( 'should throw when binding multiple attributes to multiple observables', () => {
				let vehicle = new Car();
				const car1 = new Car( { color: 'red', year: 1943 } );
				const car2 = new Car( { color: 'yellow', year: 1932 } );

				expect( () => {
					vehicle.bind( 'color', 'year' ).to( car1, 'color', car2, 'year' );
				} ).to.throw( CKEditorError, /observable-bind-to-no-callback/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year' ).to( car1, car2 );
				} ).to.throw( CKEditorError, /observable-bind-to-no-callback/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year' ).to( car1, car2, 'year' );
				} ).to.throw( CKEditorError, /observable-bind-to-no-callback/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year' ).to( car1, 'color', car2 );
				} ).to.throw( CKEditorError, /observable-bind-to-no-callback/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year', 'custom' ).to( car, car );
				} ).to.throw( CKEditorError, /observable-bind-to-no-callback/ );
			} );

			it( 'should throw when binding multiple attributes but passed a callback', () => {
				let vehicle = new Car();

				expect( () => {
					vehicle.bind( 'color', 'year' ).to( car, () => {} );
				} ).to.throw( CKEditorError, /observable-bind-to-extra-callback/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year' ).to( car, car, () => {} );
				} ).to.throw( CKEditorError, /observable-bind-to-extra-callback/ );
			} );

			it( 'should throw when binding a single attribute but multiple callbacks', () => {
				let vehicle = new Car();

				expect( () => {
					vehicle.bind( 'color' ).to( car, () => {}, () => {} );
				} ).to.throw( CKEditorError, /observable-bind-to-parse-error/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color' ).to( car, car, () => {}, () => {} );
				} ).to.throw( CKEditorError, /observable-bind-to-parse-error/ );
			} );

			it( 'should throw when a number of attributes does not match', () => {
				let vehicle = new Car();

				expect( () => {
					vehicle.bind( 'color' ).to( car, 'color', 'year' );
				} ).to.throw( CKEditorError, /observable-bind-to-attrs-length/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color', 'year' ).to( car, 'color' );
				} ).to.throw( CKEditorError, /observable-bind-to-attrs-length/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color' ).to( car, 'color', 'year', () => {} );
				} ).to.throw( CKEditorError, /observable-bind-to-attrs-length/ );

				expect( () => {
					vehicle = new Car();

					vehicle.bind( 'color' ).to( car, 'color', car, 'color', 'year', () => {} );
				} ).to.throw( CKEditorError, /observable-bind-to-attrs-length/ );
			} );

			it( 'should work when attributes don\'t exist in to() observable #1', () => {
				const vehicle = new Car();

				vehicle.bind( 'color' ).to( car, 'nonexistent in car' );

				assertBinding( vehicle,
					{ color: undefined, year: undefined },
					[
						[ car, { 'nonexistent in car': 'foo', year: 1969 } ]
					],
					{ color: 'foo', year: undefined }
				);
			} );

			it( 'should work when attributes don\'t exist in to() observable #2', () => {
				const vehicle = new Car();

				vehicle.bind( 'nonexistent in car' ).to( car );

				assertBinding( vehicle,
					{ 'nonexistent in car': undefined, year: undefined },
					[
						[ car, { 'nonexistent in car': 'foo', year: 1969 } ]
					],
					{ 'nonexistent in car': 'foo', year: undefined }
				);
			} );

			it( 'should work when attributes don\'t exist in to() observable #3', () => {
				const vehicle = new Car();

				vehicle.bind( 'year' ).to( car, 'color', car, 'nonexistent in car', ( a, b ) => a + b );

				assertBinding( vehicle,
					{ color: undefined, year: car.color + undefined },
					[
						[ car, { color: 'blue', year: 1969 } ]
					],
					{ color: undefined, year: 'blueundefined' }
				);
			} );

			it( 'should set new observable attributes', () => {
				const car = new Car( { color: 'green', year: 2001, type: 'pickup' } );
				const vehicle = new Car( { 'not involved': true } );

				vehicle.bind( 'color', 'year', 'type' ).to( car );

				expect( vehicle ).to.have.property( 'color' );
				expect( vehicle ).to.have.property( 'year' );
				expect( vehicle ).to.have.property( 'type' );
				expect( vehicle ).to.have.property( 'not involved' );
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

			it( 'should work for attributes that don\'t exist in the observable', () => {
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

			it( 'should work with callback – set a new observable attribute', () => {
				const vehicle = new Car();
				const car1 = new Car( { type: 'pickup' } );
				const car2 = new Car( { type: 'truck' } );

				vehicle.bind( 'type' )
					.to( car1, car2, ( ...args ) => args.join( '' ) );

				expect( vehicle ).to.have.property( 'type' );
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
					.to( car1, 'hue', h => h.toUpperCase() );

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

	describe( 'unbind()', () => {
		it( 'should not fail when unbinding a fresh observable', () => {
			const observable = new Observable();

			observable.unbind();
		} );

		it( 'should throw when non-string attribute is passed', () => {
			expect( () => {
				car.unbind( new Date() );
			} ).to.throw( CKEditorError, /observable-unbind-wrong-attrs/ );
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

		it( 'should be able to unbind two attributes from a single source observable attribute', () => {
			const vehicle = new Car();

			vehicle.bind( 'color' ).to( car, 'color' );
			vehicle.bind( 'interiorColor' ).to( car, 'color' );
			vehicle.unbind( 'color' );
			vehicle.unbind( 'interiorColor' );

			assertBinding( vehicle,
				{ color: 'red', interiorColor: 'red' },
				[
					[ car, { color: 'blue' } ]
				],
				{ color: 'red', interiorColor: 'red' }
			);
		} );
	} );

	describe( 'decorate()', () => {
		it( 'makes the method fire an event', () => {
			const spy = sinon.spy();

			class Foo extends Observable {
				method() {}
			}

			const foo = new Foo();

			foo.decorate( 'method' );

			foo.on( 'method', spy );

			foo.method( 1, 2 );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( [ 1, 2 ] );
		} );

		it( 'executes the original method in a listener with the default priority', () => {
			const calls = [];

			class Foo extends Observable {
				method() {
					calls.push( 'original' );
				}
			}

			const foo = new Foo();

			foo.decorate( 'method' );

			foo.on( 'method', () => calls.push( 'high' ), { priority: 'high' } );
			foo.on( 'method', () => calls.push( 'low' ), { priority: 'low' } );

			foo.method();

			expect( calls ).to.deep.equal( [ 'high', 'original', 'low' ] );
		} );

		it( 'supports overriding return values', () => {
			class Foo extends Observable {
				method() {
					return 1;
				}
			}

			const foo = new Foo();

			foo.decorate( 'method' );

			foo.on( 'method', evt => {
				expect( evt.return ).to.equal( 1 );

				evt.return = 2;
			} );

			expect( foo.method() ).to.equal( 2 );
		} );

		it( 'supports overriding arguments', () => {
			class Foo extends Observable {
				method( a ) {
					expect( a ).to.equal( 2 );
				}
			}

			const foo = new Foo();

			foo.decorate( 'method' );

			foo.on( 'method', ( evt, args ) => {
				args[ 0 ] = 2;
			}, { priority: 'high' } );

			foo.method( 1 );
		} );

		it( 'supports stopping the event (which prevents execution of the orignal method', () => {
			class Foo extends Observable {
				method() {
					throw new Error( 'this should not be executed' );
				}
			}

			const foo = new Foo();

			foo.decorate( 'method' );

			foo.on( 'method', evt => {
				evt.stop();
			}, { priority: 'high' } );

			foo.method();
		} );

		it( 'throws when trying to decorate non existing method', () => {
			class Foo extends Observable {}

			const foo = new Foo();

			expect( () => {
				foo.decorate( 'method' );
			} ).to.throw( CKEditorError, /^observablemixin-cannot-decorate-undefined:/ );
		} );
	} );
} );
