/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedstyle/constants
 */

/**
 * The valid names for media embed alignment styles.
 *
 * @internal
 */
export type MediaStyleName =
	| 'alignLeft'
	| 'alignBlockLeft'
	| 'alignCenter'
	| 'alignBlockRight'
	| 'alignRight';

/**
 * The name of the default media style.
 *
 * @internal
 */
export const DEFAULT_STYLE_NAME: MediaStyleName = 'alignCenter';
