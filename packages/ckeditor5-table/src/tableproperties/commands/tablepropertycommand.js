/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tablepropertycommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor } from '../../commands/utils';

/**
 * The table cell attribute command.
 *
 * The command is a base command for other table cell attributes commands.
 *
 * @extends module:core/command~Command
 */
export default class TablePropertyCommand extends Command {
	/**
	 * Creates a new `TablePropertyCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 * @param {String} attributeName Table cell attribute name.
	 */
	constructor( editor, attributeName ) {
		super( editor );

		this.attributeName = attributeName;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		const table = findAncestor( 'table', selection.getFirstPosition() );

		this.isEnabled = !!table;
		this.value = this._getValue( table );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} [options]
	 * @param {Boolean} [options.value] If set the command will set width. If width is not set the command will remove the attribute.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		const { value, batch } = options;

		const tables = Array.from( selection.getSelectedBlocks() )
			.map( element => findAncestor( 'table', model.createPositionAt( element, 0 ) ) );

		model.enqueueChange( batch || 'default', writer => {
			if ( value ) {
				tables.forEach( table => writer.setAttribute( this.attributeName, value, table ) );
			} else {
				tables.forEach( table => writer.removeAttribute( this.attributeName, table ) );
			}
		} );
	}

	/**
	 * Returns attribute value for a table cell.
	 *
	 * @param {module:engine/model/element~Element} table
	 * @returns {String|undefined}
	 * @private
	 */
	_getValue( table ) {
		if ( !table ) {
			return;
		}

		return table.getAttribute( this.attributeName );
	}
}
