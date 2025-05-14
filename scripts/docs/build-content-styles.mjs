/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';
import mkdirp from 'mkdirp';
import webpack from 'webpack';
import { styles, loaders } from '@ckeditor/ckeditor5-dev-utils';
import { getLastFromChangelog } from '@ckeditor/ckeditor5-dev-release-tools';

import { getCkeditor5Plugins, normalizePath, addTypeScriptLoader } from './utils.mjs';
import postCssContentStylesPlugin from './list-content-styles-plugin.mjs';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

const DESTINATION_DIRECTORY = path.join( CKEDITOR5_ROOT_PATH, 'build', 'content-styles' );
const OUTPUT_FILE_PATH = path.join( DESTINATION_DIRECTORY, 'content-styles.css' );

const DOCUMENTATION_URL = 'https://ckeditor.com/docs/ckeditor5/latest/installation/legacy/advanced/content-styles.html';

const VARIABLE_DEFINITION_REGEXP = /(--[\w-]+):\s+(.*);/g;
const VARIABLE_USAGE_REGEXP = /var\((--[\w-]+)\)/g;

const contentRules = {
	selector: [],
	variables: [],
	atRules: {}
};

const packagesPath = path.join( CKEDITOR5_ROOT_PATH, 'packages' );
const version = getLastFromChangelog( CKEDITOR5_ROOT_PATH );

export default function buildContentStyles() {
	console.log( 'Building content styles...' );

	return new Promise( resolve => {
		getCkeditor5Plugins()
			.then( ckeditor5Modules => {
				return mkdirp( DESTINATION_DIRECTORY ).then( () => generateCKEditor5Source( ckeditor5Modules, CKEDITOR5_ROOT_PATH ) );
			} )
			.then( () => {
				const webpackConfig = getWebpackConfig();

				return runWebpack( webpackConfig );
			} )
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
						.map( line => {
							const singleIndent = line.replace( /^\t{2,}/, '\t' );

							return `\t${ singleIndent }`;
						} )
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

				return fs.writeFile( OUTPUT_FILE_PATH, data )
					.then( resolve );
			} )
			.then( () => {
				console.log( `Content styles have been extracted to ${ OUTPUT_FILE_PATH }` );
			} )
			.catch( err => {
				console.log( err );
			} );
	} );
}

/**
 * Prepares the configuration for webpack.
 *
 * @returns {Object}
 */
function getWebpackConfig() {
	const postCssConfig = styles.getPostCssConfig( {
		themeImporter: {
			themePath: fileURLToPath( import.meta.resolve( '@ckeditor/ckeditor5-theme-lark' ) )
		},
		minify: false
	} );

	postCssConfig.plugins.push( postCssContentStylesPlugin( contentRules ) );

	const cssLoader = loaders.getStylesLoader( {
		skipPostCssLoader: true
	} );

	cssLoader.use.push( {
		loader: 'postcss-loader',
		options: {
			postcssOptions: postCssConfig
		}
	} );

	const webpackConfig = {
		mode: 'development',
		devtool: 'source-map',
		entry: {
			ckeditor5: path.join( DESTINATION_DIRECTORY, 'source.js' )
		},
		output: {
			path: DESTINATION_DIRECTORY,
			filename: '[name].js'
		},
		resolve: {
			modules: getModuleResolvePaths(),
			extensions: [ '.ts', '.js', '.json' ],
			extensionAlias: {
				'.js': [ '.js', '.ts' ]
			}
		},
		resolveLoader: {
			modules: getModuleResolvePaths()
		},
		module: {
			rules: [
				loaders.getIconsLoader(),
				cssLoader
			]
		}
	};

	addTypeScriptLoader( webpackConfig, 'tsconfig.docs.json' );

	return webpackConfig;
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
		path.resolve( CKEDITOR5_ROOT_PATH, 'node_modules' ),
		'node_modules'
	];
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

			let cssPath;

			if ( rule.file.includes( 'node_modules' ) ) {
				cssPath = rule.file.replace( /(.*)(@ckeditor\/ckeditor5-)/, '$2' );
			} else {
				cssPath = rule.file.replace( packagesPath, '@ckeditor' );
			}

			return `/* ${ cssPath } */\n${ css }`;
		} )
		.filter( rule => {
			// 1st: path to the CSS file, 2nd: selector definition - start block, 3rd: end block
			// If the rule contains only 3 lines, it means that it does not define any rules.
			return rule.split( '\n' ).length > 3;
		} )
		.join( '\n' );
}

/**
 * Generates a source file that will be used to build the editor.
 *
 * @param {Array.<String>} ckeditor5Modules Paths to CKEditor 5 modules.
 * @param {String} cwd
 * @returns {Promise>}
 */
function generateCKEditor5Source( ckeditor5Modules, cwd ) {
	ckeditor5Modules = ckeditor5Modules.map( modulePath => {
		const pluginName = capitalize( path.basename( modulePath.replace( /.[jt]s$/, '' ) ) );
		return { modulePath, pluginName };
	} );

	const classicEditorImportPath = path.join( cwd, 'node_modules', '@ckeditor', 'ckeditor5-editor-classic', 'src', 'classiceditor' );

	const sourceFileContent = [
		'/**',
		` * @license Copyright (c) 2003-${ new Date().getFullYear() }, CKSource Holding sp. z o.o. All rights reserved.`,
		' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options',
		' */',
		'',
		'// The editor creator to use.',
		`import ClassicEditorBase from '${ normalizePath( classicEditorImportPath ) }';`,
		''
	];

	for ( const { modulePath, pluginName } of ckeditor5Modules ) {
		sourceFileContent.push( `import ${ pluginName } from '${ normalizePath( modulePath ) }';` );
	}

	sourceFileContent.push( '' );
	sourceFileContent.push( 'export default class ClassicEditor extends ClassicEditorBase {}' );
	sourceFileContent.push( '' );
	sourceFileContent.push( '// Plugins to include in the build.' );
	sourceFileContent.push( 'ClassicEditor.builtinPlugins = [' );

	for ( const { pluginName } of ckeditor5Modules ) {
		sourceFileContent.push( '\t' + pluginName + ',' );
	}

	sourceFileContent.push( '];' );

	return fs.writeFile( path.join( DESTINATION_DIRECTORY, 'source.js' ), sourceFileContent.join( '\n' ) )
		.then( () => ckeditor5Modules );

	function capitalize( value ) {
		return value.charAt( 0 ).toUpperCase() + value.slice( 1 );
	}
}

/**
 * @typedef {Object} StyleStructure
 * @property {String} file An absolute path to the file where a definition is defined.
 * @property {String} css Definition.
 */
