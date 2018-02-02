/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/definition-conversion
 */

import {
	elementToElement as mtvElementToElement,
	attributeToElement as mtvAttributeToElement,
	attributeToAttribute as mtvAttributeToAttribute
} from './model-to-view-helpers';

import {
	elementToElement as vtmElementToElement,
	elementToAttribute as vtmElementToAttribute,
	attributeToAttribute as vtmAttributeToAttribute
} from './view-to-model-helpers';

/**
 * Defines a conversion between the model and the view where a model element is represented as a view element (and vice versa).
 * For example, model `<paragraph>Foo</paragraph>` is `<p>Foo</p>` in the view.
 *
 *		modelElementIsViewElement( conversion, { model: 'paragraph', view: 'p' } );
 *
 *		modelElementIsViewElement( conversion, {
 *			model: 'fancyParagraph',
 *			view: {
 *				name: 'p',
 *				class: 'fancy'
 *			}
 *		} );
 *
 *		modelElementIsViewElement( conversion, {
 *			model: 'blockquote',
 *			view: 'blockquote',
 *			alternativeView: [
 *				{
 *					name: 'div',
 *					class: 'blockquote'
 *				}
 *			]
 *		} );
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion Conversion class instance with registered conversion dispatchers.
 * @param {Object} definition Conversion definition.
 * @param {String} definition.model Name of the model element to convert.
 * @param {String|module:engine/view/viewelementdefinition~ViewElementDefinition} definition.view Name or a definition of
 * a view element to convert.
 * @param {Array.<String|module:engine/view/viewelementdefinition~ViewElementDefinition>} [definition.alternativeView]
 * Alternative forms of view, that also should be converted to model. Keep in mind that those will be "converted back"
 * to the main form, given in `definition.view`.
 */
export function modelElementIsViewElement( conversion, definition ) {
	// Set model-to-view conversion.
	conversion.for( 'model' ).add( mtvElementToElement( definition ) );

	// Set view-to-model conversion.
	for ( const view of _getAllViews( definition ) ) {
		conversion.for( 'view' ).add( vtmElementToElement( {
			model: definition.model,
			view
		} ) );
	}
}

/**
 * Defines a conversion between the model and the view where a model attribute is represented as a view element (and vice versa).
 * For example, model text node with data `"Foo"` and `bold` attribute is `<strong>Foo</strong>` in the view.
 *
 *		modelAttributeIsViewElement( conversion, 'bold', { view: 'strong' } );
 *
 *		modelAttributeIsViewElement( conversion, 'bold', {
 *			view: {
 *				name: 'span',
 *				class: 'bold'
 *			}
 *		} );
 *
 *		modelAttributeIsViewElement( conversion, 'bold', {
 *			view: 'strong',
 *			alternativeView: [
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
 *				}
 *			]
 *		} );
 *
 *		modelAttributeIsViewElement( conversion, 'styled', {
 *			model: 'dark',
 *			view: {
 *				name: 'span',
 *				class: [ 'styled', 'styled-dark' ]
 *			}
 *		} );
 *
 *		modelAttributeIsViewElement( conversion, 'fontSize', [
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
 *		modelAttributeIsViewElement( conversion, 'fontSize', [
 *			{
 *				model: 'big',
 *				view: {
 *					name: 'span',
 *					style: {
 *						'font-size': '1.2em'
 *					}
 *				},
 *				alternativeView: [
 *					{
 *						name: 'span',
 *						style: {
 *							'font-size': '12px'
 *						}
 *					}
 *				]
 *			},
 *			{
 *				model: 'small',
 *				view: {
 *					name: 'span',
 *					style: {
 *						'font-size': '0.8em'
 *					}
 *				},
 *				alternativeView: [
 *					{
 *						name: 'span',
 *						style: {
 *							'font-size': '8px'
 *						}
 *					}
 *				]
 *			}
 *		] );
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion Conversion class instance with registered conversion dispatchers.
 * @param {String} modelAttributeKey The key of the model attribute to convert.
 * @param {Object|Array.<Object>} definition Conversion definition. It is possible to provide multiple definitions in an array.
 * @param {*} [definition.model] The value of the converted model attribute. If omitted, in model-to-view conversion,
 * the item will be treated as a default item, that will be used when no other item matches. In view-to-model conversion,
 * the model attribute value will be set to `true`.
 * @param {String|module:engine/view/viewelementdefinition~ViewElementDefinition} definition.view Name or a definition of
 * a view element to convert.
 * @param {Array.<String|module:engine/view/viewelementdefinition~ViewElementDefinition>} [definition.alternativeView]
 * Alternative forms of view, that also should be converted to model. Keep in mind that those will be "converted back"
 * to the main form, given in `definition.view`.
 */
export function modelAttributeIsViewElement( conversion, modelAttributeKey, definition ) {
	// Set model-to-view conversion.
	conversion.for( 'model' ).add( mtvAttributeToElement( modelAttributeKey, definition ) );

	// Set view-to-model conversion. In this case, we need to re-organise the definition config.
	if ( !Array.isArray( definition ) ) {
		definition = [ definition ];
	}

	for ( const item of definition ) {
		const model = _getModelAttributeDefinition( modelAttributeKey, item.model );

		for ( const view of _getAllViews( item ) ) {
			conversion.for( 'view' ).add( vtmElementToAttribute( {
				view,
				model
			} ) );
		}
	}
}

/**
 * Defines a conversion between the model and the view where a model attribute is represented as a view attribute (and vice versa).
 * For example, `<image src='foo.jpg'></image>` is converted to `<img src='foo.jpg'></img>` (same attribute name and value).
 *
 *		modelAttributeIsViewAttribute( conversion, 'src' );
 *
 *		modelAttributeIsViewAttribute( conversion, 'source', { view: 'src' } );
 *
 *		modelAttributeIsViewAttribute( conversion, 'aside', {
 *			model: true,
 *			view: {
 *				key: 'class',
 *				value: 'aside half-size'
 *			}
 *		} );
 *
 *		modelAttributeIsViewAttribute( conversion, 'styled', [
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
 *		modelAttributeIsViewAttribute( conversion, 'align', [
 *			{
 *				model: 'right',
 *				view: {
 *					key: 'class',
 *					value: 'align-right'
 *				},
 *				alternativeView: [
 *					{
 *						key: 'style',
 *						value: 'text-align:right;'
 *					}
 *				]
 *			},
 *			{
 *				model: 'center',
 *				view: {
 *					key: 'class',
 *					value: 'align-center'
 *				},
 *				alternativeView: [
 *					{
 *						key: 'style',
 *						value: 'text-align:center;'
 *					}
 *				]
 *			}
 *		] );
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion Conversion class instance with registered conversion dispatchers.
 * @param {String} modelAttributeKey The key of the model attribute to convert.
 * @param {Object|Array.<Object>} [definition] Conversion definition. It is possible to provide multiple definitions in an array.
 * If not set, the conversion helper will assume 1-to-1 conversion, that is the model attribute key and value will be same
 * as the view attribute key and value.
 * @param {*} [definition.model] The value of the converted model attribute. If omitted, in model-to-view conversion,
 * the item will be treated as a default item, that will be used when no other item matches. In view-to-model conversion,
 * the model attribute value will be set to the same value as in the view.
 * @param {String|module:engine/view/viewelementdefinition~ViewElementDefinition} definition.view Name or a definition of
 * a view element to convert.
 * @param {Array.<String|module:engine/view/viewelementdefinition~ViewElementDefinition>} [definition.alternativeView]
 * Alternative forms of view, that also should be converted to model. Keep in mind that those will be "converted back"
 * to the main form, given in `definition.view`.
 */
export function modelAttributeIsViewAttribute( conversion, modelAttributeKey, definition ) {
	// Set model-to-view conversion.
	conversion.for( 'model' ).add( mtvAttributeToAttribute( modelAttributeKey, definition ) );

	// Set view-to-model conversion. In this case, we need to re-organise the definition config.
	if ( !definition ) {
		definition = { view: modelAttributeKey };
	}

	if ( !Array.isArray( definition ) ) {
		definition = [ definition ];
	}

	for ( const item of definition ) {
		const model = _getModelAttributeDefinition( modelAttributeKey, item.model );

		for ( const view of _getAllViews( item ) ) {
			conversion.for( 'view' ).add( vtmAttributeToAttribute( {
				view,
				model
			} ) );
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
// `definition.alternativeView`.
//
// @param {Object} definition Conversion definition.
// @returns {Array} Array containing view definitions.
function _getAllViews( definition ) {
	return [].concat( definition.view ).concat( definition.alternativeView || [] );
}
