---
menu-title: Layout tables
meta-title: Layout tables | CKEditor 5 Documentation
meta-description: Add support for different table types to distinguish between content tables and layout tables and allow to create table-based layouts.
category: tables
order: 50
modified_at: 2025-04-07
---

# Layout tables

{@snippet features/build-table-source}

Layout tables are used to structure web page content spatially rather than for presenting tabular data. They allow integrators to create multi-column designs and precise positioning of elements on a page. This kind of functionality may be handy, for example, when preparing newsletter content. You can switch between {@link features/tables content tables} and layout tables by using the table toggling feature.

## Table types comparison

The CKEditor&nbsp;5 table feature offers several approaches and plugins responsible for the execution of tables. These include:

* {@link features/tables Regular content tables} &ndash; Content tables provide the basic table experience for presentation of tabular data.
* {@link features/layout-tables Table layout} &ndash; Layout tables are used to structure the content spatially rather than present content. They allow for creating multi-column designs and precise positioning of elements on a page.
* {@link module:table/plaintableoutput~PlainTableOutput Plain table output} &ndash; This plugin strips the `<figure>` tag from the table data. It is basically an email client compatibility feature.

<table>
	<thead>
		<tr>
			<th>&nbsp;</th>
			<th>Regular table</th>
			<th>Layout table</th>
			<th>Plain table output</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th>Usage</th>
			<td>Used for presenting tabular data</td>
			<td>Used for creating layouts and multi-column designs</td>
			<td>Stripped of <code>&lt;figure&gt;</code> tags for email compatibility</td>
		</tr>
		<tr>
			<th>Purpose</th>
			<td>Rich formatting and tabular data presentation</td>
			<td>Focused on content positioning and structure</td>
			<td>Simplified output for maximum interoperability</td>
		</tr>
		<tr>
			<th>Setup</th>
			<td>Default table type in CKEditor&nbsp;5</td>
			<td>Available through toggling or direct insertion</td>
			<td>Available as an optional plugin</td>
		</tr>
		<tr>
			<th>Markup influence</th>
			<td>Affects editing view and output data</td>
			<td>Affects editing view and output data</td>
			<td>Affects only output data</td>
		</tr>
	</tbody>
</table>

## Demo

Check the editor below to see the layout tables plugin in action. Use the layout table {@icon @ckeditor/ckeditor5-icons/theme/icons/table-layout.svg} toolbar button to insert a new layout table.

{@snippet features/table-layout}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Table toggling

There are several table types available in CKEditor&nbsp;5. To switch between these  different table modes, you can use the table toggling feature. It allows users to change the type of an existing table by clicking it and selecting the desired table type. This enables seamless switching between presentation-focused content tables and layout-oriented tables without recreating the structure from scratch.

{@img assets/img/tables-toggling.png 380 Table toggling dropdown.}

When a table is selected, you can toggle its type in one of two ways:

1. If the {@link module:table/tableproperties~TableProperties} plugin is enabled, the table properties button {@icon @ckeditor/ckeditor5-icons/theme/icons/table-properties.svg} will include a "Table type" dropdown option that allows switching between regular content tables and layout tables.

2. If the {@link module:table/tableproperties~TableProperties} plugin is not available, you can use the dedicated `tableType` toolbar button to change the table type.

Switching between table types preserves the content while adjusting the table's behavior and styling to match its new purpose. Layout tables focus on spatial arrangement and design, while content tables emphasize data presentation.

<info-box warning>
	Changing a regular table to a layout table may result in data loss. Table captions will be removed when converting to a layout table, as layout tables do not support them.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Table, TableLayout } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableLayout, /* ... */ ],
		toolbar: [ 'insertTable', 'insertTableLayout', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

### Configuring the preferred type for loading external tables.

By default, external tables are loaded using internal heuristics. This can be configured by setting the preferred table type for loading all external tables by setting the {@link module:table/tableconfig~TableLayoutConfig#preferredExternalTableType `config.table.tableLayout.preferredExternalTableType`} option to `content` or `layout`.

<code-switcher>
```js
import { ClassicEditor, Table, TableLayout } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableLayout /* ... */ ],
		table: {
			tableLayout :{
				preferredExternalTableType: 'content' // or 'layout'
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

### Configuring the table toggle feature

To configure the table toggling feature, you have several options:

1. Include the {@link module:table/tablelayout~TableLayout} plugin in your editor setup to enable toggling between table types.
2. Add the `tableType` button to your table content toolbar if you want a dedicated button for toggling.
3. For advanced UI integration scenarios, include both {@link module:table/tableproperties~TableProperties} and {@link module:table/tabletoolbar~TableToolbar} plugins, which will add the table type option to the table properties dropdown.

The table type can also be set programmatically through the editor's API, making it suitable for integration with external controls or automated workflows.

### Configuring table toggle with `TableProperties`

When the {@link module:table/tableproperties~TableProperties} plugin is available, table type options will be integrated into the table properties dropdown:
<!-- Uodate main toolbar to table dropdown eventually. In both. -->
<code-switcher>
```js
import { ClassicEditor, Table, TableLayout, TableProperties, TableToolbar } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableLayout, TableProperties, TableToolbar, /* ... */ ],
		toolbar: [ 'insertTable', 'insertTableLayout', /* ... */ ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

This will add table toggling button to the table toolbar:

{@img assets/img/tables-toggling.png 380 The table toggling button to the table toolbar.}

### Configuring table toggle without `TableProperties`

If the `TableProperties` plugin is not available, you can use the dedicated `tableType` button in the content toolbar to change table types:

<code-switcher>
```js
import { ClassicEditor, Table, TableLayout, TableToolbar } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableLayout, TableToolbar, /* ... */ ],
		toolbar: [ 'insertTable', 'insertTableLayout', /* ... */ ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableType', /* ... */  ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

### Configuring table toggle in the main editor toolbar

You can configure the main editor toolbar to use the content and layout tables selector dropdown. This is handy if for some reason you do not want to use the table toolbar in your implementation.

<code-switcher>
```js
import { ClassicEditor, Table, TableLayout } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableLayout, /* ... */ ],
		toolbar: [ 'insertTable', 'insertTableLayout', 'tableType', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

This will add table toggling button to the main editor toolbar:

{@img assets/img/tables-toggling-toolbar.png 313 The table toggling button to the main editor toolbar.}

<info-box info>
	Please note that the layout toggle button does not insert new tables, it just toggles the type. You still need to configure the table insertion buttons, as shown above.
</info-box>

## Related features

There are other CKEditor&nbsp;5 features you may want to check:

* {@link features/email Email editing} &ndash; The email editing solution is a set of tools aimed at making the email composition a better and more effective experience.
* {@link features/email-configuration-helper Email configuration helper} &ndash; The email configuration helper plugin is the best way to start writing and editing emails.

## Common API

The {@link module:table/tablelayout~TableLayout} plugin registers the following command:

* {@link module:table/tablelayout/tablelayoutediting~TableLayoutEditing} &ndash; The layout table editing command.
* {@link module:table/tablelayout/tablelayoutui~TableLayoutUI} &ndash; The layout table UI.
* {@link module:table/commands/inserttablelayoutcommand~InsertTableLayoutCommand} &ndash; The `insertTableLayout` toolbar dropdown.

The {@link module:table/tablelayout~TableLayout} plugin registers the following UI components:

* The `'tableType'` button that allows changing the type of a selected table.
* The `'tableType'` command implemented by {@link module:table/tablelayout/commands/tabletypecommand~TableTypeCommand}.

You can execute the command using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method. The command accepts a table type value ('content' or 'layout') as an argument.

```js
// Change the selected table to a layout table.
editor.execute('tableType', 'layout' );

// Change the selected table to a content table.
editor.execute('tableType', 'content' );
```

Additionally, if the {@link module:table/tableproperties~TableProperties} plugin is loaded, the `'tableProperties'` button will be extended with a dropdown to select the table type, providing an alternative UI for changing the table type.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).

