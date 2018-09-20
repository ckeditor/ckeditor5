---
title: Tables
category: features
---

{@snippet features/build-table-source}

The {@link module:table/table~Table} feature offers table creation and editing tools that help content authors bring tabular data into their documents.

## Demo

{@snippet features/table}

## Installation

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
		plugins: [ Table, TableToolbar, ... ],
		toolbar: [ 'insertTable', ... ]
		table: {
			toolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	At the moment by default the table feature is available only in the {@link builds/guides/overview#document-editor document editor build}. Read more about {@link builds/guides/integration/installing-plugins installing plugins} if you want to add it to other editor builds.
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

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces the balloon toolbar for tables. The toolbar shows up when a table cell is selected and is anchored to the table. It is possible to {@link module:table/table~TableConfig#toolbar configure} its content. Normally, it contains the table-related tools such as `'tableColumn'`, `'tableRow'`, and `'mergeTableCells'` dropdowns.

## Block vs inline content in table cells

The table feature supports block content - like paragraphs, lists, headings, etc - in table cells. The table cells in the model will always have at least one block. For empty table cell it will be empty `<paragraph>`. Such table cells (with single `<pargraph>`) are considered as cells with inline content only.

<info-box info>
	The table might consist table cells of both types.
</info-box>

### Inline content

A table cell with inline content (single `<paragraph>`) will be rendered (ie. when using {@link module:core/editor/editor~Editor#getData()} directly in the `<td>` or `<th>` element without wrapping in `<p>`. A table with only inline content in table cells is considered a data table used to present tabular data. Such tables are ususally used with short content and additional paragraphs are often redundant.

Example table with inline content (model representation):

```html
<table>
	<tableRow>
		<tableCell>
			<paragraph>Foo <$text bold="true">Bar</$text></paragraph>
		</tableCell>
		<tableCell>
			<paragraph></paragraph>
		</tableCell>
	</tableRow>
</table>
```
will be rendered as:

```html
<figure class="table">
	<table>
		<tbody>
			<tr>
				<td>Foo <strong>Bar</strong></td>
				<td></td>
			</tr>
		</tbody>
	</table>
</figure>
```

### Block content

Blocks other then `<paragraph>`, even if being single, will be always rendered in the view. If there are other blocks in table cells the `<paragraph>` will be rendered as `<p>`. A single `<pargraph>` might be also rendered to the View when it has attributes.

Example table with block content (model representation):

```html
<table>
	<tableRow>
		<tableCell>
			<paragraph>Foo</paragraph>
			<paragraph><$text bold="true">Bar</$text></paragraph>
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
will be rendered as:

```html
<figure class="table">
	<table>
		<tbody>
			<tr>
				<td>
					<p>Foo</p>
					<p><strong>Bar</strong></p>
				</td>
				<td>
					<h2>Some title</h2>
				</td>
				<td>
					<p style="text-align:right;">Baz</p>
				</td>
			</tr>
		</tbody>
	</table>
</figure>
```

<info-box info>
	At the moment the block content in table feature is not configurable. It means that you cannot enforce inline content in table cells. Right now we're [discussing it on github](https://github.com/ckeditor/ckeditor5-table/issues/101) as adding such configuration would intoduce complexity into the table editing feature.
</info-box>


## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-table.
