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
| ... | ... | ... |

To switch between different table modes, use the table toggling feature.

<!-- ## Demo

Use the editor below to see the layout tables plugin in action. Demo will be delivered later.

{@snippet features/table-layout}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>
-->

## Table toggling

Describe.

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
		toolbar: [ 'insertTable', 'insertTableLayout', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

Add the configuration steps.

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

