/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import { globSync } from 'glob';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock( '../../scripts/ci/exports/utils/getfilepaths.mjs', () => ( {
	getFilePaths: vi.fn()
} ) );

vi.mock( 'chalk', () => {
	const passthrough = text => text;

	return {
		default: {
			red: passthrough,
			green: passthrough,
			yellow: passthrough,
			blackBright: passthrough
		}
	};
} );

const FIXTURES_PATH = upath.join( import.meta.dirname, 'exports', '_fixtures', 'main' );

function getFixtureFilePaths( fixtureName ) {
	return globSync( upath.join( FIXTURES_PATH, fixtureName, 'packages', '*', 'src', '**', '*.ts' ) )
		.map( upath.normalize )
		.sort();
}

describe( 'scripts/ci/validate-module-re-exports', () => {
	let getFilePaths;

	beforeEach( async () => {
		vi.resetModules();

		( { getFilePaths } = await import( '../../scripts/ci/exports/utils/getfilepaths.mjs' ) );

		vi.spyOn( console, 'log' ).mockImplementation( () => {} );
		vi.spyOn( console, 'error' ).mockImplementation( () => {} );
		vi.spyOn( process, 'exit' ).mockImplementation( () => {} );
	} );

	async function runValidation( fixtureName ) {
		const filePaths = getFixtureFilePaths( fixtureName );

		expect( filePaths ).not.toHaveLength( 0 );

		vi.mocked( getFilePaths ).mockReturnValue( filePaths );

		await import( '../../scripts/ci/validate-module-re-exports.mjs' );

		// The script does not expose its `main()` promise, so wait until it either succeeds or fails.
		await vi.waitFor( () => {
			expect(
				vi.mocked( console.log ).mock.calls.flat().join( '\n' ).includes( 'All packages exports are valid' ) ||
				vi.mocked( process.exit ).mock.calls.length > 0
			).toBe( true );
		} );

		return vi.mocked( console.log ).mock.calls.flat().join( '\n' );
	}

	it( 'should pass for a package re-exporting its public API from the package index', async () => {
		const output = await runValidation( 'valid' );

		expect( output ).toContain( 'All packages exports are valid' );
		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'should report a public tree export that is not re-exported from the package index', async () => {
		const output = await runValidation( 'missing-re-export' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( output ).toContain( 'Detected incorrect exports' );
		expect( output ).toContain( 'BetaOther' );
		expect( output ).toContain( 'Add re-export' );
	} );

	it( 'should report a re-export under a different name than the local one', async () => {
		const output = await runValidation( 'renamed-re-export' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( output ).toContain( 'GammaFeature' );
		expect( output ).toContain( 'Unify local name with re-exported name' );
	} );

	it( 'should report an export violating the naming policy', async () => {
		const output = await runValidation( 'naming' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( output ).toContain( 'SomethingElse' );
		expect( output ).toContain( 'Rename: include \'Delta\'' );
	} );

	it( 'should report an `@internal` export re-exported from the index of a private package', async () => {
		const output = await runValidation( 'internal-re-export' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( output ).toContain( 'EpsilonHelper' );
		expect( output ).toContain( 'Remove from index or @internal.' );
	} );

	it( 'should report a non-exported declaration used across packages', async () => {
		const output = await runValidation( 'missing-export' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( output ).toContain( 'ZetaHelper' );
		expect( output ).toContain( 'Add export & re-export' );
	} );

	it( 'should report a public declaration referencing an `@internal` declaration in a private package', async () => {
		const output = await runValidation( 'internal-reference' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( output ).toContain( 'ThetaFeature' );
		expect( output ).toContain( 'ThetaInternalHelper' );
		expect( output ).toContain( 'Do not reference @internal symbols from public declarations' );
	} );
} );
