#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Removes all `node_modules` directories in the current working directory.
//
// Only Node.js built-ins are used, so nothing is downloaded at runtime and the script works
// even when `node_modules` is missing or broken.

import { globSync, rmSync } from 'node:fs';

// Do not look inside `node_modules`. Nested ones are removed together with their parent.
for ( const path of globSync( '**/node_modules', { exclude: [ '**/node_modules/*' ] } ) ) {
	rmSync( path, { recursive: true, force: true } );
}
