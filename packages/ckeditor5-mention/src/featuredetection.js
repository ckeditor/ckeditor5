/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention/featuredetection
 */

/**
 * Holds feature detection resolutions used by the mention plugin.
 *
 * @protected
 * @namespace
 */
export default {
	/**
	 * Indicates whether the current browser supports ES2018 Unicode groups like `\p{P}` or `\p{L}`.
	 *
	 * @type {Boolean}
	 */
	isUnicodeGroupSupported: ( function() {
		let isSupported = false;

		// Feature detection for Unicode groups. Added in ES2018. Currently Firefox and Edge do not support it.
		// See https://github.com/ckeditor/ckeditor5-mention/issues/44#issuecomment-487002174.

		try {
			isSupported = 'ć'.search( new RegExp( '[\\p{L}]', 'u' ) ) === 0;
		} catch ( error ) {
			// Firefox throws a SyntaxError when the group is unsupported.
		}

		return isSupported;
	}() )
};
