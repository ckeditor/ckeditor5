/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getPositionShorthandNormalizer, getTopRightBottomLeftValueReducer } from './utils';

/**
 * @module engine/view/styles
 */

export function addMarginStylesProcessor( stylesProcessor ) {
	stylesProcessor.on( 'normalize:margin', getPositionShorthandNormalizer( 'margin' ) );

	stylesProcessor.on( 'normalize:margin-top', ( evt, data ) => ( data.path = 'margin.top' ) );
	stylesProcessor.on( 'normalize:margin-right', ( evt, data ) => ( data.path = 'margin.right' ) );
	stylesProcessor.on( 'normalize:margin-bottom', ( evt, data ) => ( data.path = 'margin.bottom' ) );
	stylesProcessor.on( 'normalize:margin-left', ( evt, data ) => ( data.path = 'margin.left' ) );

	stylesProcessor.on( 'reduce:margin', getTopRightBottomLeftValueReducer( 'margin' ) );
}

