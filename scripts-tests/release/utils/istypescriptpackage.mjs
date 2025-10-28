/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { vi, describe, it, expect } from 'vitest';
import fs from 'fs-extra';
import { glob } from 'glob';
import isTypeScriptPackage from '../../../scripts/release/utils/istypescriptpackage.mjs';

vi.mock( 'fs-extra' );
vi.mock( 'glob' );

describe( 'scripts/release/utils/istypescriptpackage', () => {
	const packagePath = '/packages/foo';

	it( 'returns true if package.json.main points to a TypeScript file', async () => {
		vi.mocked( fs.readJson ).mockResolvedValue( { main: 'src/index.ts' } );

		const result = await isTypeScriptPackage( packagePath );

		expect( fs.readJson ).toHaveBeenCalledWith( '/packages/foo/package.json' );
		expect( result ).toBe( true );
	} );

	it( 'returns true if tsconfig.json exists', async () => {
		vi.mocked( fs.readJson ).mockResolvedValue( { main: 'lib/index.js' } );
		vi.mocked( fs.access ).mockResolvedValue( undefined );
		vi.mocked( glob ).mockResolvedValue( [] );

		const result = await isTypeScriptPackage( packagePath );

		expect( fs.access ).toHaveBeenCalledWith( '/packages/foo/tsconfig.json', fs.constants.F_OK );
		expect( result ).toBe( true );
	} );

	it( 'returns true if any .ts files exist in src directory', async () => {
		vi.mocked( fs.readJson ).mockResolvedValue( { main: 'lib/index.js' } );
		vi.mocked( fs.access ).mockRejectedValue( new Error( 'not found' ) );
		vi.mocked( glob ).mockResolvedValue( [ 'src/index.ts', 'src/utils/helper.ts' ] );

		const result = await isTypeScriptPackage( packagePath );

		expect( glob ).toHaveBeenCalledWith( 'src/**/*.ts', { cwd: packagePath } );
		expect( result ).toBe( true );
	} );

	it( 'returns false if no TypeScript indicators are found', async () => {
		vi.mocked( fs.readJson ).mockResolvedValue( { main: 'lib/index.js' } );
		vi.mocked( fs.access ).mockRejectedValue( new Error( 'not found' ) );
		vi.mocked( glob ).mockResolvedValue( [] );

		const result = await isTypeScriptPackage( packagePath );

		expect( result ).toBe( false );
	} );

	it( 'throws if reading package.json fails', async () => {
		vi.mocked( fs.readJson ).mockRejectedValue( new Error( 'package.json not found' ) );

		await expect( isTypeScriptPackage( packagePath ) ).rejects.toThrow( 'package.json not found' );
	} );
} );

