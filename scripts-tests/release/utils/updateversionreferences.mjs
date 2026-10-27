/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { vi, describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import upath from 'upath';
import { CKEDITOR5_ROOT_PATH } from '../../../scripts/constants.mjs';
import updateVersionReferences, { VERSION_REFERENCE_FILES } from '../../../scripts/release/utils/updateversionreferences.mjs';

vi.mock( 'node:fs/promises', async importOriginal => {
	const actual = await importOriginal();

	return {
		...actual,
		default: {
			...actual.default,
			access: vi.fn(),
			readFile: vi.fn(),
			writeFile: vi.fn()
		}
	};
} );

const VERSION_FILE = 'packages/ckeditor5-utils/src/version.ts';

const VERSION_FILE_CONTENT = [
	'export const version = \'49.0.0\';',
	'',
	'// The second argument is not a month. It is `monthIndex` and starts from `0`.',
	'export const releaseDate: Date = new Date( 2026, 5, 2 );',
	''
].join( '\n' );

// Month index is zero-based, so `9` means October.
const RELEASE_DATE = new Date( 2026, 9, 8 );

describe( 'scripts/release/utils/updateversionreferences', () => {
	describe( 'VERSION_REFERENCE_FILES', () => {
		it( 'lists each file once', () => {
			expect( VERSION_REFERENCE_FILES ).toEqual( [ VERSION_FILE ] );
		} );
	} );

	describe( 'updateVersionReferences()', () => {
		it( 'updates the version and the release date in "version.ts"', async () => {
			mockFiles( { [ VERSION_FILE ]: VERSION_FILE_CONTENT } );

			const updatedFiles = await updateVersionReferences( { version: '49.1.0', releaseDate: RELEASE_DATE } );

			expect( updatedFiles ).toEqual( [ VERSION_FILE ] );
			expect( fs.writeFile ).toHaveBeenLastCalledWith(
				upath.join( CKEDITOR5_ROOT_PATH, VERSION_FILE ),
				VERSION_FILE_CONTENT
					.replace( '49.0.0', '49.1.0' )
					.replace( '2026, 5, 2', '2026, 9, 8' )
			);
		} );

		it( 'updates the release date when the declaration has no type annotation', async () => {
			mockFiles( { [ VERSION_FILE ]: VERSION_FILE_CONTENT.replace( 'releaseDate: Date', 'releaseDate' ) } );

			await updateVersionReferences( { version: '49.1.0', releaseDate: RELEASE_DATE } );

			expect( fs.writeFile ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.stringContaining( 'export const releaseDate = new Date( 2026, 9, 8 );' )
			);
		} );

		it( 'updates the release date in the actual "version.ts" file (regression)', async () => {
			// Read the real file so the test fails when the declaration changes shape again
			// and the pattern stops matching.
			const { default: actualFs } = await vi.importActual( 'node:fs/promises' );
			const actualContent = await actualFs.readFile( upath.join( CKEDITOR5_ROOT_PATH, VERSION_FILE ), 'utf-8' );

			mockFiles( { [ VERSION_FILE ]: actualContent } );

			const updatedFiles = await updateVersionReferences( { version: '49.1.0', releaseDate: RELEASE_DATE } );

			expect( updatedFiles ).toEqual( [ VERSION_FILE ] );

			const [ , newContent ] = vi.mocked( fs.writeFile ).mock.lastCall;

			expect( newContent ).toContain( 'const version = \'49.1.0\';' );
			expect( newContent ).toMatch( /const releaseDate: Date = new Date\( 2026, 9, 8 \);/ );
		} );

		it( 'does not write a file when its references are already up to date', async () => {
			mockFiles( { [ VERSION_FILE ]: VERSION_FILE_CONTENT } );

			const updatedFiles = await updateVersionReferences( { version: '49.0.0', releaseDate: new Date( 2026, 5, 2 ) } );

			expect( updatedFiles ).toEqual( [] );
			expect( fs.writeFile ).not.toHaveBeenCalled();
		} );

		it( 'skips files that do not exist', async () => {
			mockFiles( {} );

			const updatedFiles = await updateVersionReferences( { version: '49.1.0', releaseDate: RELEASE_DATE } );

			expect( updatedFiles ).toEqual( [] );
			expect( fs.readFile ).not.toHaveBeenCalled();
			expect( fs.writeFile ).not.toHaveBeenCalled();
		} );

		it( 'throws when the release date declaration does not match the expected pattern', async () => {
			mockFiles( {
				[ VERSION_FILE ]: VERSION_FILE_CONTENT.replace( 'new Date( 2026, 5, 2 )', 'new Date( \'2026-06-02\' )' )
			} );

			await expect( updateVersionReferences( { version: '49.1.0', releaseDate: RELEASE_DATE } ) )
				.rejects.toThrow( `The "${ VERSION_FILE }" file does not match the expected pattern` );

			// The version reference matched, so it has been written before the error.
			expect( fs.writeFile ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'throws when the version declaration does not match the expected pattern', async () => {
			mockFiles( { [ VERSION_FILE ]: VERSION_FILE_CONTENT.replace( 'const version =', 'const VERSION =' ) } );

			await expect( updateVersionReferences( { version: '49.1.0', releaseDate: RELEASE_DATE } ) )
				.rejects.toThrow( `The "${ VERSION_FILE }" file does not match the expected pattern` );

			expect( fs.writeFile ).not.toHaveBeenCalled();
		} );
	} );
} );

/**
 * Mocks the file system with the given files (repo-relative path => content).
 * Written content is stored, so a later read of the same file returns the updated content.
 */
function mockFiles( files ) {
	const toRelative = absolutePath => upath.relative( CKEDITOR5_ROOT_PATH, absolutePath );

	vi.mocked( fs.writeFile ).mockImplementation( async ( absolutePath, content ) => {
		files[ toRelative( absolutePath ) ] = content;
	} );

	vi.mocked( fs.access ).mockImplementation( async absolutePath => {
		if ( !( toRelative( absolutePath ) in files ) ) {
			throw new Error( 'ENOENT' );
		}
	} );

	vi.mocked( fs.readFile ).mockImplementation( async absolutePath => files[ toRelative( absolutePath ) ] );
}
