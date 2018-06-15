---
title: Tables
category: features
---

{@snippet features/build-table-source}

The {@link module:table/table~Table} feature offers table creation an editing tools that help content authors bring tabular data into their documents.

## Demo

{@snippet features/table}

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package

```bash
npm install --save @ckeditor/ckeditor5-table
```

then add `'Table'` and `'TableToolbar'` to your plugin list and the table toolbar configuration:

```js
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableToolbar, ... ],
		toolbar: [ 'insertTable', ... ]
		table: {
			toolbar: [ 'tableColumn', 'tableRow', 'mergeCell' ]
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/development/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:table/table~Table} plugin registers the following UI components:

* The `'insertTable'` dropdown,
* The `'tableColumn'` dropdown,
* The `'tableRow'` dropdown,
* The `'mergeCell'` dropdown,

and the following commands:

* The {@link module:table/commands/inserttablecommand~InsertTableCommand `'inserttable'`} command.

	To insert a table at the current selection, execute the command and specify the dimensions:

	```js
	editor.execute( 'insertTable', { rows: 20, columns: 5 } );
	```

* The {@link module:table/commands/insertcolumncommand~InsertColumnCommand} as `'insertColumnBefore'` and `'insertColumnAfter'` commands.

	To insert a column before or after the selected cell, execute one of the commands:

	```js
	editor.execute( 'insertColumnBefore' );
	```

	or

	```js
	editor.execute( 'insertColumnAfter' );
	```

* The {@link module:table/commands/insertrowcommand~InsertRowCommand} as `'insertRowAbove'`and `'insertRowBelow'` commands.

	To insert a row below or above the selected cell, execute one of the commands:

	```js
	editor.execute( 'insertRowBelow' );
	```

	or

	```js
	editor.execute( 'insertRowAbove' );
	```

* The {@link module:table/commands/removecolumncommand~RemoveColumnCommand `'removeColumn'`} command.

	To remove the column containing the selected cell, execute the command:

	```js
	editor.execute( 'removeColumn' );
	```

* The {@link module:table/commands/removerowcommand~RemoveRowCommand `'removeRow'`} command.

	To remove the row containing the selected cell, execute the command:

	```js
	editor.execute( 'removeRow' );
	```

* The {@link module:table/commands/setheadercolumncommand~SetHeaderColumnCommand `'setColumnHeader'`} command.

	You can make the column containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element) by executing:

	```js
	editor.execute( 'setColumnHeader' );
	```

	**Note:** All preceding columns will also become headers. If the current column is already a header, executing this command will make it a regular column back again (including following columns).

* The {@link module:table/commands/setheaderrowcommand~SetHeaderRowCommand `'setRowHeader'`} command.

	You can make the row containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element) by executing:

	```js
	editor.execute( 'setRowHeader' );
	```

	**Note:** All preceding rows will also become headers. If the current row is already a header, executing this command will make it a regular row back again (including following rows).

* The {@link module:table/commands/mergecellcommand~MergeCellCommand} as `'mergeCellRight'`, `'mergeCellLeft'`, `'mergeCellUp'` and `'mergeCellDown'` commands.

	To merge a table cell at the current selection with another cell, execute the command corresponding with the preferred direction. E.g. to merge with a cell to the right:

	```js
	editor.execute( 'mergeCellRight' );
	```

	**Note**: If a table cell has a different [`rowspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-rowspan) (for `'mergeCellRight'` and `'mergeCellLeft'`) or [`colspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-colspan) (for `'mergeCellUp'` and `'mergeCellDown'`), the command will be disabled.

* The {@link module:table/commands/splitcellcommand~SplitCellCommand} as `'splitCellVertically'` and `'splitCellHorizontally'` commands.

	You can split any cell vertically or horizontally by executing this command. E.g. to split the selected table cell vertically:

	```js
	editor.execute( 'splitCellVertically' );
	```

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces the balloon toolbar for the tables. The toolbar shows up when a table cell is selected, anchored to the table. It is possible to {@link module:table/table~TableConfig#toolbar configure} its content. Normally, it contains the table-related tools such as `'tableColumn'`, `'tableRow'`, and `'mergeCell'` dropdowns.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-table.
