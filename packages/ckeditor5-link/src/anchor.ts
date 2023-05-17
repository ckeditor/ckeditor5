/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/anchor
 */

import { Plugin } from 'ckeditor5/src/core';
import AnchorEditing from './anchorediting';
import AnchorUI from './anchorui';

/**
 * The anchor plugin.
 *
 * This is a "glue" plugin that loads anchor-related features.
 */
export default class Anchor extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ AnchorEditing, AnchorUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Anchor' {
		return 'Anchor';
	}
}
