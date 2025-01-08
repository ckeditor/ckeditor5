/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import path from 'path';
import module from 'module';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import { bundler, loaders } from '@ckeditor/ckeditor5-dev-utils';
import { CKEditorTranslationsPlugin } from '@ckeditor/ckeditor5-dev-translations';
import TerserPlugin from 'terser-webpack-plugin';

const require = module.createRequire( import.meta.url );
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

export default {
	devtool: 'source-map',
	performance: { hints: false },

	entry: path.resolve( __dirname, 'src', 'ckeditor.ts' ),

	output: {
		// The name under which the editor will be exported.
		library: 'BalloonEditor',

		path: path.resolve( __dirname, 'build' ),
		filename: 'ckeditor.js',
		libraryTarget: 'umd',
		libraryExport: 'default'
	},

	optimization: {
		minimizer: [
			new TerserPlugin( {
				terserOptions: {
					output: {
						// Preserve CKEditor 5 license comments.
						comments: /^!/
					}
				},
				extractComments: false
			} )
		]
	},

	plugins: [
		new CKEditorTranslationsPlugin( {
			// UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
			// When changing the built-in language, remember to also change it in the editor's configuration (src/ckeditor.js).
			language: 'en',
			additionalLanguages: 'all'
		} ),
		new webpack.BannerPlugin( {
			banner: bundler.getLicenseBanner(),
			raw: true
		} )
	],

	module: {
		rules: [
			loaders.getIconsLoader( { matchExtensionOnly: true } ),
			loaders.getStylesLoader( {
				themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' ),
				minify: true
			} ),
			loaders.getTypeScriptLoader()
		]
	},

	resolve: {
		extensions: [ '.ts', '.js', '.json' ],
		extensionAlias: {
			'.js': [ '.js', '.ts' ]
		}
	}
};
