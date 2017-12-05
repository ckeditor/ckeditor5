/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AttributeElement from '../view/attributeelement';
import buildModelConverter from './buildmodelconverter';
import buildViewConverter from './buildviewconverter';

export function viewToModelAttribute( attributeName, attributeValue, view, dispatchers ) {
	const viewDefinitions = view.from ? view.from : [ view ];

	for ( const viewDefinition of viewDefinitions ) {
		const element = viewDefinition.name;
		const classes = viewDefinition.class;
		const styles = viewDefinition.style;

		const pattern = { name: element };

		if ( classes ) {
			pattern.class = classes;
		}

		if ( styles ) {
			pattern.style = styles;
		}

		buildViewConverter()
			.for( ...dispatchers )
			.from( pattern )
			.toAttribute( () => ( {
				key: attributeName,
				value: attributeValue
			} ) );
	}
}

export function modelAttributeToView( attributeName, attributeValue, view, dispatchers ) {
	buildModelConverter()
		.for( ...dispatchers )
		.fromAttribute( attributeName )
		.toElement( value => {
			// TODO: string vs numeric values
			if ( value != attributeValue ) {
				return;
			}

			const viewDefinition = view.to ? view.to : view;
			// TODO: AttributeElement.fromDefinition() ?

			const classes = viewDefinition.class;
			const styles = viewDefinition.style;

			const attributes = {};

			// TODO: AttributeElement does no accept Array
			if ( classes ) {
				attributes.class = Array.isArray( classes ) ? classes.join( ' ' ) : classes;
			}

			// TODO: Attribute element does not accept Object
			if ( styles ) {
				attributes.style = typeof styles === 'string' ? styles : toStylesString( styles );
			}

			return new AttributeElement( viewDefinition.name, attributes );
		} );
}

function toStylesString( stylesObject ) {
	const styles = [];

	for ( const key in stylesObject ) {
		styles.push( key + ':' + stylesObject[ key ] );
	}

	return styles.join( ';' );
}
