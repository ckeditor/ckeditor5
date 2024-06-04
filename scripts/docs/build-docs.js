#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const buildApiDocs = require( './buildapi' );
const parseArguments = require( './parse-arguments' );

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
