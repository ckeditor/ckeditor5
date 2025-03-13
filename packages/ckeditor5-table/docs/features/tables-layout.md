---
menu-title: Layout tables
meta-title: Tables overview | CKEditor 5 Documentation
category: tables
order: 20
modified_at: 2025-03-06
---

# Layout tables

Layout tables are used to structure a web page content spatially rather than for presenting tabular data. They allow integrators to create multi-column designs and precise positioning of elements on a page. This kind of functionality may be handy, for example, when preparing newsletter content.

## Demo

Use the editor below to see the layout tables plugin in action. Demo will be delivered later.

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Table features comparison

| Regular table | Plain table output | Layout table |
| -------- | ------- | ------- |
| ... | ... | ... |

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
		toolbar: [ 'insetTable', 'insertTableLayout', /* ... */ ]
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

* {@link module:table/tablelayout/tablelayoutediting~TableLayoutEditing} &ndash; The layout table editing command.
* {@link module:table/tablelayout/tablelayoutui~TableLayoutUI} &ndash; The layout table UI.
* {@link module:table/commands/inserttablelayoutcommand~InsertTableLayoutCommand} &ndash; The `insertTableLayotu` toolbar dropdown.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-source-editing](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-source-editing).

