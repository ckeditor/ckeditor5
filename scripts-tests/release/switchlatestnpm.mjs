/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { randomUUID } from 'crypto';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import fs from 'fs-extra';
import { globSync } from 'glob';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';

vi.mock( 'fs-extra' );
vi.mock( 'glob' );
vi.mock( '@ckeditor/ckeditor5-dev-release-tools' );
vi.mock( '../../scripts/constants.mjs', () => ( {
	CKEDITOR5_ROOT_PATH: '/repo',
	CKEDITOR5_PACKAGES_PATH: '/repo/packages',
	CKEDITOR5_COMMERCIAL_PACKAGES_PATH: '/repo/packages-commercial'
} ) );

const SCRIPT_UNDER_TEST = '../../scripts/release/switchlatestnpm.mjs';
const packageJsonMap = {
	'/repo/packages/alpha/package.json': {
		name: '@ckeditor/alpha'
	},
	'/repo/packages-commercial/bravo/package.json': {
		name: '@ckeditor/bravo'
	},
	'/repo/package.json': {
		version: '42.0.1'
	}
};

const packageNames = Object.values( packageJsonMap )
	.map( pkg => pkg.name )
	.filter( Boolean );

const packageJsonFiles = Object.keys( packageJsonMap )
	.filter( packagePath => packageJsonMap[ packagePath ].name );

describe( 'scripts/release/switchlatestnpm', () => {
	let logSpy;

	beforeEach( () => {
		logSpy = vi.spyOn( console, 'log' ).mockImplementation( () => {} );
		vi.mocked( globSync ).mockReturnValue( packageJsonFiles );
		vi.mocked( fs.readJsonSync ).mockImplementation( path => {
			return packageJsonMap[ path ];
		} );
	} );

	afterEach( () => {
		logSpy.mockRestore();
		vi.clearAllMocks();
	} );

	it( 'should search for packages in both CKEditor 5 repositories', async () => {
		vi.mocked( releaseTools.getVersionForTag ).mockResolvedValue( '45.0.0' );

		// Act: import executes the script (top-level await).
		await import( `${ SCRIPT_UNDER_TEST }?${ randomUUID() }` );

		expect( globSync ).toHaveBeenCalledTimes( 1 );
		expect( globSync ).toHaveBeenCalledWith(
			[
				'/repo/packages/*/package.json',
				'/repo/packages-commercial/*/package.json'
			],
			{
				absolute: true,
				cwd: '/repo'
			}
		);
	} );

	it( 'should map found paths to package names', async () => {
		vi.mocked( releaseTools.getVersionForTag ).mockResolvedValue( '45.0.0' );

		// Act: import executes the script (top-level await).
		await import( `${ SCRIPT_UNDER_TEST }?${ randomUUID() }` );

		expect( fs.readJsonSync ).toHaveBeenCalledTimes( 3 );
		expect( fs.readJsonSync ).toHaveBeenCalledWith( '/repo/package.json' );
		expect( fs.readJsonSync ).toHaveBeenCalledWith( '/repo/packages/alpha/package.json' );
		expect( fs.readJsonSync ).toHaveBeenCalledWith( '/repo/packages-commercial/bravo/package.json' );
	} );

	it( 'assigns @latest for the current release version and THEN restores previous latest when registry latest > current', async () => {
		vi.mocked( releaseTools.getVersionForTag ).mockResolvedValue( '45.0.0' );

		// Act: import executes the script (top-level await)
		await import( `${ SCRIPT_UNDER_TEST }?${ randomUUID() }` );

		expect( releaseTools.getVersionForTag ).toHaveBeenCalledTimes( 1 );
		expect( releaseTools.getVersionForTag ).toHaveBeenCalledWith( 'ckeditor5', 'latest' );

		expect( releaseTools.reassignNpmTags ).toHaveBeenCalledTimes( 2 );
		expect( releaseTools.reassignNpmTags ).toHaveBeenNthCalledWith( 1, expect.objectContaining( {
			version: '42.0.1',
			packages: packageNames
		} ) );
		expect( releaseTools.reassignNpmTags ).toHaveBeenNthCalledWith( 2, expect.objectContaining( {
			version: '45.0.0',
			packages: packageNames
		} ) );
	} );

	it( 'assigns @latest for the current root version and DOES NOT restore when registry latest <= current', async () => {
		vi.mocked( releaseTools.getVersionForTag ).mockResolvedValue( '42.0.0' );

		// Act: import executes the script (top-level await).
		await import( `${ SCRIPT_UNDER_TEST }?${ randomUUID() }` );

		expect( releaseTools.getVersionForTag ).toHaveBeenCalledTimes( 1 );
		expect( releaseTools.getVersionForTag ).toHaveBeenCalledWith( 'ckeditor5', 'latest' );

		expect( releaseTools.reassignNpmTags ).toHaveBeenCalledTimes( 1 );
		expect( releaseTools.reassignNpmTags ).toHaveBeenNthCalledWith( 1, expect.objectContaining( {
			version: '42.0.1',
			packages: packageNames
		} ) );
	} );
} );
