/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const fs = require( 'fs' );
const webpack = require( 'webpack' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const { version } = require( '../../package.json' );

const DESTINATION_DIRECTORY = path.join( __dirname, '..', '..', 'build', 'content-styles' );
const DOCUMENTATION_URL = 'https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/content-styles.html';
const VARIABLE_DEFINITION_REGEXP = /(--[\w-]+):\s+(.*);/g;
const VARIABLE_USAGE_REGEXP = /var\((--[\w-]+)\)/g;

const contentRules = {
	selector: [],
	variables: [],
	atRules: {}
};

const webpackConfig = getWebpackConfig();
const packagesPath = path.join( process.cwd(), 'packages' );

runWebpack( webpackConfig )
	.then( () => {
		// All variables are placed inside the `:root` selector. Let's extract their names and values as a map.
		const cssVariables = new Map( contentRules.variables
			.map( rule => {
				// Let's extract all of them as an array of pairs: [ name, value ].
				const allRules = [];
				let match;

				while ( ( match = VARIABLE_DEFINITION_REGEXP.exec( rule.css ) ) ) {
					allRules.push( [ match[ 1 ], match[ 2 ] ] );
				}

				return allRules;
			} )
			.reduce( ( previousValue, currentValue ) => {
				// And simplify nested arrays as a flattened array.
				previousValue.push( ...currentValue );

				return previousValue;
			}, [] ) );

		// CSS variables that are used by the `.ck-content` selector.
		const usedVariables = new Set();

		// `.ck-content` selectors.
		const selectorCss = transformCssRules( contentRules.selector );

		// Find all CSS variables inside the `.ck-content` selector.
		let match;

		while ( ( match = VARIABLE_USAGE_REGEXP.exec( selectorCss ) ) ) {
			usedVariables.add( match[ 1 ] );
		}

		// We need to also look at whether any of the used variables requires the value of other variables.
		let clearRun = false;

		// We need to process all variables as long as the entire collection won't be changed.
		while ( !clearRun ) {
			clearRun = true;

			// For every used variable...
			for ( const variable of usedVariables ) {
				const value = cssVariables.get( variable );

				let match;

				// ...find its value and check whether it requires another variable.
				while ( ( match = VARIABLE_USAGE_REGEXP.exec( value ) ) ) {
					// If so, mark the entire `while()` block as it should be checked once again.
					// Also, add the new variable to the used variables collection.
					if ( !usedVariables.has( match[ 1 ] ) ) {
						clearRun = false;
						usedVariables.add( match[ 1 ] );
					}
				}
			}
		}

		const atRulesDefinitions = [];

		// Additional at-rules.
		for ( const atRuleName of Object.keys( contentRules.atRules ) ) {
			const rules = transformCssRules( contentRules.atRules[ atRuleName ] )
				.split( '\n' )
				.map( line => `\t${ line }` )
				.join( '\n' );

			atRulesDefinitions.push( `@${ atRuleName } {\n${ rules }\n}` );
		}

		// Build the final content of the CSS file.
		let data = [
			'/*',
			` * CKEditor 5 (v${ version }) content styles.`,
			` * Generated on ${ new Date().toUTCString() }.`,
			` * For more information, check out ${ DOCUMENTATION_URL }`,
			' */\n\n'
		].join( '\n' );

		data += ':root {\n';

		for ( const variable of [ ...usedVariables ].sort() ) {
			data += `\t${ variable }: ${ cssVariables.get( variable ) };\n`;
		}

		data += '}\n\n';
		data += selectorCss;
		data += '\n';
		data += atRulesDefinitions.join( '\n' );

		return writeFile( path.join( DESTINATION_DIRECTORY, 'content-styles.css' ), data );
	} )
	.then( () => {
		console.log( `Content styles have been extracted to ${ path.join( DESTINATION_DIRECTORY, 'content-styles.css' ) }` );
	} )
	.catch( err => {
		console.log( err );
	} );

/**
 * Prepares the configuration for webpack.
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
		// is triggered from a directory outside `ckeditor5` (e.g. in a multi-project case).
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

/**
 * @param {Array} rules
 * @returns {String}
 */
function transformCssRules( rules ) {
	return rules
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

					const newLine = line.slice( lastLineIndent );

					// If a line is not a CSS definition, do not touch it.
					if ( !newLine.match( /[A-Z-_0-9]+:/i ) ) {
						return newLine;
					}

					// The line is a CSS definition – let's check whether it ends with a semicolon.
					if ( newLine.endsWith( ';' ) ) {
						return newLine;
					}

					return newLine + ';';
				} )
				.join( '\n' );

			return `/* ${ rule.file.replace( packagesPath + path.sep, '' ) } */\n${ css }`;
		} )
		.filter( rule => {
			// 1st: path to the CSS file, 2nd: selector definition - start block, 3rd: end block
			// If the rule contains only 3 lines, it means that it does not define any rules.
			return rule.split( '\n' ).length > 3;
		} )
		.join( '\n' );
}
