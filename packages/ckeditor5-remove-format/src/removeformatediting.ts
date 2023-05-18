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
 */
export default class RemoveFormatEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'RemoveFormatEditing' {
		return 'RemoveFormatEditing';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.commands.add( 'removeFormat', new RemoveFormatCommand( editor ) );
	}
}
