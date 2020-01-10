/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getPositionShorthandNormalizer, getTopRightBottomLeftValueReducer } from './utils';

/**
 * @module engine/view/styles
 */

export function addPaddingStylesProcessor( stylesProcessor ) {
	stylesProcessor.registerListeners( 'padding', stylesProcessor => {
		stylesProcessor.on( 'normalize:padding', getPositionShorthandNormalizer( 'padding' ) );
		stylesProcessor.on( 'normalize:padding-top', ( evt, data ) => ( data.path = 'padding.top' ) );
		stylesProcessor.on( 'normalize:padding-right', ( evt, data ) => ( data.path = 'padding.right' ) );
		stylesProcessor.on( 'normalize:padding-bottom', ( evt, data ) => ( data.path = 'padding.bottom' ) );
		stylesProcessor.on( 'normalize:padding-left', ( evt, data ) => ( data.path = 'padding.left' ) );

		stylesProcessor.on( 'reduce:padding', getTopRightBottomLeftValueReducer( 'padding' ) );
	} );
}
