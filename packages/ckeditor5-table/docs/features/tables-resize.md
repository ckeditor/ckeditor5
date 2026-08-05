---
category: tables
menu-title: Table column resizing
meta-title: Table column resizing | CKEditor 5 Documentation
meta-description: Resize table columns and rows in CKEditor 5 to adjust the layout and improve data presentation with flexible, user-friendly controls.
order: 40
modified_at: 2022-05-19
badges: [ premium ]
---

# Table column resize

{@snippet features/build-table-source empty}

The {@link module:table/tablecolumnresize~TableColumnResize} plugin lets you resize tables and individual table columns. It gives you complete control over column width, whether you drag the column edge or enter an exact value, in percentages or pixels.

{@snippet getting-started/unlock-feature}

## Demo

To resize a column, simply hover your pointer over the column edge until it gets highlighted. Drag the column edge until you achieve the desired size.

{@snippet features/table-column-resize}

<snippet-footer>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</snippet-footer>

The column resize feature is compatible with the {@link features/export-word Export to Word} feature. The converter will respect the column width set in the editor and retain it in the created .DOCX file.

## Column width units

By default, CKEditor&nbsp;5 keeps table column widths as percentages, so the table and its columns scale with the available space. The feature also supports fixed widths expressed in pixels.

The table width is the single source of truth for the unit. When you set the table width in pixels through the {@link features/tables-styling table and cell styling} tools, the column widths switch to pixels too. Switching the table width back to a percentage converts the columns accordingly. This keeps the whole table consistent, whether it should stretch with the surrounding layout or stay at a fixed size.

## Setting an exact column width

Besides dragging the column edge, you can set a precise column width through the cell properties. Put the caret in a cell, open the cell properties, and enter the value in the **Width** field.

In a resized table, this width applies to the entire column the cell belongs to, rather than to the single cell. This lets you enter an exact value instead of approximating it by dragging.

## Installation

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Table, TableColumnResize } from 'ckeditor5';

ClassicEditor
	.create( {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableColumnResize, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
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

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
