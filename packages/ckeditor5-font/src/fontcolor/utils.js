/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontcolor/utils
 */

export function normalizeOptions( configuredOptions ) {
	return configuredOptions
		.map( getOptionDefinition )
		.filter( option => !!option );
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
