/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/styles/padding
 */

import type { StylesProcessor } from '../stylesmap.js';
import { getPositionStyleShorthandNormalizer, getBoxSidesStyleValueReducer } from './utils.js';

/**
 * Adds a padding CSS styles processing rules.
 *
 * ```ts
 * editor.data.addStyleProcessorRules( addPaddingStylesRules );
 * ```
 *
 * The normalized value is stored as:
 *
 * ```ts
 * const styles = {
 * 	padding: {
 * 		top,
 * 		right,
 * 		bottom,
 * 		left
 * 	}
 * };
 * ```
 */
export function addPaddingStylesRules( stylesProcessor: StylesProcessor ): void {
	stylesProcessor.setNormalizer( 'padding', getPositionStyleShorthandNormalizer( 'padding' ) );
	stylesProcessor.setNormalizer( 'padding-top', value => ( { path: 'padding.top', value } ) );
	stylesProcessor.setNormalizer( 'padding-right', value => ( { path: 'padding.right', value } ) );
	stylesProcessor.setNormalizer( 'padding-bottom', value => ( { path: 'padding.bottom', value } ) );
	stylesProcessor.setNormalizer( 'padding-left', value => ( { path: 'padding.left', value } ) );

	stylesProcessor.setReducer( 'padding', getBoxSidesStyleValueReducer( 'padding' ) );

	stylesProcessor.setStyleRelation( 'padding', [ 'padding-top', 'padding-right', 'padding-bottom', 'padding-left' ] );
}
