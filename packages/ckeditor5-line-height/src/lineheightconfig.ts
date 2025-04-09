/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module line-height/lineheightconfig
 */

export const LINE_HEIGHT = 'lineHeight';

/**
 * The configuration of the {@link module:line-height/lineheight~LineHeight} feature.
 *
 * Read more in {@link module:line-height/lineheightconfig~LineHeightConfig}.
 */
export interface LineHeightConfig {

	/**
	 * Available line height options. The default value is:
	 *
	 * ```ts
	 * const lineHeightConfig = {
	 * 	options: [ 0.5, 1, 1.5, 2, 2.5 ]
	 * };
	 * ```
	 *
	 * It defines a dropdown with 5 options:
	 * * "0.5" with a value of 0.5,
	 * * "1" with a value of 1,
	 * * "1.5" with a value of 1.5,
	 * * "2" with a value of 2,
	 * * "2.5" with a value of 2.5,
	 *
	 * **Note**: Line height values have to be provided in a format without units.
	 * The available values are always multipliers of the default line height applied to the edited content.
	 */
	options?: Array<number | LineHeightOption>;
}

/**
 * Configuration for one of the dropdown options.
 */
export interface LineHeightOption {

	/**
	 * The UI label for the option.
	 */
	title?: string;

	/**
	 * The line height value (CSS line-height property value, number).
	 */
	model: number;
}
