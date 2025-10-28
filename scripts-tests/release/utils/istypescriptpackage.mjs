/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { vi, describe, it, expect } from 'vitest';
import { glob } from 'glob';
import isTypeScriptPackage from '../../../scripts/release/utils/istypescriptpackage.mjs';

vi.mock( 'glob' );

describe( 'scripts/release/utils/istypescriptpackage', () => {
	const packagePath = '/packages/foo';

	it( 'returns true if TypeScript files are found', async () => {
		vi.mocked( glob ).mockResolvedValue( [ 'test.ts' ] );

		const result = await isTypeScriptPackage( packagePath );

		expect( result ).toBe( true );
	} );

	it( 'returns false if no TypeScript files are found', async () => {
		vi.mocked( glob ).mockResolvedValue( [] );

		const result = await isTypeScriptPackage( packagePath );

		expect( result ).toBe( false );
	} );
} );

