#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { execSync } from 'child_process';
import fs from 'fs-extra';
import upath from 'upath';
import semver from 'semver';
import { globSync } from 'glob';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';

import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';
const rootPkgJson = fs.readJsonSync( upath.join( CKEDITOR5_ROOT_PATH, 'package.json' ) );

const GLOB_PATTERNS = [
	'packages/*/package.json',
	'external/ckeditor5-commercial/packages/*/package.json'
];

const npmOwner = 'ckeditor';
const packages = globSync( GLOB_PATTERNS, { absolute: true, cwd: CKEDITOR5_ROOT_PATH } )
	.map( packageJsonPath => fs.readJsonSync( packageJsonPath ).name );

const latestPublishedVersion = execSync( 'npm view ckeditor5@latest version', { encoding: 'utf-8' } ).trim();

console.log( `Assigning the \`@latest\` npm tag for v${ rootPkgJson.version }.` );

await releaseTools.reassignNpmTags( {
	npmOwner,
	packages,
	version: rootPkgJson.version
} );

if ( semver.compare( latestPublishedVersion, rootPkgJson.version ) > 0 ) {
	console.log( `Restoring the \`@latest\` npm tag for v${ latestPublishedVersion }.` );

	await releaseTools.reassignNpmTags( {
		npmOwner,
		packages,
		version: latestPublishedVersion
	} );
} else {
	console.log(
		'The latest published packages are not higher version than the current release. The `@latest` npm tag is applied correctly.'
	);
}
