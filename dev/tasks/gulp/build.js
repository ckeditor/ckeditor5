/* jshint node: true, esnext: true */

'use strict';

const KNOWN_OPTIONS = {
	build: {
		string: [
			'formats'
		],

		boolean: [
			'watch'
		],

		default: {
			formats: 'amd',
			watch: false
		}
	}
};

const path = require( 'path' );
const gulp = require( 'gulp' );
const del = require( 'del' );
const merge = require( 'merge-stream' );
const gulpMirror = require( 'gulp-mirror' );
const gutil = require( 'gulp-util' );
const minimist = require( 'minimist' );
const utils = require( './utils' );

const sep = path.sep;

const options = minimist( process.argv.slice( 2 ), KNOWN_OPTIONS[ process.argv[ 2 ] ] );

module.exports = ( config ) => {
	const distDir = path.join( config.ROOT_DIR, config.DIST_DIR );

	const tasks = {
		clean() {
			return del( distDir );
		},

		src: {
			all( watch ) {
				return merge( tasks.src.main( watch ), tasks.src.ckeditor5( watch ), tasks.src.modules( watch ) );
			},

			main( watch ) {
				return utils.src( config.ROOT_DIR, 'ckeditor.js', watch );
			},

			ckeditor5( watch ) {
				return utils.src( config.ROOT_DIR, 'src/**/*.js', watch )
					.pipe( utils.wrapCKEditor5Module() );
			},

			modules( watch ) {
				const modulePathPattern = new RegExp( `node_modules${ sep }(ckeditor5-[^${ sep }]+)${ sep }src` );

				return utils.src( config.ROOT_DIR, 'node_modules/ckeditor5-*/src/**/*.js', watch )
					.pipe( utils.unpackModules( modulePathPattern ) );
			}
		}
	};

	gulp.task( 'build:clean', tasks.clean );

	gulp.task( 'build', [ 'build:clean' ], () => {
		const formats = options.formats.split( ',' );
		const codeStream = tasks.src.all( options.watch )
			.on( 'data', ( file ) => {
				gutil.log( `Processing '${ gutil.colors.cyan( file.path ) }'...` );
			} );
		const formatPipes = formats.reduce( utils.addFormat( distDir ), [] );

		return codeStream
			.pipe( gulpMirror.apply( null, formatPipes ) );
	} );

	return tasks;
};