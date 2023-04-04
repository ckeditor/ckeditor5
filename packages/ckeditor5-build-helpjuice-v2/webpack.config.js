/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const { bundler, styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const { CKEditorTranslationsPlugin } = require('@ckeditor/ckeditor5-dev-translations');
const TerserPlugin = require( 'terser-webpack-plugin' );

module.exports = {
	devtool: 'source-map',
	performance: { hints: false },

	entry: path.resolve( __dirname, 'src', 'hjeditor.ts' ),

	output: {
		// The name under which the editor will be exported.
		library: 'ClassicEditor',

		path: path.resolve( __dirname, 'build' ),
		filename: 'hjeditor.js',
		libraryTarget: 'umd',
		libraryExport: 'default'
	},

	optimization: {
		minimizer: [
			new TerserPlugin( {
				sourceMap: true,
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
		} ),
		new webpack.NormalModuleReplacementPlugin(
			/bold\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'bold.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/underline\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'underline.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/italic\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'italic.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/font-color\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'tint.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/font-background\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'paint-brush.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/image\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'image.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/link\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'link.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/media\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'camera.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/table\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'table.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/align-left\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'align-left.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/align-right\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'align-right.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/align-justify\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'align-justify.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/align-center\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'align-center.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/quote\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'quote-left.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/indent\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'indent.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/outdent\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'outdent.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/bulletedlist\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'list-ul.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/numberedlist\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'list-ol.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/undo\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'undo.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/redo\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'redo.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/remove-format\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'eraser.svg' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/source-editing\.svg/,
			path.resolve( __dirname, 'src', 'icons', 'code.svg' )
		)
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
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: styles.getPostCssConfig( {
								themeImporter: {
									themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
								},
								minify: true
							} )
						}
					}
				]
			},
			{
				test: /\.ts$/,
				use: [ 'ts-loader' ]
			}
		]
	},

	resolve: {
		extensions: [ '.ts', '.js', '.json' ]
	}
};

