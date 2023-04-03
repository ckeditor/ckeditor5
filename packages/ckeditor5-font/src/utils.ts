/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/utils
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

import ColorTableView from './ui/colortableview';

import type { FontFamilyOption, FontSizeOption } from './fontconfig';
import type { ColorDefinition, DropdownView } from 'ckeditor5/src/ui';
import type { ArrayOrItem } from 'ckeditor5/src/utils';
import type {
	ViewAttributeElement,
	ViewElement,
	MatcherPattern,
	ViewElementDefinition,
	DowncastConversionApi
} from 'ckeditor5/src/engine';

// There are no available types for 'color-parse' module.
// @ts-ignore
import { default as parse } from 'color-parse';
import * as convert from 'color-convert';

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
 * Builds a proper converter definition out of input data.
 */
export function buildDefinition(
	modelAttributeKey: string,
	options: Array<FontFamilyOption> | Array<FontSizeOption>
): FontConverterDefinition {
	const definition: FontConverterDefinition = {
		model: {
			key: modelAttributeKey,
			values: []
		},
		view: {},
		upcastAlso: {}
	};

	for ( const option of options ) {
		definition.model.values.push( option.model! );
		definition.view[ option.model! ] = option.view!;

		if ( option.upcastAlso ) {
			definition.upcastAlso[ option.model! ] = option.upcastAlso;
		}
	}

	return definition;
}

export type FontConverterDefinition = {
	model: { key: string; values: Array<string> };
	view: Record<string, ViewElementDefinition>;
	upcastAlso: Record<string, ArrayOrItem<MatcherPattern>>;
};

/**
 * A {@link module:font/fontcolor~FontColor font color} and
 * {@link module:font/fontbackgroundcolor~FontBackgroundColor font background color} helper
 * responsible for upcasting data to the model.
 *
 * **Note**: The `styleAttr` parameter should be either `'color'` or `'background-color'`.
 */
export function renderUpcastAttribute( styleAttr: string ) {
	return ( viewElement: ViewElement ): string => normalizeColorCode( viewElement.getStyle( styleAttr )! );
}

/**
 * A {@link module:font/fontcolor~FontColor font color} and
 * {@link module:font/fontbackgroundcolor~FontBackgroundColor font background color} helper
 * responsible for downcasting a color attribute to a `<span>` element.
 *
 * **Note**: The `styleAttr` parameter should be either `'color'` or `'background-color'`.
 */
export function renderDowncastElement( styleAttr: string ) {
	return ( modelAttributeValue: string, { writer }: DowncastConversionApi ): ViewAttributeElement =>
		writer.createAttributeElement( 'span', {
			style: `${ styleAttr }:${ modelAttributeValue }`
		}, { priority: 7 } );
}

/**
 * A helper that adds {@link module:font/ui/colortableview~ColorTableView} to the color dropdown with proper initial values.
 *
 * @param config.dropdownView The dropdown view to which a {@link module:font/ui/colortableview~ColorTableView} will be added.
 * @param config.colors An array with definitions representing colors to be displayed in the color table.
 * @param config.removeButtonLabel The label for the button responsible for removing the color.
 * @param config.documentColorsLabel The label for the section with document colors.
 * @param config.documentColorsCount The number of document colors inside the dropdown.
 * @returns The new color table view.
 */
export function addColorTableToDropdown(
	{ dropdownView, colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount }: {
		dropdownView: ColorTableDropdownView;
		colors: Array<ColorDefinition>;
		columns: number;
		removeButtonLabel: string;
		documentColorsLabel?: string;
		documentColorsCount?: number;
	}
): ColorTableView {
	const locale = dropdownView.locale!;
	const colorTableView = new ColorTableView( locale, { colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount } );

	dropdownView.colorTableView = colorTableView;
	dropdownView.panelView.children.add( colorTableView );

	colorTableView.delegate( 'execute' ).to( dropdownView, 'execute' );

	return colorTableView;
}

/**
 * Fixes the color value string.
 */
function normalizeColorCode( value: string ): string {
	return value.replace( /\s/g, '' );
}

export type ColorTableDropdownView = DropdownView & {
	colorTableView?: ColorTableView;
};

/**
 * @TODO
 *
 * @param colorObject
 * @returns
 */
export function convertColor( color: string, outputFormat: ColorPickerOutputFormat ): string {
	if ( !color ) {
		return '';
	}

	const colorObject = parse( color );

	if ( !colorObject.space ) {
		return '';
	}

	if ( colorObject.space === outputFormat ) {
		return color;
	}

	// @ts-ignore
	const convertedColorChannels: Array<number> = convert[ colorObject.space ][ outputFormat ]( colorObject.values );

	return formatColorOutput( outputFormat, convertedColorChannels );
}

/**
 * @TODO
 */
export type ColorPickerOutputFormat = 'hex' | 'rgb' | 'hsl' | 'hwb' | 'lab' | 'lch';

/**
 * @TODO
 *
 * @param colorObject
 * @returns
 */
export function convertToHex( color: string ): string {
	if ( !color ) {
		return '';
	}

	if ( color.startsWith( '#' ) ) {
		return color;
	}

	const colorObject = parse( color );

	// @ts-ignore
	return '#' + convert[ colorObject.space ].hex( colorObject.values );
}

/**
 * @TODO
 *
 * @param format
 * @param values
 * @returns
 */
function formatColorOutput( format: ColorPickerOutputFormat, values: Array<number> | string ): string {
	switch ( format ) {
		case 'hex': return `#${ values }`;
		case 'rgb': return `rgb( ${ values[ 0 ] }, ${ values[ 1 ] }, ${ values[ 2 ] } )`;
		case 'hsl': return `hsl( ${ values[ 0 ] }, ${ values[ 1 ] }%, ${ values[ 2 ] }% )`;
		case 'hwb': return `hwb( ${ values[ 0 ] }, ${ values[ 1 ] }, ${ values[ 2 ] } )`;
		case 'lab': return `lab( ${ values[ 0 ] }% ${ values[ 1 ] } ${ values[ 2 ] } )`;
		case 'lch': return `lch( ${ values[ 0 ] }% ${ values[ 1 ] } ${ values[ 2 ] } )`;

		default: return '';
	}
}
