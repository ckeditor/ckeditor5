/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const ckeditor5Dirs = require( '../../../utils/ckeditor5-dirs' );
const log = require( '../../../utils/log' );

/**
 * 1. Get CKEditor5 dependencies from package.json file.
 * 2. Run install task on each dependency.
 *
 * @param {Function} installTask Install task to use on each dependency.
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} packageJSON Parsed package.json file from CKEditor5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 */
module.exports = ( installTask, ckeditor5Path, packageJSON, workspaceRoot ) => {
	// Get all CKEditor dependencies from package.json.
	const dependencies = ckeditor5Dirs.getCKEditorDependencies( packageJSON.dependencies );

	if ( dependencies ) {
		for ( let dependency in dependencies ) {
			const repositoryURL = dependencies[ dependency ];
			log.out( `\x1b[1m\x1b[36m${ dependency }\x1b[0m` );
			installTask( ckeditor5Path, workspaceRoot, repositoryURL );
		}
	} else {
		log.out( 'No CKEditor5 dependencies (ckeditor5-) found in package.json file.' );
	}
};
