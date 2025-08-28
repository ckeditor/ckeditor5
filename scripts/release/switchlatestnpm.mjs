#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import fs from 'fs-extra';
import { globSync } from 'glob';
import {
	CKEDITOR5_ROOT_PATH,
	CKEDITOR5_PACKAGES_PATH,
	CKEDITOR5_COMMERCIAL_PACKAGES_PATH
} from '../constants.mjs';

const rootPkgJson = fs.readJsonSync( upath.join( CKEDITOR5_ROOT_PATH, 'package.json' ) );

const GLOB_PATTERNS = [
	'package.json',
	CKEDITOR5_PACKAGES_PATH + '/*/package.json',
	CKEDITOR5_COMMERCIAL_PACKAGES_PATH + '/*/package.json'
];

Promise.resolve()
	// CKEditor 5 packages.
	.then( () => releaseTools.reassignNpmTags( {
		npmOwner: 'ckeditor',
		version: rootPkgJson.version,
		packages: globSync( GLOB_PATTERNS, { absolute: true, cwd: CKEDITOR5_ROOT_PATH } )
			.map( packageJsonPath => fs.readJsonSync( packageJsonPath ).name )
	} ) );

