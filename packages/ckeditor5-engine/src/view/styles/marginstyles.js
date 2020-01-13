/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getPositionShorthandNormalizer, getTopRightBottomLeftValueReducer } from './utils';

/**
 * @module engine/view/styles
 */

export function addMarginStylesProcessor( stylesProcessor ) {
	stylesProcessor.setNormalizer( 'margin', getPositionShorthandNormalizer( 'margin' ) );

	stylesProcessor.setNormalizer( 'margin-top', data => ( { path: 'margin.top', value: data.value } ) );
	stylesProcessor.setNormalizer( 'margin-right', data => ( { path: 'margin.right', value: data.value } ) );
	stylesProcessor.setNormalizer( 'margin-bottom', data => ( { path: 'margin.bottom', value: data.value } ) );
	stylesProcessor.setNormalizer( 'margin-left', data => ( { path: 'margin.left', value: data.value } ) );

	stylesProcessor.setReducer( 'margin', getTopRightBottomLeftValueReducer( 'margin' ) );
}
