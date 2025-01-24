/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableui
 */

import { Plugin, type Command, type Editor } from 'ckeditor5/src/core.js';
import { IconTable, IconTableColumn, IconTableRow, IconTableMergeCell } from 'ckeditor5/src/icons.js';
import {
	addListToDropdown,
	createDropdown,
	ViewModel,
	SplitButtonView,
	SwitchButtonView,
	type DropdownView,
	type ListDropdownItemDefinition,
	MenuBarMenuView
} from 'ckeditor5/src/ui.js';
import { Collection, type ObservableChangeEvent, type Locale } from 'ckeditor5/src/utils.js';

import InsertTableView from './ui/inserttableview.js';

import type InsertTableCommand from './commands/inserttablecommand.js';
import type MergeCellsCommand from './commands/mergecellscommand.js';

/**
 * The table UI plugin. It introduces:
 *
 * * The `'insertTable'` dropdown,
 * * The `'menuBar:insertTable'` menu bar menu,
 * * The `'tableColumn'` dropdown,
 * * The `'tableRow'` dropdown,
 * * The `'mergeTableCells'` split button.
 *
 * The `'tableColumn'`, `'tableRow'` and `'mergeTableCells'` dropdowns work best with {@link module:table/tabletoolbar~TableToolbar}.
 */
export default class TableUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = this.editor.t;
		const contentLanguageDirection = editor.locale.contentLanguageDirection;
		const isContentLtr = contentLanguageDirection === 'ltr';

		editor.ui.componentFactory.add( 'insertTable', locale => {
			const command: InsertTableCommand = editor.commands.get( 'insertTable' )!;
			const dropdownView = createDropdown( locale );

			dropdownView.bind( 'isEnabled' ).to( command );

			// Decorate dropdown's button.
			dropdownView.buttonView.set( {
				icon: IconTable,
				label: t( 'Insert table' ),
				tooltip: true
			} );

			let insertTableView: InsertTableView;

			dropdownView.on( 'change:isOpen', () => {
				if ( insertTableView ) {
					return;
				}

				// Prepare custom view for dropdown's panel.
				insertTableView = new InsertTableView( locale );
				dropdownView.panelView.children.add( insertTableView );

				insertTableView.delegate( 'execute' ).to( dropdownView );

				dropdownView.on( 'execute', () => {
					editor.execute( 'insertTable', { rows: insertTableView.rows, columns: insertTableView.columns } );
					editor.editing.view.focus();
				} );
			} );

			return dropdownView;
		} );

		editor.ui.componentFactory.add( 'menuBar:insertTable', locale => {
			const command: InsertTableCommand = editor.commands.get( 'insertTable' )!;
			const menuView = new MenuBarMenuView( locale );
			const insertTableView = new InsertTableView( locale );

			insertTableView.delegate( 'execute' ).to( menuView );

			menuView.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( event, name, isOpen ) => {
				if ( !isOpen ) {
					insertTableView.reset();
				}
			} );

			insertTableView.on( 'execute', () => {
				editor.execute( 'insertTable', { rows: insertTableView.rows, columns: insertTableView.columns } );
				editor.editing.view.focus();
			} );

			menuView.buttonView.set( {
				label: t( 'Table' ),
				icon: IconTable
			} );

			menuView.panelView.children.add( insertTableView );

			menuView.bind( 'isEnabled' ).to( command );

			return menuView;
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
			] as Array<ListDropdownItemDefinition>;

			return this._prepareDropdown( t( 'Column' ), IconTableColumn, options, locale );
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
						commandName: 'insertTableRowAbove',
						label: t( 'Insert row above' )
					}
				},
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
			] as Array<ListDropdownItemDefinition>;

			return this._prepareDropdown( t( 'Row' ), IconTableRow, options, locale );
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
			] as Array<ListDropdownItemDefinition>;

			return this._prepareMergeSplitButtonDropdown( t( 'Merge cells' ), IconTableMergeCell, options, locale );
		} );
	}

	/**
	 * Creates a dropdown view from a set of options.
	 *
	 * @param label The dropdown button label.
	 * @param icon An icon for the dropdown button.
	 * @param options The list of options for the dropdown.
	 */
	private _prepareDropdown( label: string, icon: string, options: Array<ListDropdownItemDefinition>, locale: Locale ) {
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
			editor.execute( ( evt.source as any ).commandName );

			// Toggling a switch button view should not move the focus to the editable.
			if ( !( evt.source instanceof SwitchButtonView ) ) {
				editor.editing.view.focus();
			}
		} );

		return dropdownView;
	}

	/**
	 * Creates a dropdown view with a {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView} for
	 * merge (and split)–related commands.
	 *
	 * @param label The dropdown button label.
	 * @param icon An icon for the dropdown button.
	 * @param options The list of options for the dropdown.
	 */
	private _prepareMergeSplitButtonDropdown( label: string, icon: string, options: Array<ListDropdownItemDefinition>, locale: Locale ) {
		const editor = this.editor;
		const dropdownView = createDropdown( locale, SplitButtonView );
		const mergeCommandName = 'mergeTableCells';

		// Main command.
		const mergeCommand: MergeCellsCommand = editor.commands.get( mergeCommandName )!;

		// Subcommands in the dropdown.
		const commands = this._fillDropdownWithListOptions( dropdownView, options );

		dropdownView.buttonView.set( {
			label,
			icon,
			tooltip: true,
			isEnabled: true
		} );

		// Make dropdown button disabled when all options are disabled together with the main command.
		dropdownView.bind( 'isEnabled' ).toMany( [ mergeCommand, ...commands ], 'isEnabled', ( ...areEnabled ) => {
			return areEnabled.some( isEnabled => isEnabled );
		} );

		// Merge selected table cells when the main part of the split button is clicked.
		this.listenTo( dropdownView.buttonView, 'execute', () => {
			editor.execute( mergeCommandName );
			editor.editing.view.focus();
		} );

		// Execute commands for events coming from the list in the dropdown panel.
		this.listenTo( dropdownView, 'execute', evt => {
			editor.execute( ( evt.source as any ).commandName );
			editor.editing.view.focus();
		} );

		return dropdownView;
	}

	/**
	 * Injects a {@link module:ui/list/listview~ListView} into the passed dropdown with buttons
	 * which execute editor commands as configured in passed options.
	 *
	 * @param options The list of options for the dropdown.
	 * @returns Commands the list options are interacting with.
	 */
	private _fillDropdownWithListOptions( dropdownView: DropdownView, options: Array<ListDropdownItemDefinition> ) {
		const editor = this.editor;
		const commands: Array<Command> = [];
		const itemDefinitions = new Collection<ListDropdownItemDefinition>();

		for ( const option of options ) {
			addListOption( option, editor, commands, itemDefinitions );
		}

		addListToDropdown( dropdownView, itemDefinitions );

		return commands;
	}
}

/**
 * Adds an option to a list view.
 *
 * @param option A configuration option.
 * @param commands The list of commands to update.
 * @param itemDefinitions A collection of dropdown items to update with the given option.
 */
function addListOption(
	option: ListDropdownItemDefinition,
	editor: Editor,
	commands: Array<Command>,
	itemDefinitions: Collection<ListDropdownItemDefinition>
) {
	if ( option.type === 'button' || option.type === 'switchbutton' ) {
		const model = option.model = new ViewModel( option.model );
		const { commandName, bindIsOn } = option.model;
		const command = editor.commands.get( commandName as string )!;

		commands.push( command );

		model.set( { commandName } );

		model.bind( 'isEnabled' ).to( command );

		if ( bindIsOn ) {
			model.bind( 'isOn' ).to( command, 'value' );
		}

		model.set( {
			withText: true
		} );
	}

	itemDefinitions.add( option );
}
