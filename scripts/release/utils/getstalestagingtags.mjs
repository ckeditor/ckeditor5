/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import semver from 'semver';

const STAGING_TAG_PATTERN = /^staging-v(.+)$/;

/**
 * Picks the `staging-v<version>` names that a finished release of the given version can remove:
 * its own name and the names left by older, aborted releases of the same major version.
 *
 * Names of other majors belong to other release lines, which may be releasing at the same time, so they are kept.
 * So are names of newer versions and names that are not `staging-v<version>`, for example, the legacy `staging` tag.
 *
 * @param {Array.<String>} names npm dist-tags or CDN directory names.
 * @param {String} version The version that has just been released.
 * @returns {Array.<String>}
 */
export default function getStaleStagingTags( names, version ) {
	const major = semver.major( version );

	return names.filter( name => {
		const [ , stagingVersion ] = name.match( STAGING_TAG_PATTERN ) || [];

		if ( !semver.valid( stagingVersion ) ) {
			return false;
		}

		return semver.major( stagingVersion ) === major && semver.lte( stagingVersion, version );
	} );
}
