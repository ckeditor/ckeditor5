/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import injectCKBoxVersion from '../../scripts/docs/inject-ckbox-version.mjs';

vi.mock( '../../package.json', () => ( {
	default: {
		devDependencies: {
			ckbox: '2.0.0'
		}
	}
} ) );

describe( 'injectCKBoxVersion', () => {
	it( 'adds variables object when missing and sets the CKBox version', async () => {
		const config = {};

		await injectCKBoxVersion( config );

		expect( config.variables ).toEqual( {
			CKBOX_VERSION: '2.0.0'
		} );
	} );

	it( 'keeps existing variables and adds CKBOX_VERSION to the same object', async () => {
		const variables = {
			SOME_VARIABLE: 'foo'
		};
		const config = { variables };

		await injectCKBoxVersion( config );

		expect( config.variables ).toBe( variables );
		expect( config.variables ).toEqual( {
			SOME_VARIABLE: 'foo',
			CKBOX_VERSION: '2.0.0'
		} );
	} );

	it( 'overrides an existing CKBOX_VERSION value', async () => {
		const config = {
			variables: {
				CKBOX_VERSION: '0.0.0'
			}
		};

		await injectCKBoxVersion( config );

		expect( config.variables.CKBOX_VERSION ).toBe( '2.0.0' );
	} );
} );
