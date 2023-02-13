/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/removeformatediting
 */

import { Plugin } from 'ckeditor5/src/core';

import RemoveFormatCommand from './removeformatcommand';

/**
 * The remove format editing plugin.
 *
 * It registers the {@link module:remove-format/removeformatcommand~RemoveFormatCommand removeFormat} command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class RemoveFormatEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RemoveFormatEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.commands.add( 'removeFormat', new RemoveFormatCommand( editor ) );
	}
}
