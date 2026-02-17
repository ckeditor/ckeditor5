/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/styles/background
 */

import type { StylesProcessor, StylePropertyDescriptor, Styles, StylesNormalizer, StylesReducer } from '../stylesmap.js';
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
	stylesProcessor.setNormalizer( 'background-image', getBackgroundImageNormalizer() );
	stylesProcessor.setReducer( 'background', getBackgroundReducer() );

	stylesProcessor.setStyleRelation( 'background', [ 'background-color', 'background-image' ] );
}

function getBackgroundNormalizer(): StylesNormalizer {
	return value => {
		const background: {
			repeat?: Array<string>;
			position?: Array<string>;
			attachment?: string;
			color?: string;
			image?: string;
		} = {};

		const { value: valueWithoutImages, images } = trimBackgroundImageStyleValues( value );
		const parts = getShorthandStylesValues( valueWithoutImages );

		for ( const part of parts ) {
			if ( isRepeatStyleValue( part ) ) {
				background.repeat = background.repeat || [];

				background.repeat.push( part );
			} else if ( isPositionStyleValue( part ) ) {
				background.position = background.position || [];

				background.position.push( part );
			} else if ( isAttachmentStyleValue( part ) ) {
				background.attachment = part;
			} else if ( isColorStyleValue( part ) ) {
				background.color = part;
			}
		}

		if ( images.length ) {
			background.image = images.join( ', ' );
		}

		return {
			path: 'background',
			value: background
		};
	};
}

function getBackgroundColorNormalizer(): StylesNormalizer {
	return value => ( { path: 'background.color', value } );
}

function getBackgroundImageNormalizer(): StylesNormalizer {
	return value => ( { path: 'background.image', value } );
}

function getBackgroundReducer(): StylesReducer {
	return value => {
		const ret: Array<StylePropertyDescriptor> = [];
		const styles = value as Styles;

		if ( styles.color ) {
			ret.push( [ 'background-color', styles.color as string ] );
		}

		if ( styles.image ) {
			ret.push( [ 'background-image', styles.image as string ] );
		}

		return ret;
	};
}

const imageFunctions = [
	'linear-gradient',
	'repeating-linear-gradient',
	'radial-gradient',
	'repeating-radial-gradient',
	'conic-gradient',
	'repeating-conic-gradient',
	'url'
];

/**
 * Extracts specific CSS image definitions (gradients, URLs) from a raw style string
 * and separates them from the remaining value.
 *
 * This function handles nested parentheses correctly (e.g., `rgba()` inside a gradient).
 * It modifies the input string by removing the extracted image definitions.
 */
function trimBackgroundImageStyleValues( value: string ): { value: string; images: Array<string> } {
	const images = [];

	for ( const gradient of imageFunctions ) {
		// There might be multiple gradients or URLs in the value, so we need to loop until all of them are extracted.
		// Limit iterations to prevent infinite loops in case of malformed input or issue in the extraction logic.
		for ( let watchdog = 0; value.includes( gradient + '(' ) && watchdog < 10; watchdog++ ) {
			const firstIndex = value.indexOf( gradient + '(' );

			let acc = gradient;
			let nesting = 0;

			for ( let i = firstIndex + gradient.length; i < value.length; i++ ) {
				const char = value[ i ];

				if ( char === '(' ) {
					nesting++;
				} else if ( char === ')' ) {
					nesting--;
				}

				acc += char;

				if ( nesting === 0 ) {
					images.push( acc );
					value = value.substring( 0, firstIndex ) + value.substring( i + 1 );
					break;
				}
			}
		}
	}

	return {
		value,
		images
	};
}
