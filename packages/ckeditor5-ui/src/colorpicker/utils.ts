/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorpicker/utils
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

// There are no available types for 'color-parse' module.
// @ts-ignore
import { default as parse } from 'color-parse';
import * as convert from 'color-convert';

/**
 * Parses and converts the color string to requested format. Handles variety of color spaces
 * like `hsl`, `hex` or `rgb`.
 *
 * @param color
 * @returns A color string.
 */
export function convertColor( color: string, outputFormat: ColorPickerFormat ): string {
	if ( !color ) {
		return '';
	}

	// Parser library treats `hex` format as belonging to `rgb` space, which messes up further conversion.
	// Let's parse such strings on our own.
	const colorObject = color.startsWith( '#' ) ? { space: 'hex', values: color.substring( 1 ) } : parse( color );

	if ( !colorObject.space ) {
		return '';
	}

	if ( colorObject.space === outputFormat ) {
		return color;
	}

	// @ts-ignore
	const convertedColorChannels: Array<number> = convert[ colorObject.space ][ outputFormat ]( colorObject.values );

	return formatColorOutput( convertedColorChannels, outputFormat );
}

/**
 * Color formats handled by color converter.
 */
export type ColorPickerFormat = 'hex' | 'rgb' | 'hsl' | 'hwb' | 'lab' | 'lch';

/**
 * Converts a color string to hex format.
 *
 * @param color
 * @returns A color string.
 */
export function convertToHex( color: string ): string {
	if ( !color ) {
		return '';
	}

	if ( color.startsWith( '#' ) ) {
		return color;
	}

	const colorObject = parse( color );

	if ( !colorObject.space ) {
		return '#000';
	}

	// @ts-ignore
	return '#' + convert[ colorObject.space ].hex( colorObject.values );
}

/**
 * Formats the passed color channels according to the requested format.
 *
 * @param format
 * @param values
 * @returns A color string.
 */
function formatColorOutput( values: Array<number> | string, format: ColorPickerFormat ): string {
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
