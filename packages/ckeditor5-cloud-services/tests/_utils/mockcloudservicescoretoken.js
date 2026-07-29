/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { vi } from 'vitest';

import { CloudServicesCore } from '../../src/cloudservicescore.js';
import { TokenMock } from './tokenmock.js';

/**
 * Replaces `CloudServicesCore#createToken()` with a spy returning a `TokenMock`, so editors and contexts
 * using Cloud Services can boot in tests without a real network token fetch.
 *
 * Call it before `Editor.create()` or `Context.create()` — in `beforeEach()` or at the beginning of a test.
 * The shared Vitest configuration (`restoreMocks: true`) restores the spy automatically before each test,
 * so never call it in `beforeAll()`.
 *
 * @param {String} [defaultTokenUrl] The token URL used when the editor configuration does not provide one.
 * @returns {Object} The spy, for asserting `createToken()` calls.
 */
export function mockCreateToken( defaultTokenUrl ) {
	return vi.spyOn( CloudServicesCore.prototype, 'createToken' )
		.mockImplementation( ( tokenUrlOrRefreshToken = defaultTokenUrl, options ) =>
			new TokenMock( tokenUrlOrRefreshToken, options ) );
}
