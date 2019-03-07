/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontcolor/utils
 */

export const FONT_COLOR = 'fontColor';

export function normalizeOptions( configuredOptions ) {
	return configuredOptions
		.map( getOptionDefinition )
		.filter( option => !!option );
}

export function renderUpcastAttribute( viewElement ) {
	const fontColor = viewElement.getStyle( 'color' );
	const value = fontColor;

	return value;
}

export function renderDowncastElement( modelAttributeValue, viewWriter ) {
	return viewWriter.createAttributeElement( 'span', {
		style: 'color:' + modelAttributeValue
	} );
}

function getOptionDefinition( option ) {
	return {
		title: option.label,
		model: option.color,
		label: option.label,
		view: {
			name: 'span',
			styles: {
				color: `${ option.color }`
			},
			priority: 5
		}
	};
}
