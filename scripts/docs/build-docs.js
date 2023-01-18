#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );
const fs = require( 'fs' );
const buildApiDocs = require( './buildapi' );
const parseArguments = require( './parse-arguments' );

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );

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
			// Set the proper API type for Umberto if requested building the API docs for the TypeScript source code.
			if ( options.ts ) {
				setApiTypeForUmberto( 'typedoc' );
			}
		} )
		.then( () => {
			return runUmberto( options );
		} )
		.catch( err => {
			console.error( err );

			process.exitCode = 1;
		} )
		.finally( () => {
			// Restore the default JSDoc-based API type for Umberto if the docs were built for the TypeScript source code.
			if ( options.ts ) {
				setApiTypeForUmberto( 'jsdoc' );
			}
		} );
}

/**
 * Updates the API type configuration for Umberto.
 *
 * @param {String} type
 */
function setApiTypeForUmberto( type ) {
	const umbertoConfigPath = path.join( ROOT_DIRECTORY, 'docs', 'umberto.json' );
	const umbertoConfig = JSON.parse( fs.readFileSync( umbertoConfigPath, 'utf-8' ) );
	const umbertoConfigApi = umbertoConfig.groups.find( group => group.id === 'api-reference' );

	if ( !umbertoConfigApi ) {
		return;
	}

	umbertoConfigApi.type = type;

	fs.writeFileSync( umbertoConfigPath, JSON.stringify( umbertoConfig, null, '\t' ) + '\n', 'utf-8' );
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
