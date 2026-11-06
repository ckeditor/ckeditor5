/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import getCdnVersion from '../../../scripts/release/utils/getcdnversion.mjs';

describe( 'scripts/release/utils/getcdnversion', () => {
	it( 'returns the per-version staging name for a stable release', () => {
		expect( getCdnVersion( {}, '49.0.1' ) ).toEqual( 'staging-v49.0.1' );
	} );

	it( 'returns "nightly" for a nightly release', () => {
		expect( getCdnVersion( { nightly: true }, '0.0.0-nightly-20261027.0' ) ).toEqual( 'nightly' );
	} );

	it( 'returns "nightly-next" for a nightly-next release', () => {
		expect( getCdnVersion( { nightlyNext: true }, '0.0.0-nightly-next-20261027.0' ) ).toEqual( 'nightly-next' );
	} );

	it( 'returns "alpha" for a nightly alpha release', () => {
		expect( getCdnVersion( { nightlyAlpha: true }, '50.0.0-alpha.0' ) ).toEqual( 'alpha' );
	} );

	it( 'returns "internal" for an internal release', () => {
		expect( getCdnVersion( { internal: true }, '0.0.0-internal-20261027.0' ) ).toEqual( 'internal' );
	} );
} );
