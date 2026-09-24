/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs-extra';
import { tools } from '@ckeditor/ckeditor5-dev-utils';
import prepareDllBuildsCallback from '../../../scripts/release/utils/preparedllbuildscallback.mjs';

vi.mock( 'fs-extra' );
vi.mock( '@ckeditor/ckeditor5-dev-utils', () => ( {
	tools: {
		shExec: vi.fn()
	}
} ) );

describe( 'scripts/release/utils/preparedllbuildscallback', () => {
	const packagePath = '/workspace/packages/ckeditor5-foo';

	beforeEach( () => {
		vi.mocked( tools.shExec ).mockResolvedValue( '' );
	} );

	it( 'reads "package.json" of the given package', async () => {
		vi.mocked( fs.readJson ).mockResolvedValue( { scripts: {} } );

		await prepareDllBuildsCallback( packagePath );

		expect( fs.readJson ).toHaveBeenCalledTimes( 1 );
		expect( fs.readJson ).toHaveBeenCalledWith( '/workspace/packages/ckeditor5-foo/package.json' );
	} );

	it( 'does nothing if the package does not define the "dll:build" script', async () => {
		vi.mocked( fs.readJson ).mockResolvedValue( { scripts: { build: 'tsc' } } );

		await prepareDllBuildsCallback( packagePath );

		expect( tools.shExec ).not.toHaveBeenCalled();
	} );

	it( 'does nothing if the package does not define any scripts', async () => {
		vi.mocked( fs.readJson ).mockResolvedValue( {} );

		await prepareDllBuildsCallback( packagePath );

		expect( tools.shExec ).not.toHaveBeenCalled();
	} );

	it( 'builds the DLL bundle in the package directory', async () => {
		vi.mocked( fs.readJson ).mockResolvedValue( { scripts: { 'dll:build': 'webpack' } } );

		await prepareDllBuildsCallback( packagePath );

		expect( tools.shExec ).toHaveBeenCalledTimes( 1 );
		expect( tools.shExec ).toHaveBeenCalledWith( 'pnpm --config.verify-deps-before-run=false run dll:build', {
			cwd: packagePath,
			async: true,
			verbosity: 'error'
		} );
	} );

	// A package in a release directory is not a member of the pnpm workspace, so the workspace settings do not apply there.
	// Without the flag, pnpm 11.27.1+ runs `pnpm install` on its own before the script and fails.
	it( 'disables the pnpm dependency check before running the "dll:build" script', async () => {
		vi.mocked( fs.readJson ).mockResolvedValue( { scripts: { 'dll:build': 'webpack' } } );

		await prepareDllBuildsCallback( packagePath );

		const [ command ] = vi.mocked( tools.shExec ).mock.calls[ 0 ];

		expect( command ).toMatch( /^pnpm --config\.verify-deps-before-run=false run dll:build$/ );
	} );

	// `executeInParallel()` passes `null` as the task options when none are specified.
	it( 'builds the DLL bundle when the task options are `null`', async () => {
		vi.mocked( fs.readJson ).mockResolvedValue( { scripts: { 'dll:build': 'webpack' } } );

		await prepareDllBuildsCallback( packagePath, null );

		expect( tools.shExec ).toHaveBeenCalledWith( 'pnpm --config.verify-deps-before-run=false run dll:build', expect.any( Object ) );
	} );

	it( 'rejects if the build fails', async () => {
		vi.mocked( fs.readJson ).mockResolvedValue( { scripts: { 'dll:build': 'webpack' } } );
		vi.mocked( tools.shExec ).mockRejectedValue( new Error( 'Error while executing pnpm run dll:build' ) );

		await expect( prepareDllBuildsCallback( packagePath ) ).rejects.toThrow( 'Error while executing pnpm run dll:build' );
	} );
} );
