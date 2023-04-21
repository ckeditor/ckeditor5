/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table
 */

export { default as PlainTableOutput } from './plaintableoutput';
export { default as Table } from './table';
export { default as TableEditing } from './tableediting';
export { default as TableUI } from './tableui';
export { default as TableToolbar } from './tabletoolbar';
export { default as TableCellProperties } from './tablecellproperties';
export { default as TableCellPropertiesEditing } from './tablecellproperties/tablecellpropertiesediting';
export { default as TableCellPropertiesUI } from './tablecellproperties/tablecellpropertiesui';
export { default as TableCellWidthEditing } from './tablecellwidth/tablecellwidthediting';
export { default as TableProperties } from './tableproperties';
export { default as TablePropertiesEditing } from './tableproperties/tablepropertiesediting';
export { default as TablePropertiesUI } from './tableproperties/tablepropertiesui';
export { default as TableCaption } from './tablecaption';
export { default as TableCaptionEditing } from './tablecaption/tablecaptionediting';
export { default as TableCaptionUI } from './tablecaption/tablecaptionui';
export { default as TableClipboard } from './tableclipboard';
export { default as TableMouse } from './tablemouse';
export { default as TableKeyboard } from './tablekeyboard';
export { default as TableSelection } from './tableselection';
export { default as TableUtils } from './tableutils';
export { default as TableColumnResize } from './tablecolumnresize';
export { default as TableColumnResizeEditing } from './tablecolumnresize/tablecolumnresizeediting';

export type { TableConfig } from './tableconfig';
export type { default as InsertColumnCommand } from './commands/insertcolumncommand';
export type { default as InsertRowCommand } from './commands/insertrowcommand';
export type { default as InsertTableCommand } from './commands/inserttablecommand';
export type { default as MergeCellCommand } from './commands/mergecellcommand';
export type { default as MergeCellsCommand } from './commands/mergecellscommand';
export type { default as RemoveColumnCommand } from './commands/removecolumncommand';
export type { default as RemoveRowCommand } from './commands/removerowcommand';
export type { default as SelectColumnCommand } from './commands/selectcolumncommand';
export type { default as SelectRowCommand } from './commands/selectrowcommand';
export type { default as SetHeaderColumnCommand } from './commands/setheadercolumncommand';
export type { default as SetHeaderRowCommand } from './commands/setheaderrowcommand';
export type { default as SplitCellCommand } from './commands/splitcellcommand';
export type { default as ToggleTableCaptionCommand } from './tablecaption/toggletablecaptioncommand';
export type { default as TableCellBackgroundColorCommand } from './tablecellproperties/commands/tablecellbackgroundcolorcommand';
export type { default as TableCellBorderColorCommand } from './tablecellproperties/commands/tablecellbordercolorcommand';
export type { default as TableCellBorderStyleCommand } from './tablecellproperties/commands/tablecellborderstylecommand';
export type { default as TableCellBorderWidthCommand } from './tablecellproperties/commands/tablecellborderwidthcommand';
export type { default as TableCellHeightCommand } from './tablecellproperties/commands/tablecellheightcommand';
export type { default as TableCellHorizontalAlignmentCommand } from './tablecellproperties/commands/tablecellhorizontalalignmentcommand';
export type { default as TableCellPaddingCommand } from './tablecellproperties/commands/tablecellpaddingcommand';
export type { default as TableCellVerticalAlignmentCommand } from './tablecellproperties/commands/tablecellverticalalignmentcommand';
export type { default as TableCellWidthCommand } from './tablecellwidth/commands/tablecellwidthcommand';
export type { default as TableAlignmentCommand } from './tableproperties/commands/tablealignmentcommand';
export type { default as TableBackgroundColorCommand } from './tableproperties/commands/tablebackgroundcolorcommand';
export type { default as TableBorderColorCommand } from './tableproperties/commands/tablebordercolorcommand';
export type { default as TableBorderStyleCommand } from './tableproperties/commands/tableborderstylecommand';
export type { default as TableBorderWidthCommand } from './tableproperties/commands/tableborderwidthcommand';
export type { default as TableHeightCommand } from './tableproperties/commands/tableheightcommand';
export type { default as TableWidthCommand } from './tableproperties/commands/tablewidthcommand';

import './augmentation';
