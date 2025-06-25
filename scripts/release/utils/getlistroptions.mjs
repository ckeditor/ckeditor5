/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @param {ReleaseOptions} cliArguments
 * @returns {Object}
 */
export default function getListrOptions( cliArguments ) {
	return {
		renderer: cliArguments.verbose ? 'verbose' : 'default'
	};
}
