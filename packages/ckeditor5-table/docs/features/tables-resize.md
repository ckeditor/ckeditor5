---
category: tables
menu-title: Table column and row resizing
meta-title: Table column and row resizing | CKEditor 5 Documentation
meta-description: Resize table columns and rows in CKEditor 5 to adjust the layout and improve data presentation with flexible, user-friendly controls.
order: 40
modified_at: 2026-10-29
badges: [ premium ]
---

# Table column and row resize

{@snippet features/build-table-source empty}

The {@link module:table/tablecolumnresize~TableColumnResize} plugin lets you resize tables and individual table columns. It gives you complete control over column width, whether you drag the column edge or enter an exact value, in percentages or pixels.

The {@link module:table/tablerowresize~TableRowResize} plugin does the same for table rows. You can drag the bottom edge of a row or enter an exact row height in pixels.

{@snippet getting-started/unlock-feature}

## Demo

To resize a column, hover your pointer over the column edge until it gets highlighted. Drag the column edge until you achieve the desired size.

To resize a row, hover your pointer over the bottom edge of the row and drag it up or down.

{@snippet features/table-column-resize}

<snippet-footer>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</snippet-footer>

The column and row resize features are compatible with the {@link features/export-word Export to Word} feature. The converter will respect the column widths and row heights set in the editor and retain them in the created .DOCX file.

## Column width units

By default, CKEditor&nbsp;5 keeps table column widths as percentages, so the table and its columns scale with the available space. The feature also supports fixed widths expressed in pixels.

The table width is the single source of truth for the unit. When you set the table width in pixels through the {@link features/tables-styling table and cell styling} tools, the column widths switch to pixels too. Switching the table width back to a percentage converts the columns accordingly. This keeps the whole table consistent, whether it should stretch with the surrounding layout or stay at a fixed size.

## Setting an exact column width

Besides dragging the column edge, you can set a precise column width through the cell properties. Put the caret in a cell, open the cell properties, and enter the value in the **Width** field.

In a resized table, this width applies to the entire column the cell belongs to, rather than to the single cell. This lets you enter an exact value instead of approximating it by dragging.

## Row height units

CKEditor&nbsp;5 always stores row heights in pixels. When the editor loads content:

* A row height in pixels stays as it is.
* A row height in points, for example in content pasted from Microsoft Word, Microsoft Excel, or Google Docs, is converted to pixels.
* A row height in any other unit, such as `em` or `%`, is not loaded. The row gets the height its content requires.

A row cannot be lower than its content. When you drag the edge of a row past that point, the row stops at the height of its content.

## Setting an exact row height

Besides dragging the row edge, you can set a precise row height through the cell properties. Put the caret in a cell, open the cell properties, and enter the value in the **Height** field. The field accepts a number or a value in pixels, for example `40` or `40px`. Clear the field to remove the row height.

With the row resize feature, this height applies to the entire row the cell belongs to, rather than to the single cell. For a cell that spans several rows, it applies to the last of them, the same row that dragging the bottom edge of the cell resizes.

Setting a row height removes the heights of the cells in that row, because a cell height would keep the row from shrinking.

## Resizing rows of a table with a set height

A table height works as a minimum height. The browser spreads any extra space over the rows, so the edge of a row would not follow your pointer. That is why the first row resize in a table with a set height changes the table:

1. Every row gets a height equal to its current height on the screen.
2. The table height is removed.

The table looks the same as before, and its height is now the sum of the row heights. Undo restores the table height together with the row heights.

The editor configuration can set a default table height or a default cell height. A removed height would then fall back to the default one from the content styles. That is why, in this case, the row resize sets the table height and the heights of the cells in the resized row to `auto` instead of removing them. The default heights apply only to tables and rows that you have not resized.

## Installation

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the features to your plugin list and toolbar configuration. You can use each of them on its own:

<code-switcher>
```js
import { ClassicEditor, Table, TableColumnResize, TableRowResize } from 'ckeditor5';

ClassicEditor
	.create( {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableColumnResize, TableRowResize, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Common API

The {@link module:table/tablecolumnresize~TableColumnResize} plugin registers the `'tableColumnWidth'` command.

You can set the width of the columns covered by the current selection with the command below. A numeric value without a unit is treated as pixels:

```js
// Set the width of the selected column to 200 pixels.
editor.execute( 'tableColumnWidth', { value: '200' } );
```

In a resized table, the **Width** field of the {@link features/tables-styling cell properties} uses this command to set the width of the whole column instead of a single cell.

The {@link module:table/tablerowresize~TableRowResize} plugin registers the {@link module:table/tablerowresize/commands/tablerowheightcommand~TableRowHeightCommand `'tableRowHeight'`} command.

You can set the height of the rows of the selected cells with the command below. A numeric value without a unit is treated as pixels, and an empty value removes the row height:

```js
// Set the height of the selected row to 40 pixels.
editor.execute( 'tableRowHeight', { value: '40' } );
```

The **Height** field of the cell properties uses this command to set the height of the whole row instead of a single cell.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
