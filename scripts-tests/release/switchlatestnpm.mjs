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
	CKEDITOR5_ROOT_PATH: '/workspace/ckeditor/ckeditor5-commercial',
	CKEDITOR5_PACKAGES_PATH: '/workspace/ckeditor/ckeditor5-commercial/external/ckeditor5/packages',
	CKEDITOR5_COMMERCIAL_PACKAGES_PATH: '/workspace/ckeditor/ckeditor5-commercial/packages'
} ) );

const SWITCH_TO_LATEST_PATH_SCRIPT = '../../scripts/release/switchlatestnpm.mjs';

const packageJsonMap = {
	'/workspace/ckeditor/ckeditor5-commercial/external/ckeditor5/packages/alpha/package.json': {
		name: '@ckeditor/alpha'
	},
	'/workspace/ckeditor/ckeditor5-commercial/packages/bravo/package.json': {
		name: '@ckeditor/bravo'
	},
	'/workspace/ckeditor/ckeditor5-commercial/package.json': {
		version: '46.1.0',
		'ck-lts-versions': [
			47
		]
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
				'/workspace/ckeditor/ckeditor5-commercial/external/ckeditor5/packages/*/package.json',
				'/workspace/ckeditor/ckeditor5-commercial/packages/*/package.json'
			],
			{
				absolute: true,
				cwd: '/workspace/ckeditor/ckeditor5-commercial'
			}
		);
	} );

	it( 'should map found paths to package names', async () => {
		vi.mocked( releaseTools.getVersionForTag ).mockResolvedValue( '45.0.0' );

		// Act: import executes the script (top-level await).
		await import( `${ SCRIPT_UNDER_TEST }?${ randomUUID() }` );

		expect( fs.readJsonSync ).toHaveBeenCalledTimes( 3 );
		expect( fs.readJsonSync ).toHaveBeenCalledWith( '/workspace/ckeditor/ckeditor5-commercial/package.json' );
		expect( fs.readJsonSync ).toHaveBeenCalledWith(
			'/workspace/ckeditor/ckeditor5-commercial/external/ckeditor5/packages/alpha/package.json'
		);
		expect( fs.readJsonSync ).toHaveBeenCalledWith( '/workspace/ckeditor/ckeditor5-commercial/packages/bravo/package.json' );
	} );

	// Given: @latest → 47.0.0
	// When: publish 46.1.0
	// Then: @latest → 47.0.0
	it( 'should not reassign the @latest tag when publishing a version lower than the current @latest', async () => {
		vi.mocked( releaseTools.getVersionForTag ).mockResolvedValue( '47.0.0' );

		// Act: import executes the script (top-level await)
		await import( `${ SCRIPT_UNDER_TEST }?${ randomUUID() }` );

		expect( releaseTools.getVersionForTag ).toHaveBeenCalledTimes( 1 );
		expect( releaseTools.getVersionForTag ).toHaveBeenCalledWith( 'ckeditor5', 'latest' );

		expect( releaseTools.reassignNpmTags ).not.toHaveBeenCalledWith( expect.objectContaining( {
			version: '46.1.0',
			npmTag: 'latest'
		} ) );
	} );

	// Given: @latest → 46.1.0
	// When: publish 47.0.0
	// Then: @latest → 47.0.0, @lts-v47 → 47.0.0
	it( 'assigns @latest and @lts-v47 for the first LTS release (v47.0.0)', async () => {
		const packageJsonMapInternal = {
			...packageJsonMap,
			'/workspace/ckeditor/ckeditor5-commercial/package.json': {
				version: '47.0.0',
				'ck-lts-versions': [
					47
				]
			}
		};

		vi.mocked( fs.readJsonSync ).mockImplementation( path => {
			return packageJsonMapInternal[ path ];
		} );

		vi.mocked( releaseTools.getVersionForTag ).mockResolvedValue( '46.1.0' );

		// Act: import executes the script (top-level await).
		await import( `${ SCRIPT_UNDER_TEST }?${ randomUUID() }` );

		expect( releaseTools.getVersionForTag ).toHaveBeenCalledTimes( 1 );
		expect( releaseTools.getVersionForTag ).toHaveBeenCalledWith( 'ckeditor5', 'latest' );

		expect( releaseTools.reassignNpmTags ).toHaveBeenCalledTimes( 2 );
		expect( releaseTools.reassignNpmTags ).toHaveBeenNthCalledWith( 1, expect.objectContaining( {
			version: '47.0.0',
			packages: packageNames,
			npmTag: 'latest'
		} ) );

		expect( releaseTools.reassignNpmTags ).toHaveBeenNthCalledWith( 2, expect.objectContaining( {
			version: '47.0.0',
			packages: packageNames,
			npmTag: 'lts-v47'
		} ) );
	} );

	// Given: @latest → 47.0.0, @lts-v47 → 47.0.0
	// When: publish 47.1.0
	// Then: @latest → 47.1.0, @lts-v47 → 47.1.0
	it( 'assigns @latest and @lts-v47 for the subsequent LTS release (v47.1.0)', async () => {
		const packageJsonMapInternal = {
			...packageJsonMap,
			'/workspace/ckeditor/ckeditor5-commercial/package.json': {
				version: '47.1.0',
				'ck-lts-versions': [
					47
				]
			}
		};

		vi.mocked( fs.readJsonSync ).mockImplementation( path => {
			return packageJsonMapInternal[ path ];
		} );

		vi.mocked( releaseTools.getVersionForTag ).mockResolvedValue( '47.0.0' );

		// Act: import executes the script (top-level await).
		await import( `${ SCRIPT_UNDER_TEST }?${ randomUUID() }` );

		expect( releaseTools.getVersionForTag ).toHaveBeenCalledTimes( 1 );
		expect( releaseTools.getVersionForTag ).toHaveBeenCalledWith( 'ckeditor5', 'latest' );

		expect( releaseTools.reassignNpmTags ).toHaveBeenCalledTimes( 2 );
		expect( releaseTools.reassignNpmTags ).toHaveBeenNthCalledWith( 1, expect.objectContaining( {
			version: '47.1.0',
			packages: packageNames,
			npmTag: 'latest'
		} ) );

		expect( releaseTools.reassignNpmTags ).toHaveBeenNthCalledWith( 2, expect.objectContaining( {
			version: '47.1.0',
			packages: packageNames,
			npmTag: 'lts-v47'
		} ) );
	} );

	// Given: @latest → 47.1.0, @lts-v47 → 47.1.0
	// When: publish 46.1.1
	// Then: @latest → 47.1.0, @lts-v47 → 47.1.0
	it( 'should not reassign any npm tags when publishing an older version that does not affect @latest or @lts-v* tags', async () => {
		const packageJsonMapInternal = {
			...packageJsonMap,
			'/workspace/ckeditor/ckeditor5-commercial/package.json': {
				version: '46.1.1',
				'ck-lts-versions': [
					47
				]
			}
		};

		vi.mocked( fs.readJsonSync ).mockImplementation( path => {
			return packageJsonMapInternal[ path ];
		} );

		vi.mocked( releaseTools.getVersionForTag ).mockResolvedValue( '47.1.0' );

		// Act: import executes the script (top-level await).
		await import( `${ SCRIPT_UNDER_TEST }?${ randomUUID() }` );

		expect( releaseTools.getVersionForTag ).toHaveBeenCalledTimes( 1 );
		expect( releaseTools.getVersionForTag ).toHaveBeenCalledWith( 'ckeditor5', 'latest' );

		expect( releaseTools.reassignNpmTags ).not.toHaveBeenCalledWith( expect.objectContaining( {
			version: '46.1.1',
			npmTag: 'latest'
		} ) );
		expect( releaseTools.reassignNpmTags ).not.toHaveBeenCalledWith( expect.objectContaining( {
			version: '47.1.0',
			npmTag: 'latest'
		} ) );
		expect( releaseTools.reassignNpmTags ).not.toHaveBeenCalledWith( expect.objectContaining( {
			npmTag: 'lts-v47'
		} ) );
	} );

	// Given: @latest → 48.0.0, @lts-v47 → 47.1.0
	// When: publish 49.0.0
	// Then: @latest → 49.0.0, @lts-v47 → 47.1.0, @lts-v49 → 49.0.0
	it( 'assigns @latest and @lts-v49 for the current release which is the next LTS version', async () => {
		const packageJsonMapInternal = {
			...packageJsonMap,
			'/workspace/ckeditor/ckeditor5-commercial/package.json': {
				version: '49.0.0',
				'ck-lts-versions': [
					47,
					49
				]
			}
		};

		vi.mocked( fs.readJsonSync ).mockImplementation( path => {
			return packageJsonMapInternal[ path ];
		} );

		vi.mocked( releaseTools.getVersionForTag ).mockResolvedValue( '48.0.0' );

		// Act: import executes the script (top-level await).
		await import( `${ SCRIPT_UNDER_TEST }?${ randomUUID() }` );

		expect( releaseTools.getVersionForTag ).toHaveBeenCalledTimes( 1 );
		expect( releaseTools.getVersionForTag ).toHaveBeenCalledWith( 'ckeditor5', 'latest' );

		expect( releaseTools.reassignNpmTags ).toHaveBeenCalledTimes( 2 );
		expect( releaseTools.reassignNpmTags ).toHaveBeenNthCalledWith( 1, expect.objectContaining( {
			version: '49.0.0',
			packages: packageNames,
			npmTag: 'latest'
		} ) );

		expect( releaseTools.reassignNpmTags ).toHaveBeenNthCalledWith( 2, expect.objectContaining( {
			version: '49.0.0',
			packages: packageNames,
			npmTag: 'lts-v49'
		} ) );
		expect( releaseTools.reassignNpmTags ).not.toHaveBeenCalledWith( expect.objectContaining( {
			npmTag: 'lts-v47'
		} ) );
	} );

	// Given: @latest → 48.0.0, @lts-v47 → 47.1.0
	// When: publish 47.1.1
	// Then: @latest → 48.0.0, @lts-v47 → 47.1.1
	it( 'should reassign the matching LTS tag (@lts-v47) to the new release and leave @latest unchanged', async () => {
		const packageJsonMapInternal = {
			...packageJsonMap,
			'/workspace/ckeditor/ckeditor5-commercial/package.json': {
				version: '47.1.1',
				'ck-lts-versions': [
					47,
					49
				]
			}
		};

		vi.mocked( fs.readJsonSync ).mockImplementation( path => {
			return packageJsonMapInternal[ path ];
		} );

		vi.mocked( releaseTools.getVersionForTag ).mockResolvedValue( '48.0.0' );

		// Act: import executes the script (top-level await).
		await import( `${ SCRIPT_UNDER_TEST }?${ randomUUID() }` );

		expect( releaseTools.getVersionForTag ).toHaveBeenCalledTimes( 1 );
		expect( releaseTools.getVersionForTag ).toHaveBeenCalledWith( 'ckeditor5', 'latest' );

		expect( releaseTools.reassignNpmTags ).toHaveBeenCalledTimes( 1 );
		expect( releaseTools.reassignNpmTags ).toHaveBeenNthCalledWith( 1, expect.objectContaining( {
			version: '47.1.1',
			packages: packageNames,
			npmTag: 'lts-v47'
		} ) );
		expect( releaseTools.reassignNpmTags ).not.toHaveBeenCalledWith( expect.objectContaining( {
			npmTag: 'latest'
		} ) );
	} );
} );
