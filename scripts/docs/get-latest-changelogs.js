/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const childProcess = require( 'child_process' );
const path = require( 'path' );
const {	getChangesForVersion } = require( '@ckeditor/ckeditor5-dev-env/lib/release-tools/utils/changelog' );

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
		.execSync( 'git tag', {
			encoding: 'utf8',
			cwd: ROOT_DIRECTORY
		} )
		.split( '\n' )
		.reverse()
		.splice( 1, VERSIONS_TO_PRINT )
		.map( version => {
			const changelog = getChangesForVersion( version.slice( 1 ) )
				.replace( / \[ℹ️\]\(.+\)$/gm, '' )
				.replace( /#+ Released packages[\s\S]+<\/details>/, '' );

			return [
				`## CKEditor 5 ${ version } release`,
				'',
				`${ changelog }`,
				''
			].join( '\n' );
		} ).join( '\n' );
};
