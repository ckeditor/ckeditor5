/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembed
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';

import HtmlEmbedEditing from './htmlembedediting';
import HtmlEmbedUI from './htmlembedui';

/**
 * The HTML embed feature.
 *
 * It allows inserting HTML snippets directly into the editor.
 *
 * For a detailed overview, check the {@glink features/html-embed HTML embed feature} documentation.
 */
export default class HtmlEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ HtmlEmbedEditing, HtmlEmbedUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'HtmlEmbed' {
		return 'HtmlEmbed';
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ HtmlEmbed.pluginName ]: HtmlEmbed;
	}
}
