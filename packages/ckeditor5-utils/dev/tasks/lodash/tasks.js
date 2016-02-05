/* jshint node: true, esnext: true */

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
			'include=clone,extend,isPlainObject,isObject,isArray,last,isEqual',
			'--development',
			'--output', DEST_PATH
		], ( err ) => {
			if ( err instanceof Error ) {
				reject( err );
			} else {
				resolve( null );
			}
		} );
	} );
}
