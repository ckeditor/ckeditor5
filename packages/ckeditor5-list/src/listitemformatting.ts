/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listitemformatting
 */

import { Plugin } from 'ckeditor5/src/core.js';

import ListItemFontFamilyIntegration from './listitemformatting/listitemfontfamilyintegration.js';

/**
 * The list item formatting plugin. It loads the list item integrations with formatting plugins.
 */
export default class ListItemFormatting extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListItemFormatting' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ListItemFontFamilyIntegration ] as const;
	}
}
