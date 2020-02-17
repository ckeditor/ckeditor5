---
title: Tables
category: features
---

{@snippet features/build-table-source}

The {@link module:table/table~Table} feature offers table creation and editing tools that help content authors bring tabular data into their documents.

## Demo

{@snippet features/table}

## Styling tables and table cells

Sometimes the default table formatting is not enough or maybe you just want to paste a table from other text editor and preserve as much formatting as possible. This is when {@link module:table/tableproperties~TableProperties table properties} and {@link module:table/tablecellproperties~TableCellProperties table cell properties} plugins come in handy.

Take, for example, a table in the editor below. You may have noticed that there are plenty of table cells with non–standard formatting like background colors or borders, especially when compared with the previous demo. Put a selection in the table and click the **"Table properties"** button in the toolbar to open a pop–up with multiple options that will allow you to shape the look of the entire table to your needs. You can change the border of the entire table, set its background color, change its dimensions or tune the alignment for the best look of your content.

Now if you are satisfied with the look of your table, it is time to focus on individual cells. Put the caret in the table cell you would like to change and click the **"Cell properties"** button in the toolbar. A now–familiar form with styling options will show up, but this time the adjustments will apply to an individual table cell. If you look closely, you may also spot some new fields: "Padding" and "Table cell text alignment". Use the former to give the text in a cell some space around it. The latter will be useful when your table cell requires a non–standard text alignment, be it horizontal or vertical.

{@snippet features/table-styling}

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom rich text editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package:

```bash
npm install --save @ckeditor/ckeditor5-table
```

Then add `Table` and `TableToolbar` plugins to your plugin list and configure the table toolbar:

```js
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableToolbar, Bold, ... ],
		toolbar: [ 'insertTable', ... ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( ... )
	.catch( ... );
```

## Block vs inline content in table cells

The table feature allows creating block content (like paragraphs, lists, headings, etc.) in table cells. However, if a table cell contains just one paragraph and this paragraph has no special attributes (like text alignment), this cell content is considered "inline" and the paragraph is not rendered.

This means that a table cell can be in two states: with inline content or with block content. The reason for this differentiation is that most tables contain only inline content (e.g. in the [demo](#demo) above) and it is common for "data tables" to not contain any block content. In such scenario, printing out `<p>` elements would be semantically incorrect and also unnecessary. There are, however, scenarios where the user wants to create, for example, a list inside the table and then support for block content is necessary, too.

<info-box>
	"Rendering" here means the view layer. In the model a cell is always filled with at least a `<paragraph>`. It is because of consistency, as since a cell always has some block content, the text is never directly inside `<tableCell>`. This also allows features like <kbd>Enter</kbd> support to work out of the box (since a `<paragraph>` exists in the model, it can be split despite the fact that it is not present in the view).
</info-box>

### Inline content

The following is the model representation of table cells with inline content only (a single `<paragraph>` inside):

```html
<table>
	<tableRow>
		<tableCell>
			<paragraph>Foo</paragraph>
		</tableCell>
		<tableCell>
			<paragraph>Bar</paragraph>
		</tableCell>
	</tableRow>
</table>
```

The above model structure will be rendered to the {@link module:editor-classic/classiceditor~ClassicEditor#getData data} as:

```html
<figure class="table">
	<table>
		<tbody>
			<tr>
				<td>Foo</td>
				<td>Bar</td>
			</tr>
		</tbody>
	</table>
</figure>
```

In the editing view (the editable container in which the user edits the content) additional `<span>` elements are created to compensate for the hidden `<paragraph>` elements:

```html
<figure class="table">
	<table>
		<tbody>
			<tr>
				<td><span>Foo</span></td>
				<td><span>Bar</span></td>
			</tr>
		</tbody>
	</table>
</figure>
```

### Block content

If a table cell contains any other block content than a single `<paragraph>` with no attributes, these block elements will be rendered.

The following is a sample table with some block content (model representation):

```html
<table>
	<tableRow>
		<tableCell>
			<paragraph>Foo</paragraph>
			<paragraph>Bar</paragraph>
		</tableCell>
		<tableCell>
			<heading1>Some title</heading1>
		</tableCell>
		<tableCell>
			<paragraph textAlign="right">Baz</paragraph>
		</tableCell>
	</tableRow>
</table>
```

The above model structure will be rendered to the data and to the editing view as:

```html
<figure class="table">
	<table>
		<tbody>
			<tr>
				<td>
					<p>Foo</p>
					<p>Bar</p>
				</td>
				<td>
					<h2>Some title</h2>
				</td>
				<td>
					<p style="text-align: right;">Baz</p>
				</td>
			</tr>
		</tbody>
	</table>
</figure>
```

<info-box info>
	At the moment it is not possible to completely disallow block content in tables. See the [discussion on GitHub](https://github.com/ckeditor/ckeditor5-table/issues/101) about adding a configuration option that would enable that. 👍 if you need this feature.
</info-box>

## Common API

The {@link module:table/table~Table} plugin registers the following UI components:

* The `'insertTable'` dropdown.
* The `'tableColumn'` dropdown.
* The `'tableRow'` dropdown.
* The `'mergeTableCells'` dropdown.
* The `'tableProperties'` button.
* The `'tableCellProperties'` button.

And the following commands:

| {@link framework/guides/architecture/core-editor-architecture#commands Command} name | Implemented by |
|----------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| `'insertTable'`                  | {@link module:table/commands/inserttablecommand~InsertTableCommand}                                                       |
| `'insertTableColumnLeft'`        | {@link module:table/commands/insertcolumncommand~InsertColumnCommand}                                                     |
| `'insertTableColumnRight'`       | {@link module:table/commands/insertcolumncommand~InsertColumnCommand}                                                     |
| `'insertTableRowAbove'`          | {@link module:table/commands/insertrowcommand~InsertRowCommand}                                                           |
| `'insertTableRowBelow'`          | {@link module:table/commands/insertrowcommand~InsertRowCommand}                                                           |
| `'removeTableColumn'`            | {@link module:table/commands/removecolumncommand~RemoveColumnCommand}                                                     |
| `'removeTableRow'`               | {@link module:table/commands/removerowcommand~RemoveRowCommand}                                                           |
| `'setTableColumnHeader'`         | {@link module:table/commands/setheadercolumncommand~SetHeaderColumnCommand}                                               |
| `'setTableRowHeader'`            | {@link module:table/commands/setheaderrowcommand~SetHeaderRowCommand}                                                     |
| `'mergeTableCellRight'`          | {@link module:table/commands/mergecellcommand~MergeCellCommand}                                                           |
| `'mergeTableCellLeft'`           | {@link module:table/commands/mergecellcommand~MergeCellCommand}                                                           |
| `'mergeTableCellUp'`             | {@link module:table/commands/mergecellcommand~MergeCellCommand}                                                           |
| `'mergeTableCellDown'`           | {@link module:table/commands/mergecellcommand~MergeCellCommand}                                                           |
| `'splitTableCellVertically'`     | {@link module:table/commands/splitcellcommand~SplitCellCommand}                                                           |
| `'splitTableCellHorizontally'`   | {@link module:table/commands/splitcellcommand~SplitCellCommand}                                                           |
| `'tableCellBorderStyle'`         | {@link module:table/tablecellproperties/commands/tablecellborderstylecommand~TableCellBorderStyleCommand}                 |
| `'tableCellBorderColor'`         | {@link module:table/tablecellproperties/commands/tablecellbordercolorcommand~TableCellBorderColorCommand}                 |
| `'tableCellBorderWidth'`         | {@link module:table/tablecellproperties/commands/tablecellborderwidthcommand~TableCellBorderWidthCommand}                 |
| `'tableCellHorizontalAlignment'` | {@link module:table/tablecellproperties/commands/tablecellhorizontalalignmentcommand~TableCellHorizontalAlignmentCommand} |
| `'tableCellWidth'`               | {@link module:table/tablecellproperties/commands/tablecellwidthcommand~TableCellWidthCommand}                             |
| `'tableCellHeight'`              | {@link module:table/tablecellproperties/commands/tablecellheightcommand~TableCellHeightCommand}                           |
| `'tableCellPadding'`             | {@link module:table/tablecellproperties/commands/tablecellpaddingcommand~TableCellPaddingCommand}                         |
| `'tableCellBackgroundColor'`     | {@link module:table/tablecellproperties/commands/tablecellbackgroundcolorcommand~TableCellBackgroundColorCommand}         |
| `'tableCellVerticalAlignment'`   | {@link module:table/tablecellproperties/commands/tablecellverticalalignmentcommand~TableCellVerticalAlignmentCommand}     |
| `'tableBorderColor'`             | {@link module:table/tableproperties/commands/tablebordercolorcommand~TableBorderColorCommand}                             |
| `'tableBorderStyle'`             | {@link module:table/tableproperties/commands/tableborderstylecommand~TableBorderStyleCommand}                             |
| `'tableBorderWidth'`             | {@link module:table/tableproperties/commands/tableborderwidthcommand~TableBorderWidthCommand}                             |
| `'tableAlignment'`               | {@link module:table/tableproperties/commands/tablealignmentcommand~TableAlignmentCommand}                                 |
| `'tableWidth'`                   | {@link module:table/tableproperties/commands/tablewidthcommand~TableWidthCommand}                                         |
| `'tableHeight'`                  | {@link module:table/tableproperties/commands/tableheightcommand~TableHeightCommand}                                       |
| `'tableBackgroundColor'`         | {@link module:table/tableproperties/commands/tablebackgroundcolorcommand~TableBackgroundColorCommand}                     |

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces two balloon toolbars for tables.
* The content toolbar shows up when table cell is selected and is anchored to the table. It is possible to {@link module:table/table~TableConfig#contentToolbar configure} its content. Normally, it contains the table-related tools such as `'tableColumn'`, `'tableRow'`, and `'mergeTableCells'` dropdowns.
* The table toolbar shows up when the whole table is selected, for instance using the widget handler. It is possible to {@link module:table/table~TableConfig#tableToolbar configure} its content.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-table.
