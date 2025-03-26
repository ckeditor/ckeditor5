/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablelayout/tablelayoutui
 */

import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import { IconTableLayout, IconTableProperties } from 'ckeditor5/src/icons.js';
import {
	createDropdown,
	addListToDropdown,
	MenuBarMenuView,
	SplitButtonView,
	DropdownButtonView,
	ViewModel,
	type ListDropdownButtonDefinition,
	type ButtonExecuteEvent
} from 'ckeditor5/src/ui.js';
import {
	Collection,
	type ObservableChangeEvent
} from 'ckeditor5/src/utils.js';

import InsertTableView from '../ui/inserttableview.js';

import type InsertTableLayoutCommand from '../commands/inserttablelayoutcommand.js';
import type { default as TableTypeCommand } from './commands/tabletypecommand.js';
import type { TableType } from '../tableconfig.js';

/**
 * The table layout UI plugin. It introduces:
 *
 * * The `'insertTableLayout'` dropdown,
 * * The `'menuBar:insertTableLayout'` menu bar menu.
 */
export default class TableLayoutUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableLayoutUI' as const;
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

		editor.ui.componentFactory.add( 'insertTableLayout', locale => {
			const command: InsertTableLayoutCommand = editor.commands.get( 'insertTableLayout' )!;
			const dropdownView = createDropdown( locale );

			dropdownView.bind( 'isEnabled' ).to( command );

			// Decorate dropdown's button.
			dropdownView.buttonView.set( {
				icon: IconTableLayout,
				label: t( 'Insert table layout' ),
				tooltip: true
			} );

			let insertTableLayoutView: InsertTableView;

			dropdownView.on( 'change:isOpen', () => {
				if ( insertTableLayoutView ) {
					return;
				}

				// Prepare custom view for dropdown's panel.
				insertTableLayoutView = new InsertTableView( locale );
				dropdownView.panelView.children.add( insertTableLayoutView );

				insertTableLayoutView.delegate( 'execute' ).to( dropdownView );

				dropdownView.on( 'execute', () => {
					editor.execute( 'insertTableLayout', {
						rows: insertTableLayoutView.rows,
						columns: insertTableLayoutView.columns
					} );
					editor.editing.view.focus();
				} );
			} );

			return dropdownView;
		} );

		editor.ui.componentFactory.add( 'menuBar:insertTableLayout', locale => {
			const command: InsertTableLayoutCommand = editor.commands.get( 'insertTableLayout' )!;
			const menuView = new MenuBarMenuView( locale );
			const insertTableLayoutView = new InsertTableView( locale );

			insertTableLayoutView.delegate( 'execute' ).to( menuView );

			menuView.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( event, name, isOpen ) => {
				if ( !isOpen ) {
					insertTableLayoutView.reset();
				}
			} );

			insertTableLayoutView.on( 'execute', () => {
				editor.execute( 'insertTableLayout', {
					rows: insertTableLayoutView.rows,
					columns: insertTableLayoutView.columns
				} );
				editor.editing.view.focus();
			} );

			menuView.buttonView.set( {
				label: t( 'Table layout' ),
				icon: IconTableLayout
			} );

			menuView.panelView.children.add( insertTableLayoutView );

			menuView.bind( 'isEnabled' ).to( command );

			return menuView;
		} );

		// Create table type dropdown button.
		editor.ui.componentFactory.add( 'tableType', () => {
			const editor = this.editor;
			const t = editor.t;

			const button = new DropdownButtonView( editor.locale );

			button.set( {
				label: t( 'Table type' ),
				icon: IconTableProperties,
				tooltip: true
			} );

			return createTableTypeDropdown( editor, button );
		} );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'TablePropertiesUI' ) ) {
			return;
		}

		const tablePropertiesUI = editor.plugins.get( 'TablePropertiesUI' );

		// Override the default table properties button to include the table type dropdown.
		// It needs to be done in `afterInit()` to make sure that `tableProperties` button is
		// registered after the initialization of the `TablePropertiesUI`. Otherwise, the
		// button will be overridden by the default one if the `TablePropertiesUI` is
		// initialized after the `TableLayoutUI`.
		editor.ui.componentFactory.add( 'tableProperties', locale => {
			const baseButton = tablePropertiesUI._createTablePropertiesButton();
			const splitButtonView = new SplitButtonView( locale, baseButton );

			return createTableTypeDropdown( editor, splitButtonView );
		} );
	}
}

/**
 * Creates a dropdown for the table type selection.
 *
 * @param editor The editor instance.
 * @param dropdownButton The button view that will be used as the dropdown trigger.
 * @returns A dropdown view containing table type options.
 */
function createTableTypeDropdown( editor: Editor, dropdownButton: DropdownButtonView | SplitButtonView ) {
	const t = editor.t;
	const locale = editor.locale;
	const tableTypeCommand = editor.commands.get( 'tableType' )!;

	// Wrap the original button in a SplitButtonView.
	const dropdownView = createDropdown( locale, dropdownButton );
	const itemsDefinitions = createTableLayoutTypeDropdownItems( editor );

	// Add table types to the dropdown.
	addListToDropdown( dropdownView, itemsDefinitions, {
		ariaLabel: t( 'Table type options' ),
		role: 'menu'
	} );

	dropdownButton.tooltip = t( 'Choose table type' );
	dropdownView.on<ButtonExecuteEvent>( 'execute', evt => {
		const tableType = ( evt.source as any ).tableType as TableType | undefined;

		if ( tableType ) {
			tableTypeCommand.execute( tableType );
		}
	} );

	return dropdownView;
}

/**
 * Creates dropdown items for table type selection.
 *
 * @param editor The editor instance.
 * @returns A collection of dropdown items for the table type dropdown.
 */
function createTableLayoutTypeDropdownItems( editor: Editor ) {
	const t = editor.t;
	const tableTypeCommand = editor.commands.get( 'tableType' )!;
	const itemDefinitions = new Collection<ListDropdownButtonDefinition>();

	itemDefinitions.add( createTableTypeDropdownItem( tableTypeCommand, 'layout', t( 'Layout table' ) ) );
	itemDefinitions.add( createTableTypeDropdownItem( tableTypeCommand, 'content', t( 'Content table' ) ) );

	return itemDefinitions;
}

/**
 * Creates a dropdown item for a specific table type.
 *
 * @param tableTypeCommand The table type command.
 * @param type The table type value ('layout' or 'content').
 * @param label The localized label for the dropdown item.
 * @returns The dropdown item definition.
 */
function createTableTypeDropdownItem(
	tableTypeCommand: TableTypeCommand,
	type: TableType,
	label: string
): ListDropdownButtonDefinition {
	const model = new ViewModel( {
		label,
		role: 'menuitemradio',
		withText: true,
		tableType: type
	} );

	model.bind( 'isEnabled' ).to( tableTypeCommand, 'isEnabled' );
	model.bind( 'isOn' ).to( tableTypeCommand, 'value', value => value === type );

	return {
		type: 'button',
		model
	};
}
