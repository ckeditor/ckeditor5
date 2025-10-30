/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { npm } from '@ckeditor/ckeditor5-dev-utils';
import fetchCKEditor5LtsVersion from '../../scripts/docs/fetch-ckeditor5-lts-version.mjs';

vi.mock( '@ckeditor/ckeditor5-dev-utils' );

describe( 'fetchCKEditor5LtsVersion', () => {
	let warnSpy;
	let errorSpy;

	beforeEach( () => {
		warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		errorSpy = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
	} );

	it( 'adds variables object when missing and sets the LTS version', async () => {
		const config = {};
		const version = '47.2.3';

		vi.mocked( npm.manifest ).mockResolvedValue( { version } );

		await fetchCKEditor5LtsVersion( config );

		expect( npm.manifest ).toHaveBeenCalledTimes( 1 );
		expect( npm.manifest ).toHaveBeenCalledWith( 'ckeditor5@lts-v47' );

		expect( config.variables ).toBeDefined();
		expect( config.variables.CKEDITOR_5_VERSION_LTS_V47 ).toBe( version );

		expect( warnSpy ).not.toHaveBeenCalled();
		expect( errorSpy ).not.toHaveBeenCalled();
	} );

	it( 'overrides existing variable and warns', async () => {
		const config = {
			variables: {
				CKEDITOR_5_VERSION_LTS_V47: 'old-value'
			}
		};
		const version = '47.0.0';

		vi.mocked( npm.manifest ).mockResolvedValue( { version } );

		await fetchCKEditor5LtsVersion( config );

		expect( config.variables.CKEDITOR_5_VERSION_LTS_V47 ).toBe( version );

		expect( warnSpy ).toHaveBeenCalledTimes( 1 );
		expect( warnSpy ).toHaveBeenCalledWith( 'The "CKEDITOR_5_VERSION_LTS_V47" will be overridden by a hook.' );
	} );

	it( 'logs the original error message and rethrows a friendly error when manifest fails', async () => {
		const config = { variables: {} };
		const originalError = new Error( 'Registry unreachable' );

		vi.mocked( npm.manifest ).mockRejectedValue( originalError );

		await expect( fetchCKEditor5LtsVersion( config ) ).rejects.toThrow(
			'Cannot determine an LTS version.'
		);

		expect( errorSpy ).toHaveBeenCalledTimes( 1 );
		expect( errorSpy ).toHaveBeenCalledWith( 'Registry unreachable' );
		expect( config.variables.CKEDITOR_5_VERSION_LTS_V47 ).toBeUndefined();
	} );
} );
