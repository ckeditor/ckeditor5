/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getPositionShorthandNormalizer, getTopRightBottomLeftValueReducer } from './utils';

/**
 * @module engine/view/styles
 */

export default class MarginStyles {
	static attach( stylesConverter ) {
		stylesConverter.on( 'normalize:margin', getPositionShorthandNormalizer( 'margin' ) );

		stylesConverter.on( 'normalize:margin-top', ( evt, data ) => ( data.path = 'margin.top' ) );
		stylesConverter.on( 'normalize:margin-right', ( evt, data ) => ( data.path = 'margin.right' ) );
		stylesConverter.on( 'normalize:margin-bottom', ( evt, data ) => ( data.path = 'margin.bottom' ) );
		stylesConverter.on( 'normalize:margin-left', ( evt, data ) => ( data.path = 'margin.left' ) );

		stylesConverter.on( 'reduce:margin', getTopRightBottomLeftValueReducer( 'margin' ) );
	}
}
