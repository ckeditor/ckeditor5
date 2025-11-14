---
menu-title: Basics
meta-title: Tables overview | CKEditor 5 Documentation
meta-description: Create and customize tables in CKEditor 5 to organize data effectively with support for merging cells, headers, and responsive layouts.
category: tables
order: 20
modified_at: 2023-02-22
---

# Installation

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Table, TableToolbar } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableToolbar, Bold, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
		table: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

### Table contextual toolbar

Easily control your tables employing a dedicated toolbar.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Default table headers

To make every inserted table have `n` number of rows and columns as table headers by default, set an optional table configuration property `defaultHeadings` as follows:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		table: {
			defaultHeadings: { rows: 1, columns: 1 }
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Check the table with default headers applied to both the first row and the first column in the demo below. Click on the table and use the column properties {@icon @ckeditor/ckeditor5-icons/theme/icons/table-column.svg Table column} or the row properties {@icon @ckeditor/ckeditor5-icons/theme/icons/table-row.svg Table row} UI button to toggle the respective headers.

{@snippet features/table-default-headings}

### Disallow nesting tables

By default, the editor allows nesting a table inside another table's cell.

To disallow nesting tables, you need to register an additional schema rule. It needs to be added before the data is loaded into the editor. Due to that, it is best to implement it as a plugin:

```js
function DisallowNestingTables( editor ) {
	editor.model.schema.addChildCheck( ( context, childDefinition ) => {
		if ( childDefinition.name == 'table' && Array.from( context.getNames() ).includes( 'table' ) ) {
			return false;
		}
	} );
}

// Pass it via config.extraPlugins or config.plugins:

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		extraPlugins: [ DisallowNestingTables ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box>
	Check the {@link tutorials/crash-course/editor step-by-step tutorial} if you need more information about the technical side of this solution.
</info-box>

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Common API

### UI components

The {@link module:table/table~Table} plugins register the following UI components:

<table>
	<thead>
		<th>{@link getting-started/setup/toolbar Component} name</th>
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
	</tbody>
</table>

#### Toolbars

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces two balloon toolbars for tables.
* The content toolbar shows up when a table cell is selected and it is anchored to the table. It is possible to {@link module:table/tableconfig~TableConfig#contentToolbar configure} its content. Normally, the toolbar contains the table-related tools such as `'tableColumn'` and `'tableRow'` dropdowns and `'mergeTableCells'` split button.
* The table toolbar shows up when the whole table is selected, for instance using the widget handler. It is possible to {@link module:table/tableconfig~TableConfig#tableToolbar configure} its content.

<!-- not sure what to do about this ^ -->

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
	</tbody>
</table>

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>
