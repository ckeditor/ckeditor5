#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { copyFile, rm, glob } from 'node:fs/promises';
import { dist, generateCKEditor5BrowserBuild } from '../nim/utils.mjs';
import { startMemoryTest } from './orchestrator.mjs';

/**
 * Constants
 */
const TIMEOUT = 40_000; // 40 seconds per editor type.
const MEMORY_THRESHOLD = 1.5 * 1024 * 1024; // 1.5 MB.
const ASSETS_DIR = resolve( import.meta.dirname, 'assets' );

const ALLOWED_EDITOR_NAMES = [
	'BalloonEditor',
	'ClassicEditor',
	'DecoupledEditor',
	'InlineEditor',
	'MultiRootEditor'
];

/**
 * CLI arguments
 */
const { values } = parseArgs( {
	options: {
		html: { type: 'string', default: 'index.html' },
		editor: { type: 'string', multiple: true, default: ALLOWED_EDITOR_NAMES },
		build: { type: 'boolean', default: true }
	},
	strict: true,
	allowNegative: true
} );

/**
 * Build
 */
if ( values.build ) {
	// Remove old assets.
	for await ( const asset of glob( '*.@(js|css)', { cwd: ASSETS_DIR } ) ) {
		await rm( resolve( ASSETS_DIR, asset ) );
	}

	// Generate core build.
	await generateCKEditor5BrowserBuild();
	await copyFile( dist( 'browser/ckeditor5.js' ), resolve( ASSETS_DIR, 'ckeditor5.js' ) );
	await copyFile( dist( 'browser/ckeditor5.css' ), resolve( ASSETS_DIR, 'ckeditor5.css' ) );
}

/**
 * Run the memory test.
 */
await startMemoryTest( {
	assetsDir: ASSETS_DIR,
	html: values.html,
	timeout: TIMEOUT,
	memoryThreshold: MEMORY_THRESHOLD,
	editorNames: values.editor,
	editorData: {
		LICENSE_KEY: 'GPL'
	}
} );
