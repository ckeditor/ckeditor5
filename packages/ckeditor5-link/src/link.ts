/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/link
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import LinkEditing from './linkediting';
import LinkUI from './linkui';
import AutoLink from './autolink';
import './linkconfig';

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
	public static get requires(): PluginDependencies {
		return [ LinkEditing, LinkUI, AutoLink ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Link' {
		return 'Link';
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Link.pluginName ]: Link;
	}
}
