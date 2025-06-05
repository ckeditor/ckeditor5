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

export type { TableConfig } from './tableconfig.js';

import './augmentation.js';
