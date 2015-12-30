/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
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
		 * Map containing bindings of this model to external models.
		 * See {@link #bind}.
		 *
		 * @private
		 * @property {Map}
		 */
		this._boundTo = new Map();

		/**
		 * Object that stores which attributes of this model are bound.
		 * See {@link #bind}.
		 *
		 * @private
		 * @property {Object}
		 */
		this._bound = {};

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
	 *		A.bind( 'a' ).to( B, 'b' ).to( C, 'd' ).as( ( Bb, Cd ) => Bb + Cd );
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
			if ( attrName in this._bound ) {
				/**
				 * Cannot bind the same attribute more that once.
				 *
				 * @error model-bind-rebind
				 */
				throw new CKEditorError( 'model-bind-rebind: Cannot bind the same attribute more that once.' );
			}

			this._bound[ attrName ] = true;
		} );

		/**
		 * @typedef BindChain
		 * @type Object
		 * @property {Model} _bindModel The model which initializes the binding.
		 * @property {Array} _bindAttrs Array of `_bindModel` attributes to be bound.
		 * @property {Array} _boundTo Array of `to()` model–attributes (`{ model: toModel, attrs: ...toAttrs }`).
		 * @property {Object} _current The arguments of the last `to( toModel, ...toAttrs )` call, also
		 * the last item of `_boundTo`.
		 * @property {Function} to See {@link #_bindTo}.
		 * @property {Function} as See {@link #_bindAs} (available after `to()` called in chain).
		 */
		return {
			_bindModel: this,
			_bindAttrs: bindAttrs,
			_boundTo: [],
			get _current() {
				return this._boundTo[ this._boundTo.length - 1 ];
			},
			to: this._bindTo
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
				for ( let to of this._boundTo ) {
					// TODO, ES6 destructuring.
					const boundModel = to[ 0 ];
					const bindings = to[ 1 ];

					for ( let boundAttrName in bindings ) {
						if ( bindings[ boundAttrName ].has( attrName ) ) {
							bindings[ boundAttrName ].delete( attrName );
						}

						if ( !bindings[ boundAttrName ].size ) {
							delete bindings[ boundAttrName ];
						}

						if ( !Object.keys( bindings ).length ) {
							this._boundTo.delete( boundModel );
							this.stopListening( boundModel, 'change' );
						}
					}
				}

				delete this._bound[ attrName ];
			} );
		} else {
			this._boundTo.forEach( ( bindings, boundModel ) => {
				this.stopListening( boundModel, 'change' );
				this._boundTo.delete( boundModel );
			} );

			this._bound = {};
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
		if ( toAttrs.length && toAttrs.length !== this._bindAttrs.length ) {
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
		if ( this._boundTo.length && ( toAttrs.length > 1 || this._bindAttrs.length > 1 ) ) {
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
		this._boundTo.push( { model: toModel, attrs: toAttrs } );

		setupBinding( this );

		if ( !this.as ) {
			this.as = this._bindModel._bindAs;
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

		this._callback = callback;

		updateModelAttrs( this, this._bindAttrs[ 0 ] );
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
 * Returns all bindings of the `chain._bindModel` to `chain._current.model`
 * set by {@link #updateModelBindingsToCurrent}.
 *
 *		// Given that A == _bindModel and B == _current.model
 *		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y', 'x' );
 *
 *		// The following object is returned
 *		{ x: [ 'a', 'c' ], y: [ 'b' ] }
 *
 *
 * @private
 * @param {BindChain} chain The chain initialized by {@link Model#bind}.
 * @returns {Object}
 */
function getModelBindingsToCurrent( chain ) {
	return chain._bindModel._boundTo.get( chain._current.model );
}

/**
 * Updates `chain._bindModel._boundTo` with a binding for `chain._current`.
 * The binding can be then retrieved by {@link #getModelBindingsToCurrent}.
 *
 * @private
 * @param {BindChain} chain The chain initialized by {@link Model#bind}.
 * @returns {Object}
 */
function updateModelBindingsToCurrent( chain ) {
	const currentBindings = getModelBindingsToCurrent( chain );
	const bindings = currentBindings || {};

	chain._current.attrs.forEach( ( attrName, index ) => {
		( bindings[ attrName ] || ( bindings[ attrName ] = new Set() ) )
			.add( chain._bindAttrs[ index ] );
	} );

	if ( !currentBindings ) {
		chain._bindModel._boundTo.set( chain._current.model, bindings );
	}
}

/**
 * Updates the model attribute with given value. If an attribute does not exist,
 * it is created on the fly.
 *
 * @private
 * @param {Model} model The model which attribute is updated.
 * @param {String} attrName The name of the attribute.
 * @param {*} value The value of the attribute.
 */
function updateModelAttr( model, attrName, value ) {
	if ( model[ attrName ] ) {
		model[ attrName ] = value;
	} else {
		model.set( attrName, value );
	}
}

/**
 * Updates all bound attributes of `chain._bindModel` with the `value` of
 * `attrName` of `chain._current` model.
 *
 *		// Given that A == _bindModel and B == _current.model
 *		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y', 'x' );
 *
 *		// The following is updated
 *		A.a = A.c = B.x;
 *		A.b = B.y;
 *
 * @private
 * @param {BindChain} chain The chain initialized by {@link Model#bind}.
 * @param {String} attrName One of the attributes of `chain._current`.
 * @param {*} value The value of the attribute.
 */
function updateModelAttrs( chain, attrName, value ) {
	const boundAttrs = getModelBindingsToCurrent( chain )[ attrName ];

	if ( !boundAttrs ) {
		return;
	} else if ( chain._callback ) {
		// MODEL.bind( 'a' ).to( TOMODEL1, 'b1' )[ .to( TOMODELn, 'bn' ) ].as( callback )
		//  \-> Collect specific attribute value in the boundTo.model (TOMODELn.bn).
		//
		// MODEL.bind( 'a' ).to( TOMODEL1 )[ .to( TOMODELn ) ].as( callback )
		//  \-> Use model attribute name to collect boundTo attribute value (TOMODELn.a).
		const values = chain._boundTo.map( boundTo => boundTo.model[ boundTo.attrs[ 0 ] ] );

		// Pass collected attribute values to the callback function.
		// Whatever is returned it becomes the value of the model's attribute.
		updateModelAttr(
			chain._bindModel,
			chain._bindAttrs[ 0 ],
			chain._callback.apply( chain._bindModel, values )
		);
	} else {
		// MODEL.bind( 'a' ).to( TOMODEL1 )[ .to( TOMODELn ) ];
		//  \-> If multiple .to() models but **no** .as( callback ), then the binding is invalid.
		if ( !chain._callback && chain._boundTo.length > 1 ) {
			value = undefined;
		}

		for ( let boundAttrName of boundAttrs ) {
			updateModelAttr( chain._bindModel, boundAttrName, value );
		}
	}
}

/**
 * Starts listening to changes in `chain._current.model` to update `chain._bindModel`
 * attributes. Also sets the initial state of `chain._bindModel` bound attributes.
 *
 * @private
 * @param {BindChain} chain The chain initialized by {@link Model#bind}.
 */
function setupBinding( chain ) {
	// If there's already a binding between the models (`chain._bindModel` listens to
	// `chain._current.model`), there's no need to create another `change` event listener.
	if ( !getModelBindingsToCurrent( chain ) ) {
		chain._bindModel.listenTo( chain._current.model, 'change', ( evt, attrName, value ) => {
			updateModelAttrs( chain, attrName, value );
		} );
	}

	updateModelBindingsToCurrent( chain );

	// Set initial model state.
	chain._current.attrs.forEach( attrName => {
		updateModelAttrs( chain, attrName, chain._current.model[ attrName ] );
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
