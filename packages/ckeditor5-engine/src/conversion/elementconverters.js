/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import buildModelConverter from './buildmodelconverter';
import ViewContainerElement from '../view/containerelement';

import { defineConverter, parseDefinition } from './utils';

export function modelElementToView( definition, dispatchers ) {
	const { model: modelElement, viewDefinition } = parseDefinition( definition );

	buildModelConverter()
		.for( ...dispatchers )
		.fromElement( modelElement )
		.toElement( () => ViewContainerElement.fromViewDefinition( viewDefinition ) );
}

export function viewToModelElement( definition, dispatchers ) {
	const { model: modelElement, viewDefinitions } = parseDefinition( definition );

	const converter = defineConverter( dispatchers, viewDefinitions );

	converter.toElement( modelElement );
}
