---
menu-title: Styling tables
category: tables
order: 30
modified_at: 2022-05-19
---

# Table and cell styling tools

{@snippet features/build-table-source}

CKEditor 5 comes with some additional tools that help you modify the look of tables and table cells. You can control border color and style, background color, padding, or text alignment.

## Demo

Put the caret anywhere inside the table to invoke the table toolbar. Then click the **"Table properties"** button {@icon @ckeditor/ckeditor5-table/theme/icons/table-properties.svg Table properties} in the toolbar to open a pop–up with multiple options that will allow you to shape the look of the entire table. If you click the **"Cell properties"** button {@icon @ckeditor/ckeditor5-table/theme/icons/table-cell-properties.svg Cell properties}, a similar interface will appear with styling options for individual table cells.

[Learn more](#configuring-styling-tools) about configuring color palettes in the table styling pop–up interfaces.


{@snippet features/table-styling}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Installation

<info-box>
	By default, table styling tools are not included in the {@link installation/getting-started/predefined-builds predefined builds} and must be installed separately.
</info-box>

To enable the rich table and cell styling tools in your editor, you need to have the [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package installed (it is already present in the predefined builds):

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
		plugins: [ Table, TableToolbar, TableProperties, TableCellProperties, Bold, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells',
				'tableProperties', 'tableCellProperties'
			],

			tableProperties: {
				// Configuration of the TableProperties plugin.
				// ...
			},

			tableCellProperties: {
				// Configuration of the TableCellProperties plugin.
				// ...
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Configuring styling tools

Among other formatting options, table and cell styling tools allow users to create tables with colorful backgrounds and borders. These colors can be easily picked using color palettes in the **"Table properties"** and **"Cell properties"** pop-ups. To help users choose the right colors for the content, the color palettes can be pre-configured, like in the editor below:

{@snippet features/table-styling-colors}

With the selection inside any table cell, use the **"Table properties"** and **"Cell properties"** buttons in the toolbar to inspect available styling and color options.

### Customizing color palettes

You can use these specific configuration options to define customized color palettes for background and border colors to match your document:

* {@link module:table/table~TableConfig#tableProperties `tableProperties.borderColors`} &ndash; Defines the color palette for table borders.
* {@link module:table/table~TableConfig#tableProperties `tableProperties.backgroundColors`} &ndash; Defines the color palette for table background.
* {@link module:table/table~TableConfig#tableCellProperties `tableCellProperties.borderColors`} &ndash; Defines the color palette for cell borders.
* {@link module:table/table~TableConfig#tableCellProperties `tableCellProperties.backgroundColors`} &ndash; Defines the color palette for cell background.

<info-box>
	The above configurations **do not** impact the {@link installation/getting-started/getting-and-setting-data#setting-the-editor-data-with-setdata data loaded into the editor}, i.e. they do not limit or filter the colors in the data. They are used only in the user interface allowing users to pick colors in a more convenient way.
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

	// More colors.
	// ...
];

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableToolbar, TableProperties, TableCellProperties, Bold, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
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
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Default table and table cell styles

The table styles feature allows for configuring the default look of the tables in the editor. The configuration object should be synchronized with the {@link installation/advanced/content-styles editor content styles}.

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

The same will be applied to new tables and cells if they are inserted into the editor.

{@snippet features/table-default-properties}

Read more about all supported properties for the {@link module:table/tableproperties~TablePropertiesOptions table} and {@link module:table/tablecellproperties~TableCellPropertiesOptions table cell} features in their API documentation.

<info-box>
	The default table and table cell styles **do** impact the {@link installation/getting-started/getting-and-setting-data#setting-the-editor-data-with-setdata data loaded into the editor}. Default properties will not be kept in the editor model.
</info-box>

## Common API

### UI components

The {@link module:table/tableproperties~TableProperties} and {@link module:table/tablecellproperties~TableCellProperties} plugins register the following UI components:

<table>
	<thead>
		<th>{@link features/toolbar Component} name</th>
		<th>Registered by</th>
	</thead>
	<tbody>
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

The {@link module:table/tableproperties~TableProperties} and {@link module:table/tablecellproperties~TableCellProperties} plugins allow adding the `tableProperties` and `tableCellProperties` items to the toolbar. It is possible to {@link module:table/table~TableConfig#tableToolbar configure} its content. 

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
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
