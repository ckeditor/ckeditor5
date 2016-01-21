/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );
const build = require( 'lodash-cli' );

module.exports = function() {
	const tasks = {
		lodash( done ) {
			build( [
				'modularize',
				'modern',
				'exports=es',
				'include=clone,extend,isPlainObject,isObject,isArray,last,isEqual',
				'--development',
				'--output', 'src/lib/lodash'
			], ( e ) => {
				done( e instanceof Error ? e : null );
			} );
		}
	};
	gulp.task( 'lodash', tasks.lodash );

	return tasks;
};
