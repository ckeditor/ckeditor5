/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/styles/background
 */

import type {
	StylesProcessor,
	StylePropertyDescriptor,
	Styles,
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
 * Adds a background CSS styles processing rules.
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
 * ````
 *
 * **Note**: Currently `'background-color'` and `'background-image'` longhand values are parsed besides `'background'` shorthand.
 * The reducer supports `'background-color'` and `'background-image'` values.
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

function getBackgroundColorNormalizer(): StylesNormalizer {
	return value => ( { path: 'background.color', value } );
}

function getBackgroundArrayPropertyNormalizer( path: string ): StylesNormalizer {
	return value => {
		const values = splitByTopLevelCommas( value );

		return { path, value: values };
	};
}

function getBackgroundArrayPropertyReducer( property: string ): StylesReducer {
	return value => {
		const serialized = Array.isArray( value ) ? ( value as Array<string> ).join( ', ' ) : value as string;

		return serialized ? [ [ property, serialized ] ] : [];
	};
}

function getBackgroundReducer(): StylesReducer {
	const imageReducer = getBackgroundArrayPropertyReducer( 'background-image' );
	const repeatReducer = getBackgroundArrayPropertyReducer( 'background-repeat' );
	const positionReducer = getBackgroundArrayPropertyReducer( 'background-position' );
	const attachmentReducer = getBackgroundArrayPropertyReducer( 'background-attachment' );

	return value => {
		const ret: Array<StylePropertyDescriptor> = [];
		const styles = value as Styles;

		if ( styles.color ) {
			ret.push( [ 'background-color', styles.color as string ] );
		}

		ret.push( ...imageReducer( styles.image ) );
		ret.push( ...repeatReducer( styles.repeat ) );
		ret.push( ...positionReducer( styles.position ) );
		ret.push( ...attachmentReducer( styles.attachment ) );

		return ret;
	};
}

/**
 * CSS initial values for background longhand properties.
 * Spec: https://www.w3.org/TR/css-backgrounds-3/
 */
const BACKGROUND_INITIAL_VALUES = {
	image: 'none',
	position: '0% 0%',
	repeat: 'repeat',
	attachment: 'scroll'
} as const;

/**
 * Flattens multiple background layers into a structured Background object containing arrays of longhand properties.
 * According to the CSS shorthand standard, missing properties in a layer must be reset to their initial values.
 */
function mergeBackgroundLayers( layers: Array<BackgroundLayer> ): Background {
	const merged: Background = {
		image: [],
		position: [],
		repeat: [],
		attachment: []
	};

	for ( const layer of layers ) {
		merged.image!.push( layer.image || BACKGROUND_INITIAL_VALUES.image );
		merged.position!.push( layer.position?.join( ' ' ) || BACKGROUND_INITIAL_VALUES.position );
		merged.repeat!.push( layer.repeat?.join( ' ' ) || BACKGROUND_INITIAL_VALUES.repeat );
		merged.attachment!.push( layer.attachment || BACKGROUND_INITIAL_VALUES.attachment );
	}

	// The background-color can ONLY be included in the final background layer.
	merged.color = layers.at( -1 )?.color;

	function resetIfAllInitial( property: Array<string>, initialValue: string ): Array<string> {
		return property.every( value => value === initialValue ) ? [] : property;
	}

	return {
		image: resetIfAllInitial( merged.image!, BACKGROUND_INITIAL_VALUES.image ),
		position: resetIfAllInitial( merged.position!, BACKGROUND_INITIAL_VALUES.position ),
		repeat: resetIfAllInitial( merged.repeat!, BACKGROUND_INITIAL_VALUES.repeat ),
		attachment: resetIfAllInitial( merged.attachment!, BACKGROUND_INITIAL_VALUES.attachment ),
		color: merged.color
	};
}

type Background = {
	repeat?: Array<string>;
	position?: Array<string>;
	attachment?: Array<string>;
	image?: Array<string>;
	color?: string;
};

/**
 * According to CSS spectrum, a background property can contain multiple comma-separated layers,
 * and each layer can have multiple components (color, image, position, etc.). The syntax looks like this:
 *
 * `background: [ <bg-layer> , ]* <final-bg-layer>` where `<bg-layer>` can be a combination of color, image, position, etc.
 *
 * This function parses definition and splits it into separate layers, extracting image definitions (gradients, URLs) while
 * keeping the rest of the value intact.
 */
function splitBackgroundIntoLayers( value: string ): Array<BackgroundLayer> {
	return splitByTopLevelCommas( value ).map( parseBackgroundLayer );
}

/**
 * Extracts specific CSS image definitions (gradients, URLs) from a raw style string.
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

type BackgroundLayer = {
	repeat?: Array<string>;
	position?: Array<string>;
	attachment?: string;
	color?: string;
	image?: string;
};

/**
 * Extracts specific CSS image definitions (gradients, URLs) from a raw style string
 * and separates them from the remaining value.
 *
 * This function handles nested parentheses correctly (e.g., `rgba()` inside a gradient).
 * It modifies the input string by removing the extracted image definitions.
 */
const imageFunctions = [
	'linear-gradient',
	'repeating-linear-gradient',
	'radial-gradient',
	'repeating-radial-gradient',
	'conic-gradient',
	'repeating-conic-gradient',
	'url'
];

function trimBackgroundImageFunction( value: string ): { value: string; image: string | null } {
	for ( const imageFunction of imageFunctions ) {
		// There might be multiple gradients or URLs in the value, so we need to loop until all of them are extracted.
		// Limit iterations to prevent infinite loops in case of malformed input or issue in the extraction logic.
		for ( let watchdog = 0; value.includes( imageFunction + '(' ) && watchdog < 10; watchdog++ ) {
			const firstIndex = value.indexOf( imageFunction + '(' );

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
 * Splits a CSS value string by top-level commas (ignoring commas inside parentheses).
 */
function splitByTopLevelCommas( value: string ): Array<string> {
	const parts = [];
	let current = '';
	let nesting = 0;

	for ( let i = 0; i < value.length; i++ ) {
		const char = value[ i ];

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
