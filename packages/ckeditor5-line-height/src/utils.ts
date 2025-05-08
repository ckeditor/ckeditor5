/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module line-height/utils
 */

import type { LineHeightOption } from './lineheightconfig.js';

/**
 * Normalizes the line height options.
 *
 * @param options Line height options.
 * @returns Normalized line height options.
 */
export function normalizeOptions( options: Array<number | LineHeightOption> ): Array<LineHeightOption> {
	return options.map( option => {
		if ( typeof option === 'number' ) {
			return {
				title: String( option ),
				model: option
			};
		}

		return option;
	} );
}

/**
 * Return a line height style value from the provided value. The value is first normalized to handle
 * different types of input.
 *
 * @param lineHeight Line height value as provided by the editor.
 * @returns String with properly formatted CSS line-height value.
 */
export function getLineHeightStyleValue( lineHeight: number ): string {
	return String( lineHeight );
}
