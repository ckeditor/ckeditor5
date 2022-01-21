/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/liststylecommand
 */

import { Command } from 'ckeditor5/src/core';
import { getSelectedListItems } from './utils';

/**
 * The list style command. It changes the `listStyle` attribute of the selected list items.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 *
 * @extends module:core/command~Command
 */
export default class ListStyleCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {String} defaultType The list type that will be used by default if the value was not specified during
	 * the command execution.
	 */
	constructor( editor, defaultType ) {
		super( editor );

		/**
		 * The default type of the list style.
		 *
		 * @protected
		 * @member {String}
		 */
		this._defaultType = defaultType;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.value = this._getValue();
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command.
	 *
	 * @param {Object} options
	 * @param {String|null} options.type The type of the list style, e.g. `'disc'` or `'square'`. If `null` is specified, the default
	 * style will be applied.
	 * @protected
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const listItems = getSelectedListItems( model );

		if ( !listItems.length ) {
			return;
		}

		model.change( writer => {
			for ( const item of listItems ) {
				writer.setAttribute( 'listStyle', options.type || this._defaultType, item );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @private
	 * @returns {String|null} The current value.
	 */
	_getValue() {
		const listItem = this.editor.model.document.selection.getFirstPosition().parent;

		if ( listItem && listItem.is( 'element', 'listItem' ) ) {
			return listItem.getAttribute( 'listStyle' );
		}

		return null;
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		const editor = this.editor;

		const numberedList = editor.commands.get( 'numberedList' );
		const bulletedList = editor.commands.get( 'bulletedList' );

		return numberedList.isEnabled || bulletedList.isEnabled;
	}
}
