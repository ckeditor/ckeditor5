/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const fs = require( 'fs' );
const webpack = require( 'webpack' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

const DESTINATION_DIRECTORY = path.join( __dirname, '..', '..', 'build', 'content-styles' );

const contentRules = [];
const webpackConfig = getWebpackConfig();
const parentCwd = path.join( process.cwd(), '..' );

runWebpack( webpackConfig )
	.then( () => {
		const data = contentRules
			.map( rule => {
				// Removes all comments from the rule definition.
				const cssAsArray = rule.css.replace( /\/\*[^*]+\*\//g, '' ).split( '\n' );

				// We want to fix invalid indentations. We need to find a number of how many indentations we want to remove.
				// Because the last line ends the block, we can use this value.
				const lastLineIndent = cssAsArray[ cssAsArray.length - 1 ].length - 1;

				const css = cssAsArray
					.filter( line => line.trim().length > 0 )
					.map( ( line, index ) => {
						// Do not touch the first line. It is always correct.
						if ( index === 0 ) {
							return line;
						}

						return line.slice( lastLineIndent );
					} )
					.join( '\n' );

				return `/* ${ rule.file.replace( parentCwd + path.sep, '' ) } */\n${ css }`;
			} )
			.filter( rule => {
				// 1st: path to the css file, 2nd: selector definition - start block, 3rd: end block
				// If the rule contains only 3 lines, it means that it does not define any rules.
				return rule.split( '\n' ).length > 3;
			} )
			.join( '\n' );

		return writeFile( path.join( DESTINATION_DIRECTORY, 'content-styles.css' ), data );
	} )
	.then( () => {
		console.log( `Content styles has saved under the path: ${ path.join( DESTINATION_DIRECTORY, 'content-styles.css' ) }` );
	} )
	.catch( err => {
		console.log( err );
	} );

/**
 * Prepares configuration for Webpack.
 *
 * @returns {Object}
 */
function getWebpackConfig() {
	const postCssConfig = styles.getPostCssConfig( {
		themeImporter: {
			themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
		},
		minify: false
	} );

	const contentStylesPlugin = require( './content-styles/list-content-styles' )( { contentRules } );

	postCssConfig.plugins.push( contentStylesPlugin );

	return {
		mode: 'development',

		devtool: 'source-map',

		entry: {
			ckeditor5: path.join( __dirname, 'content-styles', 'ckeditor.js' )
		},

		output: {
			path: DESTINATION_DIRECTORY,
			filename: '[name].js'
		},

		// Configure the paths so building CKEditor 5 snippets work even if the script
		// is triggered from a directory outside ckeditor5 (e.g. multi-project case).
		resolve: {
			modules: getModuleResolvePaths()
		},

		resolveLoader: {
			modules: getModuleResolvePaths()
		},

		module: {
			rules: [
				{
					test: /\.svg$/,
					use: [ 'raw-loader' ]
				},
				{
					test: /\.css$/,
					use: [
						'style-loader',
						{
							loader: 'postcss-loader',
							options: postCssConfig
						}
					]
				}
			]
		}
	};
}

/**
 * @param {Object} webpackConfig
 * @returns {Promise}
 */
function runWebpack( webpackConfig ) {
	return new Promise( ( resolve, reject ) => {
		webpack( webpackConfig, ( err, stats ) => {
			if ( err ) {
				reject( err );
			} else if ( stats.hasErrors() ) {
				reject( new Error( stats.toString() ) );
			} else {
				resolve();
			}
		} );
	} );
}

/**
 * @returns {Array.<String>}
 */
function getModuleResolvePaths() {
	return [
		path.resolve( __dirname, '..', '..', 'node_modules' ),
		'node_modules'
	];
}

function writeFile( file, data ) {
	return new Promise( ( resolve, reject ) => {
		fs.writeFile( file, data, err => {
			if ( err ) {
				return reject( err );
			}

			return resolve();
		} );
	} );
}
