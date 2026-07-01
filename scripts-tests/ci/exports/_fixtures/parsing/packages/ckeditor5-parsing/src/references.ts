/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Test fixture for the module re-exports validator.
 *
 * @publicApi
 */

import { ParsingFeature, type ParsingInterface, type ParsingType } from './named-exports.js';

export class ParsingChild extends ParsingFeature implements ParsingInterface {
	public parsingValue: string = '';

	public other: ParsingType | null = null;
}

/**
 * @internal
 */
export class ParsingInternalChild extends ParsingFeature {}

export class ParsingGeneric<T> {
	public items: Array<T> = [];
}
