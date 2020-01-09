/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { isAttachment, isColor, isPosition, isRepeat, isURL } from './utils';

/**
 * @module engine/view/styles
 */

export function addBackgroundStylesProcessor( stylesProcessor ) {
	stylesProcessor.on( 'normalize:background', normalizeBackground );
	stylesProcessor.on( 'normalize:background-color', ( evt, data ) => ( data.path = 'background.color' ) );
	stylesProcessor.on( 'reduce:background', ( evt, data ) => {
		const ret = [];

		ret.push( [ 'background-color', data.value.color ] );

		data.reduced = ret;
	} );
}

function normalizeBackground( evt, data ) {
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

	data.path = 'background';
	data.value = background;
}
