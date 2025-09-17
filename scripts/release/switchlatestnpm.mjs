#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import fs from 'fs-extra';
import upath from 'upath';
import semver from 'semver';
import { globSync } from 'glob';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';

import {
	CKEDITOR5_ROOT_PATH,
	CKEDITOR5_PACKAGES_PATH,
	CKEDITOR5_COMMERCIAL_PACKAGES_PATH
} from '../constants.mjs';

const rootPkgJson = fs.readJsonSync( upath.join( CKEDITOR5_ROOT_PATH, 'package.json' ) );

const GLOB_PATTERNS = [
	CKEDITOR5_PACKAGES_PATH + '/*/package.json',
	CKEDITOR5_COMMERCIAL_PACKAGES_PATH + '/*/package.json'
];

const npmOwner = 'ckeditor';
const packages = globSync( GLOB_PATTERNS, { absolute: true, cwd: CKEDITOR5_ROOT_PATH } )
	.map( packageJsonPath => fs.readJsonSync( packageJsonPath ).name );

const latestPublishedVersion = await releaseTools.getVersionForTag( 'ckeditor5', 'latest' );

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
		'The `@latest` version is higher than the current processed release. The `@latest` npm tag is applied correctly.'
	);
}
