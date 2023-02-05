/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/styles/margin
 */

import type { StylesProcessor } from '../stylesmap';
import { getPositionShorthandNormalizer, getBoxSidesValueReducer } from './utils';

/**
 * Adds a margin CSS styles processing rules.
 *
 * ```ts
 * editor.data.addStyleProcessorRules( addMarginRules );
 * ```
 *
 * The normalized value is stored as:
 *
 * ```ts
 * const styles = {
 * 	margin: {
 * 		top,
 * 		right,
 * 		bottom,
 * 		left
 * 	}
 * };
 * ```
 */
export function addMarginRules( stylesProcessor: StylesProcessor ): void {
	stylesProcessor.setNormalizer( 'margin', getPositionShorthandNormalizer( 'margin' ) );

	stylesProcessor.setNormalizer( 'margin-top', value => ( { path: 'margin.top', value } ) );
	stylesProcessor.setNormalizer( 'margin-right', value => ( { path: 'margin.right', value } ) );
	stylesProcessor.setNormalizer( 'margin-bottom', value => ( { path: 'margin.bottom', value } ) );
	stylesProcessor.setNormalizer( 'margin-left', value => ( { path: 'margin.left', value } ) );

	stylesProcessor.setReducer( 'margin', getBoxSidesValueReducer( 'margin' ) );

	stylesProcessor.setStyleRelation( 'margin', [ 'margin-top', 'margin-right', 'margin-bottom', 'margin-left' ] );
}
