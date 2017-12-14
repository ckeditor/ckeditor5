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

export function containerElementToView( definition, dispatchers ) {
	const { model: modelElement, viewDefinition } = parseConverterDefinition( definition );

	buildModelConverter()
		.for( ...dispatchers )
		.fromElement( modelElement )
		.toElement( () => ViewContainerElement.fromViewDefinition( viewDefinition ) );
}

export function viewToContainerElement( definition, dispatchers ) {
	const { model: modelElement, viewDefinitions } = parseConverterDefinition( definition );

	const converter = defineViewConverter( dispatchers, viewDefinitions );

	converter.toElement( modelElement );
}

/**
 * Helper for creating model to view converter from model's attribute.
 *
 * @param {String} attributeName
 * @param {} definition Converter definition
 * @param dispatchers
 */
export function attributeElementToViewConverter( attributeName, definition, dispatchers ) {
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
 *
 * @param attributeName
 * @param definition
 * @param dispatchers
 */
export function viewToAttributeElementConverter( attributeName, definition, dispatchers ) {
	const { model: attributeValue, viewDefinitions } = parseConverterDefinition( definition );

	const converter = defineViewConverter( dispatchers, viewDefinitions );

	converter.toAttribute( () => ( {
		key: attributeName,
		value: attributeValue
	} ) );
}

import buildViewConverter from './buildviewconverter';

// Prepares a {@link module:engine/conversion/utils~ConverterDefinition definition object} for building converters.
//
// @param {module:engine/conversion/utils~ConverterDefinition} definition An object that defines view to model and model to view conversion.
// @returns {Object}
function parseConverterDefinition( definition ) {
	const model = definition.model;
	const view = definition.view;

	const viewDefinition = typeof view == 'string' ? { name: view } : view;

	const viewDefinitions = definition.acceptsAlso ? definition.acceptsAlso : [];

	viewDefinitions.push( viewDefinition );

	return { model, viewDefinition, viewDefinitions };
}

// Helper method for preparing a view converter from passed view definitions.
//
// @param {Array.<module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher>} dispatchers
// @param {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} viewDefinitions
// @returns {module:engine/conversion/buildviewconverter~ViewConverterBuilder}
function defineViewConverter( dispatchers, viewDefinitions ) {
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
 * @typedef {Object} ConvertedDefinition
 * @property {String} model
 * @property {String|module:engine/view/viewelementdefinition~ViewElementDefinition} view
 * @property {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} acceptAlso
 */
