---
title: Tables
category: features
---

{@snippet features/build-table-source}

The {@link module:table/table~Table} feature offers table creation and editing tools that help content authors bring tabular data into their documents.

## Demo

{@snippet features/table}

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

And the following commands:

* The `'insertTable'` command implemented by {@link module:table/commands/inserttablecommand~InsertTableCommand}.
* The `'insertTableColumnBefore'` command implemented by {@link module:table/commands/insertcolumncommand~InsertColumnCommand}.
* The `'insertTableColumnAfter'` command implemented by {@link module:table/commands/insertcolumncommand~InsertColumnCommand}.
* The `'insertTableRowAbove'` command implemented by {@link module:table/commands/insertrowcommand~InsertRowCommand}.
* The `'insertTableRowBelow'` command implemented by {@link module:table/commands/insertrowcommand~InsertRowCommand}.
* The `'removeTableColumn'` command implemented by {@link module:table/commands/removecolumncommand~RemoveColumnCommand}.
* The `'removeTableRow'` command implemented by {@link module:table/commands/removerowcommand~RemoveRowCommand}.
* The `'setTableColumnHeader'` command implemented by {@link module:table/commands/setheadercolumncommand~SetHeaderColumnCommand}.
* The `'setTableRowHeader'` command implemented by {@link module:table/commands/setheaderrowcommand~SetHeaderRowCommand}.
* The `'mergeTableCellRight'` command implemented by {@link module:table/commands/mergecellcommand~MergeCellCommand}.
* The `'mergeTableCellLeft'` command implemented by {@link module:table/commands/mergecellcommand~MergeCellCommand}.
* The `'mergeTableCellUp'` command implemented by {@link module:table/commands/mergecellcommand~MergeCellCommand}.
* The `'mergeTableCellDown'` command implemented by {@link module:table/commands/mergecellcommand~MergeCellCommand}.
* The `'splitTableCellVertically'` command implemented by {@link module:table/commands/splitcellcommand~SplitCellCommand}.
* The `'splitTableCellHorizontally'` command implemented by {@link module:table/commands/splitcellcommand~SplitCellCommand}.

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces two balloon toolbars for tables.
* The content toolbar shows up when table cell is selected and is anchored to the table. It is possible to {@link module:table/table~TableConfig#contentToolbar configure} its content. Normally, it contains the table-related tools such as `'tableColumn'`, `'tableRow'`, and `'mergeTableCells'` dropdowns.
* The table toolbar shows up when the whole table is selected, for instance using the widget handler. It is possible to {@link module:table/table~TableConfig#tableToolbar configure} its content.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-table.
