/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/indent
 */

import Plugin from './plugin';

import IndentEditing from './indentediting';
import IndentUI from './indentui';

/**
 * The indent feature.
 *
 * This plugin acts as a single entry point plugin for other features that implements indenting of elements like list or paragraphs.
 *
 * The compatible features are:
 * - the {@link module:list/list~List} or {@link module:list/listediting~ListEditing} feature for list indentation
 * - the {@link module:indent-block/indentblock~IndentBlock} feature for indenting text blocks like paragraphs or headings
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:core/indentediting~IndentEditing indent editing feature} and
 * * The {@link module:core/indentui~IndentUI indent UI feature}.
 *
 * The dependent plugins registers the `'indent'` and `'outdent'` commands and it introduces the `'indent'` and `'outdent'` buttons
 * that allow to increase or decrease text indentation of supported elements.
 *
 * **Note**: In order the commands and buttons to work at least one of compatible features is required.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Indent extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Indent';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ IndentEditing, IndentUI ];
	}
}
