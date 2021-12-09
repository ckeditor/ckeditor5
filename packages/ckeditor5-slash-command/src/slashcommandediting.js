/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/slashcommandediting
 */

import { Plugin } from 'ckeditor5/src/core';

/**
 * The remove format editing plugin.
 *
 * It registers the {@link module:remove-format/slashcommandcommand~SlashCommandCommand slashCommand} command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SlashCommandEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SlashCommandEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
	}
}
