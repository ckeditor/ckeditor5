/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/italic
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import ItalicEditing from './italic/italicediting';
import ItalicUI from './italic/italicui';

/**
 * The italic feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature} guide
 * This is a "glue" plugin which loads the {@link module:basic-styles/italic/italicediting~ItalicEditing} and
 */
export default class Italic extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ ItalicEditing, ItalicUI ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Italic' {
		return 'Italic';
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Italic.pluginName ]: Italic;
	}
}
