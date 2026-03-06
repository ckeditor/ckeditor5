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
	StyleValue
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
	stylesProcessor.setNormalizer( 'background', getBackgroundNormalizer() );
	stylesProcessor.setNormalizer( 'background-color', getBackgroundColorNormalizer() );
	stylesProcessor.setNormalizer( 'background-image', getBackgroundArrayPropertyNormalizer( 'background.image' ) );
	stylesProcessor.setNormalizer( 'background-repeat', getBackgroundArrayPropertyNormalizer( 'background.repeat' ) );
	stylesProcessor.setNormalizer( 'background-position', getBackgroundArrayPropertyNormalizer( 'background.position' ) );
	stylesProcessor.setNormalizer( 'background-size', getBackgroundArrayPropertyNormalizer( 'background.size' ) );
	stylesProcessor.setNormalizer( 'background-attachment', getBackgroundArrayPropertyNormalizer( 'background.attachment' ) );
	stylesProcessor.setNormalizer( 'background-origin', getBackgroundArrayPropertyNormalizer( 'background.origin' ) );
	stylesProcessor.setNormalizer( 'background-clip', getBackgroundArrayPropertyNormalizer( 'background.clip' ) );

	stylesProcessor.setReducer( 'background', getBackgroundReducer() );
	stylesProcessor.setReducer( 'background-image', getBackgroundArrayPropertyReducer( 'background-image', 'none' ) );
	stylesProcessor.setReducer( 'background-repeat', getBackgroundArrayPropertyReducer( 'background-repeat', 'repeat' ) );
	stylesProcessor.setReducer( 'background-position', getBackgroundArrayPropertyReducer( 'background-position', '0% 0%' ) );
	stylesProcessor.setReducer( 'background-size', getBackgroundArrayPropertyReducer( 'background-size', 'auto' ) );
	stylesProcessor.setReducer( 'background-attachment', getBackgroundArrayPropertyReducer( 'background-attachment', 'scroll' ) );
	stylesProcessor.setReducer( 'background-origin', getBackgroundArrayPropertyReducer( 'background-origin', 'padding-box' ) );
	stylesProcessor.setReducer( 'background-clip', getBackgroundArrayPropertyReducer( 'background-clip', 'border-box' ) );

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
			layers.push( { color: value } );
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
 * @param defaultValue The CSS initial value for the property, used as a placeholder for missing layer values.
 */
function getBackgroundArrayPropertyReducer( property: string, defaultValue: string ): StylesReducer {
	return value => {
		const serialized = ( value as Array<string | undefined> )
			.map( v => v ?? defaultValue )
			.join( ', ' );

		return [ [ property, serialized ] ];
	};
}

/**
 * Returns a reducer for the `background` shorthand property.
 *
 * Converts a structured `Background` object back into a CSS `background` shorthand string,
 * omitting values that match their CSS initial values to keep the output concise.
 * Longhand values are serialized per layer in the order: image, position, repeat, attachment, color.
 */
function getBackgroundReducer(): StylesReducer {
	return value => {
		const background = value as Background;
		const shorthand = extractBackgroundLayers( background )
			.map( serializeBackgroundLayer )
			.filter( Boolean )
			.join( ', ' );

		return [ [ 'background', shorthand ] ];
	};
}

/**
 * Serializes a single `BackgroundLayer` into a CSS background layer string.
 * Properties equal to their CSS placeholder values are omitted.
 *
 * @param layer A single background layer to serialize.
 * @returns A space-separated CSS string for the layer, or an empty string if no parts are present.
 */
function serializeBackgroundLayer( layer: BackgroundLayer ): string {
	const parts: Array<string> = [];

	if ( layer.image ) {
		parts.push( layer.image );
	}

	const positionStr = layer.position?.join( ' ' );

	if ( positionStr ) {
		parts.push( positionStr );
	}

	const sizeStr = layer.size?.join( ' ' );

	if ( sizeStr ) {
		if ( !positionStr ) {
			parts.push( '0% 0%' );
		}

		parts.push( '/' );
		parts.push( sizeStr );
	}

	const repeatStr = layer.repeat?.join( ' ' );

	if ( repeatStr ) {
		parts.push( repeatStr );
	}

	if ( layer.attachment ) {
		parts.push( layer.attachment );
	}

	if ( layer.origin ) {
		parts.push( layer.origin );

		if ( layer.clip && layer.clip !== layer.origin ) {
			parts.push( layer.clip );
		}
	} else if ( layer.clip ) {
		parts.push( layer.clip );
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
	const layerCount = Math.max(
		background.image?.length ?? 0,
		background.position?.length ?? 0,
		background.size?.length ?? 0,
		background.repeat?.length ?? 0,
		background.attachment?.length ?? 0,
		background.origin?.length ?? 0,
		background.clip?.length ?? 0
	);

	const layers: Array<BackgroundLayer> = Array.from( { length: layerCount }, ( _, i ) => {
		const layer: BackgroundLayer = {};

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
		if ( !layers.length ) {
			layers.push( {} );
		}

		// According to standard, the last layer can contain the color definition,
		// so we set it on the last layer if it exists.
		layers.at( -1 )!.color = background.color;
	}

	return layers;
}

/**
 * Merges an array of `BackgroundLayer` objects into a single structured `Background` object,
 * storing each longhand property as an array of per-layer values.
 *
 * Missing properties in a layer are filled with their CSS placeholder values, as required by the spec
 * when parsing the `background` shorthand. Properties that contain only placeholder values across all
 * layers are reset to empty arrays to avoid redundant output.
 *
 * @param layers An array of parsed background layers.
 * @returns A merged `Background` object.
 *
 * @example
 * // Input: [ { image: 'url(a.png)', repeat: [ 'no-repeat' ] }, { color: 'red' } ]
 * // Output: {
 * //   image: [ 'url(a.png)', undefined ],
 * //   position: [],               // all initial → reset to []
 * //   repeat: [ 'no-repeat', 'repeat' ],
 * //   attachment: [],             // all initial → reset to []
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
		background.image!.push( layer.image );
		background.position!.push( layer.position?.join( ' ' ) );
		background.size!.push( layer.size?.join( ' ' ) );
		background.repeat!.push( layer.repeat?.join( ' ' ) );
		background.attachment!.push( layer.attachment );
		background.origin!.push( layer.origin );
		background.clip!.push( layer.clip );
	}

	return {
		color: layers.at( -1 )?.color,
		image: resetIfAllPlaceholders( background.image! ),
		position: resetIfAllPlaceholders( background.position! ),
		size: resetIfAllPlaceholders( background.size! ),
		repeat: resetIfAllPlaceholders( background.repeat! ),
		attachment: resetIfAllPlaceholders( background.attachment! ),
		origin: resetIfAllPlaceholders( background.origin! ),
		clip: resetIfAllPlaceholders( background.clip! )
	};

	function resetIfAllPlaceholders( property: Array<string | undefined> ): Array<string | undefined> {
		return property.every( value => value === undefined ) ? [] : property;
	}
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
	return splitByTopLevelCommas( value ).map( parseBackgroundLayer ).filter( obj => !isEmpty( obj ) );
}

/**
 * Parses a single CSS background layer string into a structured `BackgroundLayer` object.
 *
 * First extracts any image function (gradient or `url()`), then classifies the remaining
 * space-separated tokens as repeat, position, attachment, or color values.
 *
 * @param layer A single (non-comma-separated) background layer string.
 * @returns A structured background layer object.
 *
 * @example
 * parseBackgroundLayer( 'url(bg.png) top left no-repeat fixed' );
 * // → { image: 'url(bg.png)', position: [ 'top', 'left' ], repeat: [ 'no-repeat' ], attachment: 'fixed' }
 */
function parseBackgroundLayer( layer: string ): BackgroundLayer {
	const background: BackgroundLayer = {};
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

	return background;
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
 * Represents a normalized, structured form of a CSS `background` shorthand.
 * Each longhand property is stored as an array of per-layer values, and the `color` is stored separately
 * as it applies to the whole background and is usually defined in the last layer.
 *
 * When layer do not define a value for a property, it is filled with a placeholder value to preserve the layer count and positions,
 * as required by the CSS spec when parsing the `background` shorthand.
 *
 * Properties that contain only placeholder values across all layers are reset to empty arrays to avoid redundant output.
 */
type Background = {
	repeat?: Array<string | undefined>;
	position?: Array<string | undefined>;
	size?: Array<string | undefined>;
	attachment?: Array<string | undefined>;
	image?: Array<string | undefined>;
	origin?: Array<string | undefined>;
	clip?: Array<string | undefined>;
	color?: string;
};

/**
 * Represents a single CSS background layer as parsed from one comma-separated segment.
 */
type BackgroundLayer = {
	color?: string;
	repeat?: Array<string>;
	position?: Array<string>;
	size?: Array<string>;
	attachment?: string;
	image?: string;
	origin?: string;
	clip?: string;
};
