/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/slashcommand
 */

import { Plugin } from 'ckeditor5/src/core';

import SlashCommandUI from './slashcommandui';
import SlashCommandEditing from './slashcommandediting';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';

/**
 * The remove format plugin.
 *
 * This is a "glue" plugin which loads the {@link module:remove-format/slashcommandediting~SlashCommandEditing}
 * and {@link module:remove-format/slashcommandui~SlashCommandUI} plugins.
 *
 * For a detailed overview, check out the {@glink features/remove-format remove format} feature documentation.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SlashCommand extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ SlashCommandEditing, SlashCommandUI, Mention ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SlashCommand';
	}
}
