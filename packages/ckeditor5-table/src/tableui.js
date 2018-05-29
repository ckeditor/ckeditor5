/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import InsertTableView from './ui/inserttableview';

import tableIcon from './../theme/icons/table.svg';
import tableColumnIcon from './../theme/icons/table-column.svg';
import tableRowIcon from './../theme/icons/table-row.svg';
import tableMergeCellIcon from './../theme/icons/table-merge-cell.svg';

/**
 * The table UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'insertTable', locale => {
			const command = editor.commands.get( 'insertTable' );
			const dropdownView = createDropdown( locale );

			dropdownView.bind( 'isEnabled' ).to( command );

			dropdownView.buttonView.set( {
				icon: tableIcon,
				label: 'Insert table',
				tooltip: true
			} );

			const insertTableView = new InsertTableView( locale );

			insertTableView.delegate( 'execute' ).to( dropdownView );

			dropdownView.buttonView.on( 'open', () => {
				// Reset the chooser before showing it to the user.
				insertTableView.rows = 0;
				insertTableView.columns = 0;
			} );

			dropdownView.on( 'execute', () => {
				editor.execute( 'insertTable', { rows: insertTableView.rows, columns: insertTableView.columns } );

				editor.editing.view.focus();
			} );

			dropdownView.panelView.children.add( insertTableView );

			return dropdownView;
		} );

		editor.ui.componentFactory.add( 'tableColumn', locale => {
			const options = [
				{ commandName: 'setColumnHeader', label: 'Header column', bindIsActive: true },
				{ commandName: 'insertColumnBefore', label: 'Insert column before' },
				{ commandName: 'insertColumnAfter', label: 'Insert column after' },
				{ commandName: 'removeColumn', label: 'Delete column' }
			];

			return this._prepareDropdown( 'Column', tableColumnIcon, options, locale );
		} );

		editor.ui.componentFactory.add( 'tableRow', locale => {
			const options = [
				{ commandName: 'setRowHeader', label: 'Header row', bindIsActive: true },
				{ commandName: 'insertRowBelow', label: 'Insert row below' },
				{ commandName: 'insertRowAbove', label: 'Insert row above' },
				{ commandName: 'removeRow', label: 'Delete row' }
			];

			return this._prepareDropdown( 'Row', tableRowIcon, options, locale );
		} );

		editor.ui.componentFactory.add( 'mergeCell', locale => {
			const options = [
				{ commandName: 'mergeCellUp', label: 'Merge cell up' },
				{ commandName: 'mergeCellRight', label: 'Merge cell right' },
				{ commandName: 'mergeCellDown', label: 'Merge cell down' },
				{ commandName: 'mergeCellLeft', label: 'Merge cell left' },
				{ commandName: 'splitCellVertically', label: 'Split cell vertically' },
				{ commandName: 'splitCellHorizontally', label: 'Split cell horizontally' }
			];

			return this._prepareDropdown( 'Merge cell', tableMergeCellIcon, options, locale );
		} );
	}

	/**
	 * Common method that prepares dropdown.
	 *
	 * @private
	 * @param {String} buttonName
	 * @param {String} icon
	 * @param {Array.<Object>} options
	 * @param locale
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_prepareDropdown( buttonName, icon, options, locale ) {
		const editor = this.editor;

		const dropdownView = createDropdown( locale );
		const commands = [];

		const dropdownItems = new Collection();

		for ( const option of options ) {
			addListOption( option, editor, commands, dropdownItems );
		}

		addListToDropdown( dropdownView, dropdownItems );

		dropdownView.buttonView.set( {
			label: buttonName,
			icon,
			tooltip: true
		} );

		dropdownView.bind( 'isEnabled' ).toMany( commands, 'isEnabled', ( ...areEnabled ) => {
			return areEnabled.some( isEnabled => isEnabled );
		} );

		this.listenTo( dropdownView, 'execute', evt => {
			editor.execute( evt.source.commandName );
			editor.editing.view.focus();
		} );

		return dropdownView;
	}
}

// Adds an option to a list view.
//
// @param {Object} commandName
// @param {String} label
// @param {module:core/editor/editor~Editor} editor
// @param {Array.<module:core/command~Command>} commands
// @param {module:utils/collection~Collection} dropdownItems
function addListOption( option, editor, commands, dropdownItems ) {
	const { commandName, label, bindIsActive } = option;
	const command = editor.commands.get( commandName );

	commands.push( command );

	const itemModel = new Model( {
		commandName,
		label
	} );

	itemModel.bind( 'isEnabled' ).to( command );

	if ( bindIsActive ) {
		itemModel.bind( 'isActive' ).to( command, 'value' );
	}

	dropdownItems.add( itemModel );
}
