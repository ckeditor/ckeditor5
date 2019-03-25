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

/**
 * Name of font color plugin
 */
export const FONT_COLOR = 'fontColor';

/**
 * Name of font background color plugin.
 */
export const FONT_BACKGROUND_COLOR = 'fontBackgroundColor';

/**
 * Function for font color and font background color plugins
 * which is responsible for upcasting data to model.
 * styleAttr should eqaul to `'color'` or `'background-color'`.
 *
 * @param {String} styleAttr
 */
export function renderUpcastAttribute( styleAttr ) {
	return viewElement => {
		const fontColor = viewElement.getStyle( styleAttr );
		return normalizeColorCode( fontColor );
	};
}

/**
 * Function for font color and font background color plugins
 * which is responsible for downcasting color attribute to span element.
 * styleAttr should eqaul to `'color'` or `'background-color'`.
 *
 * @param {String} styleAttr
 */
export function renderDowncastElement( styleAttr ) {
	return ( modelAttributeValue, viewWriter ) => viewWriter.createAttributeElement( 'span', {
		style: `${ styleAttr }:${ modelAttributeValue }`
	} );
}

function normalizeColorCode( value ) {
	return value.replace( /\s/g, '' );
}

/**
 * Creates model of color from configuration option. It keeps them coherent,
 * regardles how user define them in config.
 *
 * @param {String|Object} colorRow
 */
export function normalizeOptions( colorRow ) {
	return colorRow
		.map( normalizeSingleColorDefinition )
		.filter( option => !!option );
}

function normalizeSingleColorDefinition( color ) {
	if ( typeof color === 'string' ) {
		return {
			model: color.replace( / /g, '' ),
			label: color,
			hasBorder: false,
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
			model: color.color.replace( / /g, '' ),
			label: color.label || color.color,
			hasBorder: color.hasBorder === undefined ? false : color.hasBorder,
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

/**
 * Helper which add {@link module:font/ui/colortableview~ColorTableView} to dropdown with proper initial values.
 * @param {Object} config Configuration object
 * @param {module:ui/dropdown/dropdownview~DropdownView} config.dropdownView Dropdown view to which
 * will be added {@link module:font/ui/colortableview~ColorTableView}.
 * @param {Array.<Object>}  Array with objects representing color to be drawn in color grid.
 */
export function addColorsToDropdown( { dropdownView, colors, colorColumns, removeButtonTooltip } ) {
	const locale = dropdownView.locale;
	const colorTableView = new ColorTableView( locale, { colors, colorColumns, removeButtonTooltip } );
	dropdownView.colorTableView = colorTableView;
	dropdownView.panelView.children.add( colorTableView );

	colorTableView.delegate( 'execute' ).to( dropdownView, 'execute' );
	return colorTableView;
}
