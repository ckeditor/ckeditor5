---
category: tables
menu-title: Table column resizing
meta-title: Table column resizing | CKEditor 5 Documentation
meta-description: Resize table columns and rows in CKEditor 5 to adjust the layout and improve data presentation with flexible, user-friendly controls.
order: 30
modified_at: 2022-05-19
badges: [ premium ]
---
# Table column resize

{@snippet features/build-table-source empty}

The {@link module:table/tablecolumnresize~TableColumnResize} plugin lets you resize tables and individual table columns. It gives you complete control over column width.

{@snippet getting-started/unlock-feature}

## Demo

To resize a column, simply hover your pointer over the column edge until it gets highlighted. Drag the column edge until you achieve the desired size.

{@snippet features/table-column-resize}

<snippet-footer>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</snippet-footer>

The column resize feature is compatible with the {@link features/export-word Export to Word} feature. The converter will respect the column width set in the editor and retain it in the created .DOCX file.

## Installation

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Table, TableColumnResize } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableColumnResize, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Common API

The {@link module:table/tablecolumnresize~TableColumnResize} plugin does not register UI components.

<!-- Only drag handle, so this needs to be checked. No commands, tho. -->

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
