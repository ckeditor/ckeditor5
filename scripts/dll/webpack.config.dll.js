/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const { addTypeScriptLoader } = require( '../docs/utils' );

const ROOT_DIRECTORY = path.resolve( __dirname, '..', '..' );
const IS_DEVELOPMENT_MODE = process.argv.includes( '--mode=development' );
const { CI } = process.env;

if ( ROOT_DIRECTORY !== process.cwd() ) {
	throw new Error( 'This script should be called from the package root directory.' );
}

const webpackConfig = {
	mode: IS_DEVELOPMENT_MODE ? 'development' : 'production',
	performance: { hints: false },
	entry: './src/index.js',
	optimization: {
		minimize: false
	},
	output: {
		path: path.join( ROOT_DIRECTORY, 'build' ),
		filename: 'ckeditor5-dll.js'
	},
	resolve: {
		extensions: [ '.ts', '.js', '.json' ]
	},
	module: {
		rules: [
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

