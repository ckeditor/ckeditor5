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

				// Allow undefined as an initial value like A.set( 'x', undefined ) (#132).
				// Note: When _attributes has no such own property, then its value is undefined.
				if ( oldValue !== value || !this._attributes.hasOwnProperty( name ) ) {
					this._attributes[ name ] = value;
					this.fire( 'change', name, value, oldValue );
					this.fire( 'change:' + name, value, oldValue );
				}
			}
		} );

		this[ name ] = value;
	}

	/**
	 * Binds model attributes to another Model instance.
	 *
	 * Once bound, the model will immediately share the current state of attributes
	 * of the model it is bound to and react to the changes to these attributes
	 * in the future.
	 *
	 * To release the binding use {@link #unbind}.
	 *
	 *		A.bind( 'a' ).to( B );
	 *		A.bind( 'a' ).to( B, 'b' );
	 *		A.bind( 'a', 'b' ).to( B, 'c', 'd' );
	 *		A.bind( 'a' ).to( B, 'b' ).to( C, 'd' ).as( ( b, d ) => b + d );
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

		bindAttrs.forEach( a => {
			this._boundAttributes[ a ] = bindings[ a ] = { model: this, attr: a, to: [] };
		} );

		/**
		 * @typedef BindChain
		 * @type Object
		 * @property {Function} to See {@link #_bindTo}.
		 * @property {Function} as See {@link #_bindAs} (available after `to()` called in chain).
		 * @property {Model} _model The model which initializes the binding.
		 * @property {Array} _bindAttrs Array of `_model` attributes to be bound.
		 * @property {Array} _to Array of `to()` model–attributes (`{ model: toModel, attrs: ...toAttrs }`).
		 * @property {Object} _bindings Stores bindings to be kept in {@link #_boundAttributes}/{@link #_boundModels}
		 * initiated in this binding chain.
		 * @property {Function} _lastToModel A helper, retrieves `model` from last of `_to`.
		 * @property {Function} _lastToAttrs A helper, retrieves `attrs` from last of `_to`.
		 */
		return {
			to: this._bindTo,

			_model: this,
			_bindAttrs: bindAttrs,
			_to: [],
			_bindings: bindings,

			get _lastToModel() {
				return this._to[ this._to.length - 1 ].model;
			},

			get _lastToAttrs() {
				return this._to[ this._to.length - 1 ].attrs;
			}
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
					// TODO: Destructuring.
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
	 * @param {Model} model A model used for binding.
	 * @param {String...} [toAttrs] Attributes of the model used for binding.
	 * @returns {BindChain}
	 */
	_bindTo( toModel, ...toAttrs ) {
		if ( !toModel || !( toModel instanceof Model ) ) {
			/**
			 * An instance of Model is required.
			 *
			 * @error model-bind-to-wrong-model
			 */
			throw new CKEditorError( 'model-bind-to-wrong-model: An instance of Model is required.' );
		}

		if ( !isStringArray( toAttrs ) ) {
			/**
			 * Model attributes must be strings.
			 *
			 * @error model-bind-to-wrong-attrs
			 */
			throw new CKEditorError( 'model-bind-to-wrong-attrs: Model attributes must be strings.' );
		}

		// Eliminate A.bind( 'x' ).to( B, 'y', 'z' )
		// Eliminate A.bind( 'x', 'y' ).to( B, 'z' )
		if ( toAttrs.length && toAttrs.length !== Object.keys( this._bindings ).length ) {
			/**
			 * The number of attributes must match.
			 *
			 * @error model-bind-to-attrs-length
			 */
			throw new CKEditorError( 'model-bind-to-attrs-length: The number of attributes must match.' );
		}

		// Eliminate A.bind( 'x' ).to( B, 'y' ), when B.y == undefined.
		// Eliminate A.bind( 'x' ).to( B ), when B.x == undefined.
		if ( !hasAttributes( toModel, toAttrs ) || ( !toAttrs.length && !hasAttributes( toModel, this._bindAttrs ) ) ) {
			/**
			 * Model has no such attribute(s).
			 *
			 * @error model-bind-to-missing-attr
			 */
			throw new CKEditorError( 'model-bind-to-missing-attr: Model has no such attribute(s).' );
		}

		// Eliminate A.bind( 'x', 'y' ).to( B ).to( C ) when no trailing .as().
		// Eliminate A.bind( 'x', 'y' ).to( B, 'x', 'y' ).to( C, 'x', 'y' ).
		if ( this._to.length && ( toAttrs.length > 1 || this._bindAttrs.length > 1 ) ) {
			/**
			 * Chaining only allowed for a single attribute.
			 *
			 * @error model-bind-to-chain-multiple-attrs
			 */
			throw new CKEditorError( 'model-bind-to-chain-multiple-attrs: Chaining only allowed for a single attribute.' );
		}

		// When no toAttrs specified, observing MODEL attributes, like MODEL.bind( 'foo' ).to( TOMODEL )
		if ( !toAttrs.length ) {
			toAttrs = this._bindAttrs;
		}

		// Extend current chain with the new binding information.
		this._to.push( { model: toModel, attrs: toAttrs } );

		setupBindToBinding( this );

		if ( !this.as ) {
			this.as = this._model._bindAs;
		}

		return this;
	}

	/**
	 * A chaining for {@link #bind} providing `.as()` interface.
	 *
	 * @protected
	 * @param {Function} callback A callback to combine model's attributes.
	 */
	_bindAs( callback ) {
		if ( !callback || typeof callback !== 'function' ) {
			/**
			 * Callback must be a Function.
			 *
			 * @error model-bind-as-wrong-callback
			 */
			throw new CKEditorError( 'model-bind-as-wrong-callback: Callback must be a Function.' );
		}

		this._model._boundAttributes[ this._bindAttrs[ 0 ] ].callback = this._callback = callback;

		updateModelAttrs( this._model, this._lastToModel, this._lastToAttrs[ 0 ] );
	}
}

/**
 * Check if the `model` has given `attrs`.
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
 * Synchronizes `chain._model._boundAttributes` and `chain._model._boundModels`
 * with `chain`.
 *
 * @private
 * @param {BindChain} chain The binding initialized by {@link Model#bind}.
 */
function updateBoundAttributesAndModels( chain ) {
	const lastToModel = chain._lastToModel;
	const lastToAttrs = chain._lastToAttrs;

	let lastBoundAttr, bindingsToLastModel, bindings, binding;

	// Assuming the following binding being created
	//
	// 		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y' );
	//
	// the following bindings were initialized in `Model#bind` in `chain._bindings`:
	//
	// 		{
	// 			a: { model: A, attr: 'a', to: [] },
	// 			b: { model: A, attr: 'b', to: [] },
	// 		}
	//
	// Iterate over all bindings in this chain and fill their `to` properties with
	// the latest to( ... ) call arguments.
	for ( let attrName in chain._bindings ) {
		binding = chain._bindings[ attrName ];

		// Update `to` property, so the bindings are:
		//
		// 		a: { model: A, attr: 'a', to: [ [ B, 'x' ] ] },
		//
		//	and
		//
		// 		b: { model: A, attr: 'b', to: [ [ B, 'y' ] ] },
		//
		// But since `chain._bindings` and `chain._model._boundAttributes` share
		// the instances of the bindings, a model is also updated.
		lastBoundAttr = lastToAttrs[ chain._bindAttrs.indexOf( attrName ) ];
		binding.to.push( [ lastToModel, lastBoundAttr ] );

		// Update the structure of `chain._model._boundModels` with updated
		// binding, so:
		//
		// 		chain._model._boundModels == Map( {
		// 			B: {
		// 				x: Set( [
		// 					{ model: A, attr: 'a', to: [ [ B, 'x' ] ] }
		// 				] ),
		// 				y: Set( [
		// 					{ model: A, attr: 'b', to: [ [ B, 'y' ] ] },
		// 				] )
		//			}
		// 		} )
		//
		bindingsToLastModel = chain._model._boundModels.get( lastToModel );
		bindings = bindingsToLastModel || {};

		if ( !bindings[ lastBoundAttr ] ) {
			bindings[ lastBoundAttr ] = new Set();
		}

		// Pass the binding to a corresponding Set in `chain._model._boundModels`.
		bindings[ lastBoundAttr ].add( binding );

		if ( !bindingsToLastModel ) {
			chain._model._boundModels.set( lastToModel, bindings );
		}
	}
}

/**
 * Updates all bound attributes of `updateModel` with the `value` of `attrName`
 * of `withModel` model.
 *
 *		// Given that A == updateModel and B == withModel and B.x has just changed.
 *		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y', 'x' );
 *
 *		// The following is updated
 *		A.a = A.c = B.x;
 *
 * @private
 * @param {Model} updateModel The model to be updated.
 * @param {Model} withModel The model to be be used as a source.
 * @param {String} attrName One of the attributes of `withModel`.
 * @param {*} value The value of the attribute.
 */
function updateModelAttrs( updateModel, withModel, attrName, value ) {
	const bindings = updateModel._boundModels.get( withModel )[ attrName ];
	let attrValue;

	if ( bindings ) {
		bindings.forEach( binding => {
			attrValue = value;

			// A.bind( 'a' ).to( B, 'b' ).to( C, 'c' ).as( callback );
			//  \-> Collect B.b and C.c and pass the values to callback to set A.a.
			if ( binding.callback ) {
				attrValue = binding.callback.apply(
					binding.model,
					binding.to.map( bound => {
						return bound[ 0 ][ bound[ 1 ] ];
					} )
				);
			}

			// A.bind( 'a' ).to( B )[ .to( N ) ];
			//  \-> If multiple .to() models but **no** .as( callback ), then the binding is invalid.
			else if ( binding.to.length > 1 ) {
				attrValue = undefined;
			}

			// TODO: Needs update after https://github.com/ckeditor/ckeditor5-core/issues/132.
			if ( binding.model.hasOwnProperty( binding.attr ) ) {
				binding.model[ binding.attr ] = attrValue;
			} else {
				binding.model.set( binding.attr, attrValue );
			}
		} );
	}
}

/**
 * Starts listening to changes in `chain._lastToModel` to update `chain._model`
 * attributes. Also sets the initial state of `chain._model` bound attributes.
 *
 * @private
 * @param {BindChain} chain The chain initialized by {@link Model#bind}.
 */
function setupBindToBinding( chain ) {
	const lastToModel = chain._lastToModel;

	// If there's already a chain between the models (`chain._model` listens to
	// `chain._lastToModel`), there's no need to create another `change` event listener.
	if ( !chain._model._boundModels.get( lastToModel ) ) {
		chain._model.listenTo( lastToModel, 'change', ( evt, ...rest ) => {
			updateModelAttrs( chain._model, lastToModel, ...rest );
		} );
	}

	updateBoundAttributesAndModels( chain );

	// Synchronize initial state of `chain._model` with `chain._lastToModel`.
	chain._lastToAttrs.forEach( attrName => {
		updateModelAttrs( chain._model, lastToModel, attrName, lastToModel[ attrName ] );
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
