/* jshint node: true, esnext: true */

'use strict';

const path = require( 'path' );
const gulp = require( 'gulp' );
const del = require( 'del' );
const merge = require( 'merge-stream' );
// const runSequence = require( 'run-sequence' );
const watch = require( 'gulp-watch' );
const utils = require( './utils' );

const sep = path.sep;

module.exports = ( config ) => {
	const distDir = path.join( config.ROOT_DIR, config.DIST_DIR );

	const tasks = {
		clean() {
			return del( distDir );
		},

		src: {
			all() {
				return merge( tasks.src.main(), tasks.src.ckeditor5(), tasks.src.modules() );
			},

			main() {
				const srcDir = path.join( config.ROOT_DIR, 'ckeditor.js' );

				return gulp.src( srcDir )
					.pipe( watch( srcDir ) );
			},

			ckeditor5() {
				const srcDir = path.join( config.ROOT_DIR, 'src/**/*.js' );

				return gulp.src( srcDir )
					.pipe( watch( srcDir ) )
					.pipe( utils.wrapCKEditor5Module() );
			},

			modules() {
				const srcDir = path.join( config.ROOT_DIR, 'node_modules/ckeditor5-*/src/**/*.js' );
				const modulePathPattern = new RegExp( `node_modules${ sep }(ckeditor5-[^${ sep }]+)${ sep }src` );

				return gulp.src( srcDir )
					.pipe( watch( srcDir ) )
					.pipe( utils.unpackModules( modulePathPattern ) );
			}
		}
	};

	gulp.task( 'build:clean', tasks.clean );

	// gulp.task( 'build:copy', ( callback ) => {
	// 	runSequence(
	// 		'build:clean',
	// 		[ 'build:copy:main', 'build:copy:ckeditor5', 'build:copy:modules' ],
	// 		callback
	// 	);
	// } );

	// gulp.task( 'build:transpile', [ 'build:copy' ], tasks.transpile );

	gulp.task( 'build:watch', () => {
		const codeStream = tasks.src.all()
			.on( 'data', ( file ) => {
				console.log( `Processing ${ file.path }...` );
			} );

		const esNextStream = utils.fork( codeStream )
			.pipe( utils.dist( distDir, 'esnext' ) );

		const amdStream = utils.fork( codeStream )
			.pipe( utils.transpile( 'amd' ) )
			.pipe( utils.dist( distDir, 'amd' ) );

		const cjsStream = utils.fork( codeStream )
			.pipe( utils.transpile( 'cjs' ) )
			.pipe( utils.dist( distDir, 'cjs' ) );

		return merge( esNextStream, amdStream, cjsStream )
			// Unfortunately it gets triggered 3x per each file (what makes sense), but with a single path (cjs).
			// I guess that it will be better to listen on amd/cjs streams because while the watcher is on you either
			// need one or the other.
			.on( 'data', ( file ) => {
				console.log( `Finished writing ${ file.path }...` );
			} );
	} );

	return tasks;
};