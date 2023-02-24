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

The {@link module:table/tablecolumnresize~TableColumnResize} plugin registers the following UI components:

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

The {@link module:table/tablecolumnresize~TableColumnResize} plugin does not register toolbar items.

### Editor commands

<table>
	<thead>
		<tr>
			<th>{@link framework/architecture/core-editor-architecture#commands Command} name</th>
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
	</tbody>
</table>

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
