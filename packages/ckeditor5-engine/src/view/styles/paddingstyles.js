/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getPositionShorthandNormalizer, getTopRightBottomLeftValueReducer } from './utils';

/**
 * @module engine/view/styles
 */

export function addPaddingStylesProcessor( stylesProcessor ) {
	stylesProcessor.setNormalizer( 'padding', getPositionShorthandNormalizer( 'padding' ) );
	stylesProcessor.setNormalizer( 'padding-top', value => ( { path: 'padding.top', value } ) );
	stylesProcessor.setNormalizer( 'padding-right', value => ( { path: 'padding.right', value } ) );
	stylesProcessor.setNormalizer( 'padding-bottom', value => ( { path: 'padding.bottom', value } ) );
	stylesProcessor.setNormalizer( 'padding-left', value => ( { path: 'padding.left', value } ) );

	stylesProcessor.setReducer( 'padding', getTopRightBottomLeftValueReducer( 'padding' ) );
}
