---
menu-title: Basic table features
category: tables
order: 20
modified_at: 2022-05-19
---
# Basic table features

{@snippet features/build-table-source}

The basic table features allow users to insert tables into content, add or remove columns and rows and merge or split cells. It is also worth noting that you will find them out–of–the–box in all {@link installation/getting-started/predefined-builds predefined builds}.

<info-box info>
	The basic table features are enabled by default in all predefined builds. The installation instructions are for developers interested in building their own, custom rich text editor.
</info-box>

## Demo

The editor below shows the basic set of table features focusing on the **structure and semantics**. Use the **Insert table** toolbar button {@icon @ckeditor/ckeditor5-table/theme/icons/table.svg Insert table} in the editor below to create new tables. 

Click anywhere inside the table to invoke the table toolbar. The features available in there allow users to add or remove columns {@icon @ckeditor/ckeditor5-table/theme/icons/table-column.svg Table column} and rows {@icon @ckeditor/ckeditor5-table/theme/icons/table-row.svg Table row} and merge or split cells {@icon @ckeditor/ckeditor5-table/theme/icons/table-merge-cell.svg Table cell}.

{@snippet features/table-basic}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Table selection

The {@link module:table/tableselection~TableSelection} plugin introduces support for the custom selection system for tables that lets you:

* Select an arbitrary rectangular table fragment &mdash; a few cells from different rows, a column (or a few of them) or a row (or multiple rows).
* Apply formatting or add a link to all selected cells at once.

The table selection plugin is loaded automatically by the `Table` plugin and can be tested in the [demo above](#demo).

## Typing around tables

To type before or after a table easily, select the table, then press the Arrow key (<kbd>←</kbd> or <kbd>→</kbd>) once, depending on where you want to add content &ndash; before or after. The table is no longer selected and whatever text you type will appear in the desired position.

## Table contextual toolbar

The {@link module:table/tabletoolbar~TableToolbar} plugin available in all editor builds introduces a contextual toolbar for table. The toolbar appears when a table or a cell is selected and contains various table-related buttons. These would typically include add or remove columns {@icon @ckeditor/ckeditor5-table/theme/icons/table-column.svg Table column} and rows {@icon @ckeditor/ckeditor5-table/theme/icons/table-row.svg Table row} and merge or split cells {@icon @ckeditor/ckeditor5-table/theme/icons/table-merge-cell.svg Table cell}. If these features are configured, the toolbar will also contain buttons for captions {@icon @ckeditor/ckeditor5-core/theme/icons/caption.svg Table caption} and table {@icon @ckeditor/ckeditor5-table/theme/icons/table-properties.svg Table properties} and cell {@icon @ckeditor/ckeditor5-table/theme/icons/table-cell-properties.svg Cell properties} properties.

{@img assets/img/table-toolbar.png 569 An extended contextual toolbar.}

The table selection plugin is loaded automatically by the `Table` plugin and can be tested in the [demo above](#demo). Learn more about configuring contextual toolbar in the Common API section [below](#toolbars).

## Block vs inline content in table cells

The table feature allows for creating block content (like paragraphs, lists, headings, etc.) inside table cells. However, if a table cell contains just one paragraph and this paragraph has no special attributes (like text alignment), the cell content is considered "inline" and the paragraph is not rendered.

This means that a table cell can have two states: with inline content or with block content. The reason for this differentiation is that most tables contain only inline content (e.g. in the [demo](#demo) above) and it is common for "data tables" to not contain any block content. In such a scenario, printing out `<p>` elements would be semantically incorrect and also unnecessary. There are, however, scenarios where the user wants to create, for example, a list inside a table cell and then the support for block content is necessary.

<info-box>
	"Rendering" here refers to the view layer. In the model, a cell is always filled with at least a `<paragraph>`. This is because of consistency, as &mdash; since a cell always has some block content &mdash; the text is never directly inside the `<tableCell>`. This also allows features like <kbd>Enter</kbd> support to work out of the box (since a `<paragraph>` exists in the model, it can be split despite the fact that it is not present in the view).
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

In the editing view (the editable container in which the user edits the content), additional `<span>` elements are created to compensate for the hidden `<paragraph>` elements:

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
	At the moment, it is not possible to completely disallow block content in tables. See the [discussion on GitHub](https://github.com/ckeditor/ckeditor5-table/issues/101) about adding a configuration option that would enable that. Feel free to upvote 👍&nbsp; if this feature is important to you.
</info-box>

## Installation

<info-box info>
	The basic table features are enabled by default in all predefined builds. The installation instructions are for developers interested in building their own, custom rich text editor.
</info-box>

To add only the basic table features to your editor, install the [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package:

```
npm install --save @ckeditor/ckeditor5-table
```

Then add the `Table` and `TableToolbar` plugins to your plugin list and configure the table toolbar:

```js
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableToolbar, Bold, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Default table headers

In order to make every inserted table to have `n` number of rows and columns as table headers by default, set an optional table config property `defaultHeadings` as follows:

```js
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableToolbar, Bold, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
		table: {
			defaultHeadings: { rows: 1, columns: 1 }
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Check the table with default headers applied to both the first row and the first column in the demo below. Click on the table and use the column properties {@icon @ckeditor/ckeditor5-table/theme/icons/table-column.svg Table column} or the row properties {@icon @ckeditor/ckeditor5-table/theme/icons/table-row.svg Table row} UI button to toggle the respective headers.

{@snippet features/table-default-headings}

## Common API

### UI components

The {@link module:table/table~Table} plugins register the following UI components:

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
	</tbody>
</table>

#### Toolbars

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces two balloon toolbars for tables.
* The content toolbar shows up when a table cell is selected and it is anchored to the table. It is possible to {@link module:table/table~TableConfig#contentToolbar configure} its content. Normally, the toolbar contains the table-related tools such as `'tableColumn'` and `'tableRow'` dropdowns and `'mergeTableCells'` split button.
* The table toolbar shows up when the whole table is selected, for instance using the widget handler. It is possible to {@link module:table/table~TableConfig#tableToolbar configure} its content.

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
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
