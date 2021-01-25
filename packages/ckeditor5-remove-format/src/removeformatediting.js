/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/removeformatediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

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
