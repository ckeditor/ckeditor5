/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { vi, onTestFinished } from 'vitest';
import { global } from '../../src/dom/global.js';
import { _clearTrustedTypesCache, isTrustedTypesEnforced } from '../../src/dom/trustedtypes.js';

/**
 * Makes `isTrustedTypesEnforced()` answer `true` until the current test finishes. The check writes to a DOM injection
 * sink and remembers whether the browser rejected it, so the fake document is needed only while it makes up its mind — the
 * editor created afterwards needs the real one.
 *
 * Call it from `beforeEach()` or from the test itself.
 */
export function stubTrustedTypesEnforcement() {
	const element = {};

	Object.defineProperty( element, 'innerHTML', {
		set() {
			throw new TypeError( 'This document requires \'TrustedHTML\' assignment.' );
		}
	} );

	_clearTrustedTypesCache();

	const documentStub = vi.spyOn( global, 'document', 'get' ).mockReturnValue( {
		createElement: () => element
	} );

	isTrustedTypesEnforced();

	documentStub.mockRestore();

	onTestFinished( () => {
		_clearTrustedTypesCache();
	} );
}
