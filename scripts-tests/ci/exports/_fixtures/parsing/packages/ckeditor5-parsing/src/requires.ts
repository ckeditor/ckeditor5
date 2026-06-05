/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Test fixture for the module re-exports validator.
 *
 * @publicApi
 */

import { ParsingFeature } from './named-exports.js';
import { ParsingChild } from './references.js';

export class ParsingPlugin {
	public static get requires() {
		return [ ParsingFeature ] as const;
	}
}

export class ParsingPluginWithProperty {
	public static requires = [ ParsingChild ];
}
