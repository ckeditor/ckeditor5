/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/definition-based-converters
 */

import AttributeElement from '../view/attributeelement';
import ViewContainerElement from '../view/containerelement';

import buildModelConverter from './buildmodelconverter';
import buildViewConverter from './buildviewconverter';

/**
 * Helper for creating model to view converter from model's element
 * to {@link module:engine/view/containerelement~ContainerElement}.
 *
 * By defining conversion as simple model element to view element conversion using simplified definition:
 *
 *		modelElementToViewContainerElement( {
 *			model: 'heading1',
 *			view: 'h1',
 *		}, [ editor.editing.modelToView, editor.data.modelToView ] );
 *
 * Or defining full-flavored view object:
 *
 *		modelElementToViewContainerElement( {
 *			model: 'heading1',
 *			view: {
 *				name: 'h1',
 *				class: [ 'header', 'article-header' ],
 *				attribute: {
 *					data-header: 'level-1',
 *				}
 *			},
 *		}, [ editor.editing.modelToView, editor.data.modelToView ] );
 *
 * Above will generate the following view element:
 *
 *		<h1 class="header article-header" data-header="level-1">...</h1>
 *
 * @param {module:engine/conversion/definition-based-converters~ConverterDefinition} definition A conversion configuration.
 * @param {Array.<module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher>} dispatchers
 */
export function modelElementToViewContainerElement( definition, dispatchers ) {
	const { model: modelElement, targetView } = normalizeConverterDefinition( definition );

	buildModelConverter()
		.for( ...dispatchers )
		.fromElement( modelElement )
		.toElement( () => createViewElementFromDefinition( targetView, ViewContainerElement ) );
}

/**
 * Helper for creating view to model element converter. It will convert also all matched view elements defined in
 * `acceptAlso` property. The `model` property is used as model element name.
 *
 * Conversion from model to view might be defined as simple one to one conversion:
 *
 *		viewToModelElement( { model: 'heading1', view: 'h1' }, [ dispatcher ] );
 *
 * As a full-flavored definition:
 *
 *		viewToModelElement( {
 *			model: 'heading1',
 *			view: {
 *				name: 'p',
 *				attribute: {
 *					'data-heading': 'true'
 *				},
 *				// You may need to use a high-priority listener to catch elements
 *				// which are handled by other (usually – more generic) converters too.
 *				priority: 'high'
 *			}
  *		}, [ editor.data.viewToModel ] );
 *
 * or with `acceptAlso` property to match many elements:
 *
 *		viewToModelElement( {
 *			model: 'heading1',
 *			view: 'h1',
 *			acceptAlso: [
 *				{ name: 'p', attribute: { 'data-heading': 'level1' }, priority: 'high' },
 *				{ name: 'h2', class: 'heading-main' },
 *				{ name: 'div', style: { 'font-weight': 'bold', font-size: '24px' } }
 *			]
 *		}, [ editor.data.viewToModel ] );
 *
 * The above example will convert an existing view elements:
 *
 *		<h1>A heading</h1>
 *		<h2 class="heading-main">Another heading</h2>
 *		<p data-heading="level1">Paragraph-like heading</p>
 *		<div style="font-size:24px; font-weigh:bold;">Another non-semantic header</div>
 *
 * into `heading1` model elements so in model it will be represented as:
 *
 *		<heading1>A heading</heading1>
 *		<heading1>Another heading</heading1>
 *		<heading1>Paragraph-like heading</heading1>
 *		<heading1>Another non-semantic header</heading1>
 *
 * @param {module:engine/conversion/definition-based-converters~ConverterDefinition} definition A conversion configuration.
 * @param {Array.<module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher>} dispatchers
 */
export function viewToModelElement( definition, dispatchers ) {
	const { model: modelElement, sourceViews } = normalizeConverterDefinition( definition );

	const converter = prepareViewConverter( dispatchers, sourceViews );

	converter.toElement( modelElement );
}

/**
 * Helper for creating model to view converter from model's attribute
 * to {@link module:engine/view/attributeelement~AttributeElement}.
 *
 * By defining conversion as simple model element to view element conversion using simplified definition:
 *
 *        modelAttributeToViewAttributeElement( 'bold', [
 *            {
 *				model: 'true',
 *				view: 'strong'
 *			}
 *        ], [ editor.editing.modelToView, editor.data.modelToView ] );
 *
 * Or defining full-flavored view objects:
 *
 *        modelAttributeToViewAttributeElement( 'fontSize', [
 *            {
 *				model: 'big',
 *				view: {
 *					name: 'span',
 *					style: { 'font-size': '1.2em' }
 *				},
 *			},
 *            {
 *				model: 'small',
 *				view: {
 *					name: 'span',
 *					style: { 'font-size': '0.8em' }
 *				},
 *			}
 *        ], [ editor.editing.modelToView, editor.data.modelToView ] );
 *
 * Above will generate the following view element for model's attribute `fontSize` with a `big` value set:
 *
 *		<span style="font-size:1.2em;">...</span>
 *
 * @param {String} attributeName The name of the model attribute which should be converted.
 * @param {Array.<module:engine/conversion/definition-based-converters~ConverterDefinition>} definitions A conversion configuration objects
 * for each possible attribute value.
 * @param {Array.<module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher>} dispatchers
 */
export function modelAttributeToViewAttributeElement( attributeName, definitions, dispatchers ) {
	// Create a map of attributeValue - to - ViewElementDefinition.
	const valueToTargetViewMap = definitions
		.map( normalizeConverterDefinition )
		.reduce( ( mapObject, normalizedDefinition ) => {
			mapObject[ normalizedDefinition.model ] = normalizedDefinition.targetView;

			return mapObject;
		}, {} );

	buildModelConverter()
		.for( ...dispatchers )
		.fromAttribute( attributeName )
		.toElement( value => {
			const targetView = valueToTargetViewMap[ value ];

			if ( !targetView ) {
				return;
			}

			return createViewElementFromDefinition( targetView, AttributeElement );
		} );
}

/**
 * Helper for creating view to model converter from view to model attribute. It will convert also all matched view elements defined in
 * `acceptAlso` property. The `model` property is used as model's attribute value to match.
 *
 * Conversion from model to view might be defined as simple one to one conversion:
 *
 *		viewToModelAttribute( 'bold', { model: true, view: 'strong' }, [ dispatcher ] );
 *
 * As a full-flavored definition:
 *
 *		viewToModelAttribute( 'fontSize', {
 *			model: 'big',
 *			view: {
 *				name: 'span',
 *				style: {
 *					'font-size': '1.2em'
 *				}
 *			}
 *		}, [ editor.data.viewToModel ] );
 *
 * or with `acceptAlso` property to match many elements:
 *
 *		viewToModelAttribute( 'fontSize', {
 *			model: 'big',
 *			view: {
 *				name: 'span',
 *				class: 'text-big'
 *			},
 *			acceptAlso: [
 *				{ name: 'span', attribute: { 'data-size': 'big' } },
 *				{ name: 'span', class: [ 'font', 'font-huge' ] },
 *				{ name: 'span', style: { font-size: '18px' } }
 *			]
 *		}, [ editor.data.viewToModel ] );
 *
 * The above example will convert an existing view elements:
 *
 *		<p>
 *			An example text with some big elements:
 *			<span class="text-big>one</span>,
 *			<span data-size="big>two</span>,
 *			<span class="font font-huge>three</span>,
 *			<span style="font-size:18px>four</span>
 *		</p>
 *
 * into `fontSize` model attribute with 'big' value set so it will be represented:
 *
 *		<paragraph>
 *			An example text with some big elements:
 *			<$text fontSize="big>one</$text>,
 *			<$text fontSize="big>two</$text>,
 *			<$text fontSize="big>three</$text>,
 *			<$text fontSize="big>four</$text>
 *		</paragraph>
 *
 * @param {String} attributeName Attribute name to which convert.
 * @param {module:engine/conversion/definition-based-converters~ConverterDefinition} definition A conversion configuration.
 * @param {Array.<module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher>} dispatchers
 */
export function viewToModelAttribute( attributeName, definition, dispatchers ) {
	const { model: attributeValue, sourceViews } = normalizeConverterDefinition( definition );

	const converter = prepareViewConverter( dispatchers, sourceViews );

	converter.toAttribute( () => ( {
		key: attributeName,
		value: attributeValue
	} ) );
}

// Normalize a {@link module:engine/conversion/definition-based-converters~ConverterDefinition}
// into internal object used when building converters.
//
// @param {module:engine/conversion/definition-based-converters~ConverterDefinition} definition An object that defines view to model
// and model to view conversion.
// @returns {Object}
function normalizeConverterDefinition( definition ) {
	const model = definition.model;
	const view = definition.view;

	// View definition might be defined as a name of an element.
	const targetView = typeof view == 'string' ? { name: view } : view;

	const sourceViews = Array.from( definition.acceptsAlso ? definition.acceptsAlso : [] );

	// Source views also accepts default view definition used in model-to-view conversion.
	sourceViews.push( targetView );

	return { model, targetView, sourceViews };
}

// Helper method for preparing a view converter from passed view definitions.
//
// @param {Array.<module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher>} dispatchers
// @param {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} viewDefinitions
// @returns {module:engine/conversion/buildviewconverter~ViewConverterBuilder}
function prepareViewConverter( dispatchers, viewDefinitions ) {
	const converter = buildViewConverter().for( ...dispatchers );

	for ( const viewDefinition of viewDefinitions ) {
		converter.from( Object.assign( {}, viewDefinition ) );

		if ( viewDefinition.priority ) {
			converter.withPriority( viewDefinition.priority );
		}
	}

	return converter;
}

// Creates view element instance from provided viewElementDefinition and class.
//
// @param {module:engine/view/viewelementdefinition~ViewElementDefinition} viewElementDefinition
// @param {Function} ViewElementClass
// @returns {module:engine/view/element~Element}
function createViewElementFromDefinition( viewElementDefinition, ViewElementClass ) {
	const element = new ViewElementClass( viewElementDefinition.name, Object.assign( {}, viewElementDefinition.attribute ) );

	if ( viewElementDefinition.style ) {
		element.setStyle( viewElementDefinition.style );
	}

	const classes = viewElementDefinition.class;

	if ( classes ) {
		element.addClass( ... typeof classes === 'string' ? [ classes ] : classes );
	}

	return element;
}

/**
 * Defines conversion details. It is used in configuration based converters:
 * - {@link module:engine/conversion/definition-based-converters~modelAttributeToViewAttributeElement}
 * - {@link module:engine/conversion/definition-based-converters~modelElementToViewContainerElement}
 * - {@link module:engine/conversion/definition-based-converters~viewToModelAttribute}
 * - {@link module:engine/conversion/definition-based-converters~viewToModelElement}
 *
 * @typedef {Object} ConverterDefinition
 * @property {String} model Defines to model conversion. When using to element conversion
 * ({@link module:engine/conversion/definition-based-converters~viewToModelElement}
 * and {@link module:engine/conversion/definition-based-converters~modelElementToViewContainerElement})
 * it defines element name. When using to attribute conversion
 * ({@link module:engine/conversion/definition-based-converters~viewToModelAttribute}
 * and {@link module:engine/conversion/definition-based-converters~modelAttributeToViewAttributeElement})
 * it defines attribute value to which it is converted.
 * @property {module:engine/view/viewelementdefinition~ViewElementDefinition} view Defines model to view conversion and is also used
 * in view to model conversion pipeline.
 * @property {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} acceptAlso An array with all matched elements that
 * view to model conversion should also accepts.
 */
