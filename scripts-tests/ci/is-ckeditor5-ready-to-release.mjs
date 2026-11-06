/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import { npm } from '@ckeditor/ckeditor5-dev-utils';

vi.mock( '@ckeditor/ckeditor5-dev-release-tools' );
vi.mock( '@ckeditor/ckeditor5-dev-utils', () => ( { npm: { checkVersionAvailability: vi.fn() } } ) );

describe( 'scripts/ci/is-ckeditor5-ready-to-release', () => {
	beforeEach( () => {
		vi.resetModules();

		vi.spyOn( console, 'log' ).mockImplementation( vi.fn() );

		// Unlike the real `process.exit()`, a mocked one does not stop the execution. Throw instead,
		// so the script cannot run past an exit point.
		vi.spyOn( process, 'exit' ).mockImplementation( code => {
			throw new Error( `process.exit( ${ code } )` );
		} );

		vi.mocked( releaseTools.getLastFromChangelog ).mockReturnValue( '49.0.2' );
	} );

	function runScript() {
		return import( '../../scripts/ci/is-ckeditor5-ready-to-release.mjs' );
	}

	it( 'reports a stable changelog version that is not on npm as ready to release', async () => {
		vi.mocked( npm.checkVersionAvailability ).mockResolvedValue( true );

		await runScript();

		expect( npm.checkVersionAvailability ).toHaveBeenCalledExactlyOnceWith( '49.0.2', 'ckeditor5' );
		expect( console.log ).toHaveBeenCalledWith( 'CKEditor 5 is ready to release.' );
	} );

	it( 'stops when the changelog version is already on npm (a release commit)', async () => {
		vi.mocked( npm.checkVersionAvailability ).mockResolvedValue( false );

		await expect( runScript() ).rejects.toThrow( 'process.exit( 1 )' );

		expect( console.log ).toHaveBeenCalledWith( 'The proposed changelog (49.0.2) version is already published.' );
	} );

	it( 'stops when npm cannot tell if the changelog version is published', async () => {
		vi.mocked( npm.checkVersionAvailability ).mockRejectedValue( new Error( 'connect ECONNREFUSED' ) );

		await expect( runScript() ).rejects.toThrow( 'process.exit( 1 )' );

		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'Cannot check if the proposed changelog (49.0.2)' ) );
		expect( console.log ).not.toHaveBeenCalledWith( 'CKEditor 5 is ready to release.' );
	} );

	it( 'stops for a pre-release changelog version without asking npm', async () => {
		vi.mocked( releaseTools.getLastFromChangelog ).mockReturnValue( '50.0.0-alpha.0' );

		await expect( runScript() ).rejects.toThrow( 'process.exit( 1 )' );

		expect( npm.checkVersionAvailability ).not.toHaveBeenCalled();
	} );
} );
