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
	stylesProcessor.setNormalizer( 'padding-top', data => ( { path: 'padding.top', value: data.value } ) );
	stylesProcessor.setNormalizer( 'padding-right', data => ( { path: 'padding.right', value: data.value } ) );
	stylesProcessor.setNormalizer( 'padding-bottom', data => ( { path: 'padding.bottom', value: data.value } ) );
	stylesProcessor.setNormalizer( 'padding-left', data => ( { path: 'padding.left', value: data.value } ) );

	stylesProcessor.setReducer( 'padding', getTopRightBottomLeftValueReducer( 'padding' ) );
}
