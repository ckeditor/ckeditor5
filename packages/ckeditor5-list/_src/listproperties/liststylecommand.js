/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listproperties/liststylecommand
 */

import { Command } from 'ckeditor5/src/core';
import { getListTypeFromListStyleType, getSelectedListItems } from '../list/utils';

/**
 * The list style command. It changes the `listStyle` attribute of the selected list items.
 *
 * If the list type (numbered or bulleted) can be inferred from the passed style type,
 * the command tries to convert selected items to a list of that type.
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
	 * @fires execute
	 * @param {Object} options
	 * @param {String|null} [options.type] The type of the list style, e.g. `'disc'` or `'square'`. If `null` is specified, the default
	 * style will be applied.
	 */
	execute( options = {} ) {
		this._tryToConvertItemsToList( options );

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

	/**
	 * Check if the provided list style is valid. Also change the selection to a list if it's not set yet.
	 *
	 * @param {Object} options
	 * @param {String|null} [options.type] The type of the list style. If `null` is specified, the function does nothing.
	 * @private
	*/
	_tryToConvertItemsToList( options ) {
		if ( !options.type ) {
			return;
		}

		const listType = getListTypeFromListStyleType( options.type );

		if ( !listType ) {
			return;
		}

		const editor = this.editor;
		const commandName = listType + 'List';
		const command = editor.commands.get( commandName );

		if ( !command.value ) {
			editor.execute( commandName );
		}
	}
}
