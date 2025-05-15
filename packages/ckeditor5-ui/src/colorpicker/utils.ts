/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/colorpicker/utils
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

// There are no available types for 'color-parse' module.
// @ts-ignore
import { default as parse } from 'color-parse';
import * as convert from 'color-convert';
import type {
	RGB, HSL, HSV, HWB, CMYK, XYZ, LAB, LCH, HEX, KEYWORD, ANSI16, ANSI256, HCG, APPLE, GRAY
} from 'color-convert/conversions.js';

/**
 * Color formats handled by color converter.
 */
export type ColorPickerOutputFormat = 'hex' | 'rgb' | 'hsl' | 'hwb' | 'lab' | 'lch';

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
	format?: ColorPickerOutputFormat;
};

/**
 * Configuration of the color picker view.
 *
 * It can be used to enforce a particular color format or hide the color input.
 */
export type ColorPickerViewConfig = ColorPickerConfig & {
	hideInput?: boolean;
};

/**
 * Parses and converts the color string to requested format. Handles variety of color spaces
 * like `hsl`, `hex` or `rgb`.
 *
 * @param color
 * @returns A color string.
 */
export function convertColor( color: string, outputFormat: ColorPickerOutputFormat ): string {
	if ( !color ) {
		return '';
	}

	const colorObject = parseColorString( color );

	if ( !colorObject ) {
		return '';
	}

	if ( colorObject.space === outputFormat ) {
		return color;
	}

	if ( !canConvertParsedColor( colorObject ) ) {
		return '';
	}

	const fromColorSpace = ( convert as Conversion )[ colorObject.space ];
	const toColorSpace = fromColorSpace[ outputFormat ];

	if ( !toColorSpace ) {
		return '';
	}

	const convertedColorChannels = toColorSpace( colorObject.space === 'hex' ? colorObject.hexValue : colorObject.values );

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

	const colorObject = parseColorString( color );

	if ( !colorObject ) {
		return '#000';
	}

	if ( colorObject.space === 'hex' ) {
		return colorObject.hexValue;
	}

	return convertColor( color, 'hex' );
}

/**
 * Registers the custom element in the
 * [CustomElementsRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry).
 */
export function registerCustomElement( elementName: string, constructor: CustomElementConstructor ): void {
	if ( customElements.get( elementName ) === undefined ) {
		customElements.define( elementName, constructor );
	}
}

/**
 * Formats the passed color channels according to the requested format.
 *
 * @param values
 * @param format
 * @returns A color string.
 */
function formatColorOutput( values: FormatTableColor, format: ColorPickerOutputFormat ): string {
	switch ( format ) {
		case 'hex': return `#${ values }`;
		case 'rgb': return `rgb(${ values[ 0 ] }, ${ values[ 1 ] }, ${ values[ 2 ] })`;
		case 'hsl': return `hsl(${ values[ 0 ] }, ${ values[ 1 ] }%, ${ values[ 2 ] }%)`;
		case 'hwb': return `hwb(${ values[ 0 ] }, ${ values[ 1 ] }, ${ values[ 2 ] })`;
		case 'lab': return `lab(${ values[ 0 ] }% ${ values[ 1 ] } ${ values[ 2 ] })`;
		case 'lch': return `lch(${ values[ 0 ] }% ${ values[ 1 ] } ${ values[ 2 ] })`;

		default: return '';
	}
}

type FormatTableColor = HEX | RGB | HSL | HWB | LAB | LCH;
type ConversionFunctionInput = RGB | HSL | HSV | HWB | CMYK | XYZ | LAB | LCH | HEX | KEYWORD | ANSI16 | ANSI256 | HCG | APPLE | GRAY;
type ConversionInputSpaces = typeof convert;
type ConversionFunction = ( value: ConversionFunctionInput ) => FormatTableColor;
type Conversion = Record<keyof ConversionInputSpaces, Partial<Record<ColorPickerOutputFormat, ConversionFunction>>>;

type ParserColorSpaces =
	'rgb' | 'hsl' | 'hsv' | 'hsb' | 'hwb' | 'cmy' | 'cmyk' | 'xyz' | 'xyy' | 'gray' | 'lab' | 'lch' | 'lchu' | 'lchv' | 'lchuv' |
	'luv' | 'yuv' | 'lms' | 'hex';

type ParsedColor<T extends ParserColorSpaces> = {
	readonly space: T;
	readonly alpha: number;
	readonly values: T extends 'cmyk' ? [ number, number, number, number ] : [ number, number, number ];
	readonly hexValue: T extends 'hex' ? string : never;
};

type ConvertableParsedColor = ParsedColor<ParserColorSpaces> & {
	readonly space: keyof ConversionInputSpaces;
};

function parseColorString( colorString: string ): ParsedColor<ParserColorSpaces> | null {
	// Parser library treats `hex` format as belonging to `rgb` space | which messes up further conversion.
	// Let's parse such strings on our own.
	if ( colorString.startsWith( '#' ) ) {
		const parsedHex = parse( colorString );

		return {
			space: 'hex',
			values: parsedHex.values,
			hexValue: colorString,
			alpha: parsedHex.alpha
		};
	}

	const parsed = parse( colorString );

	if ( !parsed.space ) {
		return null;
	}

	return parsed;
}

function canConvertParsedColor( parsedColor: ParsedColor<ParserColorSpaces> ): parsedColor is ConvertableParsedColor {
	return Object.keys( convert ).includes( parsedColor.space );
}
