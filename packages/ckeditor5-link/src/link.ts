/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/link
 */

import { Plugin } from 'ckeditor5/src/core.js';
import LinkEditing from './linkediting.js';
import LinkUI from './linkui.js';
import AutoLink from './autolink.js';

/**
 * The link plugin.
 *
 * This is a "glue" plugin that loads the {@link module:link/linkediting~LinkEditing link editing feature}
 * and {@link module:link/linkui~LinkUI link UI feature}.
 */
export default class Link extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ LinkEditing, LinkUI, AutoLink ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Link' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
