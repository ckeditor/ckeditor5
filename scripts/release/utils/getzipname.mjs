/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import getCdnVersion from './getcdnversion.mjs';

/**
 * A stable release ZIP is named after its version, for example `ckeditor5-49.0.1`. Other releases use
 * the channel name, for example `ckeditor5-nightly`.
 *
 * @param {String} packageName For example, `ckeditor5` or `ckeditor5-premium-features`.
 * @param {ReleaseOptions} cliArguments
 * @param {String} version
 * @returns {String}
 */
export default function getZipName( packageName, cliArguments, version ) {
	const cdnVersion = getCdnVersion( cliArguments, version );
	const isStableRelease = cdnVersion === `staging-v${ version }`;

	return `${ packageName }-${ isStableRelease ? version : cdnVersion }`;
}
