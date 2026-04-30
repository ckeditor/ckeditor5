/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedresize/constants
 */

/**
 * The view class applied to a resized media embed figure.
 *
 * Shared between the editing plugin (which toggles it via downcast of `resizedWidth` and consumes
 * it on upcast) and the handles plugin (which adds it during drag and strips it on commit), so
 * both layers agree on the exact class name.
 *
 * @internal
 */
export const RESIZED_MEDIA_CLASS = 'media_resized';
