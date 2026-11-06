/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import getZipName from '../../../scripts/release/utils/getzipname.mjs';

describe( 'scripts/release/utils/getzipname', () => {
	it( 'returns the version for a stable release', () => {
		expect( getZipName( 'ckeditor5', {}, '49.0.1' ) ).toEqual( 'ckeditor5-49.0.1' );
	} );

	it( 'returns the given package name', () => {
		expect( getZipName( 'ckeditor5-premium-features', {}, '49.0.1' ) ).toEqual( 'ckeditor5-premium-features-49.0.1' );
	} );

	it( 'returns "nightly" for a nightly release', () => {
		expect( getZipName( 'ckeditor5', { nightly: true }, '0.0.0-nightly-20261027.0' ) ).toEqual( 'ckeditor5-nightly' );
	} );

	it( 'returns "nightly-next" for a nightly-next release', () => {
		expect( getZipName( 'ckeditor5', { nightlyNext: true }, '0.0.0-nightly-next-20261027.0' ) ).toEqual( 'ckeditor5-nightly-next' );
	} );

	it( 'returns "alpha" for a nightly alpha release', () => {
		expect( getZipName( 'ckeditor5', { nightlyAlpha: true }, '50.0.0-alpha.0' ) ).toEqual( 'ckeditor5-alpha' );
	} );

	it( 'returns "internal" for an internal release', () => {
		expect( getZipName( 'ckeditor5', { internal: true }, '0.0.0-internal-20261027.0' ) ).toEqual( 'ckeditor5-internal' );
	} );
} );
