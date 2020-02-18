---
title: Tables
category: features
---

{@snippet features/build-table-source}

The {@link module:table/table~Table} feature offers table creation and editing tools that help content authors bring tabular data into their documents.

## Demos

### Basic table features

The editor bellow shows the basic set of table features focusing on the **structure and semantics**. These features allow users to insert new tables into the content, add or remove columns and rows, define headers, and merge multiple cells. It is also worth noting that you will find them out–of–the–box in all {@link builds/guides/overview ready–to–use editor builds}.

{@snippet features/table}

Use the **"Insert table"** button in the toolbar to create new tables. Focus any cell in the table to display the toolbar with buttons that will help you further shape the structure of the table.

### Table and cell styling tools

In addition to the default table features described in the [previous section](#basic-table-features), the editor below comes with some additional tools that will help you modify **the look of tables and table cells**, for instance, their border color and style, background color, padding, or text alignment.

{@snippet features/table-styling}

Put the caret anywhere inside the table and click the **"Table properties"** button in the toolbar to open a pop–up with multiple options that will allow you to shape the look of the entire table. If you click the **"Cell properties"** button, a similar interface will appear with styling options for individual table cells. [Learn more](#configuring-background-and-border-colors) about configuring color palettes in the table styling pop–up interfaces.

<info-box>
	By default, table styling tools are not included in the {@link builds/guides/overview ready–to–use editor builds} and must be installed separately. See the [installation](#table-and-cell-styling-tools-2) section to learn how to enable them in your editor.
</info-box>

## Installation

### Basic table features

<info-box info>
	The basic table features are enabled by default in all builds. The installation instructions are for developers interested in building their own, custom rich text editor.
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
		plugins: [ Table, TableToolbar, Bold, ... ],
		toolbar: [ 'insertTable', ... ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( ... )
	.catch( ... );
```

### Table and cell styling tools

To enable not only the [basic table features](#basic-table-features-2) but also the rich table and cell styling tools in your editor, install the [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package:

```
npm install --save @ckeditor/ckeditor5-table
```

Then add the `Table`, `TableToolbar`, **`TableProperties`**, and **`TableCellProperties`** plugins to your plugin list and configure the table toolbar:

```js
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableToolbar, TableProperties, TableCellProperties, Bold, ... ],
		toolbar: [ 'insertTable', ... ],
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells',
				'tableProperties', 'tableCellProperties'
			],

			// Configuration of the TableProperties plugin.
			tableProperties: {
				// ...
			},

			// Configuration of the TableCellProperties plugin.
			tableCellProperties: {
				// ...
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

[Learn more](#configuring-background-and-border-colors) about configuring color palettes in the table and table cell properties pop–ups.

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Configuring background and border colors

<info-box>
	By default, table styling tools are not included in {@link builds/guides/overview ready–to–use editor builds} and must be installed separately. See the [installation](#table-and-cell-styling-tools-2) section to learn how to enable them in your editor.
</info-box>

Table and cell styling tools allow users to create tables with colorful backgrounds and borders. These colors can be easily picked using color palettes in **"Table properties"** and **"Cell properties"** pop–ups. To help users choose the right colors for the content, the color palettes can be pre–configured, like in the editor below:

{@snippet features/table-styling-colors}

With the selection inside any table cell, use the **"Table properties"** and **"Cell properties"** buttons in the toolbar to inspect available styling and color options.

### Customizing color palettes

You can use these specific configuration options to define customized color palettes for background and border colors to match your document:

* {@link module:table/table~TableConfig#tableProperties `config.tableProperties.borderColors`} — defines the color palette for table borders,
* {@link module:table/table~TableConfig#tableProperties `config.tableProperties.backgroundColors`} — defines the color palette for table backgrounds,
* {@link module:table/table~TableConfig#tableCellProperties `config.tableCellProperties.borderColors`} — defines the color palette for cell borders,
* {@link module:table/table~TableConfig#tableCellProperties `config.tableCellProperties.backgroundColors`} – defines the color palette for cell backgrounds.

<info-box>
	The above configurations **do not** impact the {@link builds/guides/integration/basic-api#setting-the-editor-data data loaded into the editor}, i.e. they do not limit or filter the colors in the data. They are used only in the user interface allowing users to pick colors in a more convenient way.
</info-box>

For instance, to the define the same color palette for all border and background configurations, use the following code snippet:

```js
const customColorPalette = [
	{
		color: 'hsl(4, 90%, 58%)',
		label: 'Red'
	},
	{
		color: 'hsl(340, 82%, 52%)',
		label: 'Pink'
	},
	{
		color: 'hsl(291, 64%, 42%)',
		label: 'Purple'
	},
	{
		color: 'hsl(262, 52%, 47%)',
		label: 'Deep Purple'
	},
	{
		color: 'hsl(231, 48%, 48%)',
		label: 'Indigo'
	},
	{
		color: 'hsl(207, 90%, 54%)',
		label: 'Blue'
	},

	// ...
];

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableToolbar, TableProperties, TableCellProperties, Bold, ... ],
		toolbar: [ 'insertTable', ... ],
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells',
				'tableProperties', 'tableCellProperties'
			],

			// Set the palettes for tables.
			tableProperties: {
				borderColors: customColorPalette,
				backgroundColors: customColorPalette
			},

			// Set the palettes for table cells.
			tableCellProperties: {
				borderColors: customColorPalette,
				backgroundColors: customColorPalette
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

## Block vs inline content in table cells

The table feature allows creating block content (like paragraphs, lists, headings, etc.) in table cells. However, if a table cell contains just one paragraph and this paragraph has no special attributes (like text alignment), the cell content is considered "inline" and the paragraph is not rendered.

This means that a table cell can be in two states: with inline content or with block content. The reason for this differentiation is that most tables contain only inline content (e.g. in the [demo](#demos) above) and it is common for "data tables" to not contain any block content. In such scenario, printing out `<p>` elements would be semantically incorrect and also unnecessary. There are, however, scenarios where the user wants to create, for example, a list inside the table and then support for block content is necessary, too.

<info-box>
	"Rendering" here means the view layer. In the model a cell is always filled with at least a `<paragraph>`. This is because of consistency, as &mdash; since a cell always has some block content &mdash; the text is never directly inside `<tableCell>`. This also allows features like <kbd>Enter</kbd> support to work out of the box (since a `<paragraph>` exists in the model, it can be split despite the fact that it is not present in the view).
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
	At the moment it is not possible to completely disallow block content in tables. See the [discussion on GitHub](https://github.com/ckeditor/ckeditor5-table/issues/101) about adding a configuration option that would enable that. Add a 👍 if you need this feature.
</info-box>

## Common API

### UI components

The table plugins register the following UI components:

<table>
	<thead>
		<th>{@link builds/guides/integration/configuration#toolbar-setup Component} name</th>
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
			<td>The <code>'mergeTableCells'</code> dropdown</td>
		</tr>
		<tr>
			<td>The <code>'tableProperties'</code> button</td>
			<td>{@link module:table/tableproperties~TableProperties}</td>
		</tr>
		<tr>
			<td>The <code>'tableCellProperties'</code> button</td>
			<td>{@link module:table/tablecellproperties~TableCellProperties}</td>
		</tr>
	</tbody>
</table>

#### Toolbars

The {@link module:table/tabletoolbar~TableToolbar} plugin introduces two balloon toolbars for tables.
* The content toolbar shows up when a table cell is selected and it is anchored to the table. It is possible to {@link module:table/table~TableConfig#contentToolbar configure} its content. Normally, the toolbar contains the table-related tools such as `'tableColumn'`, `'tableRow'`, and `'mergeTableCells'` dropdowns.
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
			<td rowspan="15">{@link module:table/table~Table}</td>
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

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-table.
