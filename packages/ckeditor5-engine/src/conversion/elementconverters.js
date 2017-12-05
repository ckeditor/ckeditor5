/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import buildModelConverter from './buildmodelconverter';
import buildViewConverter from './buildviewconverter';
import ViewContainerElement from '../view/containerelement';

export function modelElementToView( modelElement, view, dispatchers ) {
	const viewDefinition = view.to ? view.to : view;

	const attributes = {};

	if ( viewDefinition.class ) {
		attributes.class = viewDefinition.class;
	}

	if ( viewDefinition.style ) {
		attributes.style = viewDefinition.style;
	}

	if ( viewDefinition.attribute ) {
		attributes.attribute = viewDefinition.attribute;
	}

	buildModelConverter().for( ...dispatchers )
		.fromElement( modelElement )
		.toElement( () => {
			// TODO: create method from definition
			return new ViewContainerElement( viewDefinition.name, attributes );
		} );
}

export function viewToModelElement( element, view, dispatchers ) {
	// TODO: support multiple definitions
	// { name: option.view.name }

	const viewDefinitions = view.from ? view.from : [ view ];

	const converter = buildViewConverter().for( ...dispatchers );

	for ( const viewDefinition of viewDefinitions ) {
		converter.from( viewDefinition );

		if ( viewDefinition.priority ) {
			converter.withPriority( viewDefinition.priority );
		}
	}

	converter.toElement( element );
}
