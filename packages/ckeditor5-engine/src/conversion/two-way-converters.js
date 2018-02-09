/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/two-way-converters
 */

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
 * Defines a conversion between the model and the view where a model element is represented as a view element (and vice versa).
 * For example, model `<paragraph>Foo</paragraph>` is `<p>Foo</p>` in the view.
 *
 *		elementToElement( conversion, { model: 'paragraph', view: 'p' } );
 *
 *		elementToElement( conversion, {
 *			model: 'fancyParagraph',
 *			view: {
 *				name: 'p',
 *				class: 'fancy'
 *			}
 *		} );
 *
 *		elementToElement( conversion, {
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
 *		elementToElement( conversion, {
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
 * @param {module:engine/conversion/conversion~Conversion} conversion Conversion class instance with registered conversion dispatchers.
 * @param {Object} definition Conversion definition.
 * @param {String} definition.model Name of the model element to convert.
 * @param {module:engine/view/elementdefinition~ElementDefinition} definition.view Definition of a view element to convert from/to.
 * @param {module:engine/view/matcher~MatcherPattern|Array.<module:engine/view/matcher~MatcherPattern>} [definition.upcastAlso]
 * Any view element matching `upcastAlso` will also be converted to the given model element.
 */
export function elementToElement( conversion, definition ) {
	// Set up downcast converter.
	conversion.for( 'downcast' ).add( downcastElementToElement( definition ) );

	// Set up upcast converter.
	for ( const view of _getAllViews( definition ) ) {
		const priority = view == definition.view ? 'normal' : 'high';

		conversion.for( 'upcast' ).add( upcastElementToElement( {
			model: definition.model,
			view
		}, priority ) );
	}
}

/**
 * Defines a conversion between the model and the view where a model attribute is represented as a view element (and vice versa).
 * For example, model text node with data `"Foo"` and `bold` attribute is `<strong>Foo</strong>` in the view.
 *
 *		attributeToElement( conversion, 'bold', { view: 'strong' } );
 *
 *		attributeToElement( conversion, 'bold', {
 *			view: {
 *				name: 'span',
 *				class: 'bold'
 *			}
 *		} );
 *
 *		attributeToElement( conversion, 'bold', {
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
 *		attributeToElement( conversion, 'styled', {
 *			model: 'dark',
 *			view: {
 *				name: 'span',
 *				class: [ 'styled', 'styled-dark' ]
 *			}
 *		} );
 *
 *		attributeToElement( conversion, 'fontSize', [
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
 *		attributeToElement( conversion, 'fontSize', [
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
 * @param {module:engine/conversion/conversion~Conversion} conversion Conversion class instance with registered conversion dispatchers.
 * @param {String} modelAttributeKey The key of the model attribute to convert.
 * @param {Object|Array.<Object>} definition Conversion definition. It is possible to provide multiple definitions in an array.
 * @param {*} [definition.model] The value of the converted model attribute. If omitted, when downcasted, the item will be treated
 * as a default item, that will be used when no other item matches. When upcasted, the model attribute value will be set to `true`.
 * @param {module:engine/view/elementdefinition~ElementDefinition} definition.view Definition of a view element to convert from/to.
 * @param {module:engine/view/matcher~MatcherPattern|Array.<module:engine/view/matcher~MatcherPattern>} [definition.upcastAlso]
 * Any view element matching `upcastAlso` will also be converted to the given model element.
 */
export function attributeToElement( conversion, modelAttributeKey, definition ) {
	// Set downcast (model to view conversion).
	conversion.for( 'downcast' ).add( downcastAttributeToElement( modelAttributeKey, definition ) );

	// Set upcast (view to model conversion). In this case, we need to re-organise the definition config.
	if ( !Array.isArray( definition ) ) {
		definition = [ definition ];
	}

	for ( const item of definition ) {
		const model = _getModelAttributeDefinition( modelAttributeKey, item.model );

		for ( const view of _getAllViews( item ) ) {
			const priority = view == item.view ? 'normal' : 'high';

			conversion.for( 'upcast' ).add( upcastElementToAttribute( {
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
 *		attributeToAttribute( conversion, 'src' );
 *
 *		attributeToAttribute( conversion, 'source', { view: 'src' } );
 *
 *		attributeToAttribute( conversion, 'aside', {
 *			model: true,
 *			view: {
 *				name: 'img',
 *				key: 'class',
 *				value: 'aside half-size'
 *			}
 *		} );
 *
 *		attributeToAttribute( conversion, 'styled', [
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
 *		attributeToAttribute( conversion, 'align', [
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
 * @param {module:engine/conversion/conversion~Conversion} conversion Conversion class instance with registered conversion dispatchers.
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
export function attributeToAttribute( conversion, modelAttributeKey, definition ) {
	// Set up downcast converter.
	conversion.for( 'downcast' ).add( downcastAttributeToAttribute( modelAttributeKey, definition ) );

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

			conversion.for( 'upcast' ).add( upcastAttributeToAttribute( {
				view,
				model
			}, priority ) );
		}
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
