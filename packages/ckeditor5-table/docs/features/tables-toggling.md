---
menu-title: Table toggling
meta-title: Table toggling | CKEditor 5 Documentation
category: tables
order: 60
modified_at: 2025-03-06
---

# Table toggling

{@snippet features/build-table-source}

There are several table types available in CKeditor&nbsp;5. To switch between these  different table modes, you can use the table toggling feature.

## Table types comparison

The CKEditor&nbsp;5 table feature offers several approaches and plugins responsible for the execution of tables. These include:

* {@link features/tables Regular content tables} &ndash; Content tables provide the basic table experience for presentation of tabular data.
* {@link features/tables-layout Table layout} &ndash; Layout tables are used to structure the content spatially rather than present content. They allow for creating multi-column designs and precise positioning of elements on a page.
* {@link module:table/plaintableoutput~PlainTableOutput Plain table output} &ndash; This plugin strips the `<figure>` tag from the table data. Is is basically an email client compatibility feature.

| Regular table | Layout table | Plain table output |
| -------- | ------- | ------- |
| Used for presenting tabular data | Used for creating layouts and multi-column designs | Stripped of `<figure>` tags for email compatibility |
| Rich formatting and tabular data presentation | Focused on content positioning and structure | Simplified output for maximum interoperability |
| Default table type in CKEditor&nbsp;5 | Available through toggling or direct insertion | Available as an optional plugin |

## Demo

Use the editor below to see the layout tables plugin in action. Select a table and use the toolbar button <!-- Add icon when ready -->to choose the preferred type of table to change to from the dropdown. Or click the table to invoke the table toolbar and apply the preferred table type to change an existing table using the table properties dropdown {@icon @ckeditor/ckeditor5-icons/theme/icons/table-properties.svg}.

Please note that the layout toggle button <!-- Add icon when ready -->does not insert new tables, just toggles the type. Use the layout table {@icon @ckeditor/ckeditor5-icons/theme/icons/table-layout.svg} or content table {@icon @ckeditor/ckeditor5-icons/theme/icons/table.svg Insert table} toolbar buttons to insert a new table of either kind.

{@snippet features/table-toggling}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

The table toggling feature allows users to change the type of an existing table by clicking it and selecting the desired table type. This enables seamless switching between presentation-focused content tables and layout-oriented tables without recreating the structure from scratch.

When a table is selected, you can toggle its type in one of two ways:

1. If the {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI} plugin is enabled, the table properties button {@icon @ckeditor/ckeditor5-icons/theme/icons/table-properties.svg} will include a "Table type" dropdown option that allows switching between regular content tables and layout tables.

2. If the {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI} plugin is not available, you can use the dedicated `tableType` toolbar button to change the table type.

Switching between table types preserves the content while adjusting the table's behavior and styling to match its new purpose. Layout tables focus on spatial arrangement and design, while content tables emphasize data presentation.

<info-box warning>
	Changing a regular table to a layout table may result in data loss. Table captions will be removed when converting to a layout table, as layout tables do not support them.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration.

## Configuration

To configure the table toggling feature, you have several options:

1. Include the {@link module:table/tablelayout~TableLayout} plugin in your editor setup to enable toggling between table types.
2. Add the `tableType` button to your table content toolbar if you want a dedicated button for toggling.
3. For advanced UI integration scenarios, include both {@link module:table/tableproperties~TableProperties} and {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI} plugins, which will add the table type option to the table properties dropdown.

The table type can also be set programmatically through the editor's API, making it suitable for integration with external controls or automated workflows.

### Configuration of the main editor toolbar

You configure the main editor toolbar to use the content an layout tables selector dropdown.

To use a single table selector dropdown configure the toolbar as follows:

<code-switcher>
```js
import { ClassicEditor, Table, TableLayout } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableLayout, /* ... */ ],
		toolbar: [ 'insertTable', 'insertTableLayout', 'tableType', /* ... */ ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableType', /* ... */  ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

<info-box info>
	Please note that the layout toggle button <!-- Add icon when ready -->does not insert new tables, just toggles the type. You need to also configure table insertion buttons, as shown above.
</info-box>

### Configuration with `TableProperties`

When the {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI} plugin is available, table type options will be integrated into the table properties dropdown:
<!-- Uodate main toolbar to table dropdown eventually. In both. -->
<code-switcher>
```js
import { ClassicEditor, Table, TableLayout, TableToggle, TableProperties, TablePropertiesUI } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableLayout, TableToggle, TableProperties, TablePropertiesUI, /* ... */ ],
		toolbar: [ 'insertTable', 'insertTableLayout', /* ... */ ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

### Configuration without `TableProperties`

If the `TablePropertiesUI` plugin is not available, you can use the dedicated `tableType` button in the content toolbar to change table types:

<code-switcher>
```js
import { ClassicEditor, Table, TableLayout } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableLayout, /* ... */ ],
		toolbar: [ 'insertTable', 'insertTableLayout', /* ... */ ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableType', /* ... */  ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Related features

There are other CKEditor&nbsp;5 features you may want to check:

* {@link features/email Email editing} &ndash; The email editing solution is a set of tools aimed at making the email composition a better and more effective experience.
* {@link features/email-configuration Email configuration helper} &ndash; The email configuration helper plugin is the best way to start writing and editing emails.

## Common API

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

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-source-editing](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-source-editing).

