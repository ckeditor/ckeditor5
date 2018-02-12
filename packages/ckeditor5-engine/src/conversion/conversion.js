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

	/**
	 * Defines a conversion between the model and the view where a model element is represented as a view element (and vice versa).
	 * For example, model `<paragraph>Foo</paragraph>` is `<p>Foo</p>` in the view.
	 *
	 *		conversion.elementToElement( { model: 'paragraph', view: 'p' } );
	 *
	 *		conversion.elementToElement( {
	 *			model: 'fancyParagraph',
	 *			view: {
	 *				name: 'p',
	 *				class: 'fancy'
	 *			}
	 *		} );
	 *
	 *		conversion.elementToElement( {
	 *			model: 'paragraph',
	 *			view: 'p',
	 *			upcastAlso: [
	 *				'div',
	 *				{
	 *					// Match any name.
	 *					name: /./,
	 *					style: {
	 *						display: 'block'
	 *					}
	 *				}
	 *			]
	 *		} );
	 *
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
	 *					return { name: true, style: [ 'font-size' ] };
	 *				}
	 *
	 *				return null;
	 *			}
	 *		} );
	 *
	 * @param {Object} definition Conversion definition.
	 * @param {String} definition.model Name of the model element to convert.
	 * @param {module:engine/view/elementdefinition~ElementDefinition} definition.view Definition of a view element to convert from/to.
	 * @param {module:engine/view/matcher~MatcherPattern|Array.<module:engine/view/matcher~MatcherPattern>} [definition.upcastAlso]
	 * Any view element matching `upcastAlso` will also be converted to the given model element.
	 */
	elementToElement( definition ) {
		// Set up downcast converter.
		this.for( 'downcast' ).add( downcastElementToElement( definition ) );

		// Set up upcast converter.
		for ( const view of _getAllViews( definition ) ) {
			const priority = view == definition.view ? 'normal' : 'high';

			this.for( 'upcast' ).add( upcastElementToElement( {
				model: definition.model,
				view
			}, priority ) );
		}
	}

	/**
	 * Defines a conversion between the model and the view where a model attribute is represented as a view element (and vice versa).
	 * For example, model text node with data `"Foo"` and `bold` attribute is `<strong>Foo</strong>` in the view.
	 *
	 *		conversion.attributeToElement( 'bold', { view: 'strong' } );
	 *
	 *		conversion.attributeToElement( 'bold', {
	 *			view: {
	 *				name: 'span',
	 *				class: 'bold'
	 *			}
	 *		} );
	 *
	 *		conversion.attributeToElement( 'bold', {
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
	 *						return {
	 *							name: true,
	 *							style: [ 'font-weight' ]
	 *						};
	 *					}
	 *				}
	 *			]
	 *		} );
	 *
	 *		conversion.attributeToElement( 'styled', {
	 *			model: 'dark',
	 *			view: {
	 *				name: 'span',
	 *				class: [ 'styled', 'styled-dark' ]
	 *			}
	 *		} );
	 *
	 *		conversion.attributeToElement( 'fontSize', [
	 *			{
	 *				model: 'big',
	 *				view: {
	 *					name: 'span',
	 *					style: {
	 *						'font-size': '1.2em'
	 *					}
	 *				}
	 *			},
	 *			{
	 *				model: 'small',
	 *				view: {
	 *					name: 'span',
	 *					style: {
	 *						'font-size': '0.8em'
	 *					}
	 *				}
	 *			}
	 *		] );
	 *
	 *		conversion.attributeToElement( 'fontSize', [
	 *			{
	 *				model: 'big',
	 *				view: {
	 *					name: 'span',
	 *					style: {
	 *						'font-size': '1.2em'
	 *					}
	 *				},
	 *				upcastAlso: viewElement => {
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
	 *						return { name: true, style: [ 'font-size' ] };
	 *					}
	 *
	 *					return null;
	 *				}
	 *			},
	 *			{
	 *				model: 'small',
	 *				view: {
	 *					name: 'span',
	 *					style: {
	 *						'font-size': '0.8em'
	 *					}
	 *				},
	 *				upcastAlso: viewElement => {
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
	 *						return { name: true, style: [ 'font-size' ] };
	 *					}
	 *
	 *					return null;
	 *				}
	 *			}
	 *		] );
	 *
	 * @param {String} modelAttributeKey The key of the model attribute to convert.
	 * @param {Object|Array.<Object>} definition Conversion definition. It is possible to provide multiple definitions in an array.
	 * @param {*} [definition.model] The value of the converted model attribute. If omitted, when downcasted, the item will be treated
	 * as a default item, that will be used when no other item matches. When upcasted, the model attribute value will be set to `true`.
	 * @param {module:engine/view/elementdefinition~ElementDefinition} definition.view Definition of a view element to convert from/to.
	 * @param {module:engine/view/matcher~MatcherPattern|Array.<module:engine/view/matcher~MatcherPattern>} [definition.upcastAlso]
	 * Any view element matching `upcastAlso` will also be converted to the given model element.
	 */
	attributeToElement( modelAttributeKey, definition ) {
		// Set downcast (model to view conversion).
		this.for( 'downcast' ).add( downcastAttributeToElement( modelAttributeKey, definition ) );

		// Set upcast (view to model conversion). In this case, we need to re-organise the definition config.
		if ( !Array.isArray( definition ) ) {
			definition = [ definition ];
		}

		for ( const item of definition ) {
			const model = _getModelAttributeDefinition( modelAttributeKey, item.model );

			for ( const view of _getAllViews( item ) ) {
				const priority = view == item.view ? 'normal' : 'high';

				this.for( 'upcast' ).add( upcastElementToAttribute( {
					view,
					model
				}, priority ) );
			}
		}
	}

	/**
	 * Defines a conversion between the model and the view where a model attribute is represented as a view attribute (and vice versa).
	 * For example, `<image src='foo.jpg'></image>` is converted to `<img src='foo.jpg'></img>` (same attribute name and value).
	 *
	 *		conversion.attributeToAttribute( 'src' );
	 *
	 *		conversion.attributeToAttribute( 'source', { view: 'src' } );
	 *
	 *		conversion.attributeToAttribute( 'aside', {
	 *			model: true,
	 *			view: {
	 *				name: 'img',
	 *				key: 'class',
	 *				value: 'aside half-size'
	 *			}
	 *		} );
	 *
	 *		conversion.attributeToAttribute( 'styled', [
	 *			{
	 *				model: 'dark',
	 *				view: {
	 *					key: 'class',
	 *					value: 'styled styled-dark'
	 *				}
	 *			},
	 *			{
	 *				model: 'light',
	 *				view: {
	 *					key: 'class',
	 *					value: 'styled styled-light'
	 *				}
	 *			}
	 *		] );
	 *
	 *		conversion.attributeToAttribute( 'align', [
	 *			{
	 *				model: 'right',
	 *				view: {
	 *					key: 'class',
	 *					value: 'align-right'
	 *				},
	 *				upcastAlso: viewElement => {
	 *					if ( viewElement.getStyle( 'text-align' ) == 'right' ) {
	 *						return {
	 *							style: [ 'text-align' ]
	 *						};
	 *					}
	 *
	 *					return null;
	 *				}
	 *			},
	 *			{
	 *				model: 'center',
	 *				view: {
	 *					key: 'class',
	 *					value: 'align-center'
	 *				},
	 *				upcastAlso: {
	 *					style: {
	 *						'text-align': 'center'
	 *					}
	 *				}
	 *			}
	 *		] );
	 *
	 * @param {String} modelAttributeKey The key of the model attribute to convert.
	 * @param {Object|Array.<Object>} [definition] Conversion definition. It is possible to provide multiple definitions in an array.
	 * If not set, the conversion helper will assume 1-to-1 conversion, that is the model attribute key and value will be same
	 * as the view attribute key and value.
	 * @param {*} [definition.model] The value of the converted model attribute. If omitted, when downcasting,
	 * the item will be treated as a default item, that will be used when no other item matches. When upcasting conversion,
	 * the model attribute value will be set to the same value as in the view.
	 * @param {Object} definition.view View attribute conversion details. Given object has required `key` property,
	 * specifying view attribute key, optional `value` property, specifying view attribute value and optional `name`
	 * property specifying a view element name from/on which the attribute should be converted. If `value` is not given,
	 * the view attribute value will be equal to model attribute value.
	 * @param {module:engine/view/matcher~MatcherPattern|Array.<module:engine/view/matcher~MatcherPattern>} [definition.upcastAlso]
	 * Any view element matching `upcastAlso` will also be converted to the given model element.
	 */
	attributeToAttribute( modelAttributeKey, definition ) {
		// Set up downcast converter.
		this.for( 'downcast' ).add( downcastAttributeToAttribute( modelAttributeKey, definition ) );

		// Set up upcast converter. In this case, we need to re-organise the definition config.
		if ( !definition ) {
			definition = { view: modelAttributeKey };
		}

		if ( !Array.isArray( definition ) ) {
			definition = [ definition ];
		}

		for ( const item of definition ) {
			const model = _getModelAttributeDefinition( modelAttributeKey, item.model );

			for ( const view of _getAllViews( item ) ) {
				const priority = view == item.view ? 'low' : 'normal';

				this.for( 'upcast' ).add( upcastAttributeToAttribute( {
					view,
					model
				}, priority ) );
			}
		}
	}
}

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

// Helper function, normalizes input data into a correct config form that can be accepted by conversion helpers. The
// correct form is either `String` or an object with `key` and `value` properties.
//
// @param {String} key Model attribute key.
// @param {*} [model] Model attribute value.
// @returns {Object} Normalized model attribute definition.
function _getModelAttributeDefinition( key, model ) {
	if ( model === undefined ) {
		return key;
	} else {
		return {
			key, value: model
		};
	}
}

// Helper function that creates a joint array out of an item passed in `definition.view` and items passed in
// `definition.upcastAlso`.
//
// @param {Object} definition Conversion definition.
// @returns {Array} Array containing view definitions.
function _getAllViews( definition ) {
	if ( !definition.upcastAlso ) {
		return [ definition.view ];
	} else {
		const upcastAlso = Array.isArray( definition.upcastAlso ) ? definition.upcastAlso : [ definition.upcastAlso ];

		return [ definition.view ].concat( upcastAlso );
	}
}
