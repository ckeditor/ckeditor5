/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const cwd = process.cwd();

const path = require( 'path' );
const fs = require( 'fs' );
const chalk = require( 'chalk' );
const glob = require( 'glob' );
const mkdirp = require( 'mkdirp' );
const postcss = require( 'postcss' );
const webpack = require( 'webpack' );
const Table = require( 'cli-table' );
const readline = require( 'readline' );
const { tools, styles } = require( '@ckeditor/ckeditor5-dev-utils' );

const DESTINATION_DIRECTORY = path.join( __dirname, '..', '..', 'build', 'content-styles' );
const CONTENT_STYLES_GUIDE_PATH = path.join( __dirname, '..', '..', 'docs', 'builds', 'guides', 'integration', 'content-styles.md' );
const CONTENT_STYLES_DETAILS_PATH = path.join( __dirname, 'content-styles-details.json' );

const contentStylesDetails = require( CONTENT_STYLES_DETAILS_PATH );

// An array of objects with plugins used to generate the current version of the content styles.
let foundModules;

const contentRules = {
	selector: [],
	variables: [],
	atRules: {}
};

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
							ckeditor5Modules.push( path.join( cwd, modulePath ) );
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
	.then( ckeditor5Modules => {
		foundModules = ckeditor5Modules;

		logProcess( 'Building the editor...' );
		const webpackConfig = getWebpackConfig();

		return runWebpack( webpackConfig );
	} )
	.then( () => {
		logProcess( 'Looking for new plugins...' );

		const newPlugins = findNewPlugins( foundModules, contentStylesDetails.plugins );

		if ( !newPlugins.length ) {
			console.log( 'Previous and current versions of the content styles stylesheet were generated with the same set of plugins.' );
			logProcess( 'Done.' );

			return Promise.resolve();
		}

		console.log( 'Found new plugins.' );
		displayNewPluginsTable( newPlugins );

		const rl = readline.createInterface( {
			input: process.stdin,
			output: process.stdout
		} );

		rl.question( 'Do you want to commit the changes? (Y/N): ', answer => {
			rl.close();
			if ( answer !== 'Y' ) {
				console.log( 'Changes will not be commited.' );
				return Promise.resolve();
			}

			logProcess( 'Updating the content styles details file...' );

			tools.updateJSONFile( CONTENT_STYLES_DETAILS_PATH, json => {
				const newPluginsObject = {};

				for ( const data of foundModules ) {
					const modulePath = normalizePath( data.modulePath.replace( cwd + path.sep, '' ) );
					newPluginsObject[ modulePath ] = data.pluginName;
				}

				json.plugins = newPluginsObject;

				return json;
			} );

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

					const contentStyleGuide = CONTENT_STYLES_GUIDE_PATH.replace( cwd + path.sep, '' );
					const contentStyleDetails = CONTENT_STYLES_DETAILS_PATH.replace( cwd + path.sep, '' );

					// Commit the documentation.
					if ( exec( `git diff --name-only ${ contentStyleGuide } ${ contentStyleDetails }` ).trim().length ) {
						exec( `git add ${ contentStyleGuide } ${ contentStyleDetails }` );
						exec( 'git commit -m "Docs (ckeditor5): Updated the content styles stylesheet."' );

						console.log( 'Successfully updated the content styles guide.' );
					} else {
						console.log( 'Nothing to commit. The content styles guide is up to date.' );
					}

					logProcess( 'Done.' );
				} );
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
	return readFile( path.join( cwd, modulePath ) )
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

	for ( let { modulePath, pluginName } of ckeditor5Modules ) {
		modulePath = normalizePath( modulePath );
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

	return writeFile( path.join( DESTINATION_DIRECTORY, 'source.js' ), sourceFileContent.join( '\n' ) )
		.then( () => ckeditor5Modules );

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
	 * Checks whether specified definition is duplicated in the collection.
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
 * Returns an object that contains objects with new plugins.
 *
 * @param {Array.<Object>} currentPlugins
 * @param {Array.<Object>} previousPlugins
 * @returns {{Array.<Object>}}
 */
function findNewPlugins( currentPlugins, previousPlugins ) {
	const newPlugins = [];

	for ( const data of currentPlugins ) {
		// Use relative paths.
		const modulePath = normalizePath( data.modulePath.replace( cwd + path.sep, '' ) );

		if ( !previousPlugins[ modulePath ] ) {
			newPlugins.push( data );
		}
	}

	return newPlugins;
}

/**
 * Displays a table with new plugins.
 *
 * @param {Array.<Object>} newPlugins
 */
function displayNewPluginsTable( newPlugins ) {
	const table = new Table( {
		head: [ 'Plugin name', 'Module path' ],
		style: { compact: true }
	} );

	for ( const data of newPlugins ) {
		const modulePath = normalizePath( data.modulePath.replace( cwd + path.sep, '' ) );

		table.push( [ data.pluginName, modulePath ] );
	}

	console.log( table.toString() );
}

function normalizePath( modulePath ) {
	return modulePath.split( path.sep ).join( path.posix.sep );
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
