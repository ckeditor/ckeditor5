/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const WrapperPlugin = require( 'wrapper-webpack-plugin' );
const { bundler, styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );

const ROOT_DIRECTORY = path.resolve( __dirname, '..', '..' );
const IS_DEVELOPMENT_MODE = process.argv.includes( '--dev' );

if ( ROOT_DIRECTORY !== process.cwd() ) {
	throw new Error( 'This script should be called from the package root directory.' );
}

/**
 * Attaches exported modules to the global (`window`) scope.
 * The function assumes that `window.CKEditor5.dll()` is a webpack require function.
 * See #8521, and #8803.
 *
 * @param {Object} window
 */
function loadCKEditor5modules( window ) {
	window.CKEditor5 = window.CKEditor5 || {};

	const dllPackages = [
		'utils',
		'core',
		'engine',
		'ui',
		'clipboard',
		'enter',
		'paragraph',
		'select-all',
		'typing',
		'undo',
		'upload',
		'widget'
	];

	for ( const item of dllPackages ) {
		const windowScope = item.replace( /-([a-z])/g, ( match, p1 ) => p1.toUpperCase() );
		window.CKEditor5[ windowScope ] = window.CKEditor5.dll( `./src/${ item }.js` );
	}
}

const webpackConfig = {
	mode: IS_DEVELOPMENT_MODE ? 'development' : 'production',
	performance: { hints: false },
	entry: [
		// This list must be synced with the `loadCKEditor5modules()` function.
		// The base of the CKEditor 5 framework, in order of appearance:
		'./src/utils.js',
		'./src/core.js',
		'./src/engine.js',
		'./src/ui.js',

		// The Essentials plugin contents:
		'./src/clipboard.js',
		'./src/enter.js',
		'./src/paragraph.js',
		'./src/select-all.js',
		'./src/typing.js',
		'./src/undo.js',

		// Other, common packages:
		'./src/upload.js',
		'./src/widget.js'
	],
	optimization: {
		minimize: false,
		moduleIds: 'named'
	},
	output: {
		path: path.join( ROOT_DIRECTORY, 'build' ),
		filename: 'ckeditor5-dll.js',
		library: [ 'CKEditor5', 'dll' ],
		libraryTarget: 'window'
	},
	plugins: [
		new CKEditorWebpackPlugin( {
			// UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
			language: 'en',
			additionalLanguages: 'all',
			includeCorePackageTranslations: true
		} ),
		new webpack.BannerPlugin( {
			banner: bundler.getLicenseBanner(),
			raw: true
		} ),
		new webpack.DllPlugin( {
			name: 'CKEditor5.dll',
			context: 'src',
			path: path.join( ROOT_DIRECTORY, 'build', 'ckeditor5-dll.manifest.json' ),
			format: true,
			entryOnly: true
		} ),
		new WrapperPlugin( {
			footer: `( ( fn, root ) => fn( root ) )( ${ loadCKEditor5modules.toString() }, window );`
		} )
	],
	module: {
		rules: [
			{
				test: /\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							injectType: 'singletonStyleTag',
							attributes: {
								'data-cke': true
							}
						}
					},
					{
						loader: 'postcss-loader',
						options: styles.getPostCssConfig( {
							themeImporter: {
								themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
							},
							minify: true
						} )
					}
				]
			}
		]
	}
};

if ( !IS_DEVELOPMENT_MODE ) {
	webpackConfig.optimization.minimize = true;

	webpackConfig.optimization.minimizer = [
		new TerserPlugin( {
			terserOptions: {
				output: {
					// Preserve CKEditor 5 license comments.
					comments: /^!/
				}
			},
			extractComments: false
		} )
	];
}

module.exports = webpackConfig;

