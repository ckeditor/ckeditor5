/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/conversion
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * A utility class that helps add converters to upcast and downcast dispatchers.
 *
 * We recommend reading the {@glink framework/guides/architecture/editing-engine Editing engine architecture} guide first to
 * understand the core concepts of the conversion mechanisms.
 *
 * The instance of the conversion manager is available in the
 * {@link module:core/editor/editor~Editor#conversion `editor.conversion`} property
 * and by default has the following groups of dispatchers (i.e. directions of conversion):
 *
 * * `downcast` (editing and data downcasts)
 * * `editingDowncast`
 * * `dataDowncast`
 * * `upcast`
 *
 * To add a converter to a specific group, use the {@link module:engine/conversion/conversion~Conversion#for `for()`}
 * method:
 *
 *		// Add a converter to editing downcast and data downcast.
 *		editor.conversion.for( 'downcast' ).elementToElement( config ) );
 *
 *		// Add a converter to the data pipepline only:
 *		editor.conversion.for( 'dataDowncast' ).elementToElement( dataConversionConfig ) );
 *
 *		// And a slightly different one for the editing pipeline:
 *		editor.conversion.for( 'editingDowncast' ).elementToElement( editingConversionConfig ) );
 *
 * The functions used in `add()` calls are one-way converters (i.e. you need to remember yourself to add
 * a converter in the other direction, if your feature requires that). They are also called "conversion helpers".
 * You can find a set of them in the {@link module:engine/conversion/downcasthelpers} and
 * {@link module:engine/conversion/upcasthelpers} modules.
 *
 * Besides allowing to register converters to specific dispatchers, you can also use methods available in this
 * class to add two-way converters (upcast and downcast):
 *
 * * {@link module:engine/conversion/conversion~Conversion#elementToElement `elementToElement()`} &ndash;
 * Model element to view element and vice versa.
 * * {@link module:engine/conversion/conversion~Conversion#attributeToElement `attributeToElement()`} &ndash;
 * Model attribute to view element and vice versa.
 * * {@link module:engine/conversion/conversion~Conversion#attributeToAttribute `attributeToAttribute()`} &ndash;
 * Model attribute to view element and vice versa.
 */
export default class Conversion {
	/**
	 * Creates a new conversion instance.
	 */
	constructor() {
		/**
		 * @private
		 * @member {Map}
		 */
		this._conversionHelpers = new Map();
	}

	/**
	 * Registers one or more converters under a given group name. The group name can then be used to assign a converter
	 * to multiple dispatchers at once.
	 *
	 * If a given group name is used for the second time, the
	 * {@link module:utils/ckeditorerror~CKEditorError `conversion-register-group-exists` error} is thrown.
	 *
	 * @param {String} name The name for dispatchers group.
	 * @param {module:engine/conversion/downcasthelpers~DowncastHelpers|
	 * module:engine/conversion/upcasthelpers~UpcastHelpers} conversionHelpers
	 */
	register( name, conversionHelpers ) {
		if ( this._conversionHelpers.has( name ) ) {
			/**
			 * Trying to register a group name that was already registered.
			 *
			 * @error conversion-register-group-exists
			 */
			throw new CKEditorError( 'conversion-register-group-exists: Trying to register a group name that was already registered.' );
		}

		this._conversionHelpers.set( name, conversionHelpers );
	}

	/**
	 * Provides chainable API to assign converters to dispatchers registered under a given group name. Converters are added
	 * by calling the {@link module:engine/conversion/conversion~ConversionHelpers#add `.add()`} method of an
	 * {@link module:engine/conversion/conversion~ConversionHelpers conversion helpers} returned by this function.
	 *
	 *		editor.conversion.for( 'downcast' )
	 *			.add( conversionHelperA ) // Adds a custom converter A.
	 *			.add( conversionHelperB ) // Adds a custom converter B.
	 *			.elementToElement( config ); // Adds a custom element-to-element downcast converter.
	 *
	 * In this example `conversionHelperA` and `conversionHelperB` will be called for all dispatchers from the `'model'` group.
	 *
	 * The `.add()` method takes exactly one parameter, which is a function. This function should accept one parameter that
	 * is a dispatcher instance. The function should add an actual converter to the passed dispatcher instance.
	 *
	 * Conversion helpers for most common cases are already provided. They are flexible enough to cover most use cases.
	 * See the documentation to learn how they can be configured.
	 *
	 * For downcast (model-to-view conversion), these are:
	 *
	 * * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement Downcast element-to-element converter},
	 * * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement Downcast attribute-to-element converter},
	 * * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToAttribute Downcast attribute-to-attribute converter}.
	 * * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#markerToElement Downcast marker-to-element converter}.
	 * * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#markerToHighlight Downcast marker-to-highlight converter}.
	 *
	 * For upcast (view-to-model conversion), these are:
	 *
	 * * {@link module:engine/conversion/upcasthelpers~UpcastHelpers#elementToElement Upcast element-to-element converter},
	 * * {@link module:engine/conversion/upcasthelpers~UpcastHelpers#elementToAttribute Upcast attribute-to-element converter},
	 * * {@link module:engine/conversion/upcasthelpers~UpcastHelpers#attributeToAttribute Upcast attribute-to-attribute converter}.
	 * * {@link module:engine/conversion/upcasthelpers~UpcastHelpers#elementToMarker Upcast element-to-marker converter}.
	 *
	 * An example of using conversion helpers to convert the `paragraph` model element to the `p` view element (and back):
	 *
	 *		// Define conversion configuration - model element 'paragraph' should be converted to view element 'p'.
	 *		const config = { model: 'paragraph', view: 'p' };
	 *
	 *		// Add converters to proper dispatchers using conversion helpers.
	 *		editor.conversion.for( 'downcast' ).elementToElement( config ) );
	 *		editor.conversion.for( 'upcast' ).elementToElement( config ) );
	 *
	 * @param {String} groupName The name of dispatchers group to add the converters to.
	 * @returns {module:engine/conversion/downcasthelpers~DowncastHelpers|module:engine/conversion/upcasthelpers~UpcastHelpers}
	 */
	for( groupName ) {
		return this._getConversionHelpers( groupName );
	}

	/**
	 * Sets up converters between the model and the view that convert a model element to a view element (and vice versa).
	 * For example, the model `<paragraph>Foo</paragraph>` is `<p>Foo</p>` in the view.
	 *
	 *		// A simple conversion from the `paragraph` model element to the `<p>` view element (and vice versa).
	 *		conversion.elementToElement( { model: 'paragraph', view: 'p' } );
	 *
	 *		// Override other converters by specifying a converter definition with a higher priority.
	 *		conversion.elementToElement( { model: 'paragraph', view: 'div', converterPriority: 'high' } );
	 *
	 *		// View specified as an object instead of a string.
	 *		conversion.elementToElement( {
	 *			model: 'fancyParagraph',
	 *			view: {
	 *				name: 'p',
	 *				classes: 'fancy'
	 *			}
	 *		} );
	 *
	 *		// Use `upcastAlso` to define other view elements that should also be converted to a `paragraph` element.
	 *		conversion.elementToElement( {
	 *			model: 'paragraph',
	 *			view: 'p',
	 *			upcastAlso: [
	 *				'div',
	 *				{
	 *					// Any element with the `display: block` style.
	 *					styles: {
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
	 *					// Returned value can be an object with the matched properties.
	 *					// These properties will be "consumed" during the conversion.
	 *					// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more details.
	 *
	 *					return { name: true, styles: [ 'font-size' ] };
	 *				}
	 *
	 *				return null;
	 *			}
	 *		} );
	 *
	 * `definition.model` is a `String` with a model element name to convert from or to.
	 * See {@link module:engine/conversion/conversion~ConverterDefinition} to learn about other parameters.
	 *
	 * @param {module:engine/conversion/conversion~ConverterDefinition} definition The converter definition.
	 */
	elementToElement( definition ) {
		// Set up downcast converter.
		this.for( 'downcast' ).elementToElement( definition );

		// Set up upcast converter.
		for ( const { model, view } of _getAllUpcastDefinitions( definition ) ) {
			this.for( 'upcast' )
				.elementToElement( {
					model,
					view,
					converterPriority: definition.converterPriority
				} );
		}
	}

	/**
	 * Sets up converters between the model and the view that convert a model attribute to a view element (and vice versa).
	 * For example, a model text node with `"Foo"` as data and the `bold` attribute is `<strong>Foo</strong>` in the view.
	 *
	 *		// A simple conversion from the `bold=true` attribute to the `<strong>` view element (and vice versa).
	 *		conversion.attributeToElement( { model: 'bold', view: 'strong' } );
	 *
	 *		// Override other converters by specifying a converter definition with a higher priority.
	 *		conversion.attributeToElement( { model: 'bold', view: 'b', converterPriority: 'high' } );
	 *
	 *		// View specified as an object instead of a string.
	 *		conversion.attributeToElement( {
	 *			model: 'bold',
	 *			view: {
	 *				name: 'span',
	 *				classes: 'bold'
	 *			}
	 *		} );
	 *
	 *		// Use `config.model.name` to define the conversion only from a given node type, `$text` in this case.
	 *		// The same attribute on different elements may then be handled by a different converter.
	 *		conversion.attributeToElement( {
	 *			model: {
	 *				key: 'textDecoration',
	 *				values: [ 'underline', 'lineThrough' ],
	 *				name: '$text'
	 *			},
	 *			view: {
	 *				underline: {
	 *					name: 'span',
	 *					styles: {
	 *						'text-decoration': 'underline'
	 *					}
	 *				},
	 *				lineThrough: {
	 *					name: 'span',
	 *					styles: {
	 *						'text-decoration': 'line-through'
	 *					}
	 *				}
	 *			}
	 *		} );
	 *
	 *		// Use `upcastAlso` to define other view elements that should also be converted to the `bold` attribute.
	 *		conversion.attributeToElement( {
	 *			model: 'bold',
	 *			view: 'strong',
	 *			upcastAlso: [
	 *				'b',
	 *				{
	 *					name: 'span',
	 *					classes: 'bold'
	 *				},
	 *				{
	 *					name: 'span',
	 *					styles: {
	 *						'font-weight': 'bold'
	 *					}
	 *				},
	 *				viewElement => {
	 *					const fontWeight = viewElement.getStyle( 'font-weight' );
	 *
	 *					if ( viewElement.is( 'span' ) && fontWeight && /\d+/.test() && Number( fontWeight ) > 500 ) {
	 *						// Returned value can be an object with the matched properties.
	 *						// These properties will be "consumed" during the conversion.
	 *						// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more details.
	 *
	 *						return {
	 *							name: true,
	 *							styles: [ 'font-weight' ]
	 *						};
	 *					}
	 *				}
	 *			]
	 *		} );
	 *
	 *		// Conversion from and to a model attribute key whose value is an enum (`fontSize=big|small`).
	 *		// `upcastAlso` set as callback enables a conversion of a wide range of different view elements.
	 *		conversion.attributeToElement( {
	 *			model: {
	 *				key: 'fontSize',
	 *				values: [ 'big', 'small' ]
	 *			},
	 *			view: {
	 *				big: {
	 *					name: 'span',
	 *					styles: {
	 *						'font-size': '1.2em'
	 *					}
	 *				},
	 *				small: {
	 *					name: 'span',
	 *					styles: {
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
	 *						// Returned value can be an object with the matched properties.
	 *						// These properties will be "consumed" during the conversion.
	 *						// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more details.
	 *
	 *						return { name: true, styles: [ 'font-size' ] };
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
	 *						// Returned value can be an object with the matched properties.
	 *						// These properties will be "consumed" during the conversion.
	 *						// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more details.
	 *
	 *						return { name: true, styles: [ 'font-size' ] };
	 *					}
	 *
	 *					return null;
	 *				}
	 *			}
	 *		} );
	 *
	 * The `definition.model` parameter specifies which model attribute should be converted from or to. It can be a `{ key, value }` object
	 * describing the attribute key and value to convert or a `String` specifying just the attribute key (then `value` is set to `true`).
	 * See {@link module:engine/conversion/conversion~ConverterDefinition} to learn about other parameters.
	 *
	 * @param {module:engine/conversion/conversion~ConverterDefinition} definition The converter definition.
	 */
	attributeToElement( definition ) {
		// Set up downcast converter.
		this.for( 'downcast' ).attributeToElement( definition );

		// Set up upcast converter.
		for ( const { model, view } of _getAllUpcastDefinitions( definition ) ) {
			this.for( 'upcast' )
				.elementToAttribute( {
					view,
					model,
					converterPriority: definition.converterPriority
				} );
		}
	}

	/**
	 * Sets up converters between the model and the view that convert a model attribute to a view attribute (and vice versa).
	 * For example, `<image src='foo.jpg'></image>` is converted to `<img src='foo.jpg'></img>` (the same attribute key and value).
	 * This type of converters is intended to be used with {@link module:engine/model/element~Element model element} nodes.
	 * To convert text attributes {@link module:engine/conversion/conversion~Conversion#attributeToElement `attributeToElement converter`}
	 * should be set up.
	 *
	 *		// A simple conversion from the `source` model attribute to the `src` view attribute (and vice versa).
	 *		conversion.attributeToAttribute( { model: 'source', view: 'src' } );
	 *
	 *		// Attribute values are strictly specified.
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
	 *		// Set the style attribute.
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
	 *		// Conversion from and to a model attribute key whose value is an enum (`align=right|center`).
	 *		// Use `upcastAlso` to define other view elements that should also be converted to the `align=right` attribute.
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
	 *					styles: {
	 *						'text-align': 'right'
	 *					}
	 *				},
	 *				center: {
	 *					styles: {
	 *						'text-align': 'center'
	 *					}
	 *				}
	 *			}
	 *		} );
	 *
	 * The `definition.model` parameter specifies which model attribute should be converted from and to.
	 * It can be a `{ key, [ values ], [ name ] }` object or a `String`, which will be treated like `{ key: definition.model }`.
	 * The `key` property is the model attribute key to convert from and to.
	 * The `values` are the possible model attribute values. If `values` is not set, the model attribute value will be the same as the
	 * view attribute value.
	 * If `name` is set, the conversion will be set up only for model elements with the given name.
	 *
	 * The `definition.view` parameter specifies which view attribute should be converted from and to.
	 * It can be a `{ key, value, [ name ] }` object or a `String`, which will be treated like `{ key: definition.view }`.
	 * The `key` property is the view attribute key to convert from and to.
	 * The `value` is the view attribute value to convert from and to. If `definition.value` is not set, the view attribute value will be
	 * the same as the model attribute value.
	 * If `key` is `'class'`, `value` can be a `String` or an array of `String`s.
	 * If `key` is `'style'`, `value` is an object with key-value pairs.
	 * In other cases, `value` is a `String`.
	 * If `name` is set, the conversion will be set up only for model elements with the given name.
	 * If `definition.model.values` is set, `definition.view` is an object that assigns values from `definition.model.values`
	 * to `{ key, value, [ name ] }` objects.
	 *
	 * `definition.upcastAlso` specifies which other matching view elements should also be upcast to the given model configuration.
	 * If `definition.model.values` is set, `definition.upcastAlso` should be an object assigning values from `definition.model.values`
	 * to {@link module:engine/view/matcher~MatcherPattern}s or arrays of {@link module:engine/view/matcher~MatcherPattern}s.
	 *
	 * **Note:** `definition.model` and `definition.view` form should be mirrored, so the same types of parameters should
	 * be given in both parameters.
	 *
	 * @param {Object} definition The converter definition.
	 * @param {String|Object} definition.model The model attribute to convert from and to.
	 * @param {String|Object} definition.view The view attribute to convert from and to.
	 * @param {module:engine/view/matcher~MatcherPattern|Array.<module:engine/view/matcher~MatcherPattern>} [definition.upcastAlso]
	 * Any view element matching `definition.upcastAlso` will also be converted to the given model attribute. `definition.upcastAlso`
	 * is used only if `config.model.values` is specified.
	 */
	attributeToAttribute( definition ) {
		// Set up downcast converter.
		this.for( 'downcast' ).attributeToAttribute( definition );

		// Set up upcast converter.
		for ( const { model, view } of _getAllUpcastDefinitions( definition ) ) {
			this.for( 'upcast' )
				.attributeToAttribute( {
					view,
					model
				} );
		}
	}

	/**
	 * Returns conversion helpers registered under a given name.
	 *
	 * If the given group name has not been registered, the
	 * {@link module:utils/ckeditorerror~CKEditorError `conversion-for-unknown-group` error} is thrown.
	 *
	 * @private
	 * @param {String} groupName
	 * @returns {module:engine/conversion/downcasthelpers~DowncastHelpers|module:engine/conversion/upcasthelpers~UpcastHelpers}
	 */
	_getConversionHelpers( groupName ) {
		if ( !this._conversionHelpers.has( groupName ) ) {
			/**
			 * Trying to add a converter to an unknown dispatchers group.
			 *
			 * @error conversion-for-unknown-group
			 */
			throw new CKEditorError( 'conversion-for-unknown-group: Trying to add a converter to an unknown dispatchers group.' );
		}

		return this._conversionHelpers.get( groupName );
	}
}

/**
 * Defines how the model should be converted from and to the view.
 *
 * @typedef {Object} module:engine/conversion/conversion~ConverterDefinition
 *
 * @property {*} [model] The model conversion definition. Describes the model element or model attribute to convert. This parameter differs
 * for different functions that accept `ConverterDefinition`. See the description of the function to learn how to set it.
 * @property {module:engine/view/elementdefinition~ElementDefinition|Object} view The definition of the view element to convert from and
 * to. If `model` describes multiple values, `view` is an object that assigns these values (`view` object keys) to view element definitions
 * (`view` object values).
 * @property {module:engine/view/matcher~MatcherPattern|Array.<module:engine/view/matcher~MatcherPattern>} [upcastAlso]
 * Any view element matching `upcastAlso` will also be converted to the model. If `model` describes multiple values, `upcastAlso`
 * is an object that assigns these values (`upcastAlso` object keys) to {@link module:engine/view/matcher~MatcherPattern}s
 * (`upcastAlso` object values).
 * @property {module:utils/priorities~PriorityString} [converterPriority] The converter priority.
 */

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

/**
 * Base class for conversion helpers.
 */
export class ConversionHelpers {
	/**
	 * Creates ConversionHelpers instance.
	 *
	 * @param {Array.<module:engine/conversion/downcastdispatcher~DowncastDispatcher|
	 * module:engine/conversion/upcastdispatcher~UpcastDispatcher>} dispatcher
	 */
	constructor( dispatcher ) {
		this._dispatchers = Array.isArray( dispatcher ) ? dispatcher : [ dispatcher ];
	}

	/**
	 * Registers a conversion helper.
	 *
	 * **Note**: See full usage example in the `{@link module:engine/conversion/conversion~Conversion#for conversion.for()}`
	 * method description
	 *
	 * @param {Function} conversionHelper The function to be called on event.
	 * @returns {module:engine/conversion/downcasthelpers~DowncastHelpers|module:engine/conversion/upcasthelpers~UpcastHelpers}
	 */
	add( conversionHelper ) {
		this._addToDispatchers( conversionHelper );

		return this;
	}

	/**
	 * Helper function for the `Conversion` `.add()` method.
	 *
	 * Calls `conversionHelper` on each dispatcher from the group specified earlier in the `.for()` call, effectively
	 * adding converters to all specified dispatchers.
	 *
	 * @private
	 * @param {Function} conversionHelper
	 */
	_addToDispatchers( conversionHelper ) {
		for ( const dispatcher of this._dispatchers ) {
			conversionHelper( dispatcher );
		}
	}
}
