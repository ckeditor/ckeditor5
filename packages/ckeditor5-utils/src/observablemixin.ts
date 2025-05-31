/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-disable @typescript-eslint/unified-signatures */

/**
 * @module utils/observablemixin
 */

import EmitterMixin, { type Emitter } from './emittermixin.js';
import CKEditorError from './ckeditorerror.js';
import type { Constructor, Mixed } from './mix.js';

import { isObject } from 'es-toolkit/compat';

const observablePropertiesSymbol = Symbol( 'observableProperties' );
const boundObservablesSymbol = Symbol( 'boundObservables' );
const boundPropertiesSymbol = Symbol( 'boundProperties' );

const decoratedMethods = Symbol( 'decoratedMethods' );
const decoratedOriginal = Symbol( 'decoratedOriginal' );

const defaultObservableClass = /* #__PURE__ */ ObservableMixin( /* #__PURE__ */ EmitterMixin() );

/**
 * A mixin that injects the "observable properties" and data binding functionality described in the
 * {@link ~Observable} interface.
 *
 * This function creates a class that inherits from the provided `base` and implements `Observable` interface.
 *
 * ```ts
 * class BaseClass { ... }
 *
 * class MyClass extends ObservableMixin( BaseClass ) {
 * 	// This class derives from `BaseClass` and implements the `Observable` interface.
 * }
 * ```
 *
 * Read more about the concept of observables in the:
 * * {@glink framework/architecture/core-editor-architecture#event-system-and-observables Event system and observables}
 * section of the {@glink framework/architecture/core-editor-architecture Core editor architecture} guide,
 * * {@glink framework/deep-dive/observables Observables deep-dive} guide.
 *
 * @label EXTENDS
 */
export default function ObservableMixin<Base extends Constructor<Emitter>>( base: Base ): Mixed<Base, Observable>;

/**
 * A mixin that injects the "observable properties" and data binding functionality described in the
 * {@link ~Observable} interface.
 *
 * This function creates a class that implements `Observable` interface.
 *
 * ```ts
 * class MyClass extends ObservableMixin() {
 * 	// This class implements the `Observable` interface.
 * }
 * ```
 *
 * Read more about the concept of observables in the:
 * * {@glink framework/architecture/core-editor-architecture#event-system-and-observables Event system and observables}
 * section of the {@glink framework/architecture/core-editor-architecture Core editor architecture} guide,
 * * {@glink framework/deep-dive/observables Observables deep dive} guide.
 *
 * @label NO_ARGUMENTS
 */
export default function ObservableMixin(): {
	new (): Observable;
	prototype: Observable;
};

export default function ObservableMixin( base?: Constructor<Emitter> ): unknown {
	if ( !base ) {
		return defaultObservableClass;
	}

	abstract class Mixin extends base implements ObservableInternal {
		public set( name: string | { [ name: string ]: unknown }, value?: unknown ): void {
			// If the first parameter is an Object, iterate over its properties.
			if ( isObject( name ) ) {
				Object.keys( name ).forEach( property => {
					this.set( property, name[ property ] );
				}, this );

				return;
			}

			initObservable( this );

			const properties = this[ observablePropertiesSymbol ];

			if ( ( name in this ) && !properties!.has( name ) ) {
				/**
				 * Cannot override an existing property.
				 *
				 * This error is thrown when trying to {@link module:utils/observablemixin~Observable#set set} a property with
				 * a name of an already existing property. For example:
				 *
				 * ```ts
				 * let observable = new Model();
				 * observable.property = 1;
				 * observable.set( 'property', 2 );			// throws
				 *
				 * observable.set( 'property', 1 );
				 * observable.set( 'property', 2 );			// ok, because this is an existing property.
				 * ```
				 *
				 * @error observable-set-cannot-override
				 */
				throw new CKEditorError( 'observable-set-cannot-override', this );
			}

			Object.defineProperty( this, name, {
				enumerable: true,
				configurable: true,

				get() {
					return properties!.get( name );
				},

				set( this: Observable, value ) {
					const oldValue = properties!.get( name );

					// Fire `set` event before the new value will be set to make it possible
					// to override observable property without affecting `change` event.
					// See https://github.com/ckeditor/ckeditor5-utils/issues/171.
					let newValue = this.fire<ObservableSetEvent>( `set:${ name }`, name, value, oldValue );

					if ( newValue === undefined ) {
						newValue = value;
					}

					// Allow undefined as an initial value like A.define( 'x', undefined ) (#132).
					// Note: When properties map has no such own property, then its value is undefined.
					if ( oldValue !== newValue || !properties!.has( name ) ) {
						properties!.set( name, newValue );
						this.fire<ObservableChangeEvent>( `change:${ name }`, name, newValue, oldValue );
					}
				}
			} );

			( this as any )[ name ] = value;
		}

		public bind( ...bindProperties: Array<string> ): any {
			if ( !bindProperties.length || !isStringArray( bindProperties ) ) {
				/**
				 * All properties must be strings.
				 *
				 * @error observable-bind-wrong-properties
				 */
				throw new CKEditorError( 'observable-bind-wrong-properties', this );
			}

			if ( ( new Set( bindProperties ) ).size !== bindProperties.length ) {
				/**
				 * Properties must be unique.
				 *
				 * @error observable-bind-duplicate-properties
				 */
				throw new CKEditorError( 'observable-bind-duplicate-properties', this );
			}

			initObservable( this );

			const boundProperties = this[ boundPropertiesSymbol ];

			bindProperties.forEach( propertyName => {
				if ( boundProperties!.has( propertyName ) ) {
					/**
					 * Cannot bind the same property more than once.
					 *
					 * @error observable-bind-rebind
					 */
					throw new CKEditorError( 'observable-bind-rebind', this );
				}
			} );

			const bindings = new Map<string, Binding>();

			bindProperties.forEach( a => {
				const binding = { property: a, to: [] };

				boundProperties!.set( a, binding );
				bindings.set( a, binding );
			} );

			return {
				to: bindTo,
				toMany: bindToMany,

				_observable: this,
				_bindProperties: bindProperties,
				_to: [],
				_bindings: bindings
			};
		}

		public unbind( ...unbindProperties: Array<keyof this & string> ): void {
			// Nothing to do here if not inited yet.
			if ( !( this[ observablePropertiesSymbol ] ) ) {
				return;
			}

			const boundProperties = this[ boundPropertiesSymbol ]!;
			const boundObservables = this[ boundObservablesSymbol ]!;

			if ( unbindProperties.length ) {
				if ( !isStringArray( unbindProperties ) ) {
					/**
					 * Properties must be strings.
					 *
					 * @error observable-unbind-wrong-properties
					 */
					throw new CKEditorError( 'observable-unbind-wrong-properties', this );
				}

				unbindProperties.forEach( propertyName => {
					const binding = boundProperties.get( propertyName );

					// Nothing to do if the binding is not defined
					if ( !binding ) {
						return;
					}

					binding.to.forEach( ( [ toObservable, toProperty ] ) => {
						const toProperties = boundObservables.get( toObservable )!;
						const toPropertyBindings = toProperties[ toProperty ];

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
		}

		public decorate( this: this & { [ x: string ]: any }, methodName: keyof this & string ): void {
			initObservable( this );

			const originalMethod = this[ methodName ];

			if ( !originalMethod ) {
				/**
				 * Cannot decorate an undefined method.
				 *
				 * @error observablemixin-cannot-decorate-undefined
				 * @param {object} object The object which method should be decorated.
				 * @param {string} methodName Name of the method which does not exist.
				 */
				throw new CKEditorError(
					'observablemixin-cannot-decorate-undefined',
					this,
					{ object: this, methodName }
				);
			}

			this.on( methodName, ( evt, args ) => {
				evt.return = originalMethod.apply( this, args );
			} );

			this[ methodName ] = function( ...args: Array<unknown> ) {
				return this.fire( methodName, args );
			};

			this[ methodName ][ decoratedOriginal ] = originalMethod;

			if ( !this[ decoratedMethods ] ) {
				this[ decoratedMethods ] = [];
			}

			this[ decoratedMethods ]!.push( methodName );
		}

		// Override the EmitterMixin stopListening method to be able to clean (and restore) decorated methods.
		// This is needed in case of:
		//  1. Have x.foo() decorated.
		//  2. Call x.stopListening()
		//  3. Call x.foo(). Problem: nothing happens (the original foo() method is not executed)
		public override stopListening(
			this: ObservableInternal & { [ x: string ]: any },
			emitter?: Emitter,
			event?: string,
			callback?: Function
		): void {
			// Removing all listeners so let's clean the decorated methods to the original state.
			if ( !emitter && this[ decoratedMethods ] ) {
				for ( const methodName of this[ decoratedMethods ]! ) {
					this[ methodName ] = this[ methodName ][ decoratedOriginal ];
				}

				delete this[ decoratedMethods ];
			}

			super.stopListening( emitter, event, callback );
		}

		public [ observablePropertiesSymbol ]?: Map<string, unknown>;

		public [ decoratedMethods ]?: Array<string>;

		public [ boundPropertiesSymbol ]?: Map<string, Binding>;

		public [ boundObservablesSymbol ]?: Map<Observable, Record<string, Set<Binding>>>;
	}

	return Mixin;
}

interface Binding {

	/**
	 * Property which is bound.
	 */
	property: string;

	/**
	 * Array of observable–property components of the binding (`{ observable: ..., property: .. }`).
	 */
	to: Array<[ Observable, string ]>;

	/**
	 * A function which processes `to` components.
	 */
	callback?: Function;
}

interface BindChainInternal {
	to: Function;
	_observable: Observable;
	_bindings: Map<string, Binding>;
	_bindProperties: Array<string>;
	_to: Array<{
		observable: Observable;
		properties: Array<string>;
	}>;
}

// Init symbol properties needed for the observable mechanism to work.
function initObservable( observable: ObservableInternal ): void {
	// Do nothing if already inited.
	if ( observable[ observablePropertiesSymbol ] ) {
		return;
	}

	// The internal hash containing the observable's state.
	Object.defineProperty( observable, observablePropertiesSymbol, {
		value: new Map()
	} );

	// Map containing bindings to external observables. It shares the binding objects
	// (`{ observable: A, property: 'a', to: ... }`) with {@link module:utils/observablemixin~Observable#_boundProperties} and
	// it is used to observe external observables to update own properties accordingly.
	// See {@link module:utils/observablemixin~Observable#bind}.
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
	Object.defineProperty( observable, boundObservablesSymbol, {
		value: new Map()
	} );

	// Object that stores which properties of this observable are bound and how. It shares
	// the binding objects (`{ observable: A, property: 'a', to: ... }`) with
	// {@link module:utils/observablemixin~Observable#_boundObservables}. This data structure is
	// a reverse of {@link module:utils/observablemixin~Observable#_boundObservables} and it is helpful for
	// {@link module:utils/observablemixin~Observable#unbind}.
	//
	// See {@link module:utils/observablemixin~Observable#bind}.
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
	Object.defineProperty( observable, boundPropertiesSymbol, {
		value: new Map()
	} );
}

/**
 * A chaining for {@link module:utils/observablemixin~Observable#bind} providing `.to()` interface.
 *
 * @param args Arguments of the `.to( args )` binding.
 */
function bindTo( this: BindChainInternal, ...args: Array<Observable | string | Function> ): void {
	const parsedArgs = parseBindToArgs( ...args );
	const bindingsKeys = Array.from( this._bindings.keys() );
	const numberOfBindings = bindingsKeys.length;

	// Eliminate A.bind( 'x' ).to( B, C )
	if ( !parsedArgs.callback && parsedArgs.to.length > 1 ) {
		/**
		 * Binding multiple observables only possible with callback.
		 *
		 * @error observable-bind-to-no-callback
		 */
		throw new CKEditorError( 'observable-bind-to-no-callback', this );
	}

	// Eliminate A.bind( 'x', 'y' ).to( B, callback )
	if ( numberOfBindings > 1 && parsedArgs.callback ) {
		/**
		 * Cannot bind multiple properties and use a callback in one binding.
		 *
		 * @error observable-bind-to-extra-callback
		 */
		throw new CKEditorError(
			'observable-bind-to-extra-callback',
			this
		);
	}

	parsedArgs.to.forEach( to => {
		// Eliminate A.bind( 'x', 'y' ).to( B, 'a' )
		if ( to.properties.length && to.properties.length !== numberOfBindings ) {
			/**
			 * The number of properties must match.
			 *
			 * @error observable-bind-to-properties-length
			 */
			throw new CKEditorError( 'observable-bind-to-properties-length', this );
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
		this._bindings.get( bindingsKeys[ 0 ] )!.callback = parsedArgs.callback;
	}

	attachBindToListeners( this._observable, this._to );

	// Update observable._boundProperties and observable._boundObservables.
	updateBindToBound( this );

	// Set initial values of bound properties.
	this._bindProperties.forEach( propertyName => {
		updateBoundObservableProperty( this._observable, propertyName );
	} );
}

/**
 * Binds to an attribute in a set of iterable observables.
 */
function bindToMany( this: BindChainInternal, observables: Array<Observable>, attribute: string, callback: Function ): void {
	if ( this._bindings.size > 1 ) {
		/**
		 * Binding one attribute to many observables only possible with one attribute.
		 *
		 * @error observable-bind-to-many-not-one-binding
		 */
		throw new CKEditorError( 'observable-bind-to-many-not-one-binding', this );
	}

	this.to(
		// Bind to #attribute of each observable...
		...getBindingTargets( observables, attribute ),
		// ...using given callback to parse attribute values.
		callback
	);
}

/**
 * Returns an array of binding components for
 * {@link Observable#bind} from a set of iterable observables.
 */
function getBindingTargets( observables: Array<Observable>, attribute: string ): Array<Observable | string> {
	const observableAndAttributePairs = observables.map( observable => [ observable, attribute ] );

	// Merge pairs to one-dimension array of observables and attributes.
	return Array.prototype.concat.apply( [], observableAndAttributePairs );
}

/**
 * Check if all entries of the array are of `String` type.
 */
function isStringArray( arr: Array<unknown> ): arr is Array<string> {
	return arr.every( a => typeof a == 'string' );
}

/**
 * Parses and validates {@link Observable#bind}`.to( args )` arguments and returns
 * an object with a parsed structure. For example
 *
 * ```ts
 * A.bind( 'x' ).to( B, 'a', C, 'b', call );
 * ```
 *
 * becomes
 *
 * ```ts
 * {
 * 	to: [
 * 		{ observable: B, properties: [ 'a' ] },
 * 		{ observable: C, properties: [ 'b' ] },
 * 	],
 * 	callback: call
 * }
 *
 * @param args Arguments of {@link Observable#bind}`.to( args )`.
 */
function parseBindToArgs( ...args: Array<Observable | string | Function> ) {
	// Eliminate A.bind( 'x' ).to()
	if ( !args.length ) {
		/**
		 * Invalid argument syntax in `to()`.
		 *
		 * @error observable-bind-to-parse-error
		 */
		throw new CKEditorError( 'observable-bind-to-parse-error', null );
	}

	const parsed: { to: BindChainInternal[ '_to' ]; callback?: Function } = { to: [] };
	let lastObservable: { observable: Observable; properties: Array<string> };

	if ( typeof args[ args.length - 1 ] == 'function' ) {
		parsed.callback = args.pop() as Function;
	}

	args.forEach( a => {
		if ( typeof a == 'string' ) {
			lastObservable.properties.push( a );
		} else if ( typeof a == 'object' ) {
			lastObservable = { observable: a, properties: [] };
			parsed.to.push( lastObservable );
		} else {
			throw new CKEditorError( 'observable-bind-to-parse-error', null );
		}
	} );

	return parsed;
}

/**
 * Synchronizes {@link module:utils/observable#_boundObservables} with {@link Binding}.
 *
 * @param binding A binding to store in {@link Observable#_boundObservables}.
 * @param toObservable A observable, which is a new component of `binding`.
 * @param toPropertyName A name of `toObservable`'s property, a new component of the `binding`.
 */
function updateBoundObservables(
	observable: ObservableInternal,
	binding: Binding,
	toObservable: Observable,
	toPropertyName: string
): void {
	const boundObservables = observable[ boundObservablesSymbol ]!;
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

/**
 * Synchronizes {@link Observable#_boundProperties} and {@link Observable#_boundObservables}
 * with {@link BindChain}.
 *
 * Assuming the following binding being created
 *
 * ```ts
 * A.bind( 'a', 'b' ).to( B, 'x', 'y' );
 * ```
 *
 * the following bindings were initialized by {@link Observable#bind} in {@link BindChain#_bindings}:
 *
 * ```ts
 * {
 * 	a: { observable: A, property: 'a', to: [] },
 * 	b: { observable: A, property: 'b', to: [] },
 * }
 * ```
 *
 * Iterate over all bindings in this chain and fill their `to` properties with
 * corresponding to( ... ) arguments (components of the binding), so
 *
 * ```ts
 * {
 * 	a: { observable: A, property: 'a', to: [ B, 'x' ] },
 * 	b: { observable: A, property: 'b', to: [ B, 'y' ] },
 * }
 * ```
 *
 * Then update the structure of {@link Observable#_boundObservables} with updated
 * binding, so it becomes:
 *
 * ```ts
 * Map( {
 * 	B: {
 * 		x: Set( [
 * 			{ observable: A, property: 'a', to: [ [ B, 'x' ] ] }
 * 		] ),
 * 		y: Set( [
 * 			{ observable: A, property: 'b', to: [ [ B, 'y' ] ] },
 * 		] )
 * 	}
 * } )
 * ```
 *
 * @param chain The binding initialized by {@link Observable#bind}.
 */
function updateBindToBound( chain: BindChainInternal ): void {
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

/**
 * Updates an property of a {@link Observable} with a value
 * determined by an entry in {@link Observable#_boundProperties}.
 *
 * @param observable A observable which property is to be updated.
 * @param propertyName An property to be updated.
 */
function updateBoundObservableProperty( observable: ObservableInternal, propertyName: string ): void {
	const boundProperties = observable[ boundPropertiesSymbol ]!;
	const binding = boundProperties.get( propertyName )!;
	let propertyValue;

	// When a binding with callback is created like
	//
	// 		A.bind( 'a' ).to( B, 'b', C, 'c', callback );
	//
	// collect B.b and C.c, then pass them to callback to set A.a.
	if ( binding.callback ) {
		propertyValue = binding.callback.apply( observable, binding.to.map( to => ( to[ 0 ] as any )[ to[ 1 ] ] ) );
	} else {
		propertyValue = binding.to[ 0 ];
		propertyValue = ( propertyValue[ 0 ] as any )[ propertyValue[ 1 ] ];
	}

	if ( Object.prototype.hasOwnProperty.call( observable, propertyName ) ) {
		( observable as any )[ propertyName ] = propertyValue;
	} else {
		observable.set( propertyName as any, propertyValue );
	}
}

/**
 * Starts listening to changes in {@link BindChain._to} observables to update
 * {@link BindChain._observable} {@link BindChain._bindProperties}. Also sets the
 * initial state of {@link BindChain._observable}.
 *
 * @param chain The chain initialized by {@link Observable#bind}.
 */
function attachBindToListeners( observable: ObservableInternal, toBindings: BindChainInternal[ '_to' ] ): void {
	toBindings.forEach( to => {
		const boundObservables = observable[ boundObservablesSymbol ]!;
		let bindings;

		// If there's already a chain between the observables (`observable` listens to
		// `to.observable`), there's no need to create another `change` event listener.
		if ( !boundObservables.get( to.observable ) ) {
			observable.listenTo<ObservableChangeEvent>( to.observable, 'change', ( evt, propertyName ) => {
				bindings = boundObservables.get( to.observable )![ propertyName ];

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
 * An interface which adds "observable properties" and data binding functionality.
 *
 * Can be easily implemented by a class by mixing the {@link module:utils/observablemixin~Observable} mixin.
 *
 * ```ts
 * class MyClass extends ObservableMixin( OtherBaseClass ) {
 * 	// This class now implements the `Observable` interface.
 * }
 * ```
 *
 * Read more about the usage of this interface in the:
 * * {@glink framework/architecture/core-editor-architecture#event-system-and-observables Event system and observables}
 * section of the {@glink framework/architecture/core-editor-architecture Core editor architecture} guide,
 * * {@glink framework/deep-dive/observables Observables deep-dive} guide.
 */
export interface Observable extends Emitter {

	/**
	 * Creates and sets the value of an observable property of this object. Such a property becomes a part
	 * of the state and is observable.
	 *
	 * This method throws the `observable-set-cannot-override` error if the observable instance already
	 * has a property with the given property name. This prevents from mistakenly overriding existing
	 * properties and methods, but means that `foo.set( 'bar', 1 )` may be slightly slower than `foo.bar = 1`.
	 *
	 * In TypeScript, those properties should be declared in class using `declare` keyword. In example:
	 *
	 * ```ts
	 * public declare myProp: number;
	 *
	 * constructor() {
	 * 	this.set( 'myProp', 2 );
	 * }
	 * ```
	 *
	 * @label KEY_VALUE
	 * @param name The property's name.
	 * @param value The property's value.
	 */
	set<K extends keyof this & string>( name: K, value: this[ K ] ): void;

	/**
	 * Creates and sets the value of an observable properties of this object. Such a property becomes a part
	 * of the state and is observable.
	 *
	 * It accepts a single object literal containing key/value pairs with properties to be set.
	 *
	 * This method throws the `observable-set-cannot-override` error if the observable instance already
	 * has a property with the given property name. This prevents from mistakenly overriding existing
	 * properties and methods, but means that `foo.set( 'bar', 1 )` may be slightly slower than `foo.bar = 1`.
	 *
	 * In TypeScript, those properties should be declared in class using `declare` keyword. In example:
	 *
	 * ```ts
	 * public declare myProp1: number;
	 * public declare myProp2: string;
	 *
	 * constructor() {
	 * 	this.set( {
	 * 		'myProp1: 2,
	 * 		'myProp2: 'foo'
	 * 	} );
	 * }
	 * ```
	 * @label OBJECT
	 * @param values An object with `name=>value` pairs.
	 */
	set( values: object & { readonly [ K in keyof this ]?: unknown } ): void;

	/**
	 * Binds {@link #set observable properties} to other objects implementing the
	 * {@link module:utils/observablemixin~Observable} interface.
	 *
	 * Read more in the {@glink framework/deep-dive/observables#property-bindings dedicated} guide
	 * covering the topic of property bindings with some additional examples.
	 *
	 * Consider two objects: a `button` and an associated `command` (both `Observable`).
	 *
	 * A simple property binding could be as follows:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'isEnabled' );
	 * ```
	 *
	 * or even shorter:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command );
	 * ```
	 *
	 * which works in the following way:
	 *
	 * * `button.isEnabled` **instantly equals** `command.isEnabled`,
	 * * whenever `command.isEnabled` changes, `button.isEnabled` will immediately reflect its value.
	 *
	 * **Note**: To release the binding, use {@link module:utils/observablemixin~Observable#unbind}.
	 *
	 * You can also "rename" the property in the binding by specifying the new name in the `to()` chain:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'isWorking' );
	 * ```
	 *
	 * It is possible to bind more than one property at a time to shorten the code:
	 *
	 * ```ts
	 * button.bind( 'isEnabled', 'value' ).to( command );
	 * ```
	 *
	 * which corresponds to:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command );
	 * button.bind( 'value' ).to( command );
	 * ```
	 *
	 * The binding can include more than one observable, combining multiple data sources in a custom callback:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'isEnabled', ui, 'isVisible',
	 * 	( isCommandEnabled, isUIVisible ) => isCommandEnabled && isUIVisible );
	 * ```
	 *
	 * Using a custom callback allows processing the value before passing it to the target property:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'value', value => value === 'heading1' );
	 * ```
	 *
	 * It is also possible to bind to the same property in an array of observables.
	 * To bind a `button` to multiple commands (also `Observables`) so that each and every one of them
	 * must be enabled for the button to become enabled, use the following code:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).toMany( [ commandA, commandB, commandC ], 'isEnabled',
	 * 	( isAEnabled, isBEnabled, isCEnabled ) => isAEnabled && isBEnabled && isCEnabled );
	 * ```
	 *
	 * @label SINGLE_BIND
	 * @param bindProperty Observable property that will be bound to other observable(s).
	 * @returns The bind chain with the `to()` and `toMany()` methods.
	 */
	bind<K extends keyof this & string>(
		bindProperty: K
	): SingleBindChain<K, this[ K ]>;

	/**
	 * Binds {@link #set observable properties} to other objects implementing the
	 * {@link module:utils/observablemixin~Observable} interface.
	 *
	 * Read more in the {@glink framework/deep-dive/observables#property-bindings dedicated} guide
	 * covering the topic of property bindings with some additional examples.
	 *
	 * Consider two objects: a `button` and an associated `command` (both `Observable`).
	 *
	 * A simple property binding could be as follows:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'isEnabled' );
	 * ```
	 *
	 * or even shorter:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command );
	 * ```
	 *
	 * which works in the following way:
	 *
	 * * `button.isEnabled` **instantly equals** `command.isEnabled`,
	 * * whenever `command.isEnabled` changes, `button.isEnabled` will immediately reflect its value.
	 *
	 * **Note**: To release the binding, use {@link module:utils/observablemixin~Observable#unbind}.
	 *
	 * You can also "rename" the property in the binding by specifying the new name in the `to()` chain:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'isWorking' );
	 * ```
	 *
	 * It is possible to bind more than one property at a time to shorten the code:
	 *
	 * ```ts
	 * button.bind( 'isEnabled', 'value' ).to( command );
	 * ```
	 *
	 * which corresponds to:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command );
	 * button.bind( 'value' ).to( command );
	 * ```
	 *
	 * The binding can include more than one observable, combining multiple data sources in a custom callback:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'isEnabled', ui, 'isVisible',
	 * 	( isCommandEnabled, isUIVisible ) => isCommandEnabled && isUIVisible );
	 * ```
	 *
	 * Using a custom callback allows processing the value before passing it to the target property:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'value', value => value === 'heading1' );
	 * ```
	 *
	 * It is also possible to bind to the same property in an array of observables.
	 * To bind a `button` to multiple commands (also `Observables`) so that each and every one of them
	 * must be enabled for the button to become enabled, use the following code:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).toMany( [ commandA, commandB, commandC ], 'isEnabled',
	 * 	( isAEnabled, isBEnabled, isCEnabled ) => isAEnabled && isBEnabled && isCEnabled );
	 * ```
	 *
	 * @label DUAL_BIND
	 * @param bindProperty1 Observable property that will be bound to other observable(s).
	 * @param bindProperty2 Observable property that will be bound to other observable(s).
	 * @returns The bind chain with the `to()` and `toMany()` methods.
	 */
	bind<K1 extends keyof this & string, K2 extends keyof this & string>(
		bindProperty1: K1,
		bindProperty2: K2
	): DualBindChain<K1, this[ K1 ], K2, this[ K2 ]>;

	/**
	 * Binds {@link #set observable properties} to other objects implementing the
	 * {@link module:utils/observablemixin~Observable} interface.
	 *
	 * Read more in the {@glink framework/deep-dive/observables#property-bindings dedicated} guide
	 * covering the topic of property bindings with some additional examples.
	 *
	 * Consider two objects: a `button` and an associated `command` (both `Observable`).
	 *
	 * A simple property binding could be as follows:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'isEnabled' );
	 * ```
	 *
	 * or even shorter:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command );
	 * ```
	 *
	 * which works in the following way:
	 *
	 * * `button.isEnabled` **instantly equals** `command.isEnabled`,
	 * * whenever `command.isEnabled` changes, `button.isEnabled` will immediately reflect its value.
	 *
	 * **Note**: To release the binding, use {@link module:utils/observablemixin~Observable#unbind}.
	 *
	 * You can also "rename" the property in the binding by specifying the new name in the `to()` chain:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'isWorking' );
	 * ```
	 *
	 * It is possible to bind more than one property at a time to shorten the code:
	 *
	 * ```ts
	 * button.bind( 'isEnabled', 'value' ).to( command );
	 * ```
	 *
	 * which corresponds to:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command );
	 * button.bind( 'value' ).to( command );
	 * ```
	 *
	 * The binding can include more than one observable, combining multiple data sources in a custom callback:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'isEnabled', ui, 'isVisible',
	 * 	( isCommandEnabled, isUIVisible ) => isCommandEnabled && isUIVisible );
	 * ```
	 *
	 * Using a custom callback allows processing the value before passing it to the target property:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).to( command, 'value', value => value === 'heading1' );
	 * ```
	 *
	 * It is also possible to bind to the same property in an array of observables.
	 * To bind a `button` to multiple commands (also `Observables`) so that each and every one of them
	 * must be enabled for the button to become enabled, use the following code:
	 *
	 * ```ts
	 * button.bind( 'isEnabled' ).toMany( [ commandA, commandB, commandC ], 'isEnabled',
	 * 	( isAEnabled, isBEnabled, isCEnabled ) => isAEnabled && isBEnabled && isCEnabled );
	 * ```
	 *
	 * @label MANY_BIND
	 * @param bindProperties Observable properties that will be bound to other observable(s).
	 * @returns The bind chain with the `to()` and `toMany()` methods.
	 */
	bind( ...bindProperties: Array<keyof this & string> ): MultiBindChain;

	/**
	 * Removes the binding created with {@link #bind}.
	 *
	 * ```ts
	 * // Removes the binding for the 'a' property.
	 * A.unbind( 'a' );
	 *
	 * // Removes bindings for all properties.
	 * A.unbind();
	 * ```
	 *
	 * @param unbindProperties Observable properties to be unbound. All the bindings will
	 * be released if no properties are provided.
	 */
	unbind( ...unbindProperties: Array<keyof this & string> ): void;

	/**
	 * Turns the given methods of this object into event-based ones. This means that the new method will fire an event
	 * (named after the method) and the original action will be plugged as a listener to that event.
	 *
	 * Read more in the {@glink framework/deep-dive/observables#decorating-object-methods dedicated} guide
	 * covering the topic of decorating methods with some additional examples.
	 *
	 * Decorating the method does not change its behavior (it only adds an event),
	 * but it allows to modify it later on by listening to the method's event.
	 *
	 * For example, to cancel the method execution the event can be {@link module:utils/eventinfo~EventInfo#stop stopped}:
	 *
	 * ```ts
	 * class Foo extends ObservableMixin() {
	 * 	constructor() {
	 * 		super();
	 * 		this.decorate( 'method' );
	 * 	}
	 *
	 * 	method() {
	 * 		console.log( 'called!' );
	 * 	}
	 * }
	 *
	 * const foo = new Foo();
	 * foo.on( 'method', ( evt ) => {
	 * 	evt.stop();
	 * }, { priority: 'high' } );
	 *
	 * foo.method(); // Nothing is logged.
	 * ```
	 *
	 *
	 * **Note**: The high {@link module:utils/priorities~PriorityString priority} listener
	 * has been used to execute this particular callback before the one which calls the original method
	 * (which uses the "normal" priority).
	 *
	 * It is also possible to change the returned value:
	 *
	 * ```ts
	 * foo.on( 'method', ( evt ) => {
	 * 	evt.return = 'Foo!';
	 * } );
	 *
	 * foo.method(); // -> 'Foo'
	 * ```
	 *
	 * Finally, it is possible to access and modify the arguments the method is called with:
	 *
	 * ```ts
	 * method( a, b ) {
	 * 	console.log( `${ a }, ${ b }`  );
	 * }
	 *
	 * // ...
	 *
	 * foo.on( 'method', ( evt, args ) => {
	 * 	args[ 0 ] = 3;
	 *
	 * 	console.log( args[ 1 ] ); // -> 2
	 * }, { priority: 'high' } );
	 *
	 * foo.method( 1, 2 ); // -> '3, 2'
	 * ```
	 *
	 * @param methodName Name of the method to decorate.
	 */
	decorate( methodName: keyof this & string ): void;
}

interface ObservableInternal extends Observable {
	[ observablePropertiesSymbol ]?: Map<string, unknown>;

	[ decoratedMethods ]?: Array<string>;

	[ boundPropertiesSymbol ]?: Map<string, Binding>;

	[ boundObservablesSymbol]?: Map<Observable, Record<string, Set<Binding>>>;
}

/**
 * Fired when a property changed value.
 *
 * ```ts
 * observable.set( 'prop', 1 );
 *
 * observable.on<ObservableChangeEvent<number>>( 'change:prop', ( evt, propertyName, newValue, oldValue ) => {
 * 	console.log( `${ propertyName } has changed from ${ oldValue } to ${ newValue }` );
 * } );
 *
 * observable.prop = 2; // -> 'prop has changed from 1 to 2'
 * ```
 *
 * @eventName ~Observable#change:\{property\}
 * @param {String} name The property name.
 * @param {*} value The new property value.
 * @param {*} oldValue The previous property value.
 */
export type ObservableChangeEvent<TValue = any> = {
	name: 'change' | `change:${ string }`;
	args: [ name: string, value: TValue, oldValue: TValue ];
};

/**
 * Fired when a property value is going to be set but is not set yet (before the `change` event is fired).
 *
 * You can control the final value of the property by using
 * the {@link module:utils/eventinfo~EventInfo#return event's `return` property}.
 *
 * ```ts
 * observable.set( 'prop', 1 );
 *
 * observable.on<ObservableSetEvent<number>>( 'set:prop', ( evt, propertyName, newValue, oldValue ) => {
 * 	console.log( `Value is going to be changed from ${ oldValue } to ${ newValue }` );
 * 	console.log( `Current property value is ${ observable[ propertyName ] }` );
 *
 * 	// Let's override the value.
 * 	evt.return = 3;
 * } );
 *
 * observable.on<ObservableChangeEvent<number>>( 'change:prop', ( evt, propertyName, newValue, oldValue ) => {
 * 	console.log( `Value has changed from ${ oldValue } to ${ newValue }` );
 * } );
 *
 * observable.prop = 2; // -> 'Value is going to be changed from 1 to 2'
 *                      // -> 'Current property value is 1'
 *                      // -> 'Value has changed from 1 to 3'
 * ```
 *
 * **Note:** The event is fired even when the new value is the same as the old value.
 *
 * @eventName ~Observable#set:\{property\}
 * @param {String} name The property name.
 * @param {*} value The new property value.
 * @param {*} oldValue The previous property value.
 */
export type ObservableSetEvent<TValue = any> = {
	name: 'set' | `set:${ string }`;
	args: [ name: string, value: TValue, oldValue: TValue ];
	return: TValue;
};

/**
 * Utility type that creates an event describing type from decorated method.
 *
 * ```ts
 * class Foo extends ObservableMixin() {
 * 	constructor() {
 * 		super();
 * 		this.decorate( 'method' );
 * 	}
 *
 * 	method( a: number, b: number ): number {
 * 		return a + b;
 * 	}
 * }
 *
 * type FooMethodEvent = DecoratedMethodEvent<Foo, 'method'>;
 *
 * const foo = new Foo();
 *
 * foo.on<FooMethodEvent>( 'method', ( evt, [ a, b ] ) => {
 * 	// `a` and `b` are inferred as numbers.
 * } )
 * ```
 */
export type DecoratedMethodEvent<
	TObservable extends Observable & { [ N in TName ]: ( ...args: Array<any> ) => any },
	TName extends keyof TObservable & string
> = {
	name: TName;
	args: [ Parameters<TObservable[ TName ]> ];
	return: ReturnType<TObservable[ TName ]>;
};

interface SingleBindChain<TKey extends string, TVal> {
	toMany<O extends Observable, K extends keyof O>(
		observables: ReadonlyArray<O>,
		key: K,
		callback: ( ...values: Array<O[ K ]> ) => TVal
	): void;

	to<O extends ObservableWithProperty<TKey, TVal>>(
		observable: O
	): void;
	to<O extends ObservableWithProperty<TKey>>(
		observable: O,
		callback: ( value: O[ TKey ] ) => TVal
	): void;
	to<O extends ObservableWithProperty<K, TVal>, K extends keyof O>(
		observable: O,
		key: K
	): void;
	to<O extends Observable, K extends keyof O>(
		observable: O,
		key: K,
		callback: ( value: O[ K ] ) => TVal,
	): void;
	to<
		O1 extends ObservableWithProperty<TKey>,
		O2 extends ObservableWithProperty<TKey>
	>(
		observable1: O1,
		observable2: O2,
		callback: ( value1: O1[ TKey ], value2: O2[ TKey ] ) => TVal
	): void;
	to<
		O1 extends Observable,
		K1 extends keyof O1,
		O2 extends Observable,
		K2 extends keyof O2
	>(
		observable1: O1,
		key1: K1,
		observable2: O2,
		key2: K2,
		callback: ( value1: O1[ K1 ], value2: O2[ K2 ] ) => TVal
	): void;
	to<
		O1 extends ObservableWithProperty<TKey>,
		O2 extends ObservableWithProperty<TKey>,
		O3 extends ObservableWithProperty<TKey>
	>(
		observable1: O1,
		observable2: O2,
		observable3: O3,
		callback: ( value1: O1[ TKey ], value2: O2[ TKey ], value3: O3[ TKey ] ) => TVal
	): void;
	to<
		O1 extends Observable,
		K1 extends keyof O1,
		O2 extends Observable,
		K2 extends keyof O2,
		O3 extends Observable,
		K3 extends keyof O3
	>(
		observable1: O1,
		key1: K1,
		observable2: O2,
		key2: K2,
		observable3: O3,
		key3: K3,
		callback: ( value1: O1[ K1 ], value2: O2[ K2 ], value3: O3[ K3 ] ) => TVal
	): void;
	to<
		O1 extends ObservableWithProperty<TKey>,
		O2 extends ObservableWithProperty<TKey>,
		O3 extends ObservableWithProperty<TKey>,
		O4 extends ObservableWithProperty<TKey>
	>(
		observable1: O1,
		observable2: O2,
		observable3: O3,
		observable4: O4,
		callback: ( value1: O1[ TKey ], value2: O2[ TKey ], value3: O3[ TKey ], value4: O4[ TKey ] ) => TVal
	): void;
	to<
		O1 extends Observable,
		K1 extends keyof O1,
		O2 extends Observable,
		K2 extends keyof O2,
		O3 extends Observable,
		K3 extends keyof O3,
		O4 extends Observable,
		K4 extends keyof O4
	>(
		observable1: O1,
		key1: K1,
		observable2: O2,
		key2: K2,
		observable3: O3,
		key3: K3,
		observable4: O4,
		key4: K4,
		callback: ( value1: O1[ K1 ], value2: O2[ K2 ], value3: O3[ K3 ], value4: O4[ K4 ] ) => TVal
	): void;
	to<
		O1 extends ObservableWithProperty<TKey>,
		O2 extends ObservableWithProperty<TKey>,
		O3 extends ObservableWithProperty<TKey>,
		O4 extends ObservableWithProperty<TKey>,
		O5 extends ObservableWithProperty<TKey>
	>(
		observable1: O1,
		observable2: O2,
		observable3: O3,
		observable4: O4,
		observable5: O5,
		callback: ( value1: O1[ TKey ], value2: O2[ TKey ], value3: O3[ TKey ], value4: O4[ TKey ], value5: O5[ TKey ] ) => TVal
	): void;
	to<
		O1 extends Observable,
		K1 extends keyof O1,
		O2 extends Observable,
		K2 extends keyof O2,
		O3 extends Observable,
		K3 extends keyof O3,
		O4 extends Observable,
		K4 extends keyof O4,
		O5 extends Observable,
		K5 extends keyof O5
	>(
		observable1: O1,
		key1: K1,
		observable2: O2,
		key2: K2,
		observable3: O3,
		key3: K3,
		observable4: O4,
		key4: K4,
		observable5: O5,
		key5: K5,
		callback: ( value1: O1[ K1 ], value2: O2[ K2 ], value3: O3[ K3 ], value4: O4[ K4 ], value5: O5[ K5 ] ) => TVal
	): void;
}

/**
 * A helper type that can be used as a constraint, ensuring the type is both observable and have the given property.
 *
 * ```ts
 * // Ensures that `obj` is `Observable` and have property named 'abc'.
 * function f<O extends ObservableWithProperty<'abc'>>( obj: O ) {}
 *
 * // Ensures that `obj` is `Observable` and have property named 'abc' with value `number`.
 * function f<O extends ObservableWithProperty<'abc', number>>( obj: O ) {}
 * ```
 */
export type ObservableWithProperty<TKey extends PropertyKey, TVal = any> = undefined extends TVal ?
	Observable & { [ P in TKey ]?: TVal } :
	Observable & { [ P in TKey ]: TVal };

interface DualBindChain<TKey1 extends string, TVal1, TKey2 extends string, TVal2> {
	to<
		O extends ObservableWithProperty<K1, TVal1> & ObservableWithProperty<K2, TVal2>,
		K1 extends keyof O,
		K2 extends keyof O
	>(
		observable: O,
		key1: K1,
		key2: K2
	): void;

	to<
		O extends ObservableWithProperty<TKey1, TVal1> & ObservableWithProperty<TKey2, TVal2>
	>(
		observable: O
	): void;
}

interface MultiBindChain {
	to<O extends Observable>( observable: O, ...properties: Array<keyof O> ): void;
}
