/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	// Config
	TableConfig,

	// Plugins
	Table,
	TableCaption,
	TableCaptionEditing,
	TableCaptionUI,
	TableCellProperties,
	TableCellPropertiesEditing,
	TableCellPropertiesUI,
	TableCellWidthEditing,
	TableClipboard,
	TableColumnResize,
	TableColumnResizeEditing,
	TableEditing,
	TableKeyboard,
	TableLayout,
	TableLayoutEditing,
	TableMouse,
	TableProperties,
	TablePropertiesEditing,
	TablePropertiesUI,
	TableSelection,
	TableToolbar,
	TableUI,
	TableUtils,
	PlainTableOutput,

	// Commands
	InsertColumnCommand,
	InsertRowCommand,
	InsertTableCommand,
	InsertTableLayoutCommand,
	MergeCellCommand,
	MergeCellsCommand,
	RemoveColumnCommand,
	RemoveRowCommand,
	SelectColumnCommand,
	SelectRowCommand,
	SetHeaderColumnCommand,
	SetHeaderRowCommand,
	TableTypeCommand,
	SplitCellCommand,
	ToggleTableCaptionCommand,
	TableCellBackgroundColorCommand,
	TableCellBorderColorCommand,
	TableCellBorderStyleCommand,
	TableCellBorderWidthCommand,
	TableCellHeightCommand,
	TableCellHorizontalAlignmentCommand,
	TableCellPaddingCommand,
	TableCellVerticalAlignmentCommand,
	TableCellWidthCommand,
	TableAlignmentCommand,
	TableBackgroundColorCommand,
	TableBorderColorCommand,
	TableBorderStyleCommand,
	TableBorderWidthCommand,
	TableHeightCommand,
	TableWidthCommand
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:table/table~Table} feature.
		 *
		 * Read more in {@link module:table/tableconfig~TableConfig}.
		 */
		table?: TableConfig;
	}

	interface PluginsMap {
		[ Table.pluginName ]: Table;
		[ TableCaption.pluginName ]: TableCaption;
		[ TableCaptionEditing.pluginName ]: TableCaptionEditing;
		[ TableCaptionUI.pluginName ]: TableCaptionUI;
		[ TableCellProperties.pluginName ]: TableCellProperties;
		[ TableCellPropertiesEditing.pluginName ]: TableCellPropertiesEditing;
		[ TableCellPropertiesUI.pluginName ]: TableCellPropertiesUI;
		[ TableCellWidthEditing.pluginName ]: TableCellWidthEditing;
		[ TableClipboard.pluginName ]: TableClipboard;
		[ TableColumnResize.pluginName ]: TableColumnResize;
		[ TableColumnResizeEditing.pluginName ]: TableColumnResizeEditing;
		[ TableEditing.pluginName ]: TableEditing;
		[ TableKeyboard.pluginName ]: TableKeyboard;
		[ TableLayout.pluginName ]: TableLayout;
		[ TableLayoutEditing.pluginName ]: TableLayoutEditing;
		[ TableMouse.pluginName ]: TableMouse;
		[ TableProperties.pluginName ]: TableProperties;
		[ TablePropertiesEditing.pluginName ]: TablePropertiesEditing;
		[ TablePropertiesUI.pluginName ]: TablePropertiesUI;
		[ TableSelection.pluginName ]: TableSelection;
		[ TableToolbar.pluginName ]: TableToolbar;
		[ TableUI.pluginName ]: TableUI;
		[ TableUtils.pluginName ]: TableUtils;
		[ PlainTableOutput.pluginName ]: PlainTableOutput;
	}

	interface CommandsMap {
		insertTableColumnLeft: InsertColumnCommand;
		insertTableColumnRight: InsertColumnCommand;
		insertTableRowAbove: InsertRowCommand;
		insertTableRowBelow: InsertRowCommand;
		insertTable: InsertTableCommand;
		insertTableLayout: InsertTableLayoutCommand;
		mergeTableCellRight: MergeCellCommand;
		mergeTableCellLeft: MergeCellCommand;
		mergeTableCellDown: MergeCellCommand;
		mergeTableCellUp: MergeCellCommand;
		mergeTableCells: MergeCellsCommand;
		removeTableColumn: RemoveColumnCommand;
		removeTableRow: RemoveRowCommand;
		selectTableColumn: SelectColumnCommand;
		selectTableRow: SelectRowCommand;
		setTableColumnHeader: SetHeaderColumnCommand;
		setTableRowHeader: SetHeaderRowCommand;
		splitTableCellVertically: SplitCellCommand;
		splitTableCellHorizontally: SplitCellCommand;
		toggleTableCaption: ToggleTableCaptionCommand;
		tableCellBackgroundColor: TableCellBackgroundColorCommand;
		tableCellBorderColor: TableCellBorderColorCommand;
		tableCellBorderStyle: TableCellBorderStyleCommand;
		tableCellBorderWidth: TableCellBorderWidthCommand;
		tableCellHeight: TableCellHeightCommand;
		tableCellHorizontalAlignment: TableCellHorizontalAlignmentCommand;
		tableCellPadding: TableCellPaddingCommand;
		tableCellVerticalAlignment: TableCellVerticalAlignmentCommand;
		tableCellWidth: TableCellWidthCommand;
		tableAlignment: TableAlignmentCommand;
		tableBackgroundColor: TableBackgroundColorCommand;
		tableBorderColor: TableBorderColorCommand;
		tableBorderStyle: TableBorderStyleCommand;
		tableBorderWidth: TableBorderWidthCommand;
		tableHeight: TableHeightCommand;
		tableWidth: TableWidthCommand;
		tableType: TableTypeCommand;
	}
}
