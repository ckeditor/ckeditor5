/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Listr } from 'listr2';
import fs from 'fs-extra';

vi.mock( 'fs-extra' );
vi.mock( 'listr2', () => ( {
	Listr: vi.fn( function FakeListr() {
		this.run = vi.fn().mockReturnValue( Promise.resolve( undefined ) );
	} )
} ) );

describe( 'scripts/release/preparepackages', () => {
	let listrTasks;

	beforeEach( async () => {
		vi.resetModules();

		await import( '../../scripts/release/preparepackages.mjs' );

		listrTasks = vi.mocked( Listr ).mock.calls[ 0 ][ 0 ];
	} );

	describe( 'Verify release directory.', async () => {
		let task;

		beforeEach( () => {
			task = listrTasks.find( ( { title } ) => title === 'Verify release directory.' ).task;

			expect( task ).toBeInstanceOf( Function );
		} );

		it( 'does not reject if the directory is not empty', async () => {
			vi.mocked( fs.readdir ).mockResolvedValue( [ 'directoryFoo', 'file.txt' ] );

			try {
				const result = await task();

				expect( result ).toEqual( undefined );
			} catch ( err ) {
				throw new Error( `Expected not to throw, instead threw: ${ err }` );
			}
		} );

		it( 'does reject if the directory is empty', async () => {
			vi.mocked( fs.readdir ).mockResolvedValue( [] );

			try {
				await task();

				throw new Error( 'Test case did not throw as expected.' );
			} catch ( err ) {
				expect( err ).toEqual( 'Release directory is empty, aborting.' );
			}
		} );
	} );
} );
