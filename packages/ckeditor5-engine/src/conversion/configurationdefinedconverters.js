/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/configurationdefinedconverters
 */

import AttributeElement from '../view/attributeelement';
import ViewContainerElement from '../view/containerelement';

import buildModelConverter from './buildmodelconverter';
import buildViewConverter from './buildviewconverter';

/**
 * Helper for creating model to view converter from model's element
 * to {@link module:engine/view/containerelement~ContainerElement ViewContainerElement}. The `acceptAlso` property is ignored.
 *
 * You can define conversion as simple model element to view element conversion using simplified definition:
 *
 *		modelElementToViewContainerElement( {
 *			model: 'heading1',
 *			view: 'h1',
 *		}, [ dispatcher ] );
 *
 * Or defining full-flavored view object:
 *
 *		modelElementToViewContainerElement( {
 *			model: 'heading1',
 *			view: {
 *				name: 'h1',
 *				class: [ 'header', 'article-header' ],
 *				attributes: {
 *					data-header: 'level-1',
 *				}
 *			},
 *		}, [ dispatcher ] );
 *
 * Above will generate an HTML tag:
 *
 *		<h1 class="header article-header" data-header="level-1">...</h1>
 *
 * @param {module:engine/conversion/configurationdefinedconverters~ConverterDefinition} definition A conversion configuration.
 * @param {Array.<module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher>} dispatchers
 */
export function modelElementToViewContainerElement( definition, dispatchers ) {
	const { model: modelElement, viewDefinition } = parseConverterDefinition( definition );

	buildModelConverter()
		.for( ...dispatchers )
		.fromElement( modelElement )
		.toElement( () => ViewContainerElement.fromViewDefinition( viewDefinition ) );
}

/**
 * Helper for creating view to model converter from view to model element. It will convert also all matched view elements defined in
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
 *				attributes: {
 *					'data-heading': 'true'
 *				},
 *				// it might require to define higher priority for elements matched by other features
 *				priority: 'high'
 *			}
  *		}, [ dispatcher ] );
 *
 * or with `acceptAlso` property to match many elements:
 *
 *		viewToModelElement( {
 *			model: 'heading1',
 *			view: {
 *				name: 'h1'
 *			},
 *			acceptAlso: [
 *				{ name: 'p', attributes: { 'data-heading': 'level1' }, priority: 'high' },
 *				{ name: 'h2', class: 'heading-main' },
 *				{ name: 'div', style: { 'font-weight': 'bold', font-size: '24px' } }
 *			]
 *		}, [ dispatcher ] );
 *
 *    Above example will convert such existing HTML content:
 *
 *		<h1>A heading</h1>
 *		<h2 class="heading-main">Another heading</h2>
 *		<p data-heading="level1">Paragraph-like heading</p>
 *		<div style="font-size:24px; font-weigh:bold;">Another non-semantic header</div>
 *
 * into `heading1` model element so after rendering it the output HTML will be cleaned up:
 *
 *		<h1>A heading</h1>
 *		<h1>Another heading</h1>
 *		<h1>Paragraph-like heading</h1>
 *		<h1>Another non-semantic header</h1>
 *
 * @param {module:engine/conversion/configurationdefinedconverters~ConverterDefinition} definition A conversion configuration.
 * @param {Array.<module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher>} dispatchers
 */
export function viewToModelElement( definition, dispatchers ) {
	const { model: modelElement, viewDefinitions } = parseConverterDefinition( definition );

	const converter = prepareViewConverter( dispatchers, viewDefinitions );

	converter.toElement( modelElement );
}

/**
 * Helper for creating model to view converter from model's attribute
 * to {@link module:engine/view/attributeelement~AttributeElement AttributeElement}. The `acceptAlso` property is ignored.
 *
 * You can define conversion as simple model element to view element conversion using simplified definition:
 *
 *		modelAttributeToViewAttributeElement( 'bold', {
 *			model: 'true',
 *			view: 'strong',
 *		}, [ dispatcher ] );
 *
 * Or defining full-flavored view object:
 *
 *		modelAttributeToViewAttributeElement( 'fontSize' {
 *			model: 'big',
 *			view: {
 *				name: 'span',
 *				styles: {
 *					'font-size': '1.2em'
 *				}
 *			},
 *		}, [ dispatcher ] );
 *
 * Above will generate an HTML tag for model's attribute `fontSize` with a `big` value set:
 *
 *		<span style="font-size:1.2em;">...</span>
 *
 * @param {String} attributeName Attribute name from which convert.
 * @param {module:engine/conversion/configurationdefinedconverters~ConverterDefinition} definition A conversion configuration.
 * @param {Array.<module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher>} dispatchers
 */
export function modelAttributeToViewAttributeElement( attributeName, definition, dispatchers ) {
	const { model: attributeValue, viewDefinition } = parseConverterDefinition( definition );

	buildModelConverter()
		.for( ...dispatchers )
		.fromAttribute( attributeName )
		.toElement( value => {
			if ( value != attributeValue ) {
				return;
			}

			return AttributeElement.fromViewDefinition( viewDefinition );
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
  *		}, [ dispatcher ] );
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
 *				{ name: 'span', attributes: { 'data-size': 'big' } },
 *				{ name: 'span', class: [ 'font', 'font-huge' ] },
 *				{ name: 'span', style: { font-size: '18px' } }
 *			]
 *		}, [ dispatcher ] );
 *
 *    Above example will convert such existing HTML content:
 *
 *		<p>An example text with some big elements:
 *			<span class="text-big>one</span>,
 *			<span data-size="big>two</span>,
 *			<span class="font font-huge>three</span>,
 *			<span style="font-size:18px>four</span>
 *		<p>
 *
 * into `fontSize` model attribute with 'big' value set so after rendering it the output HTML will be cleaned up:
 *
 *		<p>An example text with some big elements:
 *			<span class="text-big>one</span>,
 *			<span class="text-big>two</span>,
 *			<span class="text-big>three</span>,
 *			<span class="text-big>four</span>
 *		<p>
 *
 * @param {String} attributeName Attribute name to which convert.
 * @param {module:engine/conversion/configurationdefinedconverters~ConverterDefinition} definition A conversion configuration.
 * @param {Array.<module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher>} dispatchers
 */
export function viewToModelAttribute( attributeName, definition, dispatchers ) {
	const { model: attributeValue, viewDefinitions } = parseConverterDefinition( definition );

	const converter = prepareViewConverter( dispatchers, viewDefinitions );

	converter.toAttribute( () => ( {
		key: attributeName,
		value: attributeValue
	} ) );
}

// Prepares a {@link module:engine/conversion/configurationdefinedconverters~ConverterDefinition definition object} for building converters.
//
// @param {module:engine/conversion/configurationdefinedconverters~ConverterDefinition} definition An object that defines view to model
// and model to view conversion.
// @returns {Object}
function parseConverterDefinition( definition ) {
	const model = definition.model;
	const view = definition.view;

	const viewDefinition = typeof view == 'string' ? { name: view } : view;

	const viewDefinitions = Array.from( definition.acceptsAlso ? definition.acceptsAlso : [] );

	viewDefinitions.push( viewDefinition );

	return { model, viewDefinition, viewDefinitions };
}

// Helper method for preparing a view converter from passed view definitions.
//
// @param {Array.<module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher>} dispatchers
// @param {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} viewDefinitions
// @returns {module:engine/conversion/buildviewconverter~ViewConverterBuilder}
function prepareViewConverter( dispatchers, viewDefinitions ) {
	const converter = buildViewConverter().for( ...dispatchers );

	for ( const viewDefinition of viewDefinitions ) {
		converter.from( definitionToPattern( viewDefinition ) );

		if ( viewDefinition.priority ) {
			converter.withPriority( viewDefinition.priority );
		}
	}

	return converter;
}

// Converts viewDefinition to a matcher pattern.
//
// @param {module:engine/view/viewelementdefinition~ViewElementDefinition} viewDefinition
// @returns {module:engine/view/matcher~Pattern}
function definitionToPattern( viewDefinition ) {
	const name = viewDefinition.name;
	const classes = viewDefinition.classes;
	const styles = viewDefinition.styles;
	const attributes = viewDefinition.attributes;

	const pattern = { name };

	if ( classes ) {
		pattern.class = classes;
	}

	if ( styles ) {
		pattern.style = styles;
	}

	if ( attributes ) {
		pattern.attribute = attributes;
	}

	return pattern;
}

/**
 * Defines conversion details.
 *
 * @typedef {Object} ConverterDefinition
 * @property {String} model Defines to model conversion. When using to element conversion
 * ({@link module:engine/conversion/configurationdefinedconverters~viewToModelElement}
 * and {@link module:engine/conversion/configurationdefinedconverters~modelElementToViewContainerElement})
 * it defines element name. When using to attribute conversion
 * ({@link module:engine/conversion/configurationdefinedconverters~viewToModelAttribute}
 * and {@link module:engine/conversion/configurationdefinedconverters~modelAttributeToViewAttributeElement})
 * it defines attribute value to which it is converted.
 * @property {String|module:engine/view/viewelementdefinition~ViewElementDefinition} view Defines model to view conversion and is also used
 * in view to model conversion pipeline.
 * @property {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} acceptAlso An array with all matched elements that
 * view to model conversion should also accepts.
 */
