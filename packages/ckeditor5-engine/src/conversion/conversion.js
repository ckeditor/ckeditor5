/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/conversion
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import {
	downcastElementToElement,
	downcastAttributeToElement,
	downcastAttributeToAttribute
} from './downcast-converters';

import {
	upcastElementToElement,
	upcastElementToAttribute,
	upcastAttributeToAttribute
} from './upcast-converters';

/**
 * An utility class that helps organizing dispatchers and adding converters to them.
 */
export default class Conversion {
	/**
	 * Creates new Conversion instance.
	 */
	constructor() {
		/**
		 * @private
		 * @member {Map}
		 */
		this._dispatchersGroups = new Map();
	}

	/**
	 * Registers one or more converters under given group name. Then, group name can be used to assign a converter
	 * to multiple dispatchers at once.
	 *
	 * If given group name is used for a second time,
	 * {@link module:utils/ckeditorerror~CKEditorError conversion-register-group-exists} error is thrown.
	 *
	 * @param {String} groupName A name for dispatchers group.
	 * @param {Array.<module:engine/conversion/downcastdispatcher~DowncastDispatcher|
	 * module:engine/conversion/upcastdispatcher~UpcastDispatcher>} dispatchers Dispatchers to register
	 * under given name.
	 */
	register( groupName, dispatchers ) {
		if ( this._dispatchersGroups.has( groupName ) ) {
			/**
			 * Trying to register a group name that was already registered.
			 *
			 * @error conversion-register-group-exists
			 */
			throw new CKEditorError( 'conversion-register-group-exists: Trying to register a group name that was already registered.' );
		}

		this._dispatchersGroups.set( groupName, dispatchers );
	}

	/**
	 * Provides chainable API to assign converters to dispatchers registered under given group name. Converters are added
	 * by calling `.add()` method of an object returned by this function.
	 *
	 *		conversion.for( 'downcast' )
	 *			.add( conversionHelperA )
	 *			.add( conversionHelperB );
	 *
	 * In above example, `conversionHelperA` and `conversionHelperB` will be called for all dispatchers from `'model'` group.
	 *
	 * `.add()` takes exactly one parameter, which is a function. That function should accept one parameter, which
	 * is a dispatcher instance. The function should add an actual converter to passed dispatcher instance.
	 *
	 * Conversion helpers for most common cases are already provided. They are flexible enough to cover most use cases.
	 * See documentation to learn how they can be configured.
	 *
	 * For downcast (model to view conversion), these are:
	 *
	 * * {@link module:engine/conversion/downcast-converters~downcastElementToElement downcast element to element converter},
	 * * {@link module:engine/conversion/downcast-converters~downcastAttributeToElement downcast attribute to element converter},
	 * * {@link module:engine/conversion/downcast-converters~downcastAttributeToAttribute downcast attribute to attribute converter}.
	 *
	 * For upcast (view to model conversion), these are:
	 *
	 * * {@link module:engine/conversion/upcast-converters~upcastElementToElement upcast element to element converter},
	 * * {@link module:engine/conversion/upcast-converters~upcastElementToAttribute upcast attribute to element converter},
	 * * {@link module:engine/conversion/upcast-converters~upcastAttributeToAttribute upcast attribute to attribute converter}.
	 *
	 * An example of using conversion helpers to convert `paragraph` model element to `p` view element (and back):
	 *
	 *		// Define conversion configuration - model element 'paragraph' should be converted to view element 'p'.
	 *		const config = { model: 'paragraph', view: 'p' };
	 *
	 *		// Add converters to proper dispatchers using conversion helpers.
	 *		conversion.for( 'downcast' ).add( downcastElementToElement( config ) );
	 *		conversion.for( 'upcast' ).add( upcastElementToElement( config ) );
	 *
	 * An example of providing custom conversion helper that uses custom converter function:
	 *
	 *		// Adding custom `myConverter` converter for 'paragraph' element insertion, with default priority ('normal').
	 *		conversion.for( 'downcast' ).add( conversion.customConverter( 'insert:paragraph', myConverter ) );
	 *
	 * @param {String} groupName Name of dispatchers group to add converters to.
	 * @returns {Object} Object with `.add()` method, providing a way to add converters.
	 */
	for( groupName ) {
		const dispatchers = this._getDispatchers( groupName );

		return {
			add( conversionHelper ) {
				_addToDispatchers( dispatchers, conversionHelper );

				return this;
			}
		};
	}

	/**
	 * Sets up converters between the model and the view which convert a model element to a view element (and vice versa).
	 * For example, model `<paragraph>Foo</paragraph>` is `<p>Foo</p>` in the view.
	 *
	 *		// Simple conversion from `paragraph` model element to `<p>` view element (and vice versa).
	 *		conversion.elementToElement( { model: 'paragraph', view: 'p' } );
	 *
	 *		// Override other converters by specifying converter definition with higher priority.
	 *		conversion.elementToElement( { model: 'paragraph', view: 'div', priority: 'high' } );
	 *
	 *		// View specified as an object instead of a string.
	 *		conversion.elementToElement( {
	 *			model: 'fancyParagraph',
	 *			view: {
	 *				name: 'p',
	 *				class: 'fancy'
	 *			}
	 *		} );
	 *
	 *		// Use `upcastAlso` to define other view elements that should be also converted to `paragraph` element.
	 *		conversion.elementToElement( {
	 *			model: 'paragraph',
	 *			view: 'p',
	 *			upcastAlso: [
	 *				'div',
	 *				{
	 *					// Any element with `display: block` style.
	 *					style: {
	 *						display: 'block'
	 *					}
	 *				}
	 *			]
	 *		} );
	 *
	 *		// `upcastAlso` set as callback enables a conversion of a wide range of different view elements.
	 *		conversion.elementToElement( {
	 *			model: 'heading',
	 *			view: 'h2',
	 *			// Convert "headling-like" paragraphs to headings.
	 *			upcastAlso: viewElement => {
	 *				const fontSize = viewElement.getStyle( 'font-size' );
	 *
	 *				if ( !fontSize ) {
	 *					return null;
	 *				}
	 *
	 *				const match = fontSize.match( /(\d+)\s*px/ );
	 *
	 *				if ( !match ) {
	 *					return null;
	 *				}
	 *
	 *				const size = Number( match[ 1 ] );
	 *
	 *				if ( size > 26 ) {
	 *					// Returned value be an object with the matched properties.
	 *					// Those properties will be "consumed" during conversion.
	 *					// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more.
	 *
	 *					return { name: true, style: [ 'font-size' ] };
	 *				}
	 *
	 *				return null;
	 *			}
	 *		} );
	 *
	 * `definition.model` is a `String` with a model element name to converter from/to.
	 * See {@link module:engine/conversion/conversion~ConverterDefinition} to learn about other parameters.
	 *
	 * @param {module:engine/conversion/conversion~ConverterDefinition} definition Converter definition.
	 */
	elementToElement( definition ) {
		// Set up downcast converter.
		this.for( 'downcast' ).add( downcastElementToElement( definition ) );

		// Set up upcast converter.
		for ( const { model, view } of _getAllUpcastDefinitions( definition ) ) {
			this.for( 'upcast' ).add(
				upcastElementToElement( {
					model,
					view,
					priority: definition.priority
				} )
			);
		}
	}

	/**
	 * Sets up converters between the model and the view which convert a model attribute to a view element (and vice versa).
	 * For example, model text node with data `"Foo"` and `bold` attribute is `<strong>Foo</strong>` in the view.
	 *
	 *		// Simple conversion from `bold=true` attribute to `<strong>` view element (and vice versa).
	 *		conversion.attributeToElement( { model: 'bold', view: 'strong' } );
	 *
	 *		// Override other converters by specifying converter definition with higher priority.
	 *		conversion.attributeToElement( { model: 'bold', view: 'b', priority: 'high' } );
	 *
	 *		// View specified as an object instead of a string.
	 *		conversion.attributeToElement( {
	 *			model: 'bold',
	 *			view: {
	 *				name: 'span',
	 *				class: 'bold'
	 *			}
	 *		} );
	 *
	 *		// Use `upcastAlso` to define other view elements that should be also converted to `bold` attribute.
	 *		conversion.attributeToElement( {
	 *			model: 'bold',
	 *			view: 'strong',
	 *			upcastAlso: [
	 *				'b',
	 *				{
	 *					name: 'span',
	 *					class: 'bold'
	 *				},
	 *				{
	 *					name: 'span',
	 *					style: {
	 *						'font-weight': 'bold'
	 *					}
	 *				},
	 *				viewElement => {
	 *					const fontWeight = viewElement.getStyle( 'font-weight' );
	 *
	 *					if ( viewElement.is( 'span' ) && fontWeight && /\d+/.test() && Number( fontWeight ) > 500 ) {
	 *						// Returned value be an object with the matched properties.
	 *						// Those properties will be "consumed" during conversion.
	 *						// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more.
	 *
	 *						return {
	 *							name: true,
	 *							style: [ 'font-weight' ]
	 *						};
	 *					}
	 *				}
	 *			]
	 *		} );
	 *
	 *		// Conversion from/to a model attribute key which value is an enum (`fontSize=big|small`).
	 *		// `upcastAlso` set as callback enables a conversion of a wide range of different view elements.
	 *		conversion.attributeToElement( {
	 *			model: {
	 *				key: 'fontSize',
	 *				values: [ 'big', 'small' ]
	 *			},
	 *			view: {
	 *				big: {
	 *					name: 'span',
	 *					style: {
	 *						'font-size': '1.2em'
	 *					}
	 *				},
	 *				small: {
	 *					name: 'span',
	 *					style: {
	 *						'font-size': '0.8em'
	 *					}
	 *				}
	 *			},
	 *			upcastAlso: {
	 *				big: viewElement => {
	 *					const fontSize = viewElement.getStyle( 'font-size' );
	 *
	 *					if ( !fontSize ) {
	 *						return null;
	 *					}
	 *
	 *					const match = fontSize.match( /(\d+)\s*px/ );
	 *
	 *					if ( !match ) {
	 *						return null;
	 *					}
	 *
	 *					const size = Number( match[ 1 ] );
	 *
	 *					if ( viewElement.is( 'span' ) && size > 10 ) {
	 *						// Returned value be an object with the matched properties.
	 *						// Those properties will be "consumed" during conversion.
	 *						// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more.
	 *
	 *						return { name: true, style: [ 'font-size' ] };
	 *					}
	 *
	 *					return null;
	 *				},
	 *				small: viewElement => {
	 *					const fontSize = viewElement.getStyle( 'font-size' );
	 *
	 *					if ( !fontSize ) {
	 *						return null;
	 *					}
	 *
	 *					const match = fontSize.match( /(\d+)\s*px/ );
	 *
	 *					if ( !match ) {
	 *						return null;
	 *					}
	 *
	 *					const size = Number( match[ 1 ] );
	 *
	 *					if ( viewElement.is( 'span' ) && size < 10 ) {
	 *						// Returned value be an object with the matched properties.
	 *						// Those properties will be "consumed" during conversion.
	 *						// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more.
	 *
	 *						return { name: true, style: [ 'font-size' ] };
	 *					}
	 *
	 *					return null;
	 *				}
	 *			}
	 *		} );
	 *
	 * `definition.model` parameter specifies what model attribute should be converted from/to. It can be a `{ key, value }` object
	 * describing attribute key and value to convert or a `String` specifying just attribute key (then `value` is set to `true`).
	 * See {@link module:engine/conversion/conversion~ConverterDefinition} to learn about other parameters.
	 *
	 * @param {module:engine/conversion/conversion~ConverterDefinition} definition Converter definition.
	 */
	attributeToElement( definition ) {
		// Set up downcast converter.
		this.for( 'downcast' ).add( downcastAttributeToElement( definition ) );

		// Set up upcast converter.
		for ( const { model, view } of _getAllUpcastDefinitions( definition ) ) {
			this.for( 'upcast' ).add(
				upcastElementToAttribute( {
					view,
					model,
					priority: definition.priority
				} )
			);
		}
	}

	/**
	 * Sets up converters between the model and the view which convert a model attribute to a view attribute (and vice versa).
	 * For example, `<image src='foo.jpg'></image>` is converted to `<img src='foo.jpg'></img>` (same attribute key and value).
	 *
	 *		// Simple conversion from `source` model attribute to `src` view attribute (and vice versa).
	 *		conversion.attributeToAttribute( { model: 'source', view: 'src' } );
	 *
	 *		// Attributes values are strictly specified.
	 *		conversion.attributeToAttribute( {
	 *			model: {
	 *				name: 'image',
	 *				key: 'aside',
	 *				values: [ 'aside' ]
	 *			},
	 *			view: {
	 *				aside: {
	 *					name: 'img',
	 *					key: 'class',
	 *					value: [ 'aside', 'half-size' ]
	 *				}
	 *			}
	 *		} );
	 *
	 *		// Set style attribute.
	 *		conversion.attributeToAttribute( {
	 *			model: {
	 *				name: 'image',
	 *				key: 'aside',
	 *				values: [ 'aside' ]
	 *			},
	 *			view: {
	 *				aside: {
	 *					name: 'img',
	 *					key: 'style',
	 *					value: {
	 *						float: 'right',
	 *						width: '50%',
	 *						margin: '5px'
	 *					}
	 *				}
	 *			}
	 *		} );
	 *
	 *		// Conversion from/to a model attribute key which value is an enum (`align=right|center`).
	 *		// Use `upcastAlso` to define other view elements that should be also converted to `align=right` attribute.
	 *		conversion.attributeToAttribute( {
	 *			model: {
	 *				key: 'align',
	 *				values: [ 'right', 'center' ]
	 *			},
	 *			view: {
	 *				right: {
	 *					key: 'class',
	 *					value: 'align-right'
	 *				},
	 *				center: {
	 *					key: 'class',
	 *					value: 'align-center'
	 *				}
	 *			},
	 *			upcastAlso: {
	 *				right: {
	 *					style: {
	 *						'text-align': 'right'
	 *					}
	 *				},
	 *				center: {
	 *					style: {
	 *						'text-align': 'center'
	 *					}
	 *				}
	 *			}
	 *		} );
	 *
	 * `definition.model` parameter specifies what model attribute should be converted from/to.
	 * It can be a `{ key, [ values ], [ name ] }` object or a `String`, which will be treated like `{ key: definition.model }`.
	 * `key` property is the model attribute key to convert from/to.
	 * `values` are the possible model attribute values. If `values` is not set, model attribute value will be the same as the
	 * view attribute value.
	 * If `name` is set, conversion will be set up only for model elements with the given name.
	 *
	 * `definition.view` parameter specifies what view attribute should be converted from/to.
	 * It can be a `{ key, value, [ name ] }` object or a `String`, which will be treated like `{ key: definition.view }`.
	 * `key` property is the view attribute key to convert from/to.
	 * `value` is the view attribute value to convert from/to. If `definition.value` is not set, view attribute value will be
	 * the same as the model attribute value.
	 * If `key` is `'class'`, `value` can be a `String` or an array of `String`s.
	 * If `key` is `'style'`, `value` is an object with key-value pairs.
	 * In other cases, `value` is a `String`.
	 * If `name` is set, conversion will be set up only for model elements with the given name.
	 * If `definition.model.values` is set, `definition.view` is an object which assigns values from `definition.model.values`
	 * to `{ key, value, [ name ] }` objects.
	 *
	 * `definition.upcastAlso` specifies which other matching view elements should be also upcast to given model configuration.
	 * If `definition.model.values` is set, `definition.upcastAlso` should be an object assigning values from `definition.model.values`
	 * to {@link module:engine/view/matcher~MatcherPattern}s or arrays of {@link module:engine/view/matcher~MatcherPattern}s.
	 *
	 * **Note:** `definition.model` and `definition.view` form should be mirrored, that is the same type of parameters should
	 * be given in both parameters.
	 *
	 * @param {Object} definition Converter definition.
	 * @param {String|Object} definition.model Model attribute to convert from/to.
	 * @param {String|Object} definition.view View attribute to convert from/to.
	 * @param {module:engine/view/matcher~MatcherPattern|Array.<module:engine/view/matcher~MatcherPattern>} [definition.upcastAlso]
	 * Any view element matching `definition.upcastAlso` will also be converted to the given model attribute. `definition.upcastAlso`
	 * is used only if `config.model.values` is specified.
	 */
	attributeToAttribute( definition ) {
		// Set up downcast converter.
		this.for( 'downcast' ).add( downcastAttributeToAttribute( definition ) );

		// Set up upcast converter.
		for ( const { model, view } of _getAllUpcastDefinitions( definition ) ) {
			this.for( 'upcast' ).add(
				upcastAttributeToAttribute( {
					view,
					model
				} )
			);
		}
	}

	/**
	 * Returns dispatchers registered under given group name.
	 *
	 * If given group name has not been registered,
	 * {@link module:utils/ckeditorerror~CKEditorError conversion-for-unknown-group} error is thrown.
	 *
	 * @private
	 * @param {String} groupName
	 * @returns {Array.<module:engine/conversion/downcastdispatcher~DowncastDispatcher|
	 * module:engine/conversion/upcastdispatcher~UpcastDispatcher>}
	 */
	_getDispatchers( groupName ) {
		const dispatchers = this._dispatchersGroups.get( groupName );

		if ( !dispatchers ) {
			/**
			 * Trying to add a converter to an unknown dispatchers group.
			 *
			 * @error conversion-for-unknown-group
			 */
			throw new CKEditorError( 'conversion-for-unknown-group: Trying to add a converter to an unknown dispatchers group.' );
		}

		return dispatchers;
	}
}

/**
 * Defines how the model should be converted from/to the view.
 *
 * @typedef {Object} module:engine/conversion/conversion~ConverterDefinition
 *
 * @property {*} [model] Model conversion definition. Describes model element or model attribute to convert. This parameter differs
 * for different functions that accepts `ConverterDefinition`. See the description of a function to learn how to set it.
 * @property {module:engine/view/elementdefinition~ElementDefinition|Object} view Definition of a view element to convert from/to.
 * If `model` describes multiple values, `view` is an object that assigns those values (`view` object keys) to view element definitions
 * (`view` object values).
 * @property {module:engine/view/matcher~MatcherPattern|Array.<module:engine/view/matcher~MatcherPattern>} [upcastAlso]
 * Any view element matching `upcastAlso` will also be converted to model. If `model` describes multiple values, `upcastAlso`
 * is an object that assigns those values (`upcastAlso` object keys) to {@link module:engine/view/matcher~MatcherPattern}s
 * (`upcastAlso` object values).
 * @property {module:utils/priorities~PriorityString} [priority] Conversion priority.
 */

// Helper function for `Conversion` `.add()` method.
//
// Calls `conversionHelper` on each dispatcher from the group specified earlier in `.for()` call, effectively
// adding converters to all specified dispatchers.
//
// @private
// @param {Array.<module:engine/conversion/downcastdispatcher~DowncastDispatcher|
// module:engine/conversion/upcastdispatcher~UpcastDispatcher>} dispatchers
// @param {Function} conversionHelper
function _addToDispatchers( dispatchers, conversionHelper ) {
	for ( const dispatcher of dispatchers ) {
		conversionHelper( dispatcher );
	}
}

// Helper function that creates a joint array out of an item passed in `definition.view` and items passed in
// `definition.upcastAlso`.
//
// @param {module:engine/conversion/conversion~ConverterDefinition} definition
// @returns {Array} Array containing view definitions.
function* _getAllUpcastDefinitions( definition ) {
	if ( definition.model.values ) {
		for ( const value of definition.model.values ) {
			const model = { key: definition.model.key, value };
			const view = definition.view[ value ];
			const upcastAlso = definition.upcastAlso ? definition.upcastAlso[ value ] : undefined;

			yield* _getUpcastDefinition( model, view, upcastAlso );
		}
	} else {
		yield* _getUpcastDefinition( definition.model, definition.view, definition.upcastAlso );
	}
}

function* _getUpcastDefinition( model, view, upcastAlso ) {
	yield { model, view };

	if ( upcastAlso ) {
		upcastAlso = Array.isArray( upcastAlso ) ? upcastAlso : [ upcastAlso ];

		for ( const upcastAlsoItem of upcastAlso ) {
			yield { model, view: upcastAlsoItem };
		}
	}
}
