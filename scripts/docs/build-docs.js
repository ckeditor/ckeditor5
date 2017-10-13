#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const assertIsInstalled = require( './../util/assertisinstalled' );
const buildApiDocs = require( './buildapi' );

const skipLiveSnippets = process.argv.includes( '--skip-snippets' );
const skipApi = process.argv.includes( '--skip-api' );
const production = process.argv.includes( '--production' );

buildDocs();

function buildDocs() {
	if ( skipApi ) {
		const fs = require( 'fs' );
		const apiJsonPath = './docs/api/output.json';

		if ( fs.existsSync( apiJsonPath ) ) {
			fs.unlinkSync( apiJsonPath );
		}

		runUmberto( {
			skipLiveSnippets,
			skipApi,
			production
		} ).then( () => process.exit() );

		return;
	}

	// Simple way to reuse existing api/output.json:
	// return Promise.resolve()
	buildApiDocs()
		.then( () => {
			return runUmberto( {
				skipLiveSnippets,
				production
			} );
		} );
}

function runUmberto( options ) {
	assertIsInstalled( 'umberto' );
	const umberto = require( 'umberto' );

	return umberto.buildSingleProject( {
		configDir: 'docs',
		clean: true,
		skipLiveSnippets: options.skipLiveSnippets,
		snippetOptions: {
			production: options.production
		},
		skipApi: options.skipApi
	} );
}
