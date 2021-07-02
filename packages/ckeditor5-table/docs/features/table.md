---
title: Tables
category: features
modified_at: 2021-06-07
---

{@snippet features/build-table-source}

The {@link module:table/table~Table} feature offers table creation and editing tools that help content authors bring tabular data into their documents. Tables help organize the content in a distinct, visual way that stands out from the text and is more easily readable for certain types of information. They are perfect for listing, grouping, and otherwise organizing data sets or for providing information in a clear, efficient way.

Tables are great for schedules, timetables, price lists or menus; for listing terms and conditions or providing troubleshooting solutions. They also visually break and and provide relief from large body texts. CKEditor 5 offers all necessary functionality to produce advanced, visually appealing and highly efficient tables.

You may look for more interesting details in the [Tables in CKEditor 5](https://ckeditor.com/blog/feature-of-the-month-tables-in-ckeditor-5/) blog post after reading this guide.

## Demos

### Basic table features

The editor bellow shows the basic set of table features focusing on the **structure and semantics**. Use the **Insert table** toolbar button {@icon @ckeditor/ckeditor5-table/theme/icons/table.svg Insert table} in the editor below to create new tables. Focus any cell in the table to display the toolbar with buttons that will help you further shape the structure of the table.

Click anywhere inside the table to invoke the table toolbar. The features available in there allow users to add or remove columns {@icon @ckeditor/ckeditor5-table/theme/icons/table-column.svg Table column} and rows {@icon @ckeditor/ckeditor5-table/theme/icons/table-row.svg Table row} and merge or split cells {@icon @ckeditor/ckeditor5-table/theme/icons/table-merge-cell.svg Table cell}. It is also worth noting that you will find them out–of–the–box in all {@link builds/guides/overview ready–to–use editor builds}.

{@snippet features/table}

### Table and cell styling tools

In addition to the default table features described in the [previous section](#basic-table-features), the editor below comes with some additional tools that will help you modify **the look of tables and table cells**, for instance, their border color and style, background color, padding, or text alignment. The table {@icon @ckeditor/ckeditor5-table/theme/icons/table-properties.svg Table properties} and cell properties {@icon @ckeditor/ckeditor5-table/theme/icons/table-cell-properties.svg Cell properties} are available from the table toolbar on click, just like basic table features.

{@snippet features/table-styling}

Put the caret anywhere inside the table to invoke the table toolbar. Then click the **"Table properties"** button in the toolbar to open a pop–up with multiple options that will allow you to shape the look of the entire table. If you click the **"Cell properties"** button, a similar interface will appear with styling options for individual table cells.

[Learn more](#configuring-styling-tools) about configuring color palettes in the table styling pop–up interfaces.

<info-box>
	By default, table styling tools are not included in the {@link builds/guides/overview ready–to–use editor builds} and must be installed separately. See the [installation](#table-and-cell-styling-tools-2) section to learn how to enable them in your editor.
</info-box>

### Table caption

The {@link module:table/tablecaption~TableCaption} plugin adds support for table captions. These work very much like image captions &mdash; the caption informs the reader about the content of the table. Using captions is also beneficial from the accessability point of view as they would be read by screen readers.

Click on the table caption in the demo to edit it or use the table toolbar button {@icon @ckeditor/ckeditor5-core/theme/icons/caption.svg Table caption} to toggle the caption on and off.

{@snippet features/table-caption}

<info-box>
	By default, the table caption feature is not included in the {@link builds/guides/overview ready–to–use editor builds} and must be installed separately. See the [installation](#table-caption-2) section to learn how to enable it in your editor.
</info-box>


By default, the table caption is placed above the table. You can change the placement by setting [`caption-side`](https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side) in your {@link builds/guides/integration/content-styles content styles} for the `.ck-content .table > figcaption` style. Changing it to `caption-side: bottom` will display the caption below the table.

### Nesting tables

Starting from version 27.1.0 CKEditor 5 allows nesting tables inside other table's cells. This may be used for creating advanced charts or layouts based on tables. The nested table can be formatted just like a regular one.

You can test this feature in the demo below by adding a table in the *"abandoned"* section that was left blank at the bottom of the main table. To nest a table, simply click in the selected cell and use the **"Insert table"** button in the toolbar to insert a new, nested table into an existing one.

{@snippet features/table-nesting}

<info-box>
    If you would like to block the possibility to nest tables in your editor, see the {@link features/table#disallow-nesting-tables Disallow nesting tables} section to learn how to disable this functionality.
</info-box>

## Table selection

The {@link module:table/tableselection~TableSelection} plugin introduces support for the custom selection system for tables that lets you:

* Select an arbitrary rectangular table fragment &mdash; a few cells from different rows, a column (or a few of them) or a row (or multiple rows).
* Apply formatting or add a link to all selected cells at once.

The table selection plugin is loaded automatically by the `Table` plugin and can be tested in the [demos above](#demos).

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

<info-box info>
	Learn more about [configuring color palettes](#configuring-styling-tools) in the table and table cell property pop–ups.
</info-box>

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

### Table caption

To enable the table caption feature in your editor, install the [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package:

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
		plugins: [ Table, TableToolbar, TableCaption, Bold, ... ],
		toolbar: [ 'insertTable', ... ],
		table: {
			contentToolbar: [
				'toggleTableCaption'
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Configuring styling tools

<info-box>
	By default, table styling tools are not included in {@link builds/guides/overview ready–to–use editor builds} and must be installed separately. See the [installation](#table-and-cell-styling-tools-2) section to learn how to enable them in your editor.
</info-box>

Among other formatting options, table and cell styling tools allow users to create tables with colorful backgrounds and borders. These colors can be easily picked using color palettes in the **"Table properties"** and **"Cell properties"** pop–ups. To help users choose the right colors for the content, the color palettes can be pre–configured, like in the editor below:

{@snippet features/table-styling-colors}

With the selection inside any table cell, use the **"Table properties"** and **"Cell properties"** buttons in the toolbar to inspect available styling and color options.

### Customizing color palettes

You can use these specific configuration options to define customized color palettes for background and border colors to match your document:

* {@link module:table/table~TableConfig#tableProperties `tableProperties.borderColors`} &ndash; Defines the color palette for table borders.
* {@link module:table/table~TableConfig#tableProperties `tableProperties.backgroundColors`} &ndash; Defines the color palette for table background.
* {@link module:table/table~TableConfig#tableCellProperties `tableCellProperties.borderColors`} &ndash; Defines the color palette for cell borders.
* {@link module:table/table~TableConfig#tableCellProperties `tableCellProperties.backgroundColors`} &ndash; Defines the color palette for cell background.

<info-box>
	The above configurations **do not** impact the {@link builds/guides/integration/basic-api#setting-the-editor-data data loaded into the editor}, i.e. they do not limit or filter the colors in the data. They are used only in the user interface allowing users to pick colors in a more convenient way.
</info-box>

For instance, to define the same color palette for all border and background configurations, use the following code snippet:

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

### Default table and table cell styles

The table styles feature allows for configuring the default look of the tables in the editor. The configuration object should be synchronized with the {@link builds/guides/integration/content-styles editor content styles}.

The **“Table properties”** and **“Table cell properties”** buttons in the toolbar will show the table and table cell properties applied to the table or table cells.

The stylesheet for the editor displayed below looks as follows:

```css
.ck-content .table {
    float: left;
    width: 550px;
    height: 450px;
}

.ck-content .table table {
    border-style: dashed;
    border-color: 'hsl(90, 75%, 60%)';
    border-width: 3px;
}

.ck-content .table table td {
    text-align: center;
    vertical-align: bottom;
    padding: 10px
}
```

The same values must be passed to the editor configuration as:

* The {@link module:table/tableproperties~TablePropertiesOptions `table.tableProperties.defaultProperties`} object for the table properties.
* The {@link module:table/tablecellproperties~TableCellPropertiesOptions `table.tableCellProperties.defaultProperties`} object for the table cell properties.

```js
const tableConfig = {
    table: {
        tableProperties: {
            // The default styles for tables in the editor.
			// They should be synchronized with the content styles.
            defaultProperties: {
	            borderStyle: 'dashed',
	            borderColor: 'hsl(90, 75%, 60%)',
	            borderWidth: '3px',
	            alignment: 'left',
	            width: '550px',
	            height: '450px'
            },
            // The default styles for table cells in the editor.
			// They should be synchronized with the content styles.
	        tableCellProperties: {
		        defaultProperties: {
			        horizontalAlignment: 'center',
			        verticalAlignment: 'bottom',
			        padding: '10px'
		        }
	        }
        }
    }
};
```

The table element should be aligned to the `left` side by default. Its size should be `550x450px`. The border style should be `dashed`, `3px` of its width, and the color specified as `Light green`.

The content should be away about `10px` from the cell's edges (`padding`), vertically aligned to `bottom` and horizontally to `center`.

The same will be applied for new tables and cells if they are inserted into the editor.

{@snippet features/table-default-properties}

Read more about all supported properties for the {@link module:table/tableproperties~TablePropertiesOptions table} and {@link module:table/tablecellproperties~TableCellPropertiesOptions table cell} features in their API documentation.

<info-box>
	The default table and table cell styles **do** impact the {@link builds/guides/integration/basic-api#setting-the-editor-data data loaded into the editor}. Default properties will not be kept in the editor model.
</info-box>

## Block vs inline content in table cells

The table feature allows for creating block content (like paragraphs, lists, headings, etc.) inside table cells. However, if a table cell contains just one paragraph and this paragraph has no special attributes (like text alignment), the cell content is considered "inline" and the paragraph is not rendered.

This means that a table cell can have two states: with inline content or with block content. The reason for this differentiation is that most tables contain only inline content (e.g. in the [demo](#demos) above) and it is common for "data tables" to not contain any block content. In such a scenario, printing out `<p>` elements would be semantically incorrect and also unnecessary. There are, however, scenarios where the user wants to create, for example, a list inside a table cell and then the support for block content is necessary.

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

## Disallow nesting tables

By default, the editor allows nesting a table inside another table's cell.

In order to disallow nesting tables, you need to register an additional schema rule. It needs to be added before the data is loaded into the editor. Due to that, it is best to implement it as a plugin:

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
		extraPlugins: [ DisallowNestingTables ],

		// The rest of the configuration.
	} )
	.then( ... )
	.catch( ... );
```
<info-box>
	Check the {@link framework/guides/creating-simple-plugin plugin development guide} if you need more information about the technical side of this solution.
</info-box>

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

## Known issues

While the table nesting functionality is fully functional, the Markdown code generated with the {@link features/autoformat Markdown output} feature will not properly render nested tables ([#9475](https://github.com/ckeditor/ckeditor5/issues/9475)). Feel free to upvote 👍&nbsp; this issue on GitHub if it is important for you.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table.
