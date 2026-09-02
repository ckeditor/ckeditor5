#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import upath from 'upath';
import { CKEDITOR5_ROOT_PATH, CKEDITOR5_COMMERCIAL_PATH, IS_ISOLATED_REPOSITORY } from '../constants.mjs';

/**
 * Runs `syncpack` (see `.syncpackrc.mjs`) to verify that `dependencies` and `devDependencies`
 * across the repository use consistent, exact versions.
 *
 * `syncpack` resolves its `source` patterns against the current working directory and cannot
 * match files above it. In the commercial development environment the check covers both the
 * public and the commercial `package.json` files, so this wrapper runs it from the commercial
 * root directory.
 */
const shouldFix = process.argv[ 2 ] === '--fix';

// The `syncpack` JavaScript entry point is executed through the current Node.js binary,
// because the extensionless `node_modules/.bin` launcher does not work on Windows.
const require = createRequire( import.meta.url );
const syncpackPackagePath = require.resolve( 'syncpack/package.json' );
const syncpackBin = upath.join( upath.dirname( syncpackPackagePath ), require( 'syncpack/package.json' ).bin.syncpack );

const { status } = spawnSync(
	process.execPath,
	[
		syncpackBin,
		shouldFix ? 'fix' : 'lint',
		'--config', upath.join( CKEDITOR5_ROOT_PATH, '.syncpackrc.mjs' ),
		'--dependency-types', 'prod,dev'
	],
	{
		cwd: IS_ISOLATED_REPOSITORY ? CKEDITOR5_ROOT_PATH : CKEDITOR5_COMMERCIAL_PATH,
		stdio: 'inherit'
	}
);

// `status` is `null` when `syncpack` failed to start or was killed by a signal.
process.exit( status ?? 1 );
