/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it, vi } from 'vitest';
import { globSync } from 'glob';
import { getFilePaths } from '../../../../scripts/ci/exports/utils/getfilepaths.mjs';

vi.mock( 'glob' );

vi.mock( '../../../../scripts/constants.mjs', () => ( {
	CKEDITOR5_ROOT_PATH: '/ckeditor5',
	CKEDITOR5_COMMERCIAL_PATH: '/ckeditor5-commercial'
} ) );

describe( 'scripts/ci/exports/utils/getfilepaths', () => {
	it( 'should glob TypeScript sources of both the ckeditor5 and ckeditor5-commercial packages', () => {
		vi.mocked( globSync ).mockReturnValue( [] );

		getFilePaths();

		expect( globSync ).toHaveBeenCalledWith( [
			'/ckeditor5/packages/*/src/**/*.ts',
			'/ckeditor5-commercial/packages/*/src/**/*.ts'
		] );
	} );

	it( 'should return normalized and sorted file paths', () => {
		vi.mocked( globSync ).mockReturnValue( [
			'/ckeditor5/packages/ckeditor5-engine/src/model/model.ts',
			'\\ckeditor5\\packages\\ckeditor5-core\\src\\plugin.ts',
			'/ckeditor5/packages/ckeditor5-core/src/editor/editor.ts'
		] );

		expect( getFilePaths() ).toEqual( [
			'/ckeditor5/packages/ckeditor5-core/src/editor/editor.ts',
			'/ckeditor5/packages/ckeditor5-core/src/plugin.ts',
			'/ckeditor5/packages/ckeditor5-engine/src/model/model.ts'
		] );
	} );

	it( 'should exclude TypeScript declaration files except the cloud services collaboration ones', () => {
		vi.mocked( globSync ).mockReturnValue( [
			'/ckeditor5/packages/ckeditor5-core/src/plugin.ts',
			'/ckeditor5/packages/ckeditor5-core/src/plugin.d.ts',
			'/ckeditor5-commercial/external/ckeditor-cloud-services-collaboration/src/gateway.d.ts'
		] );

		expect( getFilePaths() ).toEqual( [
			'/ckeditor5-commercial/external/ckeditor-cloud-services-collaboration/src/gateway.d.ts',
			'/ckeditor5/packages/ckeditor5-core/src/plugin.ts'
		] );
	} );

	it( 'should exclude packages that do not take part in the re-export validation', () => {
		vi.mocked( globSync ).mockReturnValue( [
			'/ckeditor5/packages/ckeditor5/src/index.ts',
			'/ckeditor5/packages/ckeditor5-build-classic/src/index.ts',
			'/ckeditor5/packages/ckeditor5-icons/src/index.ts',
			'/ckeditor5-commercial/packages/ckeditor5-operations-compressor/src/index.ts',
			'/ckeditor5-commercial/packages/ckeditor5-premium-features/src/index.ts',
			'/ckeditor5/packages/ckeditor5-core/src/plugin.ts'
		] );

		expect( getFilePaths() ).toEqual( [
			'/ckeditor5/packages/ckeditor5-core/src/plugin.ts'
		] );
	} );
} );
