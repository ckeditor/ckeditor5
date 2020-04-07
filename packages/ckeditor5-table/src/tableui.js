/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';
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
 * * The `'mergeTableCells'` split button.
 *
 * The `'tableColumn'`, `'tableRow'` and `'mergeTableCells'` dropdowns work best with {@link module:table/tabletoolbar~TableToolbar}.
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
		const contentLanguageDirection = editor.locale.contentLanguageDirection;
		const isContentLtr = contentLanguageDirection === 'ltr';

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

			let insertTableView;

			dropdownView.on( 'change:isOpen', () => {
				if ( insertTableView ) {
					return;
				}

				// Prepare custom view for dropdown's panel.
				insertTableView = new InsertTableView( locale );
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
			} );

			return dropdownView;
		} );

		editor.ui.componentFactory.add( 'tableColumn', locale => {
			const options = [
				{
					type: 'switchbutton',
					model: {
						commandName: 'setTableColumnHeader',
						label: t( 'Header column' ),
						bindIsOn: true
					}
				},
				{ type: 'separator' },
				{
					type: 'button',
					model: {
						commandName: isContentLtr ? 'insertTableColumnLeft' : 'insertTableColumnRight',
						label: t( 'Insert column left' )
					}
				},
				{
					type: 'button',
					model: {
						commandName: isContentLtr ? 'insertTableColumnRight' : 'insertTableColumnLeft',
						label: t( 'Insert column right' )
					}
				},
				{
					type: 'button',
					model: {
						commandName: 'removeTableColumn',
						label: t( 'Delete column' )
					}
				},
				{
					type: 'button',
					model: {
						commandName: 'selectTableColumn',
						label: t( 'Select column' )
					}
				}
			];

			return this._prepareDropdown( t( 'Column' ), tableColumnIcon, options, locale );
		} );

		editor.ui.componentFactory.add( 'tableRow', locale => {
			const options = [
				{
					type: 'switchbutton',
					model: {
						commandName: 'setTableRowHeader',
						label: t( 'Header row' ),
						bindIsOn: true
					}
				},
				{ type: 'separator' },
				{
					type: 'button',
					model: {
						commandName: 'insertTableRowBelow',
						label: t( 'Insert row below' )
					}
				},
				{
					type: 'button',
					model: {
						commandName: 'insertTableRowAbove',
						label: t( 'Insert row above' )
					}
				},
				{
					type: 'button',
					model: {
						commandName: 'removeTableRow',
						label: t( 'Delete row' )
					}
				},
				{
					type: 'button',
					model: {
						commandName: 'selectTableRow',
						label: t( 'Select row' )
					}
				}
			];

			return this._prepareDropdown( t( 'Row' ), tableRowIcon, options, locale );
		} );

		editor.ui.componentFactory.add( 'mergeTableCells', locale => {
			const options = [
				{
					type: 'button',
					model: {
						commandName: 'mergeTableCellUp',
						label: t( 'Merge cell up' )
					}
				},
				{
					type: 'button',
					model: {
						commandName: isContentLtr ? 'mergeTableCellRight' : 'mergeTableCellLeft',
						label: t( 'Merge cell right' )
					}
				},
				{
					type: 'button',
					model: {
						commandName: 'mergeTableCellDown',
						label: t( 'Merge cell down' )
					}
				},
				{
					type: 'button',
					model: {
						commandName: isContentLtr ? 'mergeTableCellLeft' : 'mergeTableCellRight',
						label: t( 'Merge cell left' )
					}
				},
				{ type: 'separator' },
				{
					type: 'button',
					model: {
						commandName: 'splitTableCellVertically',
						label: t( 'Split cell vertically' )
					}
				},
				{
					type: 'button',
					model: {
						commandName: 'splitTableCellHorizontally',
						label: t( 'Split cell horizontally' )
					}
				}
			];

			return this._prepareMergeSplitButtonDropdown( t( 'Merge cells' ), tableMergeCellIcon, options, locale );
		} );
	}

	/**
	 * Creates a dropdown view from a set of options.
	 *
	 * @private
	 * @param {String} label The dropdown button label.
	 * @param {String} icon An icon for the dropdown button.
	 * @param {Array.<module:ui/dropdown/utils~ListDropdownItemDefinition>} options The list of options for the dropdown.
	 * @param {module:utils/locale~Locale} locale
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_prepareDropdown( label, icon, options, locale ) {
		const editor = this.editor;
		const dropdownView = createDropdown( locale );
		const commands = this._fillDropdownWithListOptions( dropdownView, options );

		// Decorate dropdown's button.
		dropdownView.buttonView.set( {
			label,
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

	/**
	 * Creates a dropdown view with a {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView} for
	 * merge (and split)–related commands.
	 *
	 * @private
	 * @param {String} label The dropdown button label.
	 * @param {String} icon An icon for the dropdown button.
	 * @param {Array.<module:ui/dropdown/utils~ListDropdownItemDefinition>} options The list of options for the dropdown.
	 * @param {module:utils/locale~Locale} locale
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_prepareMergeSplitButtonDropdown( label, icon, options, locale ) {
		const editor = this.editor;
		const dropdownView = createDropdown( locale, SplitButtonView );
		const mergeCommandName = 'mergeTableCells';

		this._fillDropdownWithListOptions( dropdownView, options );

		dropdownView.buttonView.set( {
			label,
			icon,
			tooltip: true
		} );

		// The main part of the split button is bound to the "mergeTableCells" command only.
		dropdownView.bind( 'isEnabled' ).to( editor.commands.get( mergeCommandName ) );

		// The split button dropdown must be **always** enabled and ready to open no matter the state
		// of the "mergeTableCells" command. You may not be able to merge multiple cells but you may want
		// to split them. This is also about mobile devices where multi–cell selection will never work
		// (that's why "Merge cell right", "Merge cell down", etc. are still there in the first place).
		dropdownView.buttonView.arrowView.unbind( 'isEnabled' );
		dropdownView.buttonView.arrowView.isEnabled = true;

		// Merge selected table cells when the main part of the split button is clicked.
		this.listenTo( dropdownView.buttonView, 'execute', () => {
			editor.execute( mergeCommandName );
			editor.editing.view.focus();
		} );

		// Execute commands for events coming from the list in the dropdown panel.
		this.listenTo( dropdownView, 'execute', evt => {
			editor.execute( evt.source.commandName );
			editor.editing.view.focus();
		} );

		return dropdownView;
	}

	/**
	 * Injects a {@link module:ui/list/listview~ListView} into the passed dropdown with buttons
	 * which execute editor commands as configured in passed options.
	 *
	 * @private
	 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
	 * @param {Array.<module:ui/dropdown/utils~ListDropdownItemDefinition>} options The list of options for the dropdown.
	 * @returns {Array.<module:core/command~Command>} Commands the list options are interacting with.
	 */
	_fillDropdownWithListOptions( dropdownView, options ) {
		const editor = this.editor;
		const commands = [];
		const itemDefinitions = new Collection();

		for ( const option of options ) {
			addListOption( option, editor, commands, itemDefinitions );
		}

		addListToDropdown( dropdownView, itemDefinitions, editor.ui.componentFactory );

		return commands;
	}
}

// Adds an option to a list view.
//
// @param {module:table/tableui~DropdownOption} option A configuration option.
// @param {module:core/editor/editor~Editor} editor
// @param {Array.<module:core/command~Command>} commands The list of commands to update.
// @param {Iterable.<module:ui/dropdown/utils~ListDropdownItemDefinition>} itemDefinitions
// A collection of dropdown items to update with the given option.
function addListOption( option, editor, commands, itemDefinitions ) {
	const model = option.model = new Model( option.model );
	const { commandName, bindIsOn } = option.model;

	if ( option.type === 'button' || option.type === 'switchbutton' ) {
		const command = editor.commands.get( commandName );

		commands.push( command );

		model.set( { commandName } );

		model.bind( 'isEnabled' ).to( command );

		if ( bindIsOn ) {
			model.bind( 'isOn' ).to( command, 'value' );
		}
	}

	model.set( {
		withText: true
	} );

	itemDefinitions.add( option );
}
