/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import tableIcon from './../theme/icons/table.svg';
import tableColumnIcon from './../theme/icons/table-column.svg';
import tableRowIcon from './../theme/icons/table-row.svg';
import tableMergeCellIcon from './../theme/icons/table-merge-cell.svg';
import tableSplitCellIcon from './../theme/icons/table-split-cell.svg';

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
			const buttonView = new ButtonView( locale );

			buttonView.bind( 'isEnabled' ).to( command );

			buttonView.set( {
				icon: tableIcon,
				label: 'Insert table',
				tooltip: true
			} );

			buttonView.on( 'execute', () => {
				editor.execute( 'insertTable' );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'tableColumn', locale => {
			const options = [
				{ command: 'setColumnHeader', label: 'Header column' },
				{ command: 'insertColumnBefore', label: 'Insert column before' },
				{ command: 'insertColumnAfter', label: 'Insert column after' },
				{ command: 'removeColumn', label: 'Delete column' }
			];

			return this._prepareDropdown( 'Column', tableColumnIcon, options, locale );
		} );

		editor.ui.componentFactory.add( 'tableRow', locale => {
			const options = [
				{ command: 'setRowHeader', label: 'Header row' },
				{ command: 'insertRowBelow', label: 'Insert row below' },
				{ command: 'insertRowAbove', label: 'Insert row above' },
				{ command: 'removeRow', label: 'Delete row' }
			];

			return this._prepareDropdown( 'Row', tableRowIcon, options, locale );
		} );

		editor.ui.componentFactory.add( 'mergeCell', locale => {
			const options = [
				{ command: 'mergeCellUp', label: 'Merge cell up' },
				{ command: 'mergeCellRight', label: 'Merge cell right' },
				{ command: 'mergeCellDown', label: 'Merge cell down' },
				{ command: 'mergeCellLeft', label: 'Merge cell left' }
			];

			return this._prepareDropdown( 'Merge cell', tableMergeCellIcon, options, locale );
		} );

		editor.ui.componentFactory.add( 'splitCell', locale => {
			const options = [
				{ command: 'splitCellVertically', label: 'Split cell vertically' },
				{ command: 'splitCellHorizontally', label: 'Split cell horizontally' }
			];

			return this._prepareDropdown( 'Split cell', tableSplitCellIcon, options, locale );
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

		for ( const { command, label } of options ) {
			addListOption( command, label, editor, commands, dropdownItems );
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

/**
 * Adds an option to a list view.
 *
 * @param {String} commandName
 * @param {String} label
 * @param {module:core/editor/editor~Editor} editor
 * @param {Array.<module:core/command~Command>} commands
 * @param {module:utils/collection~Collection} dropdownItems
 */
function addListOption( commandName, label, editor, commands, dropdownItems ) {
	const command = editor.commands.get( commandName );

	commands.push( command );

	const itemModel = new Model( {
		commandName,
		label
	} );

	itemModel.bind( 'isEnabled' ).to( command );

	dropdownItems.add( itemModel );
}
