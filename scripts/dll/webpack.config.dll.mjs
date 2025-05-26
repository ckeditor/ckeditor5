/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { fileURLToPath } from 'url';
import path from 'upath';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { bundler, loaders } from '@ckeditor/ckeditor5-dev-utils';
import { CKEditorTranslationsPlugin } from '@ckeditor/ckeditor5-dev-translations';
import FooterPlugin from './webpack-footer-plugin.mjs';
import { addTypeScriptLoader } from '../docs/utils.mjs';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

const IS_DEVELOPMENT_MODE = process.argv.includes( '--mode=development' );
const { CI } = process.env;

if ( CKEDITOR5_ROOT_PATH !== path.toUnix( process.cwd() ) ) {
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
		'icons',
		'upload',
		'widget',
		'watchdog'
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
		'./src/icons.js',
		'./src/upload.js',
		'./src/widget.js',
		'./src/watchdog.js'
	],
	optimization: {
		minimize: false,
		moduleIds: 'named'
	},
	output: {
		path: path.join( CKEDITOR5_ROOT_PATH, 'build' ),
		filename: 'ckeditor5-dll.js',
		library: [ 'CKEditor5', 'dll' ],
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
		new webpack.DllPlugin( {
			name: 'CKEditor5.dll',
			context: 'src',
			path: path.join( CKEDITOR5_ROOT_PATH, 'build', 'ckeditor5-dll.manifest.json' ),
			format: true,
			entryOnly: true
		} ),
		new FooterPlugin(
			`( ( fn, root ) => fn( root ) )( ${ loadCKEditor5modules.toString() }, window );`
		)
	],
	resolve: {
		extensions: [ '.ts', '.js', '.json' ],
		extensionAlias: {
			'.js': [ '.js', '.ts' ]
		}
	},
	module: {
		rules: [
			loaders.getIconsLoader( { matchExtensionOnly: true } ),
			loaders.getStylesLoader( {
				themePath: fileURLToPath( import.meta.resolve( '@ckeditor/ckeditor5-theme-lark' ) ),
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

export default webpackConfig;

