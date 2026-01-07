#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { styleText } from 'node:util';
import { spawn } from 'node:child_process';
import { glob } from 'glob';
import fs from 'fs-extra';
import upath from 'upath';
import umberto from 'umberto';
import parseArguments from './parse-arguments.mjs';
import {
	CKEDITOR5_ROOT_PATH,
	DOCUMENTATION_PATH,
	DOCUMENTATION_ASSETS_PATH,
	IS_ISOLATED_REPOSITORY
} from '../constants.mjs';

const { version } = await fs.readJson( upath.join( CKEDITOR5_ROOT_PATH, 'package.json' ) );

try {
	const options = parseArguments( process.argv.slice( 2 ) );
	const processes = [];

	// Build API docs in a separate process.
	if ( !options.skipApi ) {
		const apiDocsProcess = spawnAsync( 'pnpm', [
			'run',
			'docs:api',
			options.strict && '--strict',
			options.verbose && '--verbose'
		].filter( Boolean ) );

		processes.push( apiDocsProcess );
	}

	// Build CKEditor 5 assets in a separate process.
	if ( shouldBuildCKEditorAssets( options ) ) {
		await fs.emptyDir( DOCUMENTATION_ASSETS_PATH );

		const corePackageProcess = spawnAsync( 'pnpm', [
			'run',
			'docs:ckeditor5'
		] );

		const commercialPackageProcess = spawnAsync( 'pnpm', [
			'run',
			'docs:ckeditor5-premium-features',
			options.skipCommercial && '--skip-commercial',
			options.skipObfuscation && '--skip-obfuscation'
		].filter( Boolean ) );

		processes.push( corePackageProcess, commercialPackageProcess );
	}

	// Wait for all workers to finish.
	await Promise.all( processes );

	// Build the rest of the docs.
	await umberto.buildSingleProject( {
		configDir: DOCUMENTATION_PATH,
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
			cwd: DOCUMENTATION_ASSETS_PATH,
			absolute: true
		} );

		const destinationPath = upath.join( DOCUMENTATION_PATH, 'ckeditor5', version, 'assets' );

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

function spawnAsync( command, args ) {
	return new Promise( ( resolve, reject ) => {
		const process = spawn( command, args, {
			cwd: CKEDITOR5_ROOT_PATH,
			stdio: 'inherit',
			shell: true
		} );

		process.on( 'close', code => {
			if ( code === 0 ) {
				resolve();
			} else {
				reject( new Error( `Process exited with code ${ code }` ) );
			}
		} );
	} );
}
