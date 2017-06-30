/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

const path = require( 'path' );
const fs = require( 'fs' );
const webpack = require( 'webpack' );
const { bundler } = require( '@ckeditor/ckeditor5-dev-utils' );

const BabiliPlugin = require( 'babili-webpack-plugin' );

module.exports = function snippetAdapter( data ) {
	const webpackConfig = getWebpackConfig( {
		entry: data.snippetSource.js,
		outputPath: path.join( data.outputPath, data.snippetPath )
	} );

	return runWebpack( webpackConfig )
		.then( () => {
			return {
				html: generateSnippetHtml( {
					htmlPath: data.snippetSource.html,
					scriptPath: path.join( data.relativeOutputPath, data.snippetPath, 'snippet.js' )
				} )
			};
		} );
};

function getWebpackConfig( config ) {
	return {
		devtool: 'source-map',

		entry: config.entry,

		output: {
			path: config.outputPath,
			filename: 'snippet.js'
		},

		plugins: [
			new BabiliPlugin( null, {
				comments: false
			} ),
			new webpack.BannerPlugin( {
				banner: bundler.getLicenseBanner(),
				raw: true
			} )
		],

		module: {
			rules: [
				{
					test: /\.svg$/,
					use: [ 'raw-loader' ]
				},
				{
					test: /\.scss$/,
					use: [
						'style-loader',
						{
							loader: 'css-loader',
							options: {
								minimize: true
							}
						},
						'sass-loader'
					]
				}
			]
		}
	};
}

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

function generateSnippetHtml( data ) {
	let html = fs.readFileSync( data.htmlPath );

	html += `<script src="${ data.scriptPath }"></script>`;

	return html;
}
