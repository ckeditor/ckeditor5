/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EmitterMixin from './emittermixin.js';
import CKEditorError from './ckeditorerror.js';
import utilsObject from './lib/lodash/object.js';
import utilsLang from './lib/lodash/lang.js';

/**
 * The base MVC model class.
 *
 * @class Model
 * @mixins EventEmitter
 */

export default class Model {
	/**
	 * Creates a new Model instance.
	 *
	 * @param {Object} [attributes] The model state attributes to be set during the instance creation.
	 * @param {Object} [properties] The properties to be appended to the instance during creation.
	 * @method constructor
	 */
	constructor( attributes, properties ) {
		/**
		 * The internal hash containing the model's state.
		 *
		 * @property _attributes
		 * @private
		 */
		this._attributes = {};

		/**
		 * Map containing bindings to external models. It shares the binding objects
		 * (`{ model: A, attr: 'a', to: ... }`) with {@link #_boundAttributes} and
		 * it is used to observe external models to update own attributes accordingly.
		 * See {@link #bind}.
		 *
		 *		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y', 'x' );
		 *		console.log( A._boundModels );
		 *
		 *			Map( {
		 *				B: {
		 *					x: Set( [
		 *						{ model: A, attr: 'a', to: [ [ B, 'x' ] ] },
		 *						{ model: A, attr: 'c', to: [ [ B, 'x' ] ] }
		 *					] ),
		 *					y: Set( [
		 *						{ model: A, attr: 'b', to: [ [ B, 'y' ] ] },
		 *					] )
		 *				}
		 *			} )
		 *
		 *		A.bind( 'd' ).to( B, 'z' ).to( C, 'w' ).as( callback );
		 *		console.log( A._boundModels );
		 *
		 *			Map( {
		 *				B: {
		 *					x: Set( [
		 *						{ model: A, attr: 'a', to: [ [ B, 'x' ] ] },
		 *						{ model: A, attr: 'c', to: [ [ B, 'x' ] ] }
		 *					] ),
		 *					y: Set( [
		 *						{ model: A, attr: 'b', to: [ [ B, 'y' ] ] },
		 *					] ),
		 *					z: Set( [
		 *						{ model: A, attr: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
		 *					] )
		 *				},
		 *				C: {
		 *					w: Set( [
		 *						{ model: A, attr: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
		 *					] )
		 *				}
		 *			} )
		 *
		 * @private
		 * @property {Map}
		 */
		this._boundModels = new Map();

		/**
		 * Object that stores which attributes of this model are bound and how. It shares
		 * the binding objects (`{ model: A, attr: 'a', to: ... }`) with {@link #_boundModels}.
		 * This data structure is a reverse of {@link #_boundModels} and it is helpful for {@link #unbind}.
		 * See {@link #bind}.
		 *
		 *		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y', 'x' );
		 *		console.log( A._boundAttributes );
		 *
		 *			{
		 *				a: { model: A, attr: 'a', to: [ [ B, 'x' ] ] },
		 *				b: { model: A, attr: 'b', to: [ [ B, 'y' ] ] },
		 *				c: { model: A, attr: 'c', to: [ [ B, 'x' ] ] }
		 *			}
		 *
		 *		A.bind( 'd' ).to( B, 'z' ).to( C, 'w' ).as( callback );
		 *		console.log( A._boundAttributes );
		 *
		 *			{
		 *				a: { model: A, attr: 'a', to: [ [ B, 'x' ] ] },
		 *				b: { model: A, attr: 'b', to: [ [ B, 'y' ] ] },
		 *				c: { model: A, attr: 'c', to: [ [ B, 'x' ] ] },
		 *				d: { model: A, attr: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
		 *			}
		 *
		 * @private
		 * @property {Object}
		 */
		this._boundAttributes = {};

		// Extend this instance with the additional (out of state) properties.
		if ( properties ) {
			utilsObject.extend( this, properties );
		}

		// Initialize the attributes.
		if ( attributes ) {
			this.set( attributes );
		}
	}

	/**
	 * Creates and sets the value of a model attribute of this object. This attribute will be part of the model
	 * state and will be observable.
	 *
	 * It accepts also a single object literal containing key/value pairs with attributes to be set.
	 *
	 * This method throws the {@link model-set-cannot-override} error if the model instance already
	 * have a property with a given attribute name. This prevents from mistakenly overriding existing
	 * properties and methods, but means that `foo.set( 'bar', 1 )` may be slightly slower than `foo.bar = 1`.
	 *
	 * @param {String} name The attributes name.
	 * @param {*} value The attributes value.
	 */
	set( name, value ) {
		// If the first parameter is an Object, we gonna interact through its properties.
		if ( utilsLang.isObject( name ) ) {
			Object.keys( name ).forEach( ( attr ) => {
				this.set( attr, name[ attr ] );
			}, this );

			return;
		}

		if ( ( name in this ) && !( name in this._attributes ) ) {
			/**
			 * Cannot override an existing property.
			 *
			 * This error is thrown when trying to {@link Model#set set} an attribute with
			 * a name of an already existing property. For example:
			 *
			 *		let model = new Model();
			 *		model.property = 1;
			 *		model.set( 'property', 2 );		// throws
			 *
			 *		model.set( 'attr', 1 );
			 *		model.set( 'attr', 2 );			// ok, because this is an existing attribute.
			 *
			 * @error model-set-cannot-override
			 */
			throw new CKEditorError( 'model-set-cannot-override: Cannot override an existing property.' );
		}

		Object.defineProperty( this, name, {
			enumerable: true,
			configurable: true,

			get: () => {
				return this._attributes[ name ];
			},

			set: ( value ) => {
				const oldValue = this._attributes[ name ];

				if ( oldValue !== value ) {
					this._attributes[ name ] = value;
					this.fire( 'change', name, value, oldValue );
					this.fire( 'change:' + name, value, oldValue );
				}
			}
		} );

		this[ name ] = value;
	}

	/**
	 * Binds model attributes to another {@link Model} instance.
	 *
	 * Once bound, the model will immediately share the current state of attributes
	 * of the model it is bound to and react to the changes to these attributes
	 * in the future.
	 *
	 * **Note**: To release the binding use {@link #unbind}.
	 *
	 *		A.bind( 'a' ).to( B );
	 *		A.bind( 'a' ).to( B, 'b' );
	 *		A.bind( 'a', 'b' ).to( B, 'c', 'd' );
	 *		A.bind( 'a' ).to( B, 'b', C, 'd', ( b, d ) => b + d );
	 *
	 * @param {String...} bindAttrs Model attributes use that will be bound to another model(s).
	 * @returns {BindChain}
	 */
	bind( ...bindAttrs ) {
		if ( !bindAttrs.length || !isStringArray( bindAttrs ) ) {
			/**
			 * All attributes must be strings.
			 *
			 * @error model-bind-wrong-attrs
			 */
			throw new CKEditorError( 'model-bind-wrong-attrs: All attributes must be strings.' );
		}

		if ( ( new Set( bindAttrs ) ).size !== bindAttrs.length ) {
			/**
			 * Attributes must be unique.
			 *
			 * @error model-bind-duplicate-attrs
			 */
			throw new CKEditorError( 'model-bind-duplicate-attrs: Attributes must be unique.' );
		}

		bindAttrs.forEach( attrName => {
			if ( attrName in this._boundAttributes ) {
				/**
				 * Cannot bind the same attribute more that once.
				 *
				 * @error model-bind-rebind
				 */
				throw new CKEditorError( 'model-bind-rebind: Cannot bind the same attribute more that once.' );
			}
		} );

		const bindings = {};

		/**
		 * @typedef Binding
		 * @type Object
		 * @property {Array} attr Attribute which is bound.
		 * @property {Array} to Array of model–attribute components of the binding (`{ model: ..., attr: .. }`).
		 * @property {Array} callback A function which processes `to` components.
		 */
		bindAttrs.forEach( a => {
			this._boundAttributes[ a ] = bindings[ a ] = { attr: a, to: [] };
		} );

		/**
		 * @typedef BindChain
		 * @type Object
		 * @property {Function} to See {@link #_bindTo}.
		 * @property {Model} _model The model which initializes the binding.
		 * @property {Array} _bindAttrs Array of `_model` attributes to be bound.
		 * @property {Array} _to Array of `to()` model–attributes (`{ model: toModel, attrs: ...toAttrs }`).
		 * @property {Object} _bindings Stores bindings to be kept in {@link #_boundAttributes}/{@link #_boundModels}
		 * initiated in this binding chain.
		 */
		return {
			to: this._bindTo,

			_model: this,
			_bindAttrs: bindAttrs,
			_to: [],
			_bindings: bindings
		};
	}

	/**
	 * Removes the binding created with {@link #bind}.
	 *
	 *		A.unbind( 'a' );
	 *		A.unbind();
	 *
	 * @param {String...} [bindAttrs] Model attributes to unbound. All the bindings will
	 * be released if not attributes provided.
	 */
	unbind( ...unbindAttrs ) {
		if ( unbindAttrs.length ) {
			if ( !isStringArray( unbindAttrs ) ) {
				/**
				 * Attributes must be strings.
				 *
				 * @error model-unbind-wrong-attrs
				 */
				throw new CKEditorError( 'model-unbind-wrong-attrs: Attributes must be strings.' );
			}

			unbindAttrs.forEach( attrName => {
				const binding = this._boundAttributes[ attrName ];
				let toModel, toAttr, toAttrs, toAttrBindings;

				binding.to.forEach( to => {
					// TODO: ES6 destructuring.
					toModel = to[ 0 ];
					toAttr = to[ 1 ];
					toAttrs = this._boundModels.get( toModel );
					toAttrBindings = toAttrs[ toAttr ];

					toAttrBindings.delete( binding );

					if ( !toAttrBindings.size ) {
						delete toAttrs[ toAttr ];
					}

					if ( !Object.keys( toAttrs ).length ) {
						this._boundModels.delete( toModel );
						this.stopListening( toModel, 'change' );
					}
				} );

				delete this._boundAttributes[ attrName ];
			} );
		} else {
			this._boundModels.forEach( ( bindings, boundModel ) => {
				this.stopListening( boundModel, 'change' );
			} );

			this._boundModels.clear();
			this._boundAttributes = {};
		}
	}

	/**
	 * A chaining for {@link #bind} providing `.to()` interface.
	 *
	 * @protected
	 * @param {...[Model|String|Function]} args Arguments of the `.to( args )` binding.
	 */
	_bindTo( ...args ) {
		const parsedArgs = parseBindToArgs( ...args );
		const bindingsKeys = Object.keys( this._bindings );
		const numberOfBindings = bindingsKeys.length;

		// Eliminate A.bind( 'x' ).to( B, C )
		if ( !parsedArgs.callback && parsedArgs.to.length > 1 ) {
			/**
			 * Binding multiple models only possible with callback.
			 *
			 * @error model-bind-no-callback
			 */
			throw new CKEditorError( 'model-bind-to-no-callback: Binding multiple models only possible with callback.' ) ;
		}

		// Eliminate A.bind( 'x', 'y' ).to( B, callback )
		if ( numberOfBindings > 1 && parsedArgs.callback ) {
			/**
			 * Cannot bind multiple attributes and use a callback in one binding.
			 *
			 * @error model-bind-to-extra-callback
			 */
			throw new CKEditorError( 'model-bind-to-extra-callback: Cannot bind multiple attributes and use a callback in one binding.' ) ;
		}

		parsedArgs.to.forEach( to => {
			// Eliminate A.bind( 'x', 'y' ).to( B, 'a' )
			if ( to.attrs.length && to.attrs.length !== numberOfBindings ) {
				/**
				 * The number of attributes must match.
				 *
				 * @error model-bind-to-attrs-length
				 */
				throw new CKEditorError( 'model-bind-to-attrs-length: The number of attributes must match.' );
			}

			// When no to.attrs specified, observing MODEL attributes instead.
			if ( !to.attrs.length ) {
				to.attrs = this._bindAttrs;
			}

			// Eliminate A.bind( 'x', 'y' ).to( B, 'a', 'b' ) when B has no 'a'.
			if ( !hasAttributes( to.model, to.attrs ) ) {
				/*
				 * Model has no such attribute(s).
				 *
				 * @error model-bind-to-missing-attr
				 */
				throw new CKEditorError( 'model-bind-to-missing-attr: Model has no such attribute(s).' );
			}
		} );

		this._to = parsedArgs.to;

		// Fill {@link BindChain#_bindings} with callback.
		if ( parsedArgs.callback ) {
			this._bindings[ bindingsKeys[ 0 ] ].callback = parsedArgs.callback;
		}

		attachBindToListeners( this._model, this._to );

		// Update model._boundAttributes and model._boundModels.
		updateBindToBound( this );

		// Set initial values of bound attributes.
		this._bindAttrs.forEach( attrName => {
			updateBoundModelAttr( this._model, attrName );
		} );
	}
}

/**
 * Check if the {@link Model} has given `attrs`.
 *
 * @private
 * @param {Model} model Model to be checked.
 * @param {Array} arr An array of `String`.
 * @returns {Boolean}
 */
function hasAttributes( model, attrs ) {
	return attrs.every( a => a in model._attributes );
}

/**
 * Check if all entries of the array are of `String` type.
 *
 * @private
 * @param {Array} arr An array to be checked.
 * @returns {Boolean}
 */
function isStringArray( arr ) {
	return arr.every( a => typeof a == 'string' );
}

/**
 * Parses and validates {@link Model#bind}`.to( args )` arguments and returns
 * an object with a parsed structure. For example
 *
 *		A.bind( 'x' ).to( B, 'a', C, 'b', call );
 *
 * becomes
 *
 *		{
 *			to: [
 *				{ model: B, attrs: [ 'a' ] },
 *				{ model: C, attrs: [ 'b' ] },
 *			],
 *			callback: call
 * 		}
 *
 * @private
 * @param {...*} args Arguments of {@link Model#bind}`.to( args )`.
 * @returns {Object}
 */
function parseBindToArgs( ...args ) {
	// Eliminate A.bind( 'x' ).to()
	if ( !args.length ) {
		/**
		 * Invalid argument syntax in `to()`.
		 *
		 * @error model-bind-to-parse-error
		 */
		throw new CKEditorError( 'model-bind-to-parse-error: Invalid argument syntax in `to()`.' );
	}

	const parsed = { to: [] };
	let lastModel;

	args.forEach( a => {
		// Callback has already been defined.
		// Eliminate A.bind( 'x' ).to( B, 'a', callback, C )
		if ( parsed.callback ) {
			throw new CKEditorError( 'model-bind-to-parse-error: Invalid argument syntax in `to()`.' );
		} else if ( a instanceof Model ) {
			parsed.to.push( ( lastModel = { model: a, attrs: [] } ) );
		} else if ( typeof a == 'string' ) {
			lastModel.attrs.push( a );
		} else if ( typeof a == 'function' ) {
			parsed.callback = a;
		}
		// Eliminate A.bind( 'x' ).to( null, new Date(), etc. )
		else {
			throw new CKEditorError( 'model-bind-to-parse-error: Invalid argument syntax in `to()`.' );
		}
	} );

	return parsed;
}

/**
 * Synchronizes {@link Model#_boundModels} with {@link Binding}.
 *
 * @private
 * @param {Binding} binding A binding to store in {@link Model#_boundModels}.
 * @param {Model} toModel A model, which is a new component of `binding`.
 * @param {String} toAttrName A name of `toModel`'s attribute, a new component of the `binding`.
 */
function updateBoundModels( model, binding, toModel, toAttrName ) {
	const bindingsToModel = model._boundModels.get( toModel );
	const bindings = bindingsToModel || {};

	if ( !bindings[ toAttrName ] ) {
		bindings[ toAttrName ] = new Set();
	}

	// Pass the binding to a corresponding Set in `model._boundModels`.
	bindings[ toAttrName ].add( binding );

	if ( !bindingsToModel ) {
		model._boundModels.set( toModel, bindings );
	}
}

/**
 * Synchronizes {@link Model#_boundAttributes} and {@link Model#_boundModels}
 * with {@link BindChain}.
 *
 * Assuming the following binding being created
 *
 * 		A.bind( 'a', 'b' ).to( B, 'x', 'y' );
 *
 * the following bindings were initialized by {@link Model#bind} in {@link BindChain#_bindings}:
 *
 * 		{
 * 			a: { model: A, attr: 'a', to: [] },
 * 			b: { model: A, attr: 'b', to: [] },
 * 		}
 *
 * Iterate over all bindings in this chain and fill their `to` properties with
 * corresponding to( ... ) arguments (components of the binding), so
 *
 * 		{
 * 			a: { model: A, attr: 'a', to: [ B, 'x' ] },
 * 			b: { model: A, attr: 'b', to: [ B, 'y' ] },
 * 		}
 *
 * Then update the structure of {@link Model#_boundModels} with updated
 * binding, so it becomes:
 *
 * 		Map( {
 * 			B: {
 * 				x: Set( [
 * 					{ model: A, attr: 'a', to: [ [ B, 'x' ] ] }
 * 				] ),
 * 				y: Set( [
 * 					{ model: A, attr: 'b', to: [ [ B, 'y' ] ] },
 * 				] )
 *			}
 * 		} )
 *
 * @private
 * @param {BindChain} chain The binding initialized by {@link Model#bind}.
 */
function updateBindToBound( chain ) {
	let binding, toAttr;

	for ( let attrName in chain._bindings ) {
		binding = chain._bindings[ attrName ];

		// Note: For a binding without a callback, this will run only once
		// like in A.bind( 'x', 'y' ).to( B, 'a', 'b' )
		// TODO: ES6 destructuring.
		chain._to.forEach( to => {
			toAttr = to.attrs[ binding.callback ? 0 : chain._bindAttrs.indexOf( attrName ) ];

			binding.to.push( [ to.model, toAttr ] );
			updateBoundModels( chain._model, binding, to.model, toAttr );
		} );
	}
}

/**
 * Updates an attribute of a {@link Model} with a value
 * determined by an entry in {@link Model#_boundAttributes}.
 *
 * @private
 * @param {Model} model A model which attribute is to be updated.
 * @param {String} attrName An attribute to be updated.
 */
function updateBoundModelAttr( model, attrName ) {
	const binding = model._boundAttributes[ attrName ];
	let attrValue;

	// When a binding with callback is created like
	//
	// 		A.bind( 'a' ).to( B, 'b', C, 'c', callback );
	//
	// collect B.b and C.c, then pass them to callback to set A.a.
	if ( binding.callback ) {
		attrValue = binding.callback.apply( model, binding.to.map( to => to[ 0 ][ to[ 1 ] ] ) );
	} else {
		attrValue = binding.to[ 0 ];
		attrValue = attrValue[ 0 ][ attrValue[ 1 ] ];
	}

	// TODO: Needs update after https://github.com/ckeditor/ckeditor5-core/issues/132.
	if ( model.hasOwnProperty( attrName ) ) {
		model[ attrName ] = attrValue;
	} else {
		model.set( attrName, attrValue );
	}
}

/**
 * Starts listening to changes in {@link BindChain._to} models to update
 * {@link BindChain._model} {@link BindChain._bindAttrs}. Also sets the
 * initial state of {@link BindChain._model}.
 *
 * @private
 * @param {BindChain} chain The chain initialized by {@link Model#bind}.
 */
function attachBindToListeners( model, toBindings ) {
	toBindings.forEach( to => {
		const boundModels = model._boundModels;
		let bindings;

		// If there's already a chain between the models (`model` listens to
		// `to.model`), there's no need to create another `change` event listener.
		if ( !boundModels.get( to.model ) ) {
			model.listenTo( to.model, 'change', ( evt, attrName ) => {
				bindings = boundModels.get( to.model )[ attrName ];

				// Note: to.model will fire for any attribute change, react
				// to changes of attributes which are bound only.
				if ( bindings ) {
					bindings.forEach( binding => {
						updateBoundModelAttr( model, binding.attr );
					} );
				}
			} );
		}
	} );
}

utilsObject.extend( Model.prototype, EmitterMixin );

/**
 * Fired when an attribute changed value.
 *
 * @event change
 * @param {String} name The attribute name.
 * @param {*} value The new attribute value.
 * @param {*} oldValue The previous attribute value.
 */

/**
 * Fired when an specific attribute changed value.
 *
 * @event change:{attribute}
 * @param {*} value The new attribute value.
 * @param {*} oldValue The previous attribute value.
 */
