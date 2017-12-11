/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AttributeElement from '../view/attributeelement';
import buildModelConverter from './buildmodelconverter';
import { defineConverter, parseDefinition } from './utils';

export function modelAttributeToView( attributeName, definition, dispatchers ) {
	const { model: attributeValue, viewDefinition } = parseDefinition( definition );

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

export function viewToModelAttribute( attributeName, definition, dispatchers ) {
	const { model: attributeValue, viewDefinitions } = parseDefinition( definition );

	const converter = defineConverter( dispatchers, viewDefinitions );

	converter.toAttribute( () => ( {
		key: attributeName,
		value: attributeValue
	} ) );
}
