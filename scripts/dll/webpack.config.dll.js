/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const WrapperPlugin = require( 'wrapper-webpack-plugin' );
const { bundler, loaders } = require( '@ckeditor/ckeditor5-dev-utils' );
const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );
const { addTypeScriptLoader } = require( '../docs/utils' );

const ROOT_DIRECTORY = path.resolve( __dirname, '..', '..' );
const IS_DEVELOPMENT_MODE = process.argv.includes( '--mode=development' );
const { CI } = process.env;

if ( ROOT_DIRECTORY !== process.cwd() ) {
	throw new Error( 'This script should be called from the package root directory.' );
}

const packages = [
	// The base of the CKEditor 5 framework.
	'utils',
	'engine',
	'core',
	'ui',

	// The Essentials plugin contents:
	'typing',
	'enter',
	'widget',
	'clipboard',
	'undo',

	// Other, common packages:
	'paragraph',
	'select-all',
	'upload',
	'watchdog'
];

const webpackConfig = {
	mode: IS_DEVELOPMENT_MODE ? 'development' : 'production',
	performance: { hints: false },
	entry: packages.map( packageName => `./packages/ckeditor5-${ packageName }/src/index.ts` ),
	optimization: {
		minimize: false,
		moduleIds: false
	},
	output: {
		library: [ 'CKEditor5', 'dll', 'mainBundle' ],

		path: path.join( ROOT_DIRECTORY, 'build' ),
		filename: 'ckeditor5-dll.js',
		libraryTarget: 'window'
	},
	plugins: [
		new CKEditorTranslationsPlugin( {
			// UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
			language: 'en',
			additionalLanguages: 'all',
			includeCorePackageTranslations: true
		} ),
		new webpack.BannerPlugin( {
			banner: bundler.getLicenseBanner(),
			raw: true
		} ),
		// Make sure that module ID include the 'ckeditor5-*' prefix (without '@ckeditor', it's used as a DLL scope).
		new webpack.ids.NamedModuleIdsPlugin( {
			context: path.join( ROOT_DIRECTORY, 'packages' )
		} ),
		new webpack.DllPlugin( {
			name: 'CKEditor5.dll.mainBundle',
			// Context in 'packages' directory so module IDs use 'ckeditor5-*' prefix.
			context: path.join( ROOT_DIRECTORY, 'packages' ),
			path: path.join( ROOT_DIRECTORY, 'build', 'ckeditor5-dll.manifest.json' ),
			format: true,
			entryOnly: true
		} ),
		// Expose contents of DLLs as global, for example `CKEditor5.editorClassic.ClassicEditor`
		new WrapperPlugin( {
			footer: packages.map( packageName => {
				const globalPackageKey = packageName.replace( /-([a-z])/g, ( match, p1 ) => p1.toUpperCase() );

				return '(' +
					`window.CKEditor5[ ${ JSON.stringify( globalPackageKey ) } ] = ` +
						`window.CKEditor5.dll.mainBundle( './ckeditor5-${ packageName }/src/index.ts' )` +
				');';
			} ).join( '' )
		} )
	],
	resolve: {
		extensions: [ '.ts', '.js', '.json' ]
	},
	module: {
		rules: [
			loaders.getIconsLoader( { matchExtensionOnly: true } ),
			loaders.getStylesLoader( {
				themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' ),
				minify: true
			} )
			// TypeScript is injected by the `addTypeScriptLoader()` function.
		]
	}
};

addTypeScriptLoader( webpackConfig, 'tsconfig.dll.json' );

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

if ( CI ) {
	webpackConfig.cache = {
		type: 'filesystem'
	};
}

module.exports = webpackConfig;

