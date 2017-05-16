/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const gulp = require( 'gulp' );
const build = require( 'lodash-cli' );
const del = require( 'del' );

const DEST_PATH = 'src/lib/lodash';

module.exports = function() {
	const tasks = {
		lodash() {
			return del( DEST_PATH )
				.then( buildLodash );
		}
	};

	gulp.task( 'lodash', tasks.lodash );

	return tasks;
};

function buildLodash() {
	return new Promise( ( resolve, reject ) => {
		build( [
			'modularize',
			'exports=es',
			'--development',
			'--output', DEST_PATH
		], err => {
			if ( err instanceof Error ) {
				reject( err );
			} else {
				resolve( null );
			}
		} );
	} );
}
