/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/styles/background
 */

import { getShorthandValues, isAttachment, isColor, isPosition, isRepeat, isURL } from './utils';

/**
 * Adds a background CSS styles processing rules.
 *
 *		editor.data.addStyleProcessorRules( addBackgroundRules );
 *
 * The normalized value is stored as:
 *
 *		const styles = {
 *			background: {
 *				color,
 *				repeat,
 *				position,
 *				attachment,
 *				image
 *			}
 *		};
 *
 * **Note**: Currently only `'background-color'` longhand value is parsed besides `'background'` shorthand. The reducer also supports only
 * `'background-color'` value.
 *
 * @param {module:engine/view/stylesmap~StylesProcessor} stylesProcessor
 */
export function addBackgroundRules( stylesProcessor ) {
	stylesProcessor.setNormalizer( 'background', normalizeBackground );
	stylesProcessor.setNormalizer( 'background-color', value => ( { path: 'background.color', value } ) );
	stylesProcessor.setReducer( 'background', value => {
		const ret = [];

		ret.push( [ 'background-color', value.color ] );

		return ret;
	} );
}

function normalizeBackground( value ) {
	const background = {};

	const parts = getShorthandValues( value );

	for ( const part of parts ) {
		if ( isRepeat( part ) ) {
			background.repeat = background.repeat || [];
			background.repeat.push( part );
		} else if ( isPosition( part ) ) {
			background.position = background.position || [];
			background.position.push( part );
		} else if ( isAttachment( part ) ) {
			background.attachment = part;
		} else if ( isColor( part ) ) {
			background.color = part;
		} else if ( isURL( part ) ) {
			background.image = part;
		}
	}

	return {
		path: 'background',
		value: background
	};
}
