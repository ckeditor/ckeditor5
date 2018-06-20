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

Then add `'Table'` and `'TableToolbar'` to your plugin list and configure the table toolbar:

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
	At the moment by default the table feature is available only in the {@link builds/guides/overview#document-editor document editor build}. Read more about {@link builds/guides/development/installing-plugins installing plugins} if you want to add it to other editor builds.
</info-box>

## Common API

The {@link module:table/table~Table} plugin registers the following UI components:

* The `'insertTable'` dropdown.
* The `'tableColumn'` dropdown.
* The `'tableRow'` dropdown.
* The `'mergeTableCells'` dropdown.

And the following commands:

* The {@link module:table/commands/inserttablecommand~InsertTableCommand `'insertTable'`} command.

	To insert a table at the current selection, execute the command and specify the dimensions:

	```js
	editor.execute( 'insertTable', { rows: 20, columns: 5 } );
	```

* The {@link module:table/commands/insertcolumncommand~InsertColumnCommand} in a form of `'insertTableColumnBefore'` and `'insertTableColumnAfter'` commands.

	To insert a column before the selected cell, execute the following command:

	```js
	editor.execute( 'insertTableColumnBefore' );
	```

	To insert a column after the selected cell, execute the following command:

	```js
	editor.execute( 'insertTableColumnAfter' );
	```

* The {@link module:table/commands/insertrowcommand~InsertRowCommand} in a form of `'insertTableRowAbove'` and `'insertTableRowBelow'` commands.

	To insert a row below the selected cell, execute the following command:

	```js
	editor.execute( 'insertTableRowBelow' );
	```

	To insert a row above the selected cell, execute the following command:

	```js
	editor.execute( 'insertTableRowAbove' );
	```

* The {@link module:table/commands/removecolumncommand~RemoveColumnCommand `'removeTableColumn'`} command.

	To remove the column containing the selected cell, execute the command:

	```js
	editor.execute( 'removeTableColumn' );
	```

* The {@link module:table/commands/removerowcommand~RemoveRowCommand `'removeTableRow'`} command.

	To remove the row containing the selected cell, execute the command:

	```js
	editor.execute( 'removeTableRow' );
	```

* The {@link module:table/commands/setheadercolumncommand~SetHeaderColumnCommand `'setTableColumnHeader'`} command.

	You can make the column containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element) by executing:

	```js
	editor.execute( 'setTableColumnHeader' );
	```

	**Note:** All preceding columns will also become headers. If the current column is already a header, executing this command will make it a regular column back again (including the following columns).

* The {@link module:table/commands/setheaderrowcommand~SetHeaderRowCommand `'setTableRowHeader'`} command.

	You can make the row containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element) by executing:

	```js
	editor.execute( 'setTableRowHeader' );
	```

	**Note:** All preceding rows will also become headers. If the current row is already a header, executing this command will make it a regular row back again (including the following rows).

* The {@link module:table/commands/mergecellcommand~MergeCellCommand} in a form of `'mergeTableCellRight'`, `'mergeTableCellLeft'`, `'mergeTableCellUp'` and `'mergeTableCellDown'` commands.

	To merge a table cell at the current selection with another cell, execute the command corresponding with the preferred direction. For example, to merge with a cell to the right:

	```js
	editor.execute( 'mergeTableCellRight' );
	```

	**Note**: If a table cell has a different [`rowspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-rowspan) (for `'mergeTableCellRight'` and `'mergeTableCellLeft'`) or [`colspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-colspan) (for `'mergeTableCellUp'` and `'mergeTableCellDown'`), the command will be disabled.

* The {@link module:table/commands/splitcellcommand~SplitCellCommand} as `'splitTableCellVertically'` and `'splitTableCellHorizontally'` commands.

	You can split any cell vertically or horizontally by executing this command. For example, to split the selected table cell vertically:

	```js
	editor.execute( 'splitTableCellVertically' );
	```

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces the balloon toolbar for tables. The toolbar shows up when a table cell is selected and is anchored to the table. It is possible to {@link module:table/table~TableConfig#toolbar configure} its content. Normally, it contains the table-related tools such as `'tableColumn'`, `'tableRow'`, and `'mergeTableCells'` dropdowns.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-table.
