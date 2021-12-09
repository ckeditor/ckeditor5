/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/slashcommandui
 */

import { Plugin } from 'ckeditor5/src/core';

/**
 * The remove format UI plugin. It registers the `'slashCommand'` button which can be
 * used in the toolbar.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SlashCommandUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SlashCommandUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
	}
}
