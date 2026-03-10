/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/styles/background
 */

import { isEmpty } from 'es-toolkit/compat';
import type {
	StylesProcessor,
	StylesNormalizer,
	StylesReducer,
	StyleValue,
	StylePropertyDescriptor
} from '../stylesmap.js';
import {
	getShorthandStylesValues,
	isAttachmentStyleValue,
	isClipStyleValue,
	isColorStyleValue,
	isOriginStyleValue,
	isPercentageStyleValue,
	isPositionStyleValue,
	isRepeatStyleValue,
	isSizeStyleValue
} from './utils.js';

/**
 * CSS initial values for background longhand properties.
 */
const BACKGROUND_INITIAL_ARRAY_VALUES = {
	image: 'none',
	repeat: 'repeat',
	position: '0% 0%',
	size: 'auto',
	origin: 'padding-box',
	clip: 'border-box',
	attachment: 'scroll'
} as const;

/**
 * CSS function names that represent image values in the `background` shorthand.
 */
const IMAGE_FUNCTIONS = [
	'linear-gradient',
	'repeating-linear-gradient',
	'radial-gradient',
	'repeating-radial-gradient',
	'conic-gradient',
	'repeating-conic-gradient',
	'url'
] as const;

/**
 * Adds background CSS styles processing rules to the given `StylesProcessor`.
 *
 * Registers normalizers for the `background` shorthand and its longhand properties,
 * reducers that serialize them back to CSS strings, and the relation mapping between them.
 *
 * ```ts
 * editor.data.addStyleProcessorRules( addBackgroundStylesRules );
 * ```
 *
 * @param stylesProcessor The styles processor instance to register rules on.
 */
export function addBackgroundStylesRules( stylesProcessor: StylesProcessor ): void {
	stylesProcessor.setNormalizer( 'background-color', getBackgroundColorNormalizer() );

	for ( const property in BACKGROUND_INITIAL_ARRAY_VALUES ) {
		stylesProcessor.setNormalizer( `background-${ property }`, getBackgroundArrayPropertyNormalizer( `background.${ property }` ) );
		stylesProcessor.setReducer(
			`background-${ property }`,
			getBackgroundArrayPropertyReducer( `background-${ property }` )
		);
	}

	// Normalized data format:
	// {
	// 	color: 'red',
	// 	image: [ 'url(img1.png)', 'url(img2.png)' ],
	// 	position: [ '0% 0%', '50% 50%' ],
	// 	repeat: [ 'no-repeat', 'repeat' ],
	// 	// ...
	// }
	stylesProcessor.setNormalizer( 'background', getBackgroundNormalizer() );
	stylesProcessor.setReducer( 'background', getBackgroundReducer() );
	stylesProcessor.setStyleRelation( 'background', [
		'background-color',
		'background-image',
		'background-repeat',
		'background-position',
		'background-size',
		'background-attachment',
		'background-origin',
		'background-clip'
	] );
}

/**
 * Returns a normalizer for the `background` shorthand property.
 *
 * Parses the raw CSS value into comma-separated layers and merges them into
 * a structured `Background` object stored under the `background` path.
 */
function getBackgroundNormalizer(): StylesNormalizer {
	return value => {
		const layers = parseBackgroundIntoLayers( value );

		// If for some reason, it was impossible to extract any valid layers from the input,
		// assume it's color value for a single layer background, as it's the most common use
		// case and better than losing the value completely.
		if ( !layers.length ) {
			layers.push( {
				...getDefaultBackgroundLayer(),
				color: value
			} );
		}

		const background = normalizeBackgroundLayers( layers );

		return {
			path: 'background',
			value: background as StyleValue
		};
	};
}

/**
 * Returns a normalizer for the `background-color` longhand property.
 *
 * Stores the raw color value directly under the `background.color` path.
 */
function getBackgroundColorNormalizer(): StylesNormalizer {
	return value => ( { path: 'background.color', value } );
}

/**
 * Returns a normalizer for a comma-separated background array longhand property
 * (e.g. `background-image`, `background-repeat`, `background-position`, `background-attachment`).
 *
 * Splits the raw value by top-level commas and stores the resulting array under the given path.
 *
 * @param path The target style path, e.g. `'background.image'`.
 */
function getBackgroundArrayPropertyNormalizer( path: string ): StylesNormalizer {
	return value => ( { path, value: splitByTopLevelCommas( value ) } );
}

/**
 * Returns a reducer for a comma-separated background array longhand property
 * (e.g. `background-image`, `background-repeat`, `background-position`, `background-attachment`).
 *
 * Serializes an array of per-layer values back into a comma-separated CSS string.
 *
 * @param property The CSS property name to output, e.g. `'background-image'`.
 */
function getBackgroundArrayPropertyReducer( property: string ): StylesReducer {
	return value => {
		const serialized = ( value as Array<string> ).join( ', ' );

		return [ [ property, serialized ] ];
	};
}

/**
 * Returns a reducer for the `background` property. Depending on which longhand properties are present, it either:
 *
 * * Serializes into a concise `background` shorthand if all required longhand properties are present and non-empty, or
 * * Serializes into individual longhand properties for those that have defined values.
 *
 * This prevents overwriting external stylesheet rules with default values that were not explicitly set in the model.
 * For example, if only `background-color` is defined in the model, we emit just `background-color` rather than
 * the full `background` shorthand, which would reset all other sub-properties to their initial values.
 */
function getBackgroundReducer(): StylesReducer {
	return value => {
		const background = value as Background;

		// It is highly unlikely that all of these properties were set manually. If all fields are present,
		// they were most likely populated by parsing the `background` shorthand, which fills all of them
		// for every layer. In this case, we can safely serialize back to the `background` shorthand.
		// On the other hand, if some fields are missing, it means the background was created by manually
		// setting individual longhand properties (e.g., `background-origin`, `background-attachment`, etc.).
		// We should preserve that intent and serialize to longhands to prevent emitting default values
		// for the missing properties.
		const allFieldsLayersFilled = Object.keys( BACKGROUND_INITIAL_ARRAY_VALUES ).every( key => {
			const value = background[ key as keyof Background ];

			return value !== undefined && ( !Array.isArray( value ) || value.length > 0 );
		} );

		if ( allFieldsLayersFilled ) {
			return serializeToShorthandBackground( background );
		}

		return serializeToLonghandBackground( background );
	};
}

/**
 * Serializes a structured `Background` object into a concise CSS `background` shorthand string.
 */
function serializeToShorthandBackground( background: Background ): Array<StylePropertyDescriptor> {
	const result: Array<StylePropertyDescriptor> = [];
	const shorthand = extractBackgroundLayers( background )
		.map( layer => serializeBackgroundLayer( layer ).trim() )
		.filter( Boolean )
		.join( ', ' );

	if ( shorthand ) {
		result.push( [ 'background', shorthand ] );
	}

	return result;
}

/**
 * Serializes a structured `Background` object into individual CSS longhand properties for those that have defined values.
 * Each longhand property is serialized into a comma-separated string of per-layer values.
 *
 * This is used when not all required longhand properties are present, to avoid emitting default values for missing properties
 * and potentially overwriting external stylesheet rules.
 */
function serializeToLonghandBackground( background: Background ): Array<StylePropertyDescriptor> {
	const result: Array<StylePropertyDescriptor> = [];

	for ( const key in BACKGROUND_INITIAL_ARRAY_VALUES ) {
		const value = background[ key as keyof Background ]!;

		if ( Array.isArray( value ) ) {
			result.push( [ `background-${ key }`, ( value as Array<string> ).join( ', ' ) ] );
		}
	}

	if ( background.color !== undefined ) {
		result.push( [ 'background-color', background.color ] );
	}

	return result;
}

/**
 * Serializes a single `BackgroundLayer` into a CSS background layer string.
 * Properties equal to their CSS initial values are omitted.
 *
 * @param layer A single background layer to serialize.
 * @returns A space-separated CSS string for the layer, or an empty string if no parts are present.
 */
function serializeBackgroundLayer( layer: BackgroundLayer ): string {
	const parts: Array<string> = [];

	if ( layer.image && layer.image !== BACKGROUND_INITIAL_ARRAY_VALUES.image ) {
		parts.push( layer.image );
	}

	const positionStr = layer.position.join( ' ' );
	const isPositionDefault = !positionStr || positionStr === BACKGROUND_INITIAL_ARRAY_VALUES.position;

	if ( !isPositionDefault ) {
		parts.push( positionStr );
	}

	const sizeStr = layer.size.join( ' ' );
	const isSizeDefault = !sizeStr || sizeStr === BACKGROUND_INITIAL_ARRAY_VALUES.size;

	if ( !isSizeDefault ) {
		if ( isPositionDefault ) {
			parts.push( '0% 0%' );
		}

		parts.push( '/', sizeStr );
	}

	const repeatStr = layer.repeat.join( ' ' );

	if ( repeatStr && repeatStr !== BACKGROUND_INITIAL_ARRAY_VALUES.repeat ) {
		parts.push( repeatStr );
	}

	if ( layer.attachment && layer.attachment !== BACKGROUND_INITIAL_ARRAY_VALUES.attachment ) {
		parts.push( layer.attachment );
	}

	const isOriginDefault = layer.origin === BACKGROUND_INITIAL_ARRAY_VALUES.origin;
	const isClipDefault = layer.clip === BACKGROUND_INITIAL_ARRAY_VALUES.clip;

	if ( !isOriginDefault || !isClipDefault ) {
		parts.push( layer.origin );

		if ( layer.clip !== layer.origin ) {
			parts.push( layer.clip );
		}
	}

	if ( layer.color ) {
		parts.push( layer.color );
	}

	return parts.join( ' ' );
}

/**
 * Splits a structured `Background` object into an array of individual `BackgroundLayer` objects.
 *
 * The number of layers is determined by the longest array among the longhand properties.
 * The `color` value, if present, is always assigned to the last layer (per CSS spec).
 *
 * @param background The structured background object to split.
 * @returns An array of per-layer background objects.
 *
 * @example
 * // Input: { image: [ 'url(a.png)', 'url(b.png)' ], repeat: [ 'no-repeat', 'repeat' ], color: 'blue' }
 * // Output: [
 * //   { image: 'url(a.png)', repeat: [ 'no-repeat' ] },
 * //   { image: 'url(b.png)', repeat: [ 'repeat' ], color: 'blue' }
 * // ]
 */
function extractBackgroundLayers( background: Background ): Array<BackgroundLayer> {
	const layerCount = getTotalBackgroundLayers( background );
	const layers: Array<BackgroundLayer> = Array.from( { length: layerCount }, ( _, i ) => {
		const layer = getDefaultBackgroundLayer();

		if ( background.image?.[ i ] ) {
			layer.image = background.image[ i ];
		}

		if ( background.position?.[ i ] ) {
			layer.position = background.position[ i ]!.split( ' ' );
		}

		if ( background.size?.[ i ] ) {
			layer.size = background.size[ i ]!.split( ' ' );
		}

		if ( background.repeat?.[ i ] ) {
			layer.repeat = background.repeat[ i ]!.split( ' ' );
		}

		if ( background.attachment?.[ i ] ) {
			layer.attachment = background.attachment[ i ];
		}

		if ( background.origin?.[ i ] ) {
			layer.origin = background.origin[ i ];
		}

		if ( background.clip?.[ i ] ) {
			layer.clip = background.clip[ i ];
		}

		return layer;
	} );

	if ( background.color ) {
		// According to standard, the last layer can contain the color definition,
		// so we set it on the last layer if it exists.
		layers.at( -1 )!.color = background.color;
	}

	return layers;
}

/**
 * Determines the total number of background layers based on the longest array among the longhand properties in the `Background` object.
 *
 * @param background The structured background object to analyze.
 * @returns The total number of layers, which is the maximum length among the longhand property arrays.
 */
function getTotalBackgroundLayers( background: Background ): number {
	let layersCount = 0;

	for ( const value of Object.values( background ) ) {
		if ( Array.isArray( value ) && value.length > layersCount ) {
			layersCount = value.length;
		}
	}

	return layersCount;
}

/**
 * Merges an array of `BackgroundLayer` objects into a single structured `Background` object,
 * storing each longhand property as an array of per-layer values.
 *
 * Each input layer always has all properties defined (via `getDefaultBackgroundLayer`),
 * so the resulting arrays are fully populated for every layer.
 *
 * @param layers An array of parsed background layers.
 * @returns A merged `Background` object.
 *
 * @example
 * // Input: [ { image: 'url(a.png)', repeat: [ 'no-repeat' ], position: [ '0%', '0%' ], ... }, { image: 'none', color: 'red', ... } ]
 * // Output: {
 * //   image: [ 'url(a.png)', 'none' ],
 * //   position: [ '0% 0%', '0% 0%' ],
 * //   repeat: [ 'no-repeat', 'repeat' ],
 * //   ...
 * //   color: 'red'
 * // }
 */
function normalizeBackgroundLayers( layers: Array<BackgroundLayer> ): Background {
	const background: Background = {
		image: [],
		position: [],
		size: [],
		repeat: [],
		attachment: [],
		origin: [],
		clip: []
	};

	for ( const layer of layers ) {
		background.position!.push( layer.position.join( ' ' ) );
		background.size!.push( layer.size.join( ' ' ) );
		background.repeat!.push( layer.repeat.join( ' ' ) );

		background.image!.push( layer.image );
		background.attachment!.push( layer.attachment );
		background.origin!.push( layer.origin );
		background.clip!.push( layer.clip );
	}

	if ( layers.at( -1 )?.color ) {
		background.color = layers.at( -1 )!.color!;
	}

	return background;
}

/**
 * Parses a raw CSS `background` value and splits it into an array of `BackgroundLayer` objects,
 * one per comma-separated layer.
 *
 * The CSS `background` shorthand syntax is:
 * `background: [ <bg-layer> , ]* <final-bg-layer>`
 *
 * Commas inside function calls (e.g. `rgba()`, `linear-gradient()`) are correctly ignored
 * during splitting.
 *
 * @param value The raw CSS background value string.
 * @returns An array of parsed background layers.
 *
 * @example
 * splitBackgroundIntoLayers( 'url(a.png) no-repeat, red' );
 * // → [ { image: 'url(a.png)', repeat: [ 'no-repeat' ] }, { color: 'red' } ]
 */
function parseBackgroundIntoLayers( value: string ): Array<BackgroundLayer> {
	return splitByTopLevelCommas( value ).map( parseBackgroundLayer ).filter( ( obj ): obj is BackgroundLayer => obj !== null );
}

/**
 * Parses a single CSS background layer string into a structured `BackgroundLayer` object.
 *
 * First extracts any image function (gradient or `url()`), then classifies the remaining
 * space-separated tokens as repeat, position, attachment, or color values.
 *
 * @param layer A single (non-comma-separated) background layer string.
 * @returns A structured background layer object. If no valid properties were found, returns `null`.
 *
 * @example
 * parseBackgroundLayer( 'url(bg.png) top left no-repeat fixed' );
 * // → { image: 'url(bg.png)', position: [ 'top', 'left' ], repeat: [ 'no-repeat' ], attachment: 'fixed' }
 */
function parseBackgroundLayer( layer: string ): BackgroundLayer | null {
	const background: Partial<BackgroundLayer> = {};

	const { value: valueWithoutImage, image } = extractBackgroundImage( layer );
	const parts = getShorthandStylesValues( valueWithoutImage );

	if ( image ) {
		background.image = image;
	}

	for ( let i = 0; i < parts.length; i++ ) {
		const part = parts[ i ];

		if ( part === '/' ) {
			background.size = [];

			while ( i + 1 < parts.length && isSizeStyleValue( parts[ i + 1 ] ) ) {
				background.size.push( parts[ ++i ] );
			}
		} else if ( isRepeatStyleValue( part ) ) {
			background.repeat ||= [];
			background.repeat.push( part );
		} else if ( isPositionStyleValue( part ) || isPercentageStyleValue( part ) ) {
			background.position ||= [];
			background.position.push( part );

			// Percentage positions can be paired (e.g. '0% 0%'), so consume the next token if it's also a percentage.
			if (
				i + 1 < parts.length &&
				isPercentageStyleValue( part ) &&
				isPercentageStyleValue( parts[ i + 1 ] )
			) {
				background.position.push( parts[ ++i ] );
			}
		} else if ( isAttachmentStyleValue( part ) ) {
			background.attachment = part;
		} else if ( isClipStyleValue( part ) ) {
			if ( isOriginStyleValue( part ) && !background.origin ) {
				// First box value sets both origin and clip (per CSS spec).
				background.origin = part;
				background.clip = part;
			} else {
				// Second box value (or 'text') sets only clip.
				background.clip = part;
			}
		} else if ( isColorStyleValue( part ) ) {
			background.color = part;
		}
	}

	if ( isEmpty( background ) ) {
		return null;
	}

	return {
		...getDefaultBackgroundLayer(),
		...background
	};
}

/**
 * Returns a `BackgroundLayer` object with all properties set to their CSS initial values.
 *
 * Used as the base when parsing the `background` shorthand so that every property of a parsed
 * layer always has a defined value.
 *
 * @returns A background layer with default values.
 */
function getDefaultBackgroundLayer(): BackgroundLayer {
	return {
		attachment: BACKGROUND_INITIAL_ARRAY_VALUES.attachment,
		image: BACKGROUND_INITIAL_ARRAY_VALUES.image,
		origin: BACKGROUND_INITIAL_ARRAY_VALUES.origin,
		clip: BACKGROUND_INITIAL_ARRAY_VALUES.clip,
		position: BACKGROUND_INITIAL_ARRAY_VALUES.position.split( ' ' ),
		repeat: BACKGROUND_INITIAL_ARRAY_VALUES.repeat.split( ' ' ),
		size: BACKGROUND_INITIAL_ARRAY_VALUES.size.split( ' ' )
	};
}

/**
 * Extracts the first CSS image function (`linear-gradient`, `url`, etc.) from a raw CSS value string
 * and returns it separately along with the remaining string with the image function removed.
 *
 * Handles arbitrarily nested parentheses correctly (e.g. `rgba()` inside a gradient).
 * Only one image function is extracted per call — the caller is responsible for looping
 * if multiple image functions may be present.
 *
 * @param value The raw CSS value string to process.
 * @returns An object with `value` (the string with the image function removed) and
 *          `image` (the extracted function string, or `null` if none was found).
 *
 * @example
 * extractBackgroundImage( 'linear-gradient(red, blue) no-repeat' );
 * // → { value: ' no-repeat', image: 'linear-gradient(red, blue)' }
 */
function extractBackgroundImage( value: string ): { value: string; image: string | null } {
	for ( const imageFunction of IMAGE_FUNCTIONS ) {
		const prefix = imageFunction + '(';
		const firstIndex = value.indexOf( prefix );

		if ( firstIndex < 0 ) {
			continue;
		}

		let acc = imageFunction;
		let nesting = 0;

		for ( let i = firstIndex + imageFunction.length; i < value.length; i++ ) {
			const char = value[ i ];

			if ( char === '(' ) {
				nesting++;
			} else if ( char === ')' ) {
				nesting--;
			}

			acc += char;

			if ( nesting === 0 ) {
				return {
					value: value.slice( 0, firstIndex ) + value.slice( i + 1 ),
					image: acc
				};
			}
		}
	}

	// If no image functions were found, check if the value contains 'none', which is also a valid background-image value.
	if ( value.includes( 'none' ) ) {
		return {
			value: value.replace( 'none', '' ),
			image: 'none'
		};
	}

	return {
		value,
		image: null
	};
}

/**
 * Splits a CSS value string by commas that are at the top level (i.e. not inside parentheses).
 *
 * This is necessary because commas appear both as layer separators in the `background` shorthand
 * and as argument separators inside functions like `rgba()` or `linear-gradient()`.
 *
 * @param value The CSS value string to split.
 * @returns An array of trimmed top-level comma-separated segments.
 *
 * @example
 * splitByTopLevelCommas( 'linear-gradient(red, blue), center' );
 * // → [ 'linear-gradient(red, blue)', 'center' ]
 */
function splitByTopLevelCommas( value: string ): Array<string> {
	const parts: Array<string> = [];
	let current = '';
	let nesting = 0;

	for ( const char of value ) {
		if ( char === '(' ) {
			nesting++;
		} else if ( char === ')' ) {
			nesting--;
		} else if ( char === ',' && nesting === 0 ) {
			parts.push( current.trim() );
			current = '';
			continue;
		}

		current += char;
	}

	if ( current.trim() ) {
		parts.push( current.trim() );
	}

	return parts;
}

/**
 * Represents a normalized, structured form of the CSS `background` property.
 * Each longhand property is stored as an array of per-layer values, and `color` is stored separately
 * as it applies to the whole background and is placed in the last layer (per CSS spec).
 *
 * All properties are optional because the object may be populated from individual longhands
 * (e.g. only `background-color` set via the `background-color` property, without the full `background`
 * shorthand). When the `background` shorthand is parsed, all arrays are fully populated for every layer.
 */
type Background = {
	repeat?: Array<string>;
	position?: Array<string>;
	size?: Array<string>;
	attachment?: Array<string>;
	image?: Array<string>;
	origin?: Array<string>;
	clip?: Array<string>;
	color?: string;
};

/**
 * Represents a single CSS background layer as parsed from one comma-separated segment.
 * Every property always has a defined value — properties not explicitly set in the source CSS
 * are filled with their CSS initial values via `getDefaultBackgroundLayer`.
 */
type BackgroundLayer = {
	color?: string;
	attachment: string;
	image: string;
	origin: string;
	clip: string;
	repeat: Array<string>;
	position: Array<string>;
	size: Array<string>;
};
