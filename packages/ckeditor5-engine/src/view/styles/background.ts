/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
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
	isRepeatStyleValue,
	isURLStyleValue
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
 * **Note**: Currently only `'background-color'` longhand value is parsed besides `'background'` shorthand. The reducer also supports only
 * `'background-color'` value.
 */
export function addBackgroundStylesRules( stylesProcessor: StylesProcessor ): void {
	stylesProcessor.setNormalizer( 'background', getBackgroundNormalizer() );
	stylesProcessor.setNormalizer( 'background-color', getBackgroundColorNormalizer() );
	stylesProcessor.setReducer( 'background', getBackgroundReducer() );

	stylesProcessor.setStyleRelation( 'background', [ 'background-color' ] );
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

		const parts = getShorthandStylesValues( value );

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
			} else if ( isURLStyleValue( part ) ) {
				background.image = part;
			}
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

function getBackgroundReducer(): StylesReducer {
	return value => {
		const ret: Array<StylePropertyDescriptor> = [];

		ret.push( [ 'background-color', ( value as Styles ).color as string ] );

		return ret;
	};
}
