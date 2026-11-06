/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import getStaleStagingTags from '../../../scripts/release/utils/getstalestagingtags.mjs';

describe( 'scripts/release/utils/getstalestagingtags', () => {
	it( 'returns the staging name of the released version', () => {
		expect( getStaleStagingTags( [ 'staging-v48.5.3' ], '48.5.3' ) ).toEqual( [ 'staging-v48.5.3' ] );
	} );

	it( 'returns the staging names of older versions of the same major', () => {
		const names = [ 'staging-v48.5.1', 'staging-v48.5.2', 'staging-v48.0.0' ];

		expect( getStaleStagingTags( names, '48.5.3' ) ).toEqual( names );
	} );

	it( 'keeps the staging names of other majors', () => {
		expect( getStaleStagingTags( [ 'staging-v47.7.7', 'staging-v49.0.2' ], '48.5.3' ) ).toEqual( [] );
	} );

	it( 'keeps the staging names of newer versions of the same major', () => {
		expect( getStaleStagingTags( [ 'staging-v48.5.4', 'staging-v48.6.0' ], '48.5.3' ) ).toEqual( [] );
	} );

	it( 'does not treat a major that starts with the same digits as the same line', () => {
		expect( getStaleStagingTags( [ 'staging-v4.0.0', 'staging-v480.0.0' ], '48.5.3' ) ).toEqual( [] );
	} );

	it( 'keeps names that are not per-version staging names', () => {
		const names = [ 'staging', 'latest', 'lts-v48', 'nightly', 'staging-v', 'staging-vfoo', 'staging-48.5.3', '48.5.3' ];

		expect( getStaleStagingTags( names, '48.5.3' ) ).toEqual( [] );
	} );
} );
