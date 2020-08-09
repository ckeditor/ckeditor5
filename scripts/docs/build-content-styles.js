/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const fs = require( 'fs' );
const chalk = require( 'chalk' );
const glob = require( 'glob' );
const mkdirp = require( 'mkdirp' );
const postcss = require( 'postcss' );
const webpack = require( 'webpack' );
const { tools, styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const { version } = require( '../../package.json' );

const DESTINATION_DIRECTORY = path.join( __dirname, '..', '..', 'build', 'content-styles' );
const DOCUMENTATION_URL = 'https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/content-styles.html';
const VARIABLE_DEFINITION_REGEXP = /(--[\w-]+):\s+(.*);/g;
const VARIABLE_USAGE_REGEXP = /var\((--[\w-]+)\)/g;
const CONTENT_STYLES_GUIDE_PATH = path.join( __dirname, '..', '..', 'docs', 'builds', 'guides', 'integration', 'content-styles.md' );

const contentRules = {
	selector: [],
	variables: [],
	atRules: {}
};
const packagesPath = path.join( process.cwd(), 'packages' );
const shouldUpdateGuide = process.argv.includes( '--commit' );

logProcess( 'Gathering all CKEditor 5 modules...' );

getCkeditor5ModulePaths()
	.then( files => {
		console.log( `Found ${ files.length } files.` );
		logProcess( 'Filtering CKEditor 5 plugins...' );

		let promise = Promise.resolve();
		const ckeditor5Modules = [];

		for ( const modulePath of files ) {
			promise = promise.then( () => {
				return checkWhetherIsCKEditor5Plugin( modulePath )
					.then( isModule => {
						if ( isModule ) {
							ckeditor5Modules.push( path.join( process.cwd(), modulePath ) );
						}
					} );
			} );
		}

		return promise.then( () => ckeditor5Modules );
	} )
	.then( ckeditor5Modules => {
		console.log( `Found ${ ckeditor5Modules.length } plugins.` );
		logProcess( 'Generating source file...' );

		return mkdirp( DESTINATION_DIRECTORY ).then( () => generateCKEditor5Source( ckeditor5Modules ) );
	} )
	.then( () => {
		logProcess( 'Building the editor...' );
		const webpackConfig = getWebpackConfig();

		return runWebpack( webpackConfig );
	} )
	.then( () => {
		logProcess( 'Preparing the content styles file...' );

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

		if ( !shouldUpdateGuide ) {
			logProcess( 'Done.' );

			return Promise.resolve();
		}

		logProcess( 'Updating the content styles guide...' );

		const promises = [
			readFile( CONTENT_STYLES_GUIDE_PATH ),
			readFile( path.join( DESTINATION_DIRECTORY, 'content-styles.css' ) )
		];

		return Promise.all( promises )
			.then( ( [ guideContent, newContentStyles ] ) => {
				guideContent = guideContent.replace( /```css([^`]+)```/, '```css\n' + newContentStyles + '\n```' );

				return writeFile( CONTENT_STYLES_GUIDE_PATH, guideContent );
			} )
			.then( () => {
				logProcess( 'Saving and committing...' );

				const contentStyleFile = CONTENT_STYLES_GUIDE_PATH.replace( process.cwd() + path.sep, '' );

				// Commit the documentation.
				if ( exec( `git diff --name-only ${ contentStyleFile }` ).trim().length ) {
					exec( `git add ${ contentStyleFile }` );
					exec( 'git commit -m "Docs (ckeditor5): Updated the content styles stylesheet."' );

					console.log( 'Successfully updated the content styles guide.' );
				} else {
					console.log( 'Nothing to commit. The content styles guide is up to date.' );
				}

				logProcess( 'Done.' );
			} );
	} )
	.catch( err => {
		console.log( err );
	} );

/**
 * Resolves the promise with an array of paths to CKEditor 5 modules.
 *
 * @returns {Promise.<Array>}
 */
function getCkeditor5ModulePaths() {
	return new Promise( ( resolve, reject ) => {
		glob( 'packages/*/src/**/*.js', ( err, files ) => {
			if ( err ) {
				return reject( err );
			}

			return resolve( files );
		} );
	} );
}

/**
 * Resolves the promise with a boolean value that indicates whether the module under `modulePath` is the CKEditor 5 plugin.
 *
 * @param modulePath
 * @returns {Promise.<Boolean>}
 */
function checkWhetherIsCKEditor5Plugin( modulePath ) {
	return readFile( path.join( process.cwd(), modulePath ) )
		.then( content => {
			const pluginName = path.basename( modulePath, '.js' );

			if ( content.match( new RegExp( `export default class ${ pluginName } extends Plugin`, 'i' ) ) ) {
				return Promise.resolve( true );
			}

			return Promise.resolve( false );
		} );
}

/**
 * Generates a source file that will be used to build the editor.
 *
 * @param {Array.<String>} ckeditor5Modules Paths to CKEditor 5 modules.
 * @returns {Promise>}
 */
function generateCKEditor5Source( ckeditor5Modules ) {
	ckeditor5Modules = ckeditor5Modules.map( modulePath => {
		const pluginName = capitalize( path.basename( modulePath, '.js' ) );
		return { modulePath, pluginName };
	} );

	const sourceFileContent = [
		'/**',
		` * @license Copyright (c) 2003-${ new Date().getFullYear() }, CKSource - Frederico Knabben. All rights reserved.`,
		' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
		' */',
		'',
		'// The editor creator to use.',
		'import ClassicEditorBase from \'@ckeditor/ckeditor5-editor-classic/src/classiceditor\';',
		''
	];

	for ( const { modulePath, pluginName } of ckeditor5Modules ) {
		sourceFileContent.push( `import ${ pluginName } from '${ modulePath }';` );
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

	return writeFile( path.join( DESTINATION_DIRECTORY, 'source.js' ), sourceFileContent.join( '\n' ) );

	function capitalize( value ) {
		return value.charAt( 0 ).toUpperCase() + value.slice( 1 );
	}
}

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

	postCssConfig.plugins.push( postCssContentStylesPlugin( contentRules ) );

	return {
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
 * Returns the PostCSS plugin that allows intercepting CSS definition used in the editor's build.
 *
 * @param {Object} contentRules
 * @param {Array.<String>} contentRules.variables Variables defined as `:root`.
 * @param {Object} contentRules.atRules Definitions of behaves.
 * @param {Array.<String>} contentRules.selector CSS definitions for all selectors.
 * @returns {Function}
 */
function postCssContentStylesPlugin( contentRules ) {
	return postcss.plugin( 'list-content-styles', function() {
		const selectorStyles = contentRules.selector;
		const variables = contentRules.variables;

		return root => {
			root.walkRules( rule => {
				for ( const selector of rule.selectors ) {
					const data = {
						file: root.source.input.file,
						css: rule.toString()
					};

					if ( selector.match( ':root' ) ) {
						addDefinition( variables, data );
					}

					if ( selector.match( '.ck-content' ) ) {
						if ( rule.parent.name && rule.parent.params ) {
							const atRule = getAtRuleArray( contentRules.atRules, rule.parent.name, rule.parent.params );

							addDefinition( atRule, data );
						} else {
							addDefinition( selectorStyles, data );
						}
					}
				}
			} );
		};
	} );

	/**
	 * @param {Object} collection
	 * @param {String} name Name of an `at-rule`.
	 * @param {String} params Parameters that describes the `at-rule`.
	 * @returns {Array}
	 */
	function getAtRuleArray( collection, name, params ) {
		const definition = `${ name } ${ params }`;

		if ( !collection[ definition ] ) {
			collection[ definition ] = [];
		}

		return collection[ definition ];
	}

	/**
	 * Checks whether specified definition is duplicated in the colletion.
	 *
	 * @param {Array.<StyleStructure>} collection
	 * @param {StyleStructure} def
	 * @returns {Boolean}
	 */
	function isDuplicatedDefinition( collection, def ) {
		for ( const item of collection ) {
			if ( item.file === def.file && item.css === def.css ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Adds definition to the collection if it does not exist in the collection.
	 *
	 * @param {Array.<StyleStructure>} collection
	 * @param {StyleStructure} def
	 */
	function addDefinition( collection, def ) {
		if ( !isDuplicatedDefinition( collection, def ) ) {
			collection.push( def );
		}
	}
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

/**
 * Resolves the promise with the content of the file saved under the `filePath` location.
 *
 * @param {String} filePath The path to fhe file.
 * @returns {Promise.<String>}
 */
function readFile( filePath ) {
	return new Promise( ( resolve, reject ) => {
		fs.readFile( filePath, 'utf-8', ( err, content ) => {
			if ( err ) {
				return reject( err );
			}

			return resolve( content );
		} );
	} );
}

/**
 * Saves the `data` value to the file saved under the `filePath` location.
 *
 * @param {String} filePath The path to fhe file.
 * @param {String} data The content to save.
 * @returns {Promise.<String>}
 */
function writeFile( filePath, data ) {
	return new Promise( ( resolve, reject ) => {
		fs.writeFile( filePath, data, err => {
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

function exec( command ) {
	return tools.shExec( command, { verbosity: 'error' } );
}

function logProcess( message ) {
	console.log( '\n📍 ' + chalk.cyan( message ) );
}

/**
 * @typedef {Object} StyleStructure
 * @property {String} file An absolute path to the file where a definition is defined.
 * @property {String} css Definition.
 */
