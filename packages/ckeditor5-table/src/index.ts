/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table
 */

export { PlainTableOutput } from './plaintableoutput.js';
export { Table } from './table.js';
export { TableEditing } from './tableediting.js';
export { TableUI } from './tableui.js';
export { TableToolbar } from './tabletoolbar.js';
export { TableCellProperties } from './tablecellproperties.js';
export { TableCellPropertiesEditing } from './tablecellproperties/tablecellpropertiesediting.js';
export { TableCellPropertiesUI } from './tablecellproperties/tablecellpropertiesui.js';
export { TableCellWidthEditing } from './tablecellwidth/tablecellwidthediting.js';
export { TableLayout } from './tablelayout.js';
export { TableLayoutEditing } from './tablelayout/tablelayoutediting.js';
export { TableProperties } from './tableproperties.js';
export { TablePropertiesEditing } from './tableproperties/tablepropertiesediting.js';
export { TablePropertiesUI } from './tableproperties/tablepropertiesui.js';
export { TableCaption } from './tablecaption.js';
export { TableCaptionEditing } from './tablecaption/tablecaptionediting.js';
export { TableCaptionUI } from './tablecaption/tablecaptionui.js';
export { TableClipboard } from './tableclipboard.js';
export { TableMouse } from './tablemouse.js';
export { TableKeyboard } from './tablekeyboard.js';
export { TableSelection } from './tableselection.js';
export { TableUtils } from './tableutils.js';
export { TableColumnResize } from './tablecolumnresize.js';
export { TableColumnResizeEditing } from './tablecolumnresize/tablecolumnresizeediting.js';

export { InsertColumnCommand } from './commands/insertcolumncommand.js';
export { InsertRowCommand } from './commands/insertrowcommand.js';
export { InsertTableCommand } from './commands/inserttablecommand.js';
export { InsertTableLayoutCommand } from './commands/inserttablelayoutcommand.js';
export { TableTypeCommand } from './tablelayout/commands/tabletypecommand.js';
export { MergeCellCommand } from './commands/mergecellcommand.js';
export { MergeCellsCommand } from './commands/mergecellscommand.js';
export { RemoveColumnCommand } from './commands/removecolumncommand.js';
export { RemoveRowCommand } from './commands/removerowcommand.js';
export { SelectColumnCommand } from './commands/selectcolumncommand.js';
export { SelectRowCommand } from './commands/selectrowcommand.js';
export { SetHeaderColumnCommand } from './commands/setheadercolumncommand.js';
export { SetHeaderRowCommand } from './commands/setheaderrowcommand.js';
export { SplitCellCommand } from './commands/splitcellcommand.js';
export { ToggleTableCaptionCommand } from './tablecaption/toggletablecaptioncommand.js';
export { TableCellBackgroundColorCommand } from './tablecellproperties/commands/tablecellbackgroundcolorcommand.js';
export { TableCellBorderColorCommand } from './tablecellproperties/commands/tablecellbordercolorcommand.js';
export { TableCellBorderStyleCommand } from './tablecellproperties/commands/tablecellborderstylecommand.js';
export { TableCellBorderWidthCommand } from './tablecellproperties/commands/tablecellborderwidthcommand.js';
export { TableCellHeightCommand } from './tablecellproperties/commands/tablecellheightcommand.js';
export { TableCellHorizontalAlignmentCommand } from './tablecellproperties/commands/tablecellhorizontalalignmentcommand.js';
export { TableCellPaddingCommand } from './tablecellproperties/commands/tablecellpaddingcommand.js';
export { TableCellVerticalAlignmentCommand } from './tablecellproperties/commands/tablecellverticalalignmentcommand.js';
export { TableCellWidthCommand } from './tablecellwidth/commands/tablecellwidthcommand.js';
export { TableAlignmentCommand } from './tableproperties/commands/tablealignmentcommand.js';
export { TableBackgroundColorCommand } from './tableproperties/commands/tablebackgroundcolorcommand.js';
export { TableBorderColorCommand } from './tableproperties/commands/tablebordercolorcommand.js';
export { TableBorderStyleCommand } from './tableproperties/commands/tableborderstylecommand.js';
export { TableBorderWidthCommand } from './tableproperties/commands/tableborderwidthcommand.js';
export { TableHeightCommand } from './tableproperties/commands/tableheightcommand.js';
export { TableWidthCommand } from './tableproperties/commands/tablewidthcommand.js';

// Internal exports.
export {
	downcastTable as _downcastTable,
	downcastRow as _downcastTableRow,
	downcastCell as _downcastTableCell,
	convertParagraphInTableCell as _convertParagraphInTableCell,
	isSingleParagraphWithoutAttributes as _isSingleTableParagraphWithoutAttributes
} from './converters/downcast.js';
export type { DowncastTableOptions as _DowncastTableOptions } from './converters/downcast.js';
export { injectTableCaptionPostFixer as _injectTableCaptionPostFixer } from './converters/table-caption-post-fixer.js';
export { injectTableCellParagraphPostFixer as _injectTableCellParagraphPostFixer } from './converters/table-cell-paragraph-post-fixer.js';
export { tableCellRefreshHandler as _tableCellRefreshHandler } from './converters/table-cell-refresh-handler.js';
export { tableHeadingsRefreshHandler as _tableHeadingsRefreshHandler } from './converters/table-headings-refresh-handler.js';
export { injectTableLayoutPostFixer as _injectTableLayoutPostFixer } from './converters/table-layout-post-fixer.js';
export {
	upcastStyleToAttribute as _upcastNormalizedTableStyleToAttribute,
	upcastBorderStyles as _upcastTableBorderStyles,
	downcastAttributeToStyle as _downcastTableAttributeToStyle,
	downcastTableAttribute as _downcastTableAttribute,
	getDefaultValueAdjusted as _getDefaultTableValueAdjusted
} from './converters/tableproperties.js';
export type { StyleValues as _TableStyleValues } from './converters/tableproperties.js';
export {
	upcastTableFigure as _upcastTableFigure,
	upcastTable as _upcastTable,
	skipEmptyTableRow as _skipEmptyTableRow,
	ensureParagraphInTableCell as _ensureParagraphInTableCell
} from './converters/upcasttable.js';
export {
	isTable as _isTableModelElement,
	getCaptionFromTableModelElement as _getCaptionFromTableModelElement,
	getCaptionFromModelSelection as _getCaptionFromTableModelSelection,
	matchTableCaptionViewElement as _matchTableCaptionViewElement
} from './tablecaption/utils.js';
export {
	COLUMN_MIN_WIDTH_AS_PERCENTAGE as _TABLE_COLUMN_MIN_WIDTH_AS_PERCENTAGE,
	COLUMN_MIN_WIDTH_IN_PIXELS as _TABLE_COLUMN_MIN_WIDTH_IN_PIXELS,
	COLUMN_WIDTH_PRECISION as _TABLE_COLUMN_WIDTH_PRECISION,
	COLUMN_RESIZE_DISTANCE_THRESHOLD as _TABLE_COLUMN_RESIZE_DISTANCE_THRESHOLD
} from './tablecolumnresize/constants.js';
export {
	upcastColgroupElement as _upcastTableColgroupElement,
	downcastTableResizedClass as _downcastTableResizedClass
} from './tablecolumnresize/converters.js';
export {
	getChangedResizedTables as _getChangedResizedTables,
	getColumnMinWidthAsPercentage as _getTableColumnMinWidthAsPercentage,
	getTableWidthInPixels as _getTableWidthInPixels,
	getElementWidthInPixels as _getElementWidthInPixels,
	getColumnEdgesIndexes as _getTableColumnEdgesIndexes,
	toPrecision as _toPrecision,
	clamp as _clamp,
	createFilledArray as _createFilledArray,
	sumArray as _sumArray,
	normalizeColumnWidths as _normalizeTableColumnWidths,
	getDomCellOuterWidth as _getDomTableCellOuterWidth,
	updateColumnElements as _updateTableColumnElements,
	getColumnGroupElement as _getTableColumnGroupElement,
	getTableColumnElements as _getTableColumnElements,
	getTableColumnsWidths as _getTableColumnsWidths,
	translateColSpanAttribute as _translateTableColspanAttribute
} from './tablecolumnresize/utils.js';
export { MouseEventsObserver as _TableMouseEventsObserver } from './tablemouse/mouseeventsobserver.js';
export type { ColorInputViewOptions as _TableColorInputViewOptions } from './ui/colorinputview.js';
export { ColorInputView as _TableColorInputView } from './ui/colorinputview.js';
export { InsertTableView as _InsertTableView } from './ui/inserttableview.js';
export {
	updateNumericAttribute as _updateTableNumericAttribute,
	createEmptyTableCell as _createEmptyTableCell,
	isHeadingColumnCell as _isHeadingColumnCell,
	enableProperty as _enableTableCellProperty,
	getSelectionAffectedTable as _getSelectionAffectedTable
} from './utils/common.js';
export {
	cropTableToDimensions as _cropTableToDimensions,
	getVerticallyOverlappingCells as _getVerticallyOverlappingTableCells,
	splitHorizontally as _splitTableCellHorizontally,
	getHorizontallyOverlappingCells as _getHorizontallyOverlappingTableCells,
	splitVertically as _splitTableCellVertically,
	trimTableCellIfNeeded as _trimTableCellIfNeeded,
	removeEmptyColumns as _removeEmptyTableColumns,
	removeEmptyRows as _removeEmptyTableRows,
	removeEmptyRowsColumns as _removeEmptyTableRowsColumns,
	adjustLastRowIndex as _adjustLastTableRowIndex,
	adjustLastColumnIndex as _adjustLastTableColumnIndex
} from './utils/structure.js';
export {
	getSingleValue as _getTableBorderBoxSingleValue,
	addDefaultUnitToNumericValue as _addDefaultUnitToNumericValue,
	getNormalizedDefaultProperties as _getNormalizedDefaultTableBaseProperties,
	getNormalizedDefaultTableProperties as _getNormalizedDefaultTableProperties,
	getNormalizedDefaultCellProperties as _getNormalizedDefaultTableCellProperties
} from './utils/table-properties.js';
export type {
	NormalizedDefaultProperties as _NormalizedTableDefaultProperties,
	NormalizeTableDefaultPropertiesOptions as _NormalizeTableDefaultPropertiesOptions
} from './utils/table-properties.js';
export {
	repositionContextualBalloon as _repositionTableContextualBalloon,
	getBalloonTablePositionData as _getBalloonTablePositionData,
	getBalloonCellPositionData as _getBalloonTableCellPositionData
} from './utils/ui/contextualballoon.js';
export {
	getBorderStyleLabels as _getBorderTableStyleLabels,
	getLocalizedColorErrorText as _getLocalizedTableColorErrorText,
	getLocalizedLengthErrorText as _getLocalizedTableLengthErrorText,
	colorFieldValidator as _colorTableFieldValidator,
	lengthFieldValidator as _lengthTableFieldValidator,
	lineWidthFieldValidator as _lineWidthTableFieldValidator,
	getBorderStyleDefinitions as _getTableOrCellBorderStyleDefinitions,
	fillToolbar as _fillTableOrCellToolbar,
	defaultColors as _DEFAULT_TABLE_COLORS,
	getLabeledColorInputCreator as _getLabeledTableColorInputCreator
} from './utils/ui/table-properties.js';
export {
	getSelectionAffectedTableWidget as _getSelectionAffectedTableWidget,
	getSelectedTableWidget as _getSelectedTableWidget,
	getTableWidgetAncestor as _getTableWidgetAncestor
} from './utils/ui/widget.js';

export type { TableConfig } from './tableconfig.js';

import './augmentation.js';
