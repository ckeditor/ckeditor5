/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { isAttachment, isColor, isPosition, isRepeat, isURL } from './utils';

/**
 * @module engine/view/styles
 */

export function addBackgroundStylesProcessor( stylesProcessor ) {
	stylesProcessor.setNormalizer( 'background', normalizeBackground );
	stylesProcessor.setNormalizer( 'background-color', data => ( { path: 'background.color', value: data.value } ) );
	stylesProcessor.setReducer( 'background', data => {
		const ret = [];

		ret.push( [ 'background-color', data.value.color ] );

		return ret;
	} );
}

function normalizeBackground( data ) {
	const background = {};

	const parts = data.value.split( ' ' );

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
