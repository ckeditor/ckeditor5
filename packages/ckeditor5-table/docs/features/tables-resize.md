---
menu-title: Table column resizing
category: tables
order: 40
modified_at: 2022-05-19
---
# Table column resize

{@snippet features/build-table-source}

The {@link module:table/tablecolumnresize~TableColumnResize} plugin lets you resize tables and individual table columns. It gives you complete control over column width.

## Demo

To resize a column, simply hover your pointer over the column edge until it gets highlighted. Just drag the column edge until you achieve the desired size and release.

{@snippet features/table-column-resize}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

The column resize feature is compatible with the {@link features/export-word Export to Word} feature. The converter will respect the column width set in the editor and retain it in the created .DOCX file.

## Installation

<info-box>
	By default, the table column resize feature is not included in the {@link installation/getting-started/predefined-builds predefined builds} and must be installed separately.
</info-box>

To enable the table column resize feature in your editor, you need to have the [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package installed (it is already present in the predefined builds):

```
npm install --save @ckeditor/ckeditor5-table
```

Then add the `Table` and **`TableColumnResize`** plugins to your plugin list and configure the table toolbar:

```js
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableColumnResize, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Common API

The {@link module:table/tablecolumnresize~TableColumnResize} plugin does not register UI components.

<!-- Only drag handle, so this needs to be checked. No commands, tho. -->

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
