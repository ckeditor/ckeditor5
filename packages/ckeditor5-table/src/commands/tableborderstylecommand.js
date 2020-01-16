/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/tableborderstylecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor, getSingleValue } from './utils';

/**
 * The table style border command.
 *
 * The command is registered by {@link module:table/tablepropertiesediting~TablePropertiesEditing} as
 * `'tableBorderStyle'` editor command.
 *
 * To change border of the selected , execute the command:
 *
 *		editor.execute( 'tableBorderStyle', {
 *			value: '5px'
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class TableBorderStyleCommand extends Command {
	constructor( editor ) {
		super( editor );

		this.attributeName = 'borderStyle';
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		const table = Array.from( selection.getSelectedBlocks() ).find( block => block.is( 'table' ) );

		this.isEnabled = !!table;
		this.value = this._getValue( table );
	}

	_getValue( table ) {
		if ( !table ) {
			return;
		}

		return getSingleValue( table.getAttribute( this.attributeName ) );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} [options]
	 * @param {Boolean} [options.value] If set the command will set border style.
	 * If border style is not set the command will remove the attribute.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		const { value } = options;

		const tables = Array.from( selection.getSelectedBlocks() )
			.map( element => findAncestor( 'table', model.createPositionAt( element, 0 ) ) );

		model.change( writer => {
			if ( value ) {
				tables.forEach( table => writer.setAttribute( this.attributeName, value, table ) );
			} else {
				tables.forEach( table => writer.removeAttribute( this.attributeName, table ) );
			}
		} );
	}
}

