/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module slash-command/slashcommandediting
 */

import { Plugin } from 'ckeditor5/src/core';
import SlashCommand from './slashcommand';

/**
 * The slash command editing plugin.
 *
 * It registers the {@link module:slash-command/slashcommandcommand~SlashCommandCommand slashCommand} command.
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
		const editor = this.editor;

		editor.commands.add( 'slashCommand', new SlashCommand( editor ) );
	}
}
