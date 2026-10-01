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
	let task;

	beforeEach( async () => {
		vi.resetModules();

		vi.mocked( fs.readJsonSync ).mockReturnValue( { version: '47.0.0' } );
		vi.mocked( parseArguments ).mockReturnValue( { npmTag: 'staging', ci: true } );

		await import( '../../scripts/release/publishpackages.mjs' );

		task = findTask( vi.mocked( Listr ).mock.calls[ 0 ][ 0 ], 'Publishing packages.' );
	} );

	describe( 'Publishing packages.', () => {
		it( 'should publish packages using npm Trusted Publishing (OIDC)', async () => {
			await task( {}, {} );

			expect( releaseTools.publishPackages ).toHaveBeenCalledExactlyOnceWith( expect.objectContaining( {
				useOidc: true,
				npmTag: 'staging'
			} ) );

			// `npm whoami` does not reflect OIDC authentication, so the npm account must not be verified.
			expect( vi.mocked( releaseTools.publishPackages ).mock.calls[ 0 ][ 0 ] ).not.toHaveProperty( 'npmOwner' );
		} );

		it( 'should not ask for a confirmation on CI', async () => {
			await task( {}, {} );

			const { confirmationCallback } = vi.mocked( releaseTools.publishPackages ).mock.calls[ 0 ][ 0 ];

			expect( confirmationCallback() ).toEqual( true );
		} );
	} );
} );
