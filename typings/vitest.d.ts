/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import 'vitest';

declare module 'vitest' {
	interface Assertion<T = any> {
		attribute( key: string ): void;
		attribute( key: string, value: string ): void;

		equalMarkup( expected: string ): void;
	}
}
