/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/styles/padding
 */

import { getPositionShorthandNormalizer, getBoxSidesValueReducer } from './utils';

/**
 * Adds a margin CSS styles processing rules.
 *
 *		editor.data.addStyleProcessorRules( addPaddingRules );
 *
 * The normalized value is stored as:
 *
 *		const styles = {
 *			padding: {
 *				top,
 *				right,
 *				bottom,
 *				left
 *			}
 *		};
 *
 * @param {module:engine/view/stylesmap~StylesProcessor} stylesProcessor
 */
export function addPaddingRules( stylesProcessor ) {
	stylesProcessor.setNormalizer( 'padding', getPositionShorthandNormalizer( 'padding' ) );
	stylesProcessor.setNormalizer( 'padding-top', value => ( { path: 'padding.top', value } ) );
	stylesProcessor.setNormalizer( 'padding-right', value => ( { path: 'padding.right', value } ) );
	stylesProcessor.setNormalizer( 'padding-bottom', value => ( { path: 'padding.bottom', value } ) );
	stylesProcessor.setNormalizer( 'padding-left', value => ( { path: 'padding.left', value } ) );

	stylesProcessor.setReducer( 'padding', getBoxSidesValueReducer( 'padding' ) );

	stylesProcessor.setStyleRelation( 'padding', [ 'padding-top', 'padding-right', 'padding-bottom', 'padding-left' ] );
}
