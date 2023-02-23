---
menu-title: Table caption
category: tables
order: 50
modified_at: 2022-05-19
---

# Table caption

{@snippet features/build-table-source}

The {@link module:table/tablecaption~TableCaption} plugin adds support for table captions. These work very much like image captions &mdash; the caption informs the reader about the content of the table. Using captions is also beneficial from the accessibility point of view as they would be read by screen readers.

<info-box>
	By default, the table caption feature is not included in the {@link installation/getting-started/predefined-builds predefined builds} and must be installed separately. See the [installation](#installation) section to learn how to enable it in your editor.
</info-box>

## Demo

Click on the table caption in the demo to edit it or use the table toolbar button {@icon @ckeditor/ckeditor5-core/theme/icons/caption.svg Table caption} to toggle the caption on and off.

{@snippet features/table-caption}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Installation

To enable the table caption feature in your editor, you need to have the [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package installed (it is already present in the predefined builds):

```
npm install --save @ckeditor/ckeditor5-table
```

Then add the `Table`, `TableToolbar`, and **`TableCaption`** plugins to your plugin list and configure the table toolbar:

```js
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableToolbar, TableCaption, Bold, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
		table: {
			contentToolbar: [
				'toggleTableCaption'
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

By default, the table caption is placed above the table. You can change the placement by setting [`caption-side`](https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side) in your {@link installation/advanced/content-styles content styles} for the `.ck-content .table > figcaption` style. Changing it to `caption-side: bottom` will display the caption below the table.

## Common API

### UI components

The table plugins register the following UI components:

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

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces two balloon toolbars for tables.
* The content toolbar shows up when a table cell is selected and it is anchored to the table. It is possible to {@link module:table/table~TableConfig#contentToolbar configure} its content. Normally, the toolbar contains the table-related tools such as `'tableColumn'` and `'tableRow'` dropdowns and `'mergeTableCells'` split button.
* The table toolbar shows up when the whole table is selected, for instance using the widget handler. It is possible to {@link module:table/table~TableConfig#tableToolbar configure} its content.

### Editor commands

<table>
	<thead>
		<tr>
			<th>{@link framework/guides/architecture/core-editor-architecture#commands Command} name</th>
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
		<tr>
			<td><code>'toggleTableCaption'</code></td>
			<td>{@link module:table/tablecaption/toggletablecaptioncommand~ToggleTableCaptionCommand}</td>
			<td>{@link module:table/tablecaption~TableCaption}</td>
		</tr>
		<tr>
			<td><code>'tableBorderColor'</code></td>
			<td>{@link module:table/tableproperties/commands/tablebordercolorcommand~TableBorderColorCommand}</td>
			<td rowspan="7">{@link module:table/tableproperties~TableProperties}</td>
		</tr>
		<tr>
			<td><code>'tableBorderStyle'</code></td>
			<td>{@link module:table/tableproperties/commands/tableborderstylecommand~TableBorderStyleCommand}</td>
		</tr>
		<tr>
			<td><code>'tableBorderWidth'</code></td>
			<td>{@link module:table/tableproperties/commands/tableborderwidthcommand~TableBorderWidthCommand}</td>
		</tr>
		<tr>
			<td><code>'tableAlignment'</code></td>
			<td>{@link module:table/tableproperties/commands/tablealignmentcommand~TableAlignmentCommand}</td>
		</tr>
		<tr>
			<td><code>'tableWidth'</code></td>
			<td>{@link module:table/tableproperties/commands/tablewidthcommand~TableWidthCommand}</td>
		</tr>
		<tr>
			<td><code>'tableHeight'</code></td>
			<td>{@link module:table/tableproperties/commands/tableheightcommand~TableHeightCommand}</td>
		</tr>
		<tr>
			<td><code>'tableBackgroundColor'</code></td>
			<td>{@link module:table/tableproperties/commands/tablebackgroundcolorcommand~TableBackgroundColorCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellBorderStyle'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellborderstylecommand~TableCellBorderStyleCommand}</td>
			<td rowspan="9">{@link module:table/tablecellproperties~TableCellProperties}</td>
		</tr>
		<tr>
			<td><code>'tableCellBorderColor'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellbordercolorcommand~TableCellBorderColorCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellBorderWidth'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellborderwidthcommand~TableCellBorderWidthCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellHorizontalAlignment'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellhorizontalalignmentcommand~TableCellHorizontalAlignmentCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellWidth'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellwidthcommand~TableCellWidthCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellHeight'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellheightcommand~TableCellHeightCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellPadding'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellpaddingcommand~TableCellPaddingCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellBackgroundColor'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellbackgroundcolorcommand~TableCellBackgroundColorCommand}</td>
		</tr>
		<tr>
			<td><code>'tableCellVerticalAlignment'</code></td>
			<td>{@link module:table/tablecellproperties/commands/tablecellverticalalignmentcommand~TableCellVerticalAlignmentCommand}</td>
		</tr>
	</tbody>
</table>

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
