#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const buildApiDocs = require( './buildapi' );
const minimist = require( 'minimist' );

buildDocs();

function buildDocs() {
	const options = parseArguments( process.argv.slice( 2 ) );

	let promise;

	if ( options.skipApi ) {
		promise = Promise.resolve();
	} else {
		promise = buildApiDocs();
	}

	return promise
		.then( () => {
			return runUmberto( options );
		} )
		.catch( err => {
			console.error( err );

			process.exitCode = 1;
		} );
}

/**
 * @param {DocumentationOptions} options
 * @return {Promise}
 */
function runUmberto( options ) {
	const umberto = require( 'umberto' );

	return umberto.buildSingleProject( {
		configDir: 'docs',
		clean: true,
		dev: !options.production,
		skipLiveSnippets: options.skipSnippets,
		skipValidation: options.skipValidation,
		snippetOptions: {
			production: options.production,
			allowedSnippets: options.snippets
		},
		skipApi: options.skipApi,
		skipGuides: options.skipGuides,
		verbose: options.verbose,
		watch: options.watch,
		guides: options.guides
	} );
}

/**
 * @param {Array.<String>} args An array containing modifiers for the executed command.
 * @return {DocumentationOptions}
 */
function parseArguments( args ) {
	const options = minimist( args, {
		boolean: [
			'skip-api',
			'skip-snippets',
			'skip-validation',
			'skip-guides',
			'production',
			'watch',
			'verbose'
		],
		string: [
			'snippets',
			'guides'
		],
		default: {
			'skip-api': false,
			'skip-snippets': false,
			'skip-validation': false,
			'skip-guides': false,
			production: false,
			watch: false,
			verbose: false,
			snippets: [],
			guides: []
		}
	} );

	splitOptionsToArray( options, [
		'snippets',
		'guides'
	] );

	replaceKebabCaseWithCamelCase( options, [
		'skip-api',
		'skip-snippets',
		'skip-validation',
		'skip-guides'
	] );

	return options;
}

/**
 * Replaces all kebab-case keys in the `options` object with camelCase entries.
 * Kebab-case keys will be removed.
 *
 * @param {Object} options
 * @param {Array.<String>} keys Kebab-case keys in `options` object.
 */
function replaceKebabCaseWithCamelCase( options, keys ) {
	for ( const key of keys ) {
		const camelCaseKey = key.replace( /-./g, match => match[ 1 ].toUpperCase() );

		options[ camelCaseKey ] = options[ key ];
		delete options[ key ];
	}
}

/**
 * Splits by a comma (`,`) all values specified under keys to array.
 *
 * @param {Object} options
 * @param {Array.<String>} keys Kebab-case keys in `options` object.
 */
function splitOptionsToArray( options, keys ) {
	for ( const key of keys ) {
		if ( typeof options[ key ] === 'string' ) {
			options[ key ] = options[ key ].split( ',' ).filter( item => item.length );
		}
	}
}

/**
 * @typedef {Object} DocumentationOptions
 *
 * @param {Boolean} [skipApi=false] Whether to skip building API docs.
 *
 * @param {Boolean} [skipSnippets=false] Whether to skip building live snippets.
 *
 * @param {Boolean} [skipValidation=false] Whether to skip validating URLs in the generated documentation.
 *
 * @param {Boolean} [skipGuides=false] Whether to skip processing guides.
 *
 * @param {Boolean} [production=false] Whether the documentation is being built on the production environment. It means that all files
 * will be minified. Increases the time needed for processing all files.
 *
 * @param {Boolean} [watch=false] Whether to watch source files.
 *
 * @param {Boolean} [verbose=false] Whether to print additional logs.
 *
 * @param {Array.<String>} [snippets=[]] An array containing the names of snippets that the snippet adapter should process.
 * An empty array means that the filtering mechanism is disabled.
 *
 * @param {Array.<String>} [guides=[]] An array containing the names of guides that should be processed by Umberto.
 * An empty array means that the filtering mechanism is disabled.
 */
