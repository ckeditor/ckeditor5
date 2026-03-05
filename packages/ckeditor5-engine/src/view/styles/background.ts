/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/styles/background
 */

import type {
	StylesProcessor,
	StylesNormalizer,
	StylesReducer
} from '../stylesmap.js';
import {
	getShorthandStylesValues,
	isAttachmentStyleValue,
	isColorStyleValue,
	isPositionStyleValue,
	isRepeatStyleValue
} from './utils.js';

/**
 * CSS initial values for background longhand properties.
 */
const BACKGROUND_INITIAL_VALUES = {
	image: 'none',
	position: '0% 0%',
	repeat: 'repeat',
	attachment: 'scroll'
} as const;

/**
 * CSS function names that represent image values in the `background` shorthand.
 * Used to detect and extract image tokens before parsing the remaining parts of the value.
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
 * Registers normalizers for the `background` shorthand and all its longhand properties,
 * reducers that serialize them back to CSS strings, and the relation mapping between them.
 *
 * ```ts
 * editor.data.addStyleProcessorRules( addBackgroundStylesRules );
 * ```
 *
 * The normalized value is stored as:
 *
 * ```ts
 * const styles = {
 * 	background: {
 * 		color,
 * 		repeat,
 * 		position,
 * 		attachment,
 * 		image
 * 	}
 * };
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
	stylesProcessor.setNormalizer( 'background-attachment', getBackgroundArrayPropertyNormalizer( 'background.attachment' ) );

	stylesProcessor.setReducer( 'background', getBackgroundReducer() );
	stylesProcessor.setReducer( 'background-image', getBackgroundArrayPropertyReducer( 'background-image' ) );
	stylesProcessor.setReducer( 'background-repeat', getBackgroundArrayPropertyReducer( 'background-repeat' ) );
	stylesProcessor.setReducer( 'background-position', getBackgroundArrayPropertyReducer( 'background-position' ) );
	stylesProcessor.setReducer( 'background-attachment', getBackgroundArrayPropertyReducer( 'background-attachment' ) );

	stylesProcessor.setStyleRelation( 'background', [
		'background-color',
		'background-image',
		'background-repeat',
		'background-position',
		'background-attachment'
	] );
}

/**
 * Returns a normalizer for the `background` shorthand property.
 *
 * Parses the raw CSS value into comma-separated layers and merges them into
 * a structured `Background` object stored under the `background` path.
 *
 * @example
 * // Input: 'url(a.png) no-repeat, red'
 * // Output: { path: 'background', value: { image: ['url(a.png)', 'none'], repeat: ['no-repeat'], color: 'red', ... } }
 */
function getBackgroundNormalizer(): StylesNormalizer {
	return value => {
		const layers = splitBackgroundIntoLayers( value );
		const background = mergeBackgroundLayers( layers );

		return {
			path: 'background',
			value: background
		};
	};
}

/**
 * Returns a normalizer for the `background-color` longhand property.
 *
 * Stores the raw color value directly under the `background.color` path.
 *
 * @example
 * // Input: '#fff'  →  { path: 'background.color', value: '#fff' }
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
 *
 * @example
 * // path: 'background.image', value: 'url(a.png), url(b.png)'
 * // Output: { path: 'background.image', value: [ 'url(a.png)', 'url(b.png)' ] }
 */
function getBackgroundArrayPropertyNormalizer( path: string ): StylesNormalizer {
	return value => {
		const values = splitByTopLevelCommas( value );

		return { path, value: values };
	};
}

/**
 * Returns a reducer for a comma-separated background array longhand property
 * (e.g. `background-image`, `background-repeat`, `background-position`, `background-attachment`).
 *
 * Serializes an array of per-layer values back into a comma-separated CSS string.
 * Returns an empty array (property omitted) if the serialized value is empty.
 *
 * @param property The CSS property name to output, e.g. `'background-image'`.
 *
 * @example
 * // property: 'background-image', value: [ 'url(a.png)', 'url(b.png)' ]
 * // Output: [ [ 'background-image', 'url(a.png), url(b.png)' ] ]
 */
function getBackgroundArrayPropertyReducer( property: string ): StylesReducer {
	return value => {
		const serialized = ( value as Array<string> ).join( ', ' );

		return [ [ property, serialized ] ];
	};
}

/**
 * Returns a reducer for the `background` shorthand property.
 *
 * Converts a structured `Background` object back into a CSS `background` shorthand string,
 * omitting values that match their CSS initial values to keep the output concise.
 * Longhand values are serialized per layer in the order: image, position, repeat, attachment, color.
 *
 * @example
 * // Input: { image: ['url(a.png)'], repeat: ['no-repeat'], position: ['0% 0%'], attachment: ['scroll'], color: 'red' }
 * // Output: [ [ 'background', 'url(a.png) no-repeat red' ] ]
 * // (position and attachment are omitted because they equal their initial values)
 */
function getBackgroundReducer(): StylesReducer {
	return value => {
		const background = value as Background;
		const shorthand = unwrapBackgroundLayers( background )
			.map( serializeBackgroundLayer )
			.filter( Boolean )
			.join( ', ' );

		return [ [ 'background', shorthand ] ];
	};
}

/**
 * Serializes a single `BackgroundLayer` into a CSS background layer string.
 * Properties equal to their CSS initial values are omitted.
 *
 * @param layer A single background layer to serialize.
 * @returns A space-separated CSS string for the layer, or an empty string if no parts are present.
 *
 * @example
 * // Input: { image: 'url(bg.png)', repeat: [ 'no-repeat' ], position: [ '0%', '0%' ], attachment: 'scroll' }
 * // Output: 'url(bg.png) no-repeat'  (position and attachment match initial values, so they're omitted)
 */
function serializeBackgroundLayer( layer: BackgroundLayer ): string {
	const parts: Array<string> = [];

	if ( layer.image ) {
		parts.push( layer.image );
	}

	const positionStr = layer.position?.join( ' ' );

	if ( positionStr && positionStr !== BACKGROUND_INITIAL_VALUES.position ) {
		parts.push( positionStr );
	}

	const repeatStr = layer.repeat?.join( ' ' );

	if ( repeatStr && repeatStr !== BACKGROUND_INITIAL_VALUES.repeat ) {
		parts.push( repeatStr );
	}

	if ( layer.attachment && layer.attachment !== BACKGROUND_INITIAL_VALUES.attachment ) {
		parts.push( layer.attachment );
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
function unwrapBackgroundLayers( background: Background ): Array<BackgroundLayer> {
	const layerCount = Math.max(
		background.image?.length ?? 0,
		background.position?.length ?? 0,
		background.repeat?.length ?? 0,
		background.attachment?.length ?? 0
	);

	const layers: Array<BackgroundLayer> = Array.from( { length: layerCount }, ( _, i ) => {
		const layer: BackgroundLayer = {};

		if ( background.image?.[ i ] ) {
			layer.image = background.image[ i ];
		}

		if ( background.position?.[ i ] ) {
			layer.position = background.position[ i ].split( ' ' );
		}

		if ( background.repeat?.[ i ] ) {
			layer.repeat = background.repeat[ i ].split( ' ' );
		}

		if ( background.attachment?.[ i ] ) {
			layer.attachment = background.attachment[ i ];
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
 * Missing properties in a layer are filled with their CSS initial values, as required by the spec
 * when parsing the `background` shorthand. Properties that contain only initial values across all
 * layers are reset to empty arrays to avoid redundant output.
 *
 * @param layers An array of parsed background layers.
 * @returns A merged `Background` object.
 *
 * @example
 * // Input: [ { image: 'url(a.png)', repeat: [ 'no-repeat' ] }, { color: 'red' } ]
 * // Output: {
 * //   image: [ 'url(a.png)', 'none' ],
 * //   position: [],               // all initial → reset to []
 * //   repeat: [ 'no-repeat', 'repeat' ],
 * //   attachment: [],             // all initial → reset to []
 * //   color: 'red'
 * // }
 */
function mergeBackgroundLayers( layers: Array<BackgroundLayer> ): Background {
	const image: Array<string> = [];
	const position: Array<string> = [];
	const repeat: Array<string> = [];
	const attachment: Array<string> = [];

	for ( const layer of layers ) {
		image.push( layer.image || BACKGROUND_INITIAL_VALUES.image );
		position.push( layer.position?.join( ' ' ) || BACKGROUND_INITIAL_VALUES.position );
		repeat.push( layer.repeat?.join( ' ' ) || BACKGROUND_INITIAL_VALUES.repeat );
		attachment.push( layer.attachment || BACKGROUND_INITIAL_VALUES.attachment );
	}

	// The background-color can ONLY be included in the final background layer.
	const color = layers.at( -1 )?.color;

	return {
		image: resetIfAllInitial( image, BACKGROUND_INITIAL_VALUES.image ),
		position: resetIfAllInitial( position, BACKGROUND_INITIAL_VALUES.position ),
		repeat: resetIfAllInitial( repeat, BACKGROUND_INITIAL_VALUES.repeat ),
		attachment: resetIfAllInitial( attachment, BACKGROUND_INITIAL_VALUES.attachment ),
		color
	};
}

/**
 * Returns an empty array if every element of `property` equals `initialValue`,
 * otherwise returns `property` unchanged.
 *
 * Used to avoid storing redundant all-initial longhand arrays after merging background layers.
 *
 * @param property The array of per-layer values to check.
 * @param initialValue The CSS initial value for the property.
 * @returns The original array, or `[]` if all elements equal the initial value.
 *
 * @example
 * resetIfAllInitial( [ 'scroll', 'scroll' ], 'scroll' ); // → []
 * resetIfAllInitial( [ 'scroll', 'fixed' ], 'scroll' );  // → [ 'scroll', 'fixed' ]
 */
function resetIfAllInitial( property: Array<string>, initialValue: string ): Array<string> {
	return property.every( value => value === initialValue ) ? [] : property;
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
function splitBackgroundIntoLayers( value: string ): Array<BackgroundLayer> {
	return splitByTopLevelCommas( value ).map( parseBackgroundLayer );
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
	const { value: valueWithoutImage, image } = trimBackgroundImageFunction( layer );
	const parts = getShorthandStylesValues( valueWithoutImage );

	if ( image ) {
		background.image = image;
	}

	for ( const part of parts ) {
		if ( isRepeatStyleValue( part ) ) {
			background.repeat ||= [];
			background.repeat.push( part );
		} else if ( isPositionStyleValue( part ) ) {
			background.position ||= [];
			background.position.push( part );
		} else if ( isAttachmentStyleValue( part ) ) {
			background.attachment = part;
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
 * trimBackgroundImageFunction( 'linear-gradient(red, blue) no-repeat' );
 * // → { value: ' no-repeat', image: 'linear-gradient(red, blue)' }
 */
function trimBackgroundImageFunction( value: string ): { value: string; image: string | null } {
	for ( const imageFunction of IMAGE_FUNCTIONS ) {
		const prefix = imageFunction + '(';

		// There might be multiple gradients or URLs in the value, so we need to loop until all of them are extracted.
		// Limit iterations to prevent infinite loops in case of malformed input or an issue in the extraction logic.
		for ( let watchdog = 0; value.includes( prefix ) && watchdog < 10; watchdog++ ) {
			const firstIndex = value.indexOf( prefix );

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
 * Each longhand property is stored as an array — one entry per background layer.
 */
type Background = {
	repeat?: Array<string>;
	position?: Array<string>;
	attachment?: Array<string>;
	image?: Array<string>;
	color?: string;
};

/**
 * Represents a single CSS background layer as parsed from one comma-separated segment.
 * Unlike `Background`, all longhand properties here are singular (not arrays).
 */
type BackgroundLayer = {
	repeat?: Array<string>;
	position?: Array<string>;
	attachment?: string;
	color?: string;
	image?: string;
};
