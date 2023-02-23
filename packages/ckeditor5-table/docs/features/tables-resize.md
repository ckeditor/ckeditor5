---
menu-title: Table column resizing
category: tables
order: 40
modified_at: 2022-05-19
---
# Table column resize

{@snippet features/build-table-source}

The {@link module:table/tablecolumnresize~TableColumnResize} plugin adds support for resizing tables and table columns. It gives the content creator full control over the column width. It is a great tool to control both the content and the look of the table. By resizing individual columns, the authors can adjust them to their needs, depending on content inside.

The column resize feature is compatible with the {@link features/export-word Export to Word} feature. The converter will respect the column width set in the editor and retain it in the effecting .DOCX file.

<info-box>
	By default, the table column resize feature is not included in the {@link installation/getting-started/predefined-builds predefined builds} and must be installed separately.
</info-box>

## Demo

To resize a column, simply hover your pointer over the column edge until it gets highlighted. Just drag the column edge until you achieve the desired size and release.

{@snippet features/table-column-resize}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Installation

To enable the table column resize feature in your editor, you need to have the [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package installed (it is already present in the predefined builds):

```
npm install --save @ckeditor/ckeditor5-table
```

Then add the `Table` and **`TableColumnResize`** plugins to your plugin list and configure the table toolbar:

```js
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableColumnResize, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Common API

### UI components

The table plugins register the following UI components:

<table>
	<thead>
		<th>{@link features/toolbar Component} name</th>
		<th>Registered by</th>
	</thead>
	<tbody>
		<tr>
			<td>The <code>'insertTable'</code> dropdown</td>
			<td rowspan="4">{@link module:table/table~Table}</td>
		</tr>
		<tr>
			<td>The <code>'tableColumn'</code> dropdown</td>
		</tr>
		<tr>
			<td>The <code>'tableRow'</code> dropdown</td>
		</tr>
		<tr>
			<td>The <code>'mergeTableCells'</code> split button</td>
		</tr>
		<tr>
			<td>The <code>'tableProperties'</code> button</td>
			<td>{@link module:table/tableproperties~TableProperties}</td>
		</tr>
		<tr>
			<td>The <code>'toggleTableCaption'</code> button</td>
			<td>{@link module:table/tablecaption~TableCaption}</td>
		</tr>
		<tr>
			<td>The <code>'tableCellProperties'</code> button</td>
			<td>{@link module:table/tablecellproperties~TableCellProperties}</td>
		</tr>
	</tbody>
</table>

#### Toolbars

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces two balloon toolbars for tables.
* The content toolbar shows up when a table cell is selected and it is anchored to the table. It is possible to {@link module:table/table~TableConfig#contentToolbar configure} its content. Normally, the toolbar contains the table-related tools such as `'tableColumn'` and `'tableRow'` dropdowns and `'mergeTableCells'` split button.
* The table toolbar shows up when the whole table is selected, for instance using the widget handler. It is possible to {@link module:table/table~TableConfig#tableToolbar configure} its content.

### Editor commands

<table>
	<thead>
		<tr>
			<th>{@link framework/guides/architecture/core-editor-architecture#commands Command} name</th>
			<th>Command class</th>
			<th>Belongs to (top–level plugin)</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>'insertTable'</code></td>
			<td>{@link module:table/commands/inserttablecommand~InsertTableCommand}</td>
			<td rowspan="17">{@link module:table/table~Table}</td>
		</tr>
		<tr>
			<td><code>'insertTableColumnLeft'</code></td>
			<td>{@link module:table/commands/insertcolumncommand~InsertColumnCommand}</td>
		</tr>
		<tr>
			<td><code>'insertTableColumnRight'</code></td>
			<td>{@link module:table/commands/insertcolumncommand~InsertColumnCommand}</td>
		</tr>
		<tr>
			<td><code>'insertTableRowAbove'</code></td>
			<td>{@link module:table/commands/insertrowcommand~InsertRowCommand}</td>
		</tr>
		<tr>
			<td><code>'insertTableRowBelow'</code></td>
			<td>{@link module:table/commands/insertrowcommand~InsertRowCommand}</td>
		</tr>
		<tr>
			<td><code>'removeTableColumn'</code></td>
			<td>{@link module:table/commands/removecolumncommand~RemoveColumnCommand}</td>
		</tr>
		<tr>
			<td><code>'removeTableRow'</code></td>
			<td>{@link module:table/commands/removerowcommand~RemoveRowCommand}</td>
		</tr>
		<tr>
			<td><code>'selectTableColumn'</code></td>
			<td>{@link module:table/commands/selectcolumncommand~SelectColumnCommand}</td>
		</tr>
		<tr>
			<td><code>'selectTableRow'</code></td>
			<td>{@link module:table/commands/selectrowcommand~SelectRowCommand}</td>
		</tr>
		<tr>
			<td><code>'setTableColumnHeader'</code></td>
			<td>{@link module:table/commands/setheadercolumncommand~SetHeaderColumnCommand}</td>
		</tr>
		<tr>
			<td><code>'setTableRowHeader'</code></td>
			<td>{@link module:table/commands/setheaderrowcommand~SetHeaderRowCommand}</td>
		</tr>
		<tr>
			<td><code>'mergeTableCellRight'</code></td>
			<td>{@link module:table/commands/mergecellcommand~MergeCellCommand}</td>
		</tr>
		<tr>
			<td><code>'mergeTableCellLeft'</code></td>
			<td>{@link module:table/commands/mergecellcommand~MergeCellCommand}</td>
		</tr>
		<tr>
			<td><code>'mergeTableCellUp'</code></td>
			<td>{@link module:table/commands/mergecellcommand~MergeCellCommand}</td>
		</tr>
		<tr>
			<td><code>'mergeTableCellDown'</code></td>
			<td>{@link module:table/commands/mergecellcommand~MergeCellCommand}</td>
		</tr>
		<tr>
			<td><code>'splitTableCellVertically'</code></td>
			<td>{@link module:table/commands/splitcellcommand~SplitCellCommand}</td>
		</tr>
		<tr>
			<td><code>'splitTableCellHorizontally'</code></td>
			<td>{@link module:table/commands/splitcellcommand~SplitCellCommand}</td>
		</tr>
		<tr>
			<td><code>'toggleTableCaption'</code></td>
			<td>{@link module:table/tablecaption/toggletablecaptioncommand~ToggleTableCaptionCommand}</td>
			<td>{@link module:table/tablecaption~TableCaption}</td>
		</tr>
		<tr>
			<td><code>'tableBorderColor'</code></td>
			<td>{@link module:table/tableproperties/commands/tablebordercolorcommand~TableBorderColorCommand}</td>
			<td rowspan="7">{@link module:table/tableproperties~TableProperties}</td>
		</tr>
		<tr>
			<td><code>'tableBorderStyle'</code></td>
			<td>{@link module:table/tableproperties/commands/tableborderstylecommand~TableBorderStyleCommand}</td>
		</tr>
		<tr>
			<td><code>'tableBorderWidth'</code></td>
			<td>{@link module:table/tableproperties/commands/tableborderwidthcommand~TableBorderWidthCommand}</td>
		</tr>
		<tr>
			<td><code>'tableAlignment'</code></td>
			<td>{@link module:table/tableproperties/commands/tablealignmentcommand~TableAlignmentCommand}</td>
		</tr>
		<tr>
			<td><code>'tableWidth'</code></td>
			<td>{@link module:table/tableproperties/commands/tablewidthcommand~TableWidthCommand}</td>
		</tr>
		<tr>
			<td><code>'tableHeight'</code></td>
			<td>{@link module:table/tableproperties/commands/tableheightcommand~TableHeightCommand}</td>
		</tr>
		<tr>
			<td><code>'tableBackgroundColor'</code></td>
			<td>{@link module:table/tableproperties/commands/tablebackgroundcolorcommand~TableBackgroundColorCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellBorderStyle'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellborderstylecommand~TableCellBorderStyleCommand}</td>
			<td rowspan="9">{@link module:table/tablecellproperties~TableCellProperties}</td>
		</tr>
		<tr>
			<td><code>'tableCellBorderColor'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellbordercolorcommand~TableCellBorderColorCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellBorderWidth'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellborderwidthcommand~TableCellBorderWidthCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellHorizontalAlignment'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellhorizontalalignmentcommand~TableCellHorizontalAlignmentCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellWidth'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellwidthcommand~TableCellWidthCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellHeight'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellheightcommand~TableCellHeightCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellPadding'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellpaddingcommand~TableCellPaddingCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellBackgroundColor'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellbackgroundcolorcommand~TableCellBackgroundColorCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellVerticalAlignment'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellverticalalignmentcommand~TableCellVerticalAlignmentCommand}</td>
		</tr>
	</tbody>
</table>

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
