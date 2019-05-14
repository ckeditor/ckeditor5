/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module text-transformation/texttransformation
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The text transformation plugin.
 *
 * For a detailed overview, check the {@glink features/text-transformation Text transformation feature documentation}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TextTransformation extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TextTransformation';
	}
}
