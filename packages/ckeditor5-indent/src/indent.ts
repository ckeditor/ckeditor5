/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent/indent
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';

import IndentEditing from './indentediting';
import IndentUI from './indentui';

/**
 * The indent feature.
 *
 * This plugin acts as a single entry point plugin for other features that implement indentation of elements like lists or paragraphs.
 *
 * The compatible features are:
 *
 * * The {@link module:list/list~List} or {@link module:list/list/listediting~ListEditing} feature for list indentation.
 * * The {@link module:indent/indentblock~IndentBlock} feature for block indentation.
 *
 * This is a "glue" plugin that loads the following plugins:
 *
 * * The {@link module:indent/indentediting~IndentEditing indent editing feature}.
 * * The {@link module:indent/indentui~IndentUI indent UI feature}.
 *
 * The dependent plugins register the `'indent'` and `'outdent'` commands and introduce the `'indent'` and `'outdent'` buttons
 * that allow to increase or decrease text indentation of supported elements.
 *
 * **Note**: In order for the commands and buttons to work, at least one of compatible features is required.
 */
export default class Indent extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Indent' {
		return 'Indent';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ IndentEditing, IndentUI ];
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Indent.pluginName ]: Indent;
	}
}
