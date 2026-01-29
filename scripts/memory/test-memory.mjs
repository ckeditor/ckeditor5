#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { dist, generateCKEditor5BrowserBuild } from '../nim/utils.mjs';
import { startMemoryTest } from './orchestrator.mjs';

const ALLOWED_EDITOR_NAMES = [
	'BalloonEditor',
	'ClassicEditor',
	'DecoupledEditor',
	'InlineEditor',
	'MultiRootEditor'
];

const { values } = parseArgs( {
	options: {
		assets: { type: 'string', default: 'scripts/memory/assets' },
		editors: { type: 'string', multiple: true, default: ALLOWED_EDITOR_NAMES },
		build: { type: 'boolean', default: true },
		timeout: { type: 'string', default: String( 20_000 ) }, // 20 seconds per editor
		threshold: { type: 'string', default: String( 1.5 * 1024 * 1024 ) } // 1.5 MB
	},
	strict: true,
	allowNegative: true
} );

const resolvedAssetsDir = resolve( process.cwd(), values.assets );

await mkdir( resolvedAssetsDir, { recursive: true } );

if ( values.build ) {
	await generateCKEditor5BrowserBuild();
	await copyFile( dist( 'browser/ckeditor5.js' ), resolve( resolvedAssetsDir, 'ckeditor5.js' ) );
	await copyFile( dist( 'browser/ckeditor5.css' ), resolve( resolvedAssetsDir, 'ckeditor5.css' ) );
}

await startMemoryTest( {
	assetsDir: resolvedAssetsDir,
	timeout: Number( values.timeout ),
	memoryThreshold: Number( values.threshold ),
	editorNames: values.editors,
	editorData: {
		LICENSE_KEY: 'GPL'
	}
} );
