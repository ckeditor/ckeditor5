/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import 'vitest';

// Registers the types of the custom matchers added by `test_setup.js`, since no file included
// in the TypeScript program imports them. The augmentation must be declared here (instead of
// relying on the declaration shipped with `@ckeditor/ckeditor5-dev-tests`), so that it binds
// to the `vitest` instance resolved by this repository — with a workspace-linked development
// checkout of `ckeditor5-dev`, the shipped declaration would bind to a different copy.
declare module 'vitest' {
	interface Matchers<T = any> {

		/**
		 * Asserts that two markup strings are equal. Unlike `toEqual()`, it formats the markup before showing a diff.
		 */
		toEqualMarkup( expected: string ): T;
	}
}
