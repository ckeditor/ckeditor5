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
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'blockQuote' ]
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

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces the balloon toolbars for tables. The content toolbar shows up when a table cell is selected and is anchored to the table. It is possible to {@link module:table/table~TableConfig#contentToolbar configure} its content. Normally, it contains the table-related tools such as `'tableColumn'`, `'tableRow'`, and `'mergeTableCells'` dropdowns. There is also the second toolbar for the whole table selected which you can configure via the {@link module:table/table~TableConfig#tableToolbar configuration}.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-table.
