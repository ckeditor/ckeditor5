/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/observablemixin
 */

import EmitterMixin from './emittermixin';
import CKEditorError from './ckeditorerror';
import extend from './lib/lodash/extend';
import isObject from './lib/lodash/isObject';

const observablePropertiesSymbol = Symbol( 'observableProperties' );
const boundObservablesSymbol = Symbol( 'boundObservables' );
const boundPropertiesSymbol = Symbol( 'boundProperties' );

/**
 * Mixin that injects the "observable properties" and data binding functionality described in the
 * {@link ~Observable} interface.
 *
 * @mixin ObservableMixin
 * @mixes module:utils/emittermixin~EmitterMixin
 * @implements module:utils/observablemixin~Observable
 */
const ObservableMixin = {
	/**
	 * @inheritDoc
	 */
	set( name, value ) {
		// If the first parameter is an Object, iterate over its properties.
		if ( isObject( name ) ) {
			Object.keys( name ).forEach( property => {
				this.set( property, name[ property ] );
			}, this );

			return;
		}

		initObservable( this );

		const properties = this[ observablePropertiesSymbol ];

		if ( ( name in this ) && !properties.has( name ) ) {
			/**
			 * Cannot override an existing property.
			 *
			 * This error is thrown when trying to {@link ~Observable#set set} an property with
			 * a name of an already existing property. For example:
			 *
			 *		let observable = new Model();
			 *		observable.property = 1;
			 *		observable.set( 'property', 2 );			// throws
			 *
			 *		observable.set( 'property', 1 );
			 *		observable.set( 'property', 2 );			// ok, because this is an existing property.
			 *
			 * @error observable-set-cannot-override
			 */
			throw new CKEditorError( 'observable-set-cannot-override: Cannot override an existing property.' );
		}

		Object.defineProperty( this, name, {
			enumerable: true,
			configurable: true,

			get() {
				return properties.get( name );
			},

			set( value ) {
				const oldValue = properties.get( name );

				// Allow undefined as an initial value like A.define( 'x', undefined ) (#132).
				// Note: When properties map has no such own property, then its value is undefined.
				if ( oldValue !== value || !properties.has( name ) ) {
					properties.set( name, value );
					this.fire( 'change:' + name, name, value, oldValue );
				}
			}
		} );

		this[ name ] = value;
	},

	/**
	 * @inheritDoc
	 */
	bind( ...bindProperties ) {
		if ( !bindProperties.length || !isStringArray( bindProperties ) ) {
			/**
			 * All properties must be strings.
			 *
			 * @error observable-bind-wrong-properties
			 */
			throw new CKEditorError( 'observable-bind-wrong-properties: All properties must be strings.' );
		}

		if ( ( new Set( bindProperties ) ).size !== bindProperties.length ) {
			/**
			 * Properties must be unique.
			 *
			 * @error observable-bind-duplicate-properties
			 */
			throw new CKEditorError( 'observable-bind-duplicate-properties: Properties must be unique.' );
		}

		initObservable( this );

		const boundProperties = this[ boundPropertiesSymbol ];

		bindProperties.forEach( propertyName => {
			if ( boundProperties.has( propertyName ) ) {
				/**
				 * Cannot bind the same property more that once.
				 *
				 * @error observable-bind-rebind
				 */
				throw new CKEditorError( 'observable-bind-rebind: Cannot bind the same property more that once.' );
			}
		} );

		const bindings = new Map();

		// @typedef {Object} Binding
		// @property {Array} property Property which is bound.
		// @property {Array} to Array of observable–property components of the binding (`{ observable: ..., property: .. }`).
		// @property {Array} callback A function which processes `to` components.
		bindProperties.forEach( a => {
			const binding = { property: a, to: [] };

			boundProperties.set( a, binding );
			bindings.set( a, binding );
		} );

		// @typedef {Object} BindChain
		// @property {Function} to See {@link ~ObservableMixin#_bindTo}.
		// @property {Function} toMany See {@link ~ObservableMixin#_bindToMany}.
		// @property {module:utils/observablemixin~Observable} _observable The observable which initializes the binding.
		// @property {Array} _bindProperties Array of `_observable` properties to be bound.
		// @property {Array} _to Array of `to()` observable–properties (`{ observable: toObservable, properties: ...toProperties }`).
		// @property {Map} _bindings Stores bindings to be kept in
		// {@link ~ObservableMixin#_boundProperties}/{@link ~ObservableMixin#_boundObservables}
		// initiated in this binding chain.
		return {
			to: bindTo,
			toMany: bindToMany,

			_observable: this,
			_bindProperties: bindProperties,
			_to: [],
			_bindings: bindings
		};
	},

	/**
	 * @inheritDoc
	 */
	unbind( ...unbindProperties ) {
		// Nothing to do here if not inited yet.
		if ( !( observablePropertiesSymbol in this ) ) {
			return;
		}

		const boundProperties = this[ boundPropertiesSymbol ];
		const boundObservables = this[ boundObservablesSymbol ];

		if ( unbindProperties.length ) {
			if ( !isStringArray( unbindProperties ) ) {
				/**
				 * Properties must be strings.
				 *
				 * @error observable-unbind-wrong-properties
				 */
				throw new CKEditorError( 'observable-unbind-wrong-properties: Properties must be strings.' );
			}

			unbindProperties.forEach( propertyName => {
				const binding = boundProperties.get( propertyName );

				// Nothing to do if the binding is not defined
				if ( !binding ) {
					return;
				}

				let toObservable, toProperty, toProperties, toPropertyBindings;

				binding.to.forEach( to => {
					// TODO: ES6 destructuring.
					toObservable = to[ 0 ];
					toProperty = to[ 1 ];
					toProperties = boundObservables.get( toObservable );
					toPropertyBindings = toProperties[ toProperty ];

					toPropertyBindings.delete( binding );

					if ( !toPropertyBindings.size ) {
						delete toProperties[ toProperty ];
					}

					if ( !Object.keys( toProperties ).length ) {
						boundObservables.delete( toObservable );
						this.stopListening( toObservable, 'change' );
					}
				} );

				boundProperties.delete( propertyName );
			} );
		} else {
			boundObservables.forEach( ( bindings, boundObservable ) => {
				this.stopListening( boundObservable, 'change' );
			} );

			boundObservables.clear();
			boundProperties.clear();
		}
	},

	/**
	 * @inheritDoc
	 */
	decorate( methodName ) {
		const originalMethod = this[ methodName ];

		if ( !originalMethod ) {
			/**
			 * Cannot decorate an undefined method.
			 *
			 * @error observablemixin-cannot-decorate-undefined
			 * @param {Object} object The object which method should be decorated.
			 * @param {String} methodName Name of the method which does not exist.
			 */
			throw new CKEditorError(
				'observablemixin-cannot-decorate-undefined: Cannot decorate an undefined method.',
				{ object: this, methodName }
			);
		}

		this.on( methodName, ( evt, args ) => {
			evt.return = originalMethod.apply( this, args );
		} );

		this[ methodName ] = function( ...args ) {
			return this.fire( methodName, args );
		};
	}
};

extend( ObservableMixin, EmitterMixin );

export default ObservableMixin;

// Init symbol properties needed to for the observable mechanism to work.
//
// @private
// @param {module:utils/observablemixin~ObservableMixin} observable
function initObservable( observable ) {
	// Do nothing if already inited.
	if ( observablePropertiesSymbol in observable ) {
		return;
	}

	// The internal hash containing the observable's state.
	//
	// @private
	// @type {Map}
	Object.defineProperty( observable, observablePropertiesSymbol, {
		value: new Map()
	} );

	// Map containing bindings to external observables. It shares the binding objects
	// (`{ observable: A, property: 'a', to: ... }`) with {@link module:utils/observablemixin~ObservableMixin#_boundProperties} and
	// it is used to observe external observables to update own properties accordingly.
	// See {@link module:utils/observablemixin~ObservableMixin#bind}.
	//
	//		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y', 'x' );
	//		console.log( A._boundObservables );
	//
	//			Map( {
	//				B: {
	//					x: Set( [
	//						{ observable: A, property: 'a', to: [ [ B, 'x' ] ] },
	//						{ observable: A, property: 'c', to: [ [ B, 'x' ] ] }
	//					] ),
	//					y: Set( [
	//						{ observable: A, property: 'b', to: [ [ B, 'y' ] ] },
	//					] )
	//				}
	//			} )
	//
	//		A.bind( 'd' ).to( B, 'z' ).to( C, 'w' ).as( callback );
	//		console.log( A._boundObservables );
	//
	//			Map( {
	//				B: {
	//					x: Set( [
	//						{ observable: A, property: 'a', to: [ [ B, 'x' ] ] },
	//						{ observable: A, property: 'c', to: [ [ B, 'x' ] ] }
	//					] ),
	//					y: Set( [
	//						{ observable: A, property: 'b', to: [ [ B, 'y' ] ] },
	//					] ),
	//					z: Set( [
	//						{ observable: A, property: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
	//					] )
	//				},
	//				C: {
	//					w: Set( [
	//						{ observable: A, property: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
	//					] )
	//				}
	//			} )
	//
	// @private
	// @type {Map}
	Object.defineProperty( observable, boundObservablesSymbol, {
		value: new Map()
	} );

	// Object that stores which properties of this observable are bound and how. It shares
	// the binding objects (`{ observable: A, property: 'a', to: ... }`) with {@link utils.ObservableMixin#_boundObservables}.
	// This data structure is a reverse of {@link utils.ObservableMixin#_boundObservables} and it is helpful for
	// {@link utils.ObservableMixin#unbind}.
	//
	// See {@link utils.ObservableMixin#bind}.
	//
	//		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y', 'x' );
	//		console.log( A._boundProperties );
	//
	//			Map( {
	//				a: { observable: A, property: 'a', to: [ [ B, 'x' ] ] },
	//				b: { observable: A, property: 'b', to: [ [ B, 'y' ] ] },
	//				c: { observable: A, property: 'c', to: [ [ B, 'x' ] ] }
	//			} )
	//
	//		A.bind( 'd' ).to( B, 'z' ).to( C, 'w' ).as( callback );
	//		console.log( A._boundProperties );
	//
	//			Map( {
	//				a: { observable: A, property: 'a', to: [ [ B, 'x' ] ] },
	//				b: { observable: A, property: 'b', to: [ [ B, 'y' ] ] },
	//				c: { observable: A, property: 'c', to: [ [ B, 'x' ] ] },
	//				d: { observable: A, property: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
	//			} )
	//
	// @private
	// @type {Map}
	Object.defineProperty( observable, boundPropertiesSymbol, {
		value: new Map()
	} );
}

// A chaining for {@link module:utils/observablemixin~ObservableMixin#bind} providing `.to()` interface.
//
// @private
// @param {...[Observable|String|Function]} args Arguments of the `.to( args )` binding.
function bindTo( ...args ) {
	const parsedArgs = parseBindToArgs( ...args );
	const bindingsKeys = Array.from( this._bindings.keys() );
	const numberOfBindings = bindingsKeys.length;

	// Eliminate A.bind( 'x' ).to( B, C )
	if ( !parsedArgs.callback && parsedArgs.to.length > 1 ) {
		/**
		 * Binding multiple observables only possible with callback.
		 *
		 * @error observable-bind-no-callback
		 */
		throw new CKEditorError( 'observable-bind-to-no-callback: Binding multiple observables only possible with callback.' );
	}

	// Eliminate A.bind( 'x', 'y' ).to( B, callback )
	if ( numberOfBindings > 1 && parsedArgs.callback ) {
		/**
		 * Cannot bind multiple properties and use a callback in one binding.
		 *
		 * @error observable-bind-to-extra-callback
		 */
		throw new CKEditorError( 'observable-bind-to-extra-callback: Cannot bind multiple properties and use a callback in one binding.' );
	}

	parsedArgs.to.forEach( to => {
		// Eliminate A.bind( 'x', 'y' ).to( B, 'a' )
		if ( to.properties.length && to.properties.length !== numberOfBindings ) {
			/**
			 * The number of properties must match.
			 *
			 * @error observable-bind-to-properties-length
			 */
			throw new CKEditorError( 'observable-bind-to-properties-length: The number of properties must match.' );
		}

		// When no to.properties specified, observing source properties instead i.e.
		// A.bind( 'x', 'y' ).to( B ) -> Observe B.x and B.y
		if ( !to.properties.length ) {
			to.properties = this._bindProperties;
		}
	} );

	this._to = parsedArgs.to;

	// Fill {@link BindChain#_bindings} with callback. When the callback is set there's only one binding.
	if ( parsedArgs.callback ) {
		this._bindings.get( bindingsKeys[ 0 ] ).callback = parsedArgs.callback;
	}

	attachBindToListeners( this._observable, this._to );

	// Update observable._boundProperties and observable._boundObservables.
	updateBindToBound( this );

	// Set initial values of bound properties.
	this._bindProperties.forEach( propertyName => {
		updateBoundObservableProperty( this._observable, propertyName );
	} );
}

// Binds to an attribute in a set of iterable observables.
//
// @private
// @param {Array.<Observable>} observables
// @param {String} attribute
// @param {Function} callback
function bindToMany( observables, attribute, callback ) {
	if ( this._bindings.size > 1 ) {
		/**
		 * Binding one attribute to many observables only possible with one attribute.
		 *
		 * @error observable-bind-to-many-not-one-binding
		 */
		throw new CKEditorError( 'observable-bind-to-many-not-one-binding: Cannot bind multiple properties with toMany().' );
	}

	this.to(
		// Bind to #attribute of each observable...
		...getBindingTargets( observables, attribute ),
		// ...using given callback to parse attribute values.
		callback
	);
}

// Returns an array of binding components for
// {@link Observable#bind} from a set of iterable observables.
//
// @param {Array.<Observable>} observables
// @param {String} attribute
// @returns {Array.<String|Observable>}
function getBindingTargets( observables, attribute ) {
	const observableAndAttributePairs = observables.map( observable => [ observable, attribute ] );

	// Merge pairs to one-dimension array of observables and attributes.
	return Array.prototype.concat.apply( [], observableAndAttributePairs );
}

// Check if all entries of the array are of `String` type.
//
// @private
// @param {Array} arr An array to be checked.
// @returns {Boolean}
function isStringArray( arr ) {
	return arr.every( a => typeof a == 'string' );
}

// Parses and validates {@link Observable#bind}`.to( args )` arguments and returns
// an object with a parsed structure. For example
//
//		A.bind( 'x' ).to( B, 'a', C, 'b', call );
//
// becomes
//
//		{
//			to: [
//				{ observable: B, properties: [ 'a' ] },
//				{ observable: C, properties: [ 'b' ] },
//			],
//			callback: call
// 		}
//
// @private
// @param {...*} args Arguments of {@link Observable#bind}`.to( args )`.
// @returns {Object}
function parseBindToArgs( ...args ) {
	// Eliminate A.bind( 'x' ).to()
	if ( !args.length ) {
		/**
		 * Invalid argument syntax in `to()`.
		 *
		 * @error observable-bind-to-parse-error
		 */
		throw new CKEditorError( 'observable-bind-to-parse-error: Invalid argument syntax in `to()`.' );
	}

	const parsed = { to: [] };
	let lastObservable;

	if ( typeof args[ args.length - 1 ] == 'function' ) {
		parsed.callback = args.pop();
	}

	args.forEach( a => {
		if ( typeof a == 'string' ) {
			lastObservable.properties.push( a );
		} else if ( typeof a == 'object' ) {
			lastObservable = { observable: a, properties: [] };
			parsed.to.push( lastObservable );
		} else {
			throw new CKEditorError( 'observable-bind-to-parse-error: Invalid argument syntax in `to()`.' );
		}
	} );

	return parsed;
}

// Synchronizes {@link module:utils/observablemixin#_boundObservables} with {@link Binding}.
//
// @private
// @param {Binding} binding A binding to store in {@link Observable#_boundObservables}.
// @param {Observable} toObservable A observable, which is a new component of `binding`.
// @param {String} toPropertyName A name of `toObservable`'s property, a new component of the `binding`.
function updateBoundObservables( observable, binding, toObservable, toPropertyName ) {
	const boundObservables = observable[ boundObservablesSymbol ];
	const bindingsToObservable = boundObservables.get( toObservable );
	const bindings = bindingsToObservable || {};

	if ( !bindings[ toPropertyName ] ) {
		bindings[ toPropertyName ] = new Set();
	}

	// Pass the binding to a corresponding Set in `observable._boundObservables`.
	bindings[ toPropertyName ].add( binding );

	if ( !bindingsToObservable ) {
		boundObservables.set( toObservable, bindings );
	}
}

// Synchronizes {@link Observable#_boundProperties} and {@link Observable#_boundObservables}
// with {@link BindChain}.
//
// Assuming the following binding being created
//
// 		A.bind( 'a', 'b' ).to( B, 'x', 'y' );
//
// the following bindings were initialized by {@link Observable#bind} in {@link BindChain#_bindings}:
//
// 		{
// 			a: { observable: A, property: 'a', to: [] },
// 			b: { observable: A, property: 'b', to: [] },
// 		}
//
// Iterate over all bindings in this chain and fill their `to` properties with
// corresponding to( ... ) arguments (components of the binding), so
//
// 		{
// 			a: { observable: A, property: 'a', to: [ B, 'x' ] },
// 			b: { observable: A, property: 'b', to: [ B, 'y' ] },
// 		}
//
// Then update the structure of {@link Observable#_boundObservables} with updated
// binding, so it becomes:
//
// 		Map( {
// 			B: {
// 				x: Set( [
// 					{ observable: A, property: 'a', to: [ [ B, 'x' ] ] }
// 				] ),
// 				y: Set( [
// 					{ observable: A, property: 'b', to: [ [ B, 'y' ] ] },
// 				] )
//			}
// 		} )
//
// @private
// @param {BindChain} chain The binding initialized by {@link Observable#bind}.
function updateBindToBound( chain ) {
	let toProperty;

	chain._bindings.forEach( ( binding, propertyName ) => {
		// Note: For a binding without a callback, this will run only once
		// like in A.bind( 'x', 'y' ).to( B, 'a', 'b' )
		// TODO: ES6 destructuring.
		chain._to.forEach( to => {
			toProperty = to.properties[ binding.callback ? 0 : chain._bindProperties.indexOf( propertyName ) ];

			binding.to.push( [ to.observable, toProperty ] );
			updateBoundObservables( chain._observable, binding, to.observable, toProperty );
		} );
	} );
}

// Updates an property of a {@link Observable} with a value
// determined by an entry in {@link Observable#_boundProperties}.
//
// @private
// @param {Observable} observable A observable which property is to be updated.
// @param {String} propertyName An property to be updated.
function updateBoundObservableProperty( observable, propertyName ) {
	const boundProperties = observable[ boundPropertiesSymbol ];
	const binding = boundProperties.get( propertyName );
	let propertyValue;

	// When a binding with callback is created like
	//
	// 		A.bind( 'a' ).to( B, 'b', C, 'c', callback );
	//
	// collect B.b and C.c, then pass them to callback to set A.a.
	if ( binding.callback ) {
		propertyValue = binding.callback.apply( observable, binding.to.map( to => to[ 0 ][ to[ 1 ] ] ) );
	} else {
		propertyValue = binding.to[ 0 ];
		propertyValue = propertyValue[ 0 ][ propertyValue[ 1 ] ];
	}

	if ( observable.hasOwnProperty( propertyName ) ) {
		observable[ propertyName ] = propertyValue;
	} else {
		observable.set( propertyName, propertyValue );
	}
}

// Starts listening to changes in {@link BindChain._to} observables to update
// {@link BindChain._observable} {@link BindChain._bindProperties}. Also sets the
// initial state of {@link BindChain._observable}.
//
// @private
// @param {BindChain} chain The chain initialized by {@link Observable#bind}.
function attachBindToListeners( observable, toBindings ) {
	toBindings.forEach( to => {
		const boundObservables = observable[ boundObservablesSymbol ];
		let bindings;

		// If there's already a chain between the observables (`observable` listens to
		// `to.observable`), there's no need to create another `change` event listener.
		if ( !boundObservables.get( to.observable ) ) {
			observable.listenTo( to.observable, 'change', ( evt, propertyName ) => {
				bindings = boundObservables.get( to.observable )[ propertyName ];

				// Note: to.observable will fire for any property change, react
				// to changes of properties which are bound only.
				if ( bindings ) {
					bindings.forEach( binding => {
						updateBoundObservableProperty( observable, binding.property );
					} );
				}
			} );
		}
	} );
}

/**
 * Interface which adds "observable properties" and data binding functionality.
 *
 * Can be easily implemented by a class by mixing the {@link module:utils/observablemixin~ObservableMixin} mixin.
 *
 * @interface Observable
 * @extends module:utils/emittermixin~Emitter
 */

/**
 * Fired when a property changed value.
 *
 *		observable.set( 'prop', 1 );
 *
 *		observable.on( 'change:prop', ( evt, propertyName, newValue, oldValue ) => {
 *			console.log( `${ propertyName } has changed from ${ oldValue } to ${ newValue }` );
 *		} )
 *
 *		observable.prop = 2; // -> 'prop has changed from 1 to 2'
 *
 * @event change:{property}
 * @param {String} name The property name.
 * @param {*} value The new property value.
 * @param {*} oldValue The previous property value.
 */

/**
 * Creates and sets the value of an observable property of this object. Such an property becomes a part
 * of the state and is be observable.
 *
 * It accepts also a single object literal containing key/value pairs with properties to be set.
 *
 * This method throws the `observable-set-cannot-override` error if the observable instance already
 * have a property with the given property name. This prevents from mistakenly overriding existing
 * properties and methods, but means that `foo.set( 'bar', 1 )` may be slightly slower than `foo.bar = 1`.
 *
 * @method #set
 * @param {String|Object} name The property's name or object with `name=>value` pairs.
 * @param {*} [value] The property's value (if `name` was passed in the first parameter).
 */

/**
 * Binds observable properties to another objects implementing {@link module:utils/observablemixin~Observable}
 * interface (like {@link module:ui/model~Model}).
 *
 * Once bound, the observable will immediately share the current state of properties
 * of the observable it is bound to and react to the changes to these properties
 * in the future.
 *
 * **Note**: To release the binding use {@link module:utils/observablemixin~Observable#unbind}.
 *
 * Using `bind().to()` chain:
 *
 *		A.bind( 'a' ).to( B );
 *		A.bind( 'a' ).to( B, 'b' );
 *		A.bind( 'a', 'b' ).to( B, 'c', 'd' );
 *		A.bind( 'a' ).to( B, 'b', C, 'd', ( b, d ) => b + d );
 *
 * It is also possible to bind to the same property in a observables collection using `bind().toMany()` chain:
 *
 *		A.bind( 'a' ).toMany( [ B, C, D ], 'x', ( a, b, c ) => a + b + c );
 *		A.bind( 'a' ).toMany( [ B, C, D ], 'x', ( ...x ) => x.every( x => x ) );
 *
 * @method #bind
 * @param {...String} bindProperties Observable properties that will be bound to another observable(s).
 * @returns {Object} The bind chain with the `to()` and `toMany()` methods.
 */

/**
 * Removes the binding created with {@link #bind}.
 *
 *		A.unbind( 'a' );
 *		A.unbind();
 *
 * @method #unbind
 * @param {...String} [unbindProperties] Observable properties to be unbound. All the bindings will
 * be released if no properties provided.
 */

/**
 * Turns the given methods of this object into event-based ones. This means that the new method will fire an event
 * (named after the method) and the original action will be plugged as a listener to that event.
 *
 * This is a very simplified method decoration. Itself it doesn't change the behavior of a method (expect adding the event),
 * but it allows to modify it later on by listening to the method's event.
 *
 * For example, in order to cancel the method execution one can stop the event:
 *
 *		class Foo {
 *			constructor() {
 *				this.decorate( 'method' );
 *			}
 *
 *			method() {
 *				console.log( 'called!' );
 *			}
 *		}
 *
 *		const foo = new Foo();
 *		foo.on( 'method', ( evt ) => {
 *			evt.stop();
 *		}, { priority: 'high' } );
 *
 *		foo.method(); // Nothing is logged.
 *
 *
 * Note: we used a high priority listener here to execute this callback before the one which
 * calls the original method (which used the default priority).
 *
 * It's also possible to change the return value:
 *
 *		foo.on( 'method', ( evt ) => {
 *			evt.return = 'Foo!';
 *		} );
 *
 *		foo.method(); // -> 'Foo'
 *
 * Finally, it's possible to access and modify the parameters:
 *
 *		method( a, b ) {
 *			console.log( `${ a }, ${ b }`  );
 *		}
 *
 *		// ...
 *
 *		foo.on( 'method', ( evt, args ) => {
 *			args[ 0 ] = 3;
 *
 *			console.log( args[ 1 ] ); // -> 2
 *		}, { priority: 'high' } );
 *
 *		foo.method( 1, 2 ); // -> '3, 2'
 *
 * @method #decorate
 * @param {String} methodName Name of the method to decorate.
 */
