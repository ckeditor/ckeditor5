/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/removeformat
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import RemoveFormatUI from './removeformatui';
import RemoveFormatCommand from './removeformatcommand';

/**
 * The remove format plugin.
 *
 * This is a "glue" plugin which loads the {@link module:remove-format/removeformatcommand~RemoveFormatCommand command}
 * and the {@link module:remove-format/removeformatui~RemoveFormatUI UI}.
 *
 * For a detailed overview, check out the {@glink features/remove-format remove format} feature documentation.
 *
 * @extends module:core/plugin~Plugin
 */
export default class RemoveFormat extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ RemoveFormatCommand, RemoveFormatUI ];
	}

	init() {
		const editor = this.editor;

		editor.commands.add( 'removeFormat', new RemoveFormatCommand( editor ) );
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RemoveFormat';
	}
}
