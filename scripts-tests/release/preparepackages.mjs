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

// Finds a Listr task definition by its title and returns its `task` callback.
// A plain `throw` keeps `beforeEach()` hooks free of `expect()` calls (`vitest/no-standalone-expect`).
function findTask( definitions, title ) {
	const definition = definitions.find( item => item.title === title );

	if ( !definition || !( definition.task instanceof Function ) ) {
		throw new Error( `Expected to find a task definition with the "${ title }" title.` );
	}

	return definition.task;
}

describe( 'scripts/release/preparepackages', () => {
	let listrTasks;

	beforeEach( async () => {
		vi.resetModules();

		await import( '../../scripts/release/preparepackages.mjs' );

		listrTasks = vi.mocked( Listr ).mock.calls[ 0 ][ 0 ];
	} );

	describe( 'Verify release directory.', () => {
		let task;

		beforeEach( () => {
			task = findTask( listrTasks, 'Verify release directory.' );
		} );

		it( 'does not reject if the directory is not empty', async () => {
			vi.mocked( fs.readdir ).mockResolvedValue( [ 'directoryFoo', 'file.txt' ] );

			await expect( task() ).resolves.toBeUndefined();
		} );

		it( 'does reject if the directory is empty', async () => {
			vi.mocked( fs.readdir ).mockResolvedValue( [] );

			await expect( task() ).rejects.toEqual( 'Release directory is empty, aborting.' );
		} );
	} );
} );
