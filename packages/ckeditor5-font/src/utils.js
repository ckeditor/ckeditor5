/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/utils
 */

import ColorTableView from './ui/colortableview';

/**
 * The name of the font size plugin.
 */
export const FONT_SIZE = 'fontSize';

/**
 * The name of the font family plugin.
 */
export const FONT_FAMILY = 'fontFamily';

/**
 * The name of the font color plugin.
 */
export const FONT_COLOR = 'fontColor';

/**
 * The name of the font background color plugin.
 */
export const FONT_BACKGROUND_COLOR = 'fontBackgroundColor';

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
 * A {@link module:font/fontcolor~FontColor font color} and
 * {@link module:font/fontbackgroundcolor~FontBackgroundColor font background color} helper
 * responsible for upcasting data to the model.
 *
 * **Note**: The `styleAttr` parameter should be either `'color'` or `'background-color'`.
 *
 * @param {String} styleAttr
 * @return {String}
 */
export function renderUpcastAttribute( styleAttr ) {
	return viewElement => normalizeColorCode( viewElement.getStyle( styleAttr ) );
}

/**
 * A {@link module:font/fontcolor~FontColor font color} and
 * {@link module:font/fontbackgroundcolor~FontBackgroundColor font background color} helper
 * responsible for downcasting a color attribute to a `<span>` element.
 *
 * **Note**: The `styleAttr` parameter should be either `'color'` or `'background-color'`.
 *
 * @param {String} styleAttr
 */
export function renderDowncastElement( styleAttr ) {
	return ( modelAttributeValue, { writer } ) => writer.createAttributeElement( 'span', {
		style: `${ styleAttr }:${ modelAttributeValue }`
	}, { priority: 7 } );
}

/**
 * A helper that adds {@link module:font/ui/colortableview~ColorTableView} to the color dropdown with proper initial values.
 *
 * @param {Object} config The configuration object.
 * @param {module:ui/dropdown/dropdownview~DropdownView} config.dropdownView The dropdown view to which
 * a {@link module:font/ui/colortableview~ColorTableView} will be added.
 * @param {Array.<module:ui/colorgrid/colorgrid~ColorDefinition>} config.colors An array with definitions
 * representing colors to be displayed in the color table.
 * @param {String} config.removeButtonLabel The label for the button responsible for removing the color.
 * @param {String} config.documentColorsLabel The label for the section with document colors.
 * @param {String} config.documentColorsCount The number of document colors inside the dropdown.
 * @returns {module:font/ui/colortableview~ColorTableView} The new color table view.
 */
export function addColorTableToDropdown( { dropdownView, colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount } ) {
	const locale = dropdownView.locale;
	const colorTableView = new ColorTableView( locale, { colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount } );

	dropdownView.colorTableView = colorTableView;
	dropdownView.panelView.children.add( colorTableView );

	colorTableView.delegate( 'execute' ).to( dropdownView, 'execute' );

	return colorTableView;
}

// Fixes the color value string.
//
// @param {String} value
// @returns {String}
function normalizeColorCode( value ) {
	return value.replace( /\s/g, '' );
}
