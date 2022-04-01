/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const childProcess = require( 'child_process' );
const path = require( 'path' );
const { getChangesForVersion } = require( '@ckeditor/ckeditor5-dev-env/lib/release-tools/utils/changelog' );

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );

const VERSIONS_TO_PRINT = 3;

/**
 * Returns changelogs formatted in markdown for last X versions of the editor. Additional formatting is applied:
 *
 * - "ℹ️" character in "BREAKING CHANGE" headers removed.
 * - "Released packages" section removed.
 *
 * @returns {String}
 */
module.exports = () => {
	return childProcess
		// Git does not contain a single command for displaying N last tags.
		// Hence, we need to adjust the returned output manually.
		// First, find all available tags.
		.execSync( 'git tag', {
			encoding: 'utf8',
			cwd: ROOT_DIRECTORY
		} )
		// Remove the last new line.
		.trim()
		// Each line contains a single tag.
		.split( '\n' )
		// Reverse the list to start with the latest releases.
		.reverse()
		// Take three latest.
		.slice( 0, VERSIONS_TO_PRINT )
		// And map each version to its changelog entries.
		.map( version => {
			// `slice` removes the `v` prefix.
			const changelog = getChangesForVersion( version.slice( 1 ) )
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
