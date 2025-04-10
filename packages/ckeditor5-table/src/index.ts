/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table
 */

export { default as PlainTableOutput } from './plaintableoutput.js';
export { default as Table } from './table.js';
export { default as TableEditing } from './tableediting.js';
export { default as TableUI } from './tableui.js';
export { default as TableToolbar } from './tabletoolbar.js';
export { default as TableCellProperties } from './tablecellproperties.js';
export { default as TableCellPropertiesEditing } from './tablecellproperties/tablecellpropertiesediting.js';
export { default as TableCellPropertiesUI } from './tablecellproperties/tablecellpropertiesui.js';
export { default as TableCellWidthEditing } from './tablecellwidth/tablecellwidthediting.js';
export { default as TableLayout } from './tablelayout.js';
export { default as TableLayoutEditing } from './tablelayout/tablelayoutediting.js';
export { default as TableProperties } from './tableproperties.js';
export { default as TablePropertiesEditing } from './tableproperties/tablepropertiesediting.js';
export { default as TablePropertiesUI } from './tableproperties/tablepropertiesui.js';
export { default as TableCaption } from './tablecaption.js';
export { default as TableCaptionEditing } from './tablecaption/tablecaptionediting.js';
export { default as TableCaptionUI } from './tablecaption/tablecaptionui.js';
export { default as TableClipboard } from './tableclipboard.js';
export { default as TableMouse } from './tablemouse.js';
export { default as TableKeyboard } from './tablekeyboard.js';
export { default as TableSelection } from './tableselection.js';
export { default as TableUtils } from './tableutils.js';
export { default as TableColumnResize } from './tablecolumnresize.js';
export { default as TableColumnResizeEditing } from './tablecolumnresize/tablecolumnresizeediting.js';

export type { TableConfig } from './tableconfig.js';
export type { default as InsertColumnCommand } from './commands/insertcolumncommand.js';
export type { default as InsertRowCommand } from './commands/insertrowcommand.js';
export type { default as InsertTableCommand } from './commands/inserttablecommand.js';
export type { default as InsertTableLayoutCommand } from './commands/inserttablelayoutcommand.js';
export type { default as TableTypeCommand } from './tablelayout/commands/tabletypecommand.js';
export type { default as MergeCellCommand } from './commands/mergecellcommand.js';
export type { default as MergeCellsCommand } from './commands/mergecellscommand.js';
export type { default as RemoveColumnCommand } from './commands/removecolumncommand.js';
export type { default as RemoveRowCommand } from './commands/removerowcommand.js';
export type { default as SelectColumnCommand } from './commands/selectcolumncommand.js';
export type { default as SelectRowCommand } from './commands/selectrowcommand.js';
export type { default as SetHeaderColumnCommand } from './commands/setheadercolumncommand.js';
export type { default as SetHeaderRowCommand } from './commands/setheaderrowcommand.js';
export type { default as SplitCellCommand } from './commands/splitcellcommand.js';
export type { default as ToggleTableCaptionCommand } from './tablecaption/toggletablecaptioncommand.js';
export type { default as TableCellBackgroundColorCommand } from './tablecellproperties/commands/tablecellbackgroundcolorcommand.js';
export type { default as TableCellBorderColorCommand } from './tablecellproperties/commands/tablecellbordercolorcommand.js';
export type { default as TableCellBorderStyleCommand } from './tablecellproperties/commands/tablecellborderstylecommand.js';
export type { default as TableCellBorderWidthCommand } from './tablecellproperties/commands/tablecellborderwidthcommand.js';
export type { default as TableCellHeightCommand } from './tablecellproperties/commands/tablecellheightcommand.js';
export type { default as TableCellHorizontalAlignmentCommand } from './tablecellproperties/commands/tablecellhorizontalalignmentcommand.js';
export type { default as TableCellPaddingCommand } from './tablecellproperties/commands/tablecellpaddingcommand.js';
export type { default as TableCellVerticalAlignmentCommand } from './tablecellproperties/commands/tablecellverticalalignmentcommand.js';
export type { default as TableCellWidthCommand } from './tablecellwidth/commands/tablecellwidthcommand.js';
export type { default as TableAlignmentCommand } from './tableproperties/commands/tablealignmentcommand.js';
export type { default as TableBackgroundColorCommand } from './tableproperties/commands/tablebackgroundcolorcommand.js';
export type { default as TableBorderColorCommand } from './tableproperties/commands/tablebordercolorcommand.js';
export type { default as TableBorderStyleCommand } from './tableproperties/commands/tableborderstylecommand.js';
export type { default as TableBorderWidthCommand } from './tableproperties/commands/tableborderwidthcommand.js';
export type { default as TableHeightCommand } from './tableproperties/commands/tableheightcommand.js';
export type { default as TableWidthCommand } from './tableproperties/commands/tablewidthcommand.js';

import './augmentation.js';
