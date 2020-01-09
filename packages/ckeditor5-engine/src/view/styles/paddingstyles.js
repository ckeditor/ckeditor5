/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getPositionShorthandNormalizer, getTopRightBottomLeftValueReducer } from './utils';

/**
 * @module engine/view/styles
 */

export function addPaddingStylesProcessor( stylesConverter ) {
	stylesConverter.on( 'normalize:padding', getPositionShorthandNormalizer( 'padding' ) );
	stylesConverter.on( 'normalize:padding-top', ( evt, data ) => ( data.path = 'padding.top' ) );
	stylesConverter.on( 'normalize:padding-right', ( evt, data ) => ( data.path = 'padding.right' ) );
	stylesConverter.on( 'normalize:padding-bottom', ( evt, data ) => ( data.path = 'padding.bottom' ) );
	stylesConverter.on( 'normalize:padding-left', ( evt, data ) => ( data.path = 'padding.left' ) );

	stylesConverter.on( 'reduce:padding', getTopRightBottomLeftValueReducer( 'padding' ) );
}
