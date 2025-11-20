#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Worker } from 'node:worker_threads';
import { glob } from 'glob';
import fs from 'fs-extra';
import upath from 'upath';
import umberto from 'umberto';
import { CKEDITOR5_ROOT_PATH, IS_ISOLATED_REPOSITORY } from '../constants.mjs';
import parseArguments from './parse-arguments.mjs';
import { styleText } from 'node:util';

const { version } = await fs.readJson( upath.join( CKEDITOR5_ROOT_PATH, 'package.json' ) );

const DOCS_DIRECTORY = 'docs';

try {
	const options = parseArguments( process.argv.slice( 2 ) );
	const workers = [];

	// Build API docs in a separate thread.
	if ( !options.skipApi ) {
		const apiDocsWorker = spawnWorker( './workers/build-api-docs.mjs', {
			strict: options.strict,
			verbose: options.verbose
		} );

		workers.push( apiDocsWorker );
	}

	// Build CKEditor 5 assets in a separate threads.
	if ( shouldBuildCKEditorAssets( options ) ) {
		const basePath = upath.join( CKEDITOR5_ROOT_PATH, 'build', 'docs-assets' );

		await fs.emptyDir( basePath );

		const corePackageWorker = spawnWorker( './workers/build-core.mjs', { basePath } );
		const commercialPackageWorker = spawnWorker( './workers/build-commercial.mjs', {
			basePath,
			skipCommercial: options.skipCommercial,
			skipObfuscation: options.skipObfuscation
		} );

		workers.push( corePackageWorker, commercialPackageWorker );
	}

	// Wait for all workers to finish.
	await Promise.all( workers );

	// Build the rest of the docs.
	await umberto.buildSingleProject( {
		configDir: DOCS_DIRECTORY,
		clean: true,
		dev: options.dev,
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

	if ( !options.skipSnippets ) {
		const assetsPaths = await glob( '*/', {
			cwd: upath.join( CKEDITOR5_ROOT_PATH, 'build', 'docs-assets' ),
			absolute: true
		} );

		const destinationPath = upath.join( CKEDITOR5_ROOT_PATH, 'build', DOCS_DIRECTORY, 'ckeditor5', version, 'assets' );

		if ( !assetsPaths.length ) {
			throw new Error( 'CKEditor 5 assets needed to run snippets are not detected. Snippets will not work.' );
		}

		for ( const asset of assetsPaths ) {
			const directoryName = upath.basename( asset );

			await fs.copy( asset, upath.join( destinationPath, directoryName ) );
		}
	}

	if ( IS_ISOLATED_REPOSITORY ) {
		const warning = styleText(
			'yellow',
			'\nThis repository is typically used in conjunction with a private project.\n\n' +
			'Since the project is not present here, some documentation links may not resolve - ' +
			'this is expected and does not indicate a problem.\n\n' +
			'The purpose of this task is to create the API reference and contributor-facing ' +
			'guides for this repository independently.\n\n' +
			'If you still want to run full documentation validation, use "--skip-validation=false".'
		);

		console.log( warning );
	}
} catch ( err ) {
	console.error( err );
	process.exitCode = 1;
}

function shouldBuildCKEditorAssets( options ) {
	if ( options.skipSnippets ) {
		return false;
	}

	if ( options.skipCkeditor5 ) {
		return false;
	}

	return true;
}

function spawnWorker( path, workerData ) {
	return new Promise( ( resolve, reject ) => {
		const worker = new Worker(
			new URL( path, import.meta.url ),
			{ workerData }
		);

		worker.on( 'error', reject );
		worker.on( 'exit', code => {
			if ( code === 0 ) {
				resolve();
			} else {
				reject( new Error( `Worker stopped with exit code ${ code }` ) );
			}
		} );
	} );
};
