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

export type { TableConfig } from './tableconfig.js';
export type { InsertColumnCommand } from './commands/insertcolumncommand.js';
export type { InsertRowCommand } from './commands/insertrowcommand.js';
export type { InsertTableCommand } from './commands/inserttablecommand.js';
export type { InsertTableLayoutCommand } from './commands/inserttablelayoutcommand.js';
export type { TableTypeCommand } from './tablelayout/commands/tabletypecommand.js';
export type { MergeCellCommand } from './commands/mergecellcommand.js';
export type { MergeCellsCommand } from './commands/mergecellscommand.js';
export type { RemoveColumnCommand } from './commands/removecolumncommand.js';
export type { RemoveRowCommand } from './commands/removerowcommand.js';
export type { SelectColumnCommand } from './commands/selectcolumncommand.js';
export type { SelectRowCommand } from './commands/selectrowcommand.js';
export type { SetHeaderColumnCommand } from './commands/setheadercolumncommand.js';
export type { SetHeaderRowCommand } from './commands/setheaderrowcommand.js';
export type { SplitCellCommand } from './commands/splitcellcommand.js';
export type { ToggleTableCaptionCommand } from './tablecaption/toggletablecaptioncommand.js';
export type { TableCellBackgroundColorCommand } from './tablecellproperties/commands/tablecellbackgroundcolorcommand.js';
export type { TableCellBorderColorCommand } from './tablecellproperties/commands/tablecellbordercolorcommand.js';
export type { TableCellBorderStyleCommand } from './tablecellproperties/commands/tablecellborderstylecommand.js';
export type { TableCellBorderWidthCommand } from './tablecellproperties/commands/tablecellborderwidthcommand.js';
export type { TableCellHeightCommand } from './tablecellproperties/commands/tablecellheightcommand.js';
export type { TableCellHorizontalAlignmentCommand } from './tablecellproperties/commands/tablecellhorizontalalignmentcommand.js';
export type { TableCellPaddingCommand } from './tablecellproperties/commands/tablecellpaddingcommand.js';
export type { TableCellVerticalAlignmentCommand } from './tablecellproperties/commands/tablecellverticalalignmentcommand.js';
export type { TableCellWidthCommand } from './tablecellwidth/commands/tablecellwidthcommand.js';
export type { TableAlignmentCommand } from './tableproperties/commands/tablealignmentcommand.js';
export type { TableBackgroundColorCommand } from './tableproperties/commands/tablebackgroundcolorcommand.js';
export type { TableBorderColorCommand } from './tableproperties/commands/tablebordercolorcommand.js';
export type { TableBorderStyleCommand } from './tableproperties/commands/tableborderstylecommand.js';
export type { TableBorderWidthCommand } from './tableproperties/commands/tableborderwidthcommand.js';
export type { TableHeightCommand } from './tableproperties/commands/tableheightcommand.js';
export type { TableWidthCommand } from './tableproperties/commands/tablewidthcommand.js';

import './augmentation.js';
