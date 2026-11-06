/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Listr } from 'listr2';
import fs from 'fs-extra';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import parseArguments from '../../scripts/release/utils/parsearguments.mjs';

vi.mock( 'fs-extra' );
vi.mock( '@ckeditor/ckeditor5-dev-release-tools' );
vi.mock( '@listr2/prompt-adapter-inquirer', () => ( { ListrInquirerPromptAdapter: class {} } ) );
vi.mock( '@inquirer/prompts', () => ( { confirm: vi.fn() } ) );
vi.mock( '../../scripts/release/utils/validatedependenciesversions.mjs' );
vi.mock( '../../scripts/release/utils/parsearguments.mjs' );
vi.mock( '../../scripts/release/utils/getlistroptions.mjs' );
vi.mock( 'listr2', () => ( {
	Listr: vi.fn( function FakeListr() {
		this.run = vi.fn().mockReturnValue( Promise.resolve( undefined ) );
	} )
} ) );

// Finds a Listr task definition by its title and returns its `task` callback.
// A plain `throw` keeps `beforeEach()` hooks free of `expect()` calls (`vitest/no-standalone-expect`).
function findTask( definitions, title ) {
	const definition = definitions.find( item => item.title === title );

	if ( !definition || !( definition.task instanceof Function ) ) {
		throw new Error( `Expected to find a task definition with the "${ title }" title.` );
	}

	return definition.task;
}

describe( 'scripts/release/publishpackages', () => {
	let definitions;

	// The CLI arguments are read when the script is imported, so each set of arguments needs a fresh import.
	async function importScript( cliArguments ) {
		vi.resetModules();
		vi.mocked( Listr ).mockClear();
		vi.mocked( parseArguments ).mockReturnValue( cliArguments );

		await import( '../../scripts/release/publishpackages.mjs' );

		return vi.mocked( Listr ).mock.calls[ 0 ][ 0 ];
	}

	beforeEach( async () => {
		vi.mocked( fs.readJsonSync ).mockReturnValue( { version: '47.0.0' } );

		definitions = await importScript( { npmTag: null, ci: true } );
	} );

	describe( 'Preparing the release options.', () => {
		it( 'should be the first task', () => {
			expect( definitions[ 0 ].title ).toEqual( 'Preparing the release options.' );
		} );

		it( 'should use the per-version staging tag for a stable release', () => {
			const ctx = {};

			findTask( definitions, 'Preparing the release options.' )( ctx );

			expect( ctx ).toEqual( { npmTag: 'staging-v47.0.0' } );
		} );

		it( 'should use the npm tag given in the CLI arguments', async () => {
			const nightlyDefinitions = await importScript( { npmTag: 'nightly', ci: true } );
			const ctx = {};

			findTask( nightlyDefinitions, 'Preparing the release options.' )( ctx );

			expect( ctx ).toEqual( { npmTag: 'nightly' } );
		} );
	} );

	describe( 'Publishing packages.', () => {
		let task;

		beforeEach( () => {
			task = findTask( definitions, 'Publishing packages.' );
		} );

		it( 'should publish packages using npm Trusted Publishing (OIDC)', async () => {
			await task( { npmTag: 'staging-v47.0.0' }, {} );

			expect( releaseTools.publishPackages ).toHaveBeenCalledExactlyOnceWith( expect.objectContaining( {
				useOidc: true
			} ) );

			// `npm whoami` does not reflect OIDC authentication, so the npm account must not be verified.
			expect( vi.mocked( releaseTools.publishPackages ).mock.calls[ 0 ][ 0 ] ).not.toHaveProperty( 'npmOwner' );
		} );

		it( 'should publish packages under the npm tag from the task context', async () => {
			await task( { npmTag: 'example-tag' }, {} );

			expect( releaseTools.publishPackages ).toHaveBeenCalledExactlyOnceWith( expect.objectContaining( {
				npmTag: 'example-tag'
			} ) );
		} );

		it( 'should not ask for a confirmation on CI', async () => {
			await task( { npmTag: 'staging-v47.0.0' }, {} );

			const { confirmationCallback } = vi.mocked( releaseTools.publishPackages ).mock.calls[ 0 ][ 0 ];

			expect( confirmationCallback() ).toEqual( true );
		} );
	} );
} );
