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
import { hex, rgb, hsl, hwb, lab, lch } from 'color-convert';

/**
 * Color formats handled by color converter.
 */
export type ColorPickerFormat = 'hex' | 'rgb' | 'hsl' | 'hwb' | 'lab' | 'lch';

type colorObject = {
	space: 'hex' | 'rgb' | 'hsl' | 'hwb' | 'lab' | 'lch';
	values: string;
	alpha: number;
};

/**
 * Configuration of the color picker feature.
 *
 * It can be forced to apply colors in the editor in a particular format.
 *
 * @default `{
 * 	format: 'hsl'
 * }`
 */
export type ColorPickerConfig = {
	format?: ColorPickerFormat;
};

/**
 * TODO
 */

const convert: any = {
	hex,
	rgb,
	hsl,
	hwb,
	lab,
	lch
};

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
	const colorObject = color.startsWith( '#' ) ? { space: 'hex', values: color.substring( 1 ) } : parse( color ) as colorObject;

	if ( !colorObject.space ) {
		return '';
	}

	if ( colorObject.space === outputFormat ) {
		return color;
	}

	const conversionFunction = convert[ colorObject.space ][ outputFormat ];

	if ( !conversionFunction ) {
		return '';
	}

	const convertedColorChannels: Array<number> = conversionFunction( colorObject.values );

	return formatColorOutput( convertedColorChannels, outputFormat );
}

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

	return '#' + convert[ colorObject.space ].hex( colorObject.values );
}

/**
 * Formats the passed color channels according to the requested format.
 *
 * @param values
 * @param format
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
