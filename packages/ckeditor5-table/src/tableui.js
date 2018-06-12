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
 * The table UI plugin. It introduces:
 *
 * * The `'insertTable'` dropdown,
 * * The `'tableColumn'` dropdown,
 * * The `'tableRow'` dropdown,
 * * The `'mergeCell'` dropdown.
 *
 * The `'tableColumn'`, `'tableRow'`, `'mergeCell'` work best with {@link module:table/tabletoolbar~TableToolbar}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = this.editor.t;

		editor.ui.componentFactory.add( 'insertTable', locale => {
			const command = editor.commands.get( 'insertTable' );
			const dropdownView = createDropdown( locale );

			dropdownView.bind( 'isEnabled' ).to( command );

			// Decorate dropdown's button.
			dropdownView.buttonView.set( {
				icon: tableIcon,
				label: t( 'Insert table' ),
				tooltip: true
			} );

			// Prepare custom view for dropdown's panel.
			const insertTableView = new InsertTableView( locale );
			dropdownView.panelView.children.add( insertTableView );

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

			return dropdownView;
		} );

		editor.ui.componentFactory.add( 'tableColumn', locale => {
			const options = [
				{ commandName: 'setColumnHeader', label: t( 'Header column' ), bindIsActive: true },
				'|',
				{ commandName: 'insertColumnBefore', label: t( 'Insert column before' ) },
				{ commandName: 'insertColumnAfter', label: t( 'Insert column after' ) },
				{ commandName: 'removeColumn', label: t( 'Delete column' ) }
			];

			return this._prepareDropdown( 'Column', tableColumnIcon, options, locale );
		} );

		editor.ui.componentFactory.add( 'tableRow', locale => {
			const options = [
				{ commandName: 'setRowHeader', label: t( 'Header row' ), bindIsActive: true },
				'|',
				{ commandName: 'insertRowBelow', label: t( 'Insert row below' ) },
				{ commandName: 'insertRowAbove', label: t( 'Insert row above' ) },
				{ commandName: 'removeRow', label: t( 'Delete row' ) }
			];

			return this._prepareDropdown( 'Row', tableRowIcon, options, locale );
		} );

		editor.ui.componentFactory.add( 'mergeCell', locale => {
			const options = [
				{ commandName: 'mergeCellUp', label: t( 'Merge cell up' ) },
				{ commandName: 'mergeCellRight', label: t( 'Merge cell right' ) },
				{ commandName: 'mergeCellDown', label: t( 'Merge cell down' ) },
				{ commandName: 'mergeCellLeft', label: t( 'Merge cell left' ) },
				'|',
				{ commandName: 'splitCellVertically', label: t( 'Split cell vertically' ) },
				{ commandName: 'splitCellHorizontally', label: t( 'Split cell horizontally' ) }
			];

			return this._prepareDropdown( 'Merge cell', tableMergeCellIcon, options, locale );
		} );
	}

	/**
	 * Creates dropdown view from set of options.
	 *
	 * @private
	 * @param {String} buttonName Dropdown button name.
	 * @param {String} icon Icon for dropdown button.
	 * @param {Array.<module:table/tableui~DropdownOption>} options List of options for dropdown.
	 * @param {module:utils/locale~Locale} locale
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_prepareDropdown( buttonName, icon, options, locale ) {
		const editor = this.editor;

		const dropdownView = createDropdown( locale );
		const commands = [];

		// Prepare dropdown list items for list dropdown.
		const dropdownItems = new Collection();

		for ( const option of options ) {
			addListOption( option, editor, commands, dropdownItems );
		}

		addListToDropdown( dropdownView, dropdownItems );

		// Decorate dropdown's button.
		dropdownView.buttonView.set( {
			label: buttonName,
			icon,
			tooltip: true
		} );

		// Make dropdown button disabled when all options are disabled.
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
// @param {module:table/tableui~DropdownOption} option Configuration option.
// @param {module:core/editor/editor~Editor} editor
// @param {Array.<module:core/command~Command>} commands List of commands to update.
// @param {module:utils/collection~Collection} dropdownItems Collection of dropdown items to update with given option.
function addListOption( option, editor, commands, dropdownItems ) {
	const itemModel = new Model();

	if ( option === '|' ) {
		itemModel.set( {
			separator: true
		} );
	} else {
		const { commandName, label, bindIsActive } = option;
		const command = editor.commands.get( commandName );

		commands.push( command );

		itemModel.set( {
			commandName,
			label
		} );

		itemModel.bind( 'isEnabled' ).to( command );

		if ( bindIsActive ) {
			itemModel.bind( 'isActive' ).to( command, 'value' );
		}
	}

	dropdownItems.add( itemModel );
}

/**
 * Object describing table dropdowns' items.
 *
 * @typedef {Object} module:table/tableui~DropdownOption
 * @private
 * @property {String} commandName A command name to execute for that option.
 * @property {String} label A dropdown item label.
 * @property {Boolean} bindIsActive If `true` will bind command's value to `isActive` dropdown item property.
 */
