/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import buildViewConverter from './buildviewconverter';

export function parseDefinition( definition ) {
	const model = definition.model;
	const view = definition.view;
	const viewDefinition = typeof view == 'string' ? { name: view } : view;

	const viewDefinitions = definition.acceptsAlso ? definition.acceptsAlso : [];

	viewDefinitions.push( viewDefinition );

	return { model, viewDefinition, viewDefinitions };
}

export function definitionToPattern( viewDefinition ) {
	const name = viewDefinition.name;
	const classes = viewDefinition.class;
	const styles = viewDefinition.style;
	const attributes = viewDefinition.attribute;

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

export function defineConverter( dispatchers, viewDefinitions ) {
	const converter = buildViewConverter().for( ...dispatchers );

	for ( const viewDefinition of viewDefinitions ) {
		converter.from( definitionToPattern( viewDefinition ) );

		if ( viewDefinition.priority ) {
			converter.withPriority( viewDefinition.priority );
		}
	}
	return converter;
}
