/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/utils
 */

import ColorTableView from './ui/colortableview';

/**
 * Builds a proper {@link module:engine/conversion/conversion~ConverterDefinition converter definition} out of input data.
 *
 * @param {String} modelAttributeKey Key
 * @param {Array.<module:font/fontfamily~FontFamilyOption>|Array.<module:font/fontsize~FontSizeOption>} options
 * @returns {module:engine/conversion/conversion~ConverterDefinition}
 */
export function buildDefinition( modelAttributeKey, options ) {
	const definition = {
		model: {
			key: modelAttributeKey,
			values: []
		},
		view: {},
		upcastAlso: {}
	};

	for ( const option of options ) {
		definition.model.values.push( option.model );
		definition.view[ option.model ] = option.view;

		if ( option.upcastAlso ) {
			definition.upcastAlso[ option.model ] = option.upcastAlso;
		}
	}

	return definition;
}

export const FONT_COLOR = 'fontColor';
export const FONT_BACKGROUND_COLOR = 'fontBackgroundColor';

export function renderUpcastAttribute( styleAttr ) {
	return viewElement => {
		const fontColor = viewElement.getStyle( styleAttr );
		return normalizeColorCode( fontColor );
	};
}

export function renderDowncastElement( styleAttr ) {
	return ( modelAttributeValue, viewWriter ) => viewWriter.createAttributeElement( 'span', {
		style: `${ styleAttr }:${ modelAttributeValue }`
	} );
}

function normalizeColorCode( value ) {
	return value.replace( /\s/g, '' );
}

export function normalizeOptions( colorRow ) {
	return colorRow
		.map( getColorsDefinition )
		.filter( option => !!option );
}

function getColorsDefinition( color ) {
	if ( typeof color === 'string' ) {
		return {
			model: color,
			label: color,
			view: {
				name: 'span',
				styles: {
					color
				},
				priority: 5
			}
		};
	} else {
		return {
			model: color.color,
			label: color.label || color.color,
			hasBorder: color.hasBorder,
			view: {
				name: 'span',
				styles: {
					color: `${ color.color }`
				},
				priority: 5
			}
		};
	}
}

export function addColorsToDropdown( dropdownView, colors ) {
	const locale = dropdownView.locale;
	const colorTableView = new ColorTableView( locale, { colors } );
	dropdownView.colorTableView = colorTableView;
	dropdownView.panelView.children.add( colorTableView );

	colorTableView.delegate( 'execute' ).to( dropdownView, 'execute' );
	return colorTableView;
}
