---
title: Table
category: features
---

{@snippet features/build-table-source}

The {@link module:table/table~Table} feature offers table creation an editing tools that help content authors representing tabular data.

## Demo

{@snippet features/table}

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package:

```bash
npm install --save @ckeditor/ckeditor5-table
```

And add `'Table'` and `'TableToolbar'` to your plugin list and the table toolbar configuration:

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

The {@link module:table/table~Table} plugin registers UI components:

* The `'insertTable'` dropdown,
* The `'tableColumn'` dropdown,
* The `'tableRow'` dropdown,
* The `'mergeCell'` dropdown,

and following commands:

* The {@link module:table/commands/inserttablecommand~InsertTableCommand `'inserttable'`} command.

	To insert a table in current selection execute command with desired table dimensions:

	```js
	editor.execute( 'insertTable', { rows: 20, columns: 5 } );
	```

* The {@link module:table/commands/insertcolumncommand~InsertColumnCommand} as `'insertColumnBefore'` and `'insertColumnAfter'` commands.

	To insert a column before or after selected table cell's column execute command:

	```js
	editor.execute( 'insertColumnBefore' );
	```

	or

	```js
	editor.execute( 'insertColumnAfter' );
	```

* The {@link module:table/commands/insertrowcommand~InsertRowCommand} as `'insertRowAbove'`and `'insertRowBelow'` commands.

	To insert a row below or above selected table cell's row execute command:

	```js
	editor.execute( 'insertRowBelow' );
	```

	or

	```js
	editor.execute( 'insertRowAbove' );
	```

* The {@link module:table/commands/removecolumncommand~RemoveColumnCommand `'removeColumn'`} command.

	To remove column of currently selected table cell execute command:

	```js
	editor.execute( 'removeColumn' );
	```

* The {@link module:table/commands/removerowcommand~RemoveRowCommand `'removeRow'`} command.

	To remove row of currently selected table cell execute command:

	```js
	editor.execute( 'removeRow' );
	```

* The {@link module:table/commands/setheadercolumncommand~SetHeaderColumnCommand `'setColumnHeader'`} command.

	You can set a column of currently selected table cell to be a header by executing:

	```js
	editor.execute( 'setColumnHeader' );
	```

	All previous columns will also be set as a headers. If current column is already header executing this command will unset this column and any columns after as a header.   

* The {@link module:table/commands/setheaderrowcommand~SetHeaderRowCommand `'setRowHeader'`} command.

	You can set a row of currently selected table cell to be a header by executing:

	```js
	editor.execute( 'setRowHeader' );
	```

	All previous rows will also be set as a headers. If current row is already header executing this command will unset this row and any rows after as a header.   

* The {@link module:table/commands/mergecellcommand~MergeCellCommand} as `'mergeCellRight'`, `'mergeCellLeft'`, `'mergeCellUp'` and `'mergeCellDown'` commands.

	To merge a table cell in which is current selection with other table cell execute command of desired direction. To merge currently selected table cell with a cell on the right execute:

	```js
	editor.execute( 'mergeCellRight' );
	```

	**Note**: if a table cell has different rowspan (for `'mergeCellRight'` and `'mergeCellLeft'`) or colspan (for `'mergeCellUp'` and `'mergeCellDown'`) the command will be disabled.

* The {@link module:table/commands/splitcellcommand~SplitCellCommand} as `'splitCellVertically'` and `'splitCellHorizontally'` commands.

	You can split any cell vertically and horizontally to two cells by executing command. For instance, to split a currently selected table cell vertically by executing a command:
	

	```js
	editor.execute( 'splitCellVertically' );
	```

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces a contextual toolbar for tables. The toolbar appears when an table is selected and can be configured to contain any buttons you want. Usually, these will be table-related options such as `'tableColumn'`, `'tableRow'` and `'mergeCell'` dropdowns.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-table.
