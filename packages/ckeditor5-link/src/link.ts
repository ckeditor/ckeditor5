/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/link
 */

import { Plugin } from 'ckeditor5/src/core';
import LinkEditing from './linkediting';
import LinkUI from './linkui';
import AutoLink from './autolink';

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
	public static get pluginName(): 'Link' {
		return 'Link';
	}
}
