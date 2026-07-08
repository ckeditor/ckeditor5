/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import 'vitest';

// Registers the types of the custom matchers added by `scripts/vitest/test_setup.mjs`, since
// no file included in the TypeScript program imports them. The matchers themselves are
// implemented in the `scripts/vitest/` directory, outside of the TypeScript program, so their
// types must be maintained here manually.
declare module 'vitest' {
	interface Matchers<T = any> {

		/**
		 * Asserts that two markup strings are equal. Unlike `toEqual()`, it formats the markup before showing a diff.
		 */
		toEqualMarkup( expected: string ): T;
	}
}
