/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/observablemixin
 */

import EmitterMixin from './emittermixin';
import CKEditorError from './ckeditorerror';
import extend from './lib/lodash/extend';
import isObject from './lib/lodash/isObject';

const attributesSymbol = Symbol( 'attributes' );
const boundObservablesSymbol = Symbol( 'boundObservables' );
const boundAttributesSymbol = Symbol( 'boundAttributes' );

/**
 * Mixin that injects the "observable attributes" and data binding functionality.
 * Used mainly in the {@link module:ui/model~Model} class.
 *
 * @mixin ObservableMixin
 * @mixes module:utils/emittermixin~EmitterMixin
 * @implements module:utils/observablemixin~Observable
 */
const ObservableMixin = {
	/**
	 * Creates and sets the value of an observable attribute of this object. Such an attribute becomes a part
	 * of the state and is be observable.
	 *
	 * It accepts also a single object literal containing key/value pairs with attributes to be set.
	 *
	 * This method throws the observable-set-cannot-override error if the observable instance already
	 * have a property with a given attribute name. This prevents from mistakenly overriding existing
	 * properties and methods, but means that `foo.set( 'bar', 1 )` may be slightly slower than `foo.bar = 1`.
	 *
	 * @method #set
	 * @param {String} name The attributes name.
	 * @param {*} value The attributes value.
	 */
	set( name, value ) {
		// If the first parameter is an Object, iterate over its properties.
		if ( isObject( name ) ) {
			Object.keys( name ).forEach( attr => {
				this.set( attr, name[ attr ] );
			}, this );

			return;
		}

		initObservable( this );

		const attributes = this[ attributesSymbol ];

		if ( ( name in this ) && !attributes.has( name ) ) {
			/**
			 * Cannot override an existing property.
			 *
			 * This error is thrown when trying to {@link ~Observable#set set} an attribute with
			 * a name of an already existing property. For example:
			 *
			 *		let observable = new Model();
			 *		observable.property = 1;
			 *		observable.set( 'property', 2 );		// throws
			 *
			 *		observable.set( 'attr', 1 );
			 *		observable.set( 'attr', 2 );			// ok, because this is an existing attribute.
			 *
			 * @error observable-set-cannot-override
			 */
			throw new CKEditorError( 'observable-set-cannot-override: Cannot override an existing property.' );
		}

		Object.defineProperty( this, name, {
			enumerable: true,
			configurable: true,

			get() {
				return attributes.get( name );
			},

			set( value ) {
				const oldValue = attributes.get( name );

				// Allow undefined as an initial value like A.define( 'x', undefined ) (#132).
				// Note: When attributes map has no such own property, then its value is undefined.
				if ( oldValue !== value || !attributes.has( name ) ) {
					attributes.set( name, value );
					this.fire( 'change:' + name, name, value, oldValue );
				}
			}
		} );

		this[ name ] = value;
	},

	/**
	 * Binds observable attributes to another objects implementing {@link ~ObservableMixin}
	 * interface (like {@link module:ui/model~Model}).
	 *
	 * Once bound, the observable will immediately share the current state of attributes
	 * of the observable it is bound to and react to the changes to these attributes
	 * in the future.
	 *
	 * **Note**: To release the binding use {@link module:utils/observablemixin~ObservableMixin#unbind}.
	 *
	 *		A.bind( 'a' ).to( B );
	 *		A.bind( 'a' ).to( B, 'b' );
	 *		A.bind( 'a', 'b' ).to( B, 'c', 'd' );
	 *		A.bind( 'a' ).to( B, 'b', C, 'd', ( b, d ) => b + d );
	 *
	 * @method #bind
	 * @param {...String} bindAttrs Observable attributes that will be bound to another observable(s).
	 * @returns {module:utils/observablemixin~BindChain}
	 */
	bind( ...bindAttrs ) {
		if ( !bindAttrs.length || !isStringArray( bindAttrs ) ) {
			/**
			 * All attributes must be strings.
			 *
			 * @error observable-bind-wrong-attrs
			 */
			throw new CKEditorError( 'observable-bind-wrong-attrs: All attributes must be strings.' );
		}

		if ( ( new Set( bindAttrs ) ).size !== bindAttrs.length ) {
			/**
			 * Attributes must be unique.
			 *
			 * @error observable-bind-duplicate-attrs
			 */
			throw new CKEditorError( 'observable-bind-duplicate-attrs: Attributes must be unique.' );
		}

		initObservable( this );

		const boundAttributes = this[ boundAttributesSymbol ];

		bindAttrs.forEach( attrName => {
			if ( boundAttributes.has( attrName ) ) {
				/**
				 * Cannot bind the same attribute more that once.
				 *
				 * @error observable-bind-rebind
				 */
				throw new CKEditorError( 'observable-bind-rebind: Cannot bind the same attribute more that once.' );
			}
		} );

		const bindings = new Map();

		/**
		 * @typedef Binding
		 * @type Object
		 * @property {Array} attr Attribute which is bound.
		 * @property {Array} to Array of observable–attribute components of the binding (`{ observable: ..., attr: .. }`).
		 * @property {Array} callback A function which processes `to` components.
		 */
		bindAttrs.forEach( a => {
			const binding = { attr: a, to: [] };

			boundAttributes.set( a, binding );
			bindings.set( a, binding );
		} );

		/**
		 * @typedef BindChain
		 * @type Object
		 * @property {Function} to See {@link ~ObservableMixin#_bindTo}.
		 * @property {module:utils/observablemixin~Observable} _observable The observable which initializes the binding.
		 * @property {Array} _bindAttrs Array of `_observable` attributes to be bound.
		 * @property {Array} _to Array of `to()` observable–attributes (`{ observable: toObservable, attrs: ...toAttrs }`).
		 * @property {Map} _bindings Stores bindings to be kept in
		 *  {@link ~ObservableMixin#_boundAttributes}/{@link ~ObservableMixin#_boundObservables}
		 * initiated in this binding chain.
		 */
		return {
			to: bindTo,

			_observable: this,
			_bindAttrs: bindAttrs,
			_to: [],
			_bindings: bindings
		};
	},

	/**
	 * Removes the binding created with {@link ~ObservableMixin#bind}.
	 *
	 *		A.unbind( 'a' );
	 *		A.unbind();
	 *
	 * @method #unbind
	 * @param {...String} [unbindAttrs] Observable attributes to be unbound. All the bindings will
	 * be released if no attributes provided.
	 */
	unbind( ...unbindAttrs ) {
		// Nothing to do here if not inited yet.
		if ( !( attributesSymbol in this ) ) {
			return;
		}

		const boundAttributes = this[ boundAttributesSymbol ];
		const boundObservables = this[ boundObservablesSymbol ];

		if ( unbindAttrs.length ) {
			if ( !isStringArray( unbindAttrs ) ) {
				/**
				 * Attributes must be strings.
				 *
				 * @error observable-unbind-wrong-attrs
				 */
				throw new CKEditorError( 'observable-unbind-wrong-attrs: Attributes must be strings.' );
			}

			unbindAttrs.forEach( attrName => {
				const binding = boundAttributes.get( attrName );
				let toObservable, toAttr, toAttrs, toAttrBindings;

				binding.to.forEach( to => {
					// TODO: ES6 destructuring.
					toObservable = to[ 0 ];
					toAttr = to[ 1 ];
					toAttrs = boundObservables.get( toObservable );
					toAttrBindings = toAttrs[ toAttr ];

					toAttrBindings.delete( binding );

					if ( !toAttrBindings.size ) {
						delete toAttrs[ toAttr ];
					}

					if ( !Object.keys( toAttrs ).length ) {
						boundObservables.delete( toObservable );
						this.stopListening( toObservable, 'change' );
					}
				} );

				boundAttributes.delete( attrName );
			} );
		} else {
			boundObservables.forEach( ( bindings, boundObservable ) => {
				this.stopListening( boundObservable, 'change' );
			} );

			boundObservables.clear();
			boundAttributes.clear();
		}
	},

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
	 * calls the orignal method (which used the default priority).
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

	/**
	 * @private
	 * @member ~ObservableMixin#_boundAttributes
	 */

	/**
	 * @private
	 * @member ~ObservableMixin#_boundObservables
	 */

	/**
	 * @private
	 * @member ~ObservableMixin#_bindTo
	 */
};

export default ObservableMixin;

// Init symbol properties needed to for the observable mechanism to work.
//
// @private
// @param {module:utils/observablemixin~ObservableMixin} observable
function initObservable( observable ) {
	// Do nothing if already inited.
	if ( attributesSymbol in observable ) {
		return;
	}

	// The internal hash containing the observable's state.
	//
	// @private
	// @type {Map}
	Object.defineProperty( observable, attributesSymbol, {
		value: new Map()
	} );

	// Map containing bindings to external observables. It shares the binding objects
	// (`{ observable: A, attr: 'a', to: ... }`) with {@link module:utils/observablemixin~ObservableMixin#_boundAttributes} and
	// it is used to observe external observables to update own attributes accordingly.
	// See {@link module:utils/observablemixin~ObservableMixin#bind}.
	//
	//		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y', 'x' );
	//		console.log( A._boundObservables );
	//
	//			Map( {
	//				B: {
	//					x: Set( [
	//						{ observable: A, attr: 'a', to: [ [ B, 'x' ] ] },
	//						{ observable: A, attr: 'c', to: [ [ B, 'x' ] ] }
	//					] ),
	//					y: Set( [
	//						{ observable: A, attr: 'b', to: [ [ B, 'y' ] ] },
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
	//						{ observable: A, attr: 'a', to: [ [ B, 'x' ] ] },
	//						{ observable: A, attr: 'c', to: [ [ B, 'x' ] ] }
	//					] ),
	//					y: Set( [
	//						{ observable: A, attr: 'b', to: [ [ B, 'y' ] ] },
	//					] ),
	//					z: Set( [
	//						{ observable: A, attr: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
	//					] )
	//				},
	//				C: {
	//					w: Set( [
	//						{ observable: A, attr: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
	//					] )
	//				}
	//			} )
	//
	// @private
	// @type {Map}
	Object.defineProperty( observable, boundObservablesSymbol, {
		value: new Map()
	} );

	// Object that stores which attributes of this observable are bound and how. It shares
	// the binding objects (`{ observable: A, attr: 'a', to: ... }`) with {@link utils.ObservableMixin#_boundObservables}.
	// This data structure is a reverse of {@link utils.ObservableMixin#_boundObservables} and it is helpful for
	// {@link utils.ObservableMixin#unbind}.
	//
	// See {@link utils.ObservableMixin#bind}.
	//
	//		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y', 'x' );
	//		console.log( A._boundAttributes );
	//
	//			Map( {
	//				a: { observable: A, attr: 'a', to: [ [ B, 'x' ] ] },
	//				b: { observable: A, attr: 'b', to: [ [ B, 'y' ] ] },
	//				c: { observable: A, attr: 'c', to: [ [ B, 'x' ] ] }
	//			} )
	//
	//		A.bind( 'd' ).to( B, 'z' ).to( C, 'w' ).as( callback );
	//		console.log( A._boundAttributes );
	//
	//			Map( {
	//				a: { observable: A, attr: 'a', to: [ [ B, 'x' ] ] },
	//				b: { observable: A, attr: 'b', to: [ [ B, 'y' ] ] },
	//				c: { observable: A, attr: 'c', to: [ [ B, 'x' ] ] },
	//				d: { observable: A, attr: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
	//			} )
	//
	// @private
	// @type {Map}
	Object.defineProperty( observable, boundAttributesSymbol, {
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
		 * Cannot bind multiple attributes and use a callback in one binding.
		 *
		 * @error observable-bind-to-extra-callback
		 */
		throw new CKEditorError( 'observable-bind-to-extra-callback: Cannot bind multiple attributes and use a callback in one binding.' );
	}

	parsedArgs.to.forEach( to => {
		// Eliminate A.bind( 'x', 'y' ).to( B, 'a' )
		if ( to.attrs.length && to.attrs.length !== numberOfBindings ) {
			/**
			 * The number of attributes must match.
			 *
			 * @error observable-bind-to-attrs-length
			 */
			throw new CKEditorError( 'observable-bind-to-attrs-length: The number of attributes must match.' );
		}

		// When no to.attrs specified, observing source attributes instead i.e.
		// A.bind( 'x', 'y' ).to( B ) -> Observe B.x and B.y
		if ( !to.attrs.length ) {
			to.attrs = this._bindAttrs;
		}
	} );

	this._to = parsedArgs.to;

	// Fill {@link BindChain#_bindings} with callback. When the callback is set there's only one binding.
	if ( parsedArgs.callback ) {
		this._bindings.get( bindingsKeys[ 0 ] ).callback = parsedArgs.callback;
	}

	attachBindToListeners( this._observable, this._to );

	// Update observable._boundAttributes and observable._boundObservables.
	updateBindToBound( this );

	// Set initial values of bound attributes.
	this._bindAttrs.forEach( attrName => {
		updateBoundObservableAttr( this._observable, attrName );
	} );
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
//				{ observable: B, attrs: [ 'a' ] },
//				{ observable: C, attrs: [ 'b' ] },
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
			lastObservable.attrs.push( a );
		} else if ( typeof a == 'object' ) {
			lastObservable = { observable: a, attrs: [] };
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
// @param {String} toAttrName A name of `toObservable`'s attribute, a new component of the `binding`.
function updateBoundObservables( observable, binding, toObservable, toAttrName ) {
	const boundObservables = observable[ boundObservablesSymbol ];
	const bindingsToObservable = boundObservables.get( toObservable );
	const bindings = bindingsToObservable || {};

	if ( !bindings[ toAttrName ] ) {
		bindings[ toAttrName ] = new Set();
	}

	// Pass the binding to a corresponding Set in `observable._boundObservables`.
	bindings[ toAttrName ].add( binding );

	if ( !bindingsToObservable ) {
		boundObservables.set( toObservable, bindings );
	}
}

// Synchronizes {@link Observable#_boundAttributes} and {@link Observable#_boundObservables}
// with {@link BindChain}.
//
// Assuming the following binding being created
//
// 		A.bind( 'a', 'b' ).to( B, 'x', 'y' );
//
// the following bindings were initialized by {@link Observable#bind} in {@link BindChain#_bindings}:
//
// 		{
// 			a: { observable: A, attr: 'a', to: [] },
// 			b: { observable: A, attr: 'b', to: [] },
// 		}
//
// Iterate over all bindings in this chain and fill their `to` properties with
// corresponding to( ... ) arguments (components of the binding), so
//
// 		{
// 			a: { observable: A, attr: 'a', to: [ B, 'x' ] },
// 			b: { observable: A, attr: 'b', to: [ B, 'y' ] },
// 		}
//
// Then update the structure of {@link Observable#_boundObservables} with updated
// binding, so it becomes:
//
// 		Map( {
// 			B: {
// 				x: Set( [
// 					{ observable: A, attr: 'a', to: [ [ B, 'x' ] ] }
// 				] ),
// 				y: Set( [
// 					{ observable: A, attr: 'b', to: [ [ B, 'y' ] ] },
// 				] )
//			}
// 		} )
//
// @private
// @param {BindChain} chain The binding initialized by {@link Observable#bind}.
function updateBindToBound( chain ) {
	let toAttr;

	chain._bindings.forEach( ( binding, attrName ) => {
		// Note: For a binding without a callback, this will run only once
		// like in A.bind( 'x', 'y' ).to( B, 'a', 'b' )
		// TODO: ES6 destructuring.
		chain._to.forEach( to => {
			toAttr = to.attrs[ binding.callback ? 0 : chain._bindAttrs.indexOf( attrName ) ];

			binding.to.push( [ to.observable, toAttr ] );
			updateBoundObservables( chain._observable, binding, to.observable, toAttr );
		} );
	} );
}

// Updates an attribute of a {@link Observable} with a value
// determined by an entry in {@link Observable#_boundAttributes}.
//
// @private
// @param {Observable} observable A observable which attribute is to be updated.
// @param {String} attrName An attribute to be updated.
function updateBoundObservableAttr( observable, attrName ) {
	const boundAttributes = observable[ boundAttributesSymbol ];
	const binding = boundAttributes.get( attrName );
	let attrValue;

	// When a binding with callback is created like
	//
	// 		A.bind( 'a' ).to( B, 'b', C, 'c', callback );
	//
	// collect B.b and C.c, then pass them to callback to set A.a.
	if ( binding.callback ) {
		attrValue = binding.callback.apply( observable, binding.to.map( to => to[ 0 ][ to[ 1 ] ] ) );
	} else {
		attrValue = binding.to[ 0 ];
		attrValue = attrValue[ 0 ][ attrValue[ 1 ] ];
	}

	if ( observable.hasOwnProperty( attrName ) ) {
		observable[ attrName ] = attrValue;
	} else {
		observable.set( attrName, attrValue );
	}
}

// Starts listening to changes in {@link BindChain._to} observables to update
// {@link BindChain._observable} {@link BindChain._bindAttrs}. Also sets the
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
			observable.listenTo( to.observable, 'change', ( evt, attrName ) => {
				bindings = boundObservables.get( to.observable )[ attrName ];

				// Note: to.observable will fire for any attribute change, react
				// to changes of attributes which are bound only.
				if ( bindings ) {
					bindings.forEach( binding => {
						updateBoundObservableAttr( observable, binding.attr );
					} );
				}
			} );
		}
	} );
}

extend( ObservableMixin, EmitterMixin );

/**
 * Fired when an attribute changed value.
 *
 * @event module:utils/observablemixin~ObservableMixin#change:{attribute}
 * @param {String} name The attribute name.
 * @param {*} value The new attribute value.
 * @param {*} oldValue The previous attribute value.
 */

/**
 * Interface representing classes which mix in {@link module:utils/observablemixin~ObservableMixin}.
 *
 * @interface Observable
 */
