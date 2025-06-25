#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { spawn } from 'child_process';
import { glob } from 'glob';
import fs from 'fs-extra';
import upath from 'upath';
import umberto from 'umberto';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';
import parseArguments from './parse-arguments.mjs';

const { version } = await fs.readJson( upath.join( CKEDITOR5_ROOT_PATH, 'package.json' ) );

const DOCS_DIRECTORY = 'docs';

buildDocs()
	.catch( err => {
		console.error( err );

		process.exitCode = 1;
	} );

async function buildDocs() {
	const options = parseArguments( process.argv.slice( 2 ) );

	if ( !options.skipApi ) {
		await spawnAsync( 'yarn', [
			'run',
			'docs:api',
			options.strict && '--strict',
			options.verbose && '--verbose'
		].filter( Boolean ) );
	}

	if ( shouldBuildCKEditorAssets( options ) ) {
		await spawnAsync( 'yarn', [
			'run',
			'docs:ckeditor5',
			options.skipCommercial && '--skip-commercial',
			options.dev && '--skip-obfuscation'
		].filter( Boolean ) );
	}

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
		// skipApi: options.skipApi,
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
