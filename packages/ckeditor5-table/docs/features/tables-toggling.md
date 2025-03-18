---
menu-title: Table toggling
meta-title: Table toggling | CKEditor 5 Documentation
category: tables
order: 60
modified_at: 2025-03-06
---

# Table toggling

{@snippet features/build-table-source}

## Table types comparison

The CKEditor&nbsp;5 table feature offers several approaches and plugins responsible for the execution of tables. These include:

* {@link features/tables Regular content tables} &ndash; Content tables provide the basic table experience for presentation of tabular data.
* {@link features/tables-layout Table layout} &ndash; Layout tables are used to structure the content spatially rather than present content. They allow for creating multi-column designs and precise positioning of elements on a page.
* {@link module:table/plaintableoutput~PlainTableOutput Plain table output} &ndash; This plugin strips the `<figure>` tag from the table data. Is is basically an email client compatibility feature.

| Regular table | Layout table | Plain table output |
| -------- | ------- | ------- |
| Used for presenting tabular data | Used for creating layouts and multi-column designs | Stripped of `<figure>` tags for email compatibility |
| Rich formatting and data presentation | Focused on positioning and structure | Simplified output for maximum compatibility |
| Default table type in CKEditor 5 | Available through toggling or direct insertion | Available as a plugin option |

To switch between different table modes, use the table toggling feature.

## Demo

Use the editor below to see the layout tables plugin in action. Demo will be delivered later.

{@snippet features/table-layout}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Description

The table toggling feature allows users to change the type of an existing table by clicking on it and selecting the desired table type. This enables seamless switching between presentation-focused content tables and layout-oriented tables without recreating the structure from scratch.

When a table is selected, you can toggle its type in one of two ways:

1. If the {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI} plugin is available, the table properties dropdown will include a "Table type" option that allows switching between regular content tables and layout tables.

2. If the {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI} plugin is not available, you can use the dedicated `tableType` toolbar button to change the table type.

Switching between table types preserves the content while adjusting the table's behavior and styling to match its new purpose. Layout tables focus on spatial arrangement and design, while content tables emphasize data presentation.

<info-box warning>
	Changing a regular table to a layout table may result in data loss. Some elements like table captions will be removed when converting to a layout table, as layout tables do not support these elements.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration.

### Configuration with TablePropertiesUI

When the {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI} plugin is available, table type options will be integrated into the table properties dropdown:

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

### Configuration without TablePropertiesUI

If the TablePropertiesUI plugin is not available, you can use the dedicated `tableType` button in the content toolbar to change table types:

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

## Configuration

To configure the table toggling feature, you have several options:

1. Include the `TableToggle` plugin in your editor setup to enable toggling between table types.
2. Add the `tableType` button to your table content toolbar if you want a dedicated button for toggling.
3. For a more integrated experience, include both `TableProperties` and `TablePropertiesUI` plugins, which will add the table type option to the table properties dropdown.

The table type can also be set programmatically through the editor's API, making it suitable for integration with external controls or automated workflows.

## Related features

There are other CKEditor&nbsp;5 features you may want to check:

* {@link features/email Email editing} &ndash; The email editing solution is a set of tools aimed at making the email composition a better and more effective experience.
* {@link features/email-configuration Email configuration helper} &ndash; The email configuration helper plugin is the best way to start writing and editing emails.

## Common API

The {@link module:table/tablelayout~TableLayout} plugin registers the following UI components:

* uodate

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-source-editing](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-source-editing).

