/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );
const { getChangesForVersion, getChangelog } = require( '@ckeditor/ckeditor5-dev-env/lib/release-tools/utils/changelog' );

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );
const VERSIONS_TO_PRINT = 3;

/**
 * Returns changelogs formatted in markdown for the last three versions of the CKEditor 5 releases.
 * Additional, the following sections for each entry are modified:
 *
 * - The "ℹ️" symbol is removed.
 * - The "Released packages" section is removed.
 * - The "Release highlights" section is removed.
 *
 * @returns {String}
 */
module.exports = () => {
	const changes = getChangelog( ROOT_DIRECTORY );

	// Get all releases from the changelog file.
	return [ ...changes.matchAll( /## \[(?<version>\d+\.\d+\.\d+)\]/g ) ]
		// Take `version` from matches.
		.map( match => match.groups.version )
		// Take three latest.
		.slice( 0, VERSIONS_TO_PRINT )
		// And map each version to its changelog entries.
		.map( version => {
			// `slice` removes the `v` prefix.
			const changelog = getChangesForVersion( version, ROOT_DIRECTORY )
				// Remove the `ℹ️` character along with its link from breaking change headers.
				.replace( / \[ℹ️\]\(.+\)$/gm, '' )
				// Remove `Release highlights` section.
				.replace( getSectionRegexp( 'Release highlights' ), '' )
				// Remove `Released packages` section.
				.replace( getSectionRegexp( 'Released packages' ), '' );

			return [
				`## CKEditor 5 ${ version } release`,
				'',
				`${ changelog }`,
				''
			].join( '\n' );
		} )
		// Then, merge everything into a single string.
		.join( '\n' );
};

/**
 * Returns regexp that matches entire section of the given name,
 * along with its header. RegExp logic is as follows:
 *
 * - Title is case insensitive. (flag `i`)
 * - Section starts with one or more `#` followed by a space and the title.
 * - Section ends with either:
 *     - Newline followed by `#`.
 *     - End of the string.
 *
 * @param {String} sectionTitle
 * @returns {RegExp}
 */
function getSectionRegexp( sectionTitle ) {
	return new RegExp( `#+ ${ sectionTitle }[\\s\\S]+?(?=\\n#|$)`, 'i' );
}
