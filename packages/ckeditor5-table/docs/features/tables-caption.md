---
menu-title: Table caption
meta-title: Table caption | CKEditor 5 Documentation
category: tables
order: 50
modified_at: 2022-05-19
---

# Table caption

{@snippet features/build-table-source}

The {@link module:table/tablecaption~TableCaption} plugin lets you add captions to your tables. Table captions also improve accessibility as they are recognized by screen readers.

## Demo

In the demo below, click the table caption to edit it. Once you click the caption, you can use the table toolbar button {@icon @ckeditor/ckeditor5-core/theme/icons/caption.svg Table caption} to toggle the caption on and off.

{@snippet features/table-caption}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box>
	By default, the table caption feature is not included in the {@link installation/getting-started/predefined-builds predefined builds} and must be installed separately.
</info-box>

To enable the table caption feature in your editor, you need to have the [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package installed (it is already present in the predefined builds):

```
npm install --save @ckeditor/ckeditor5-table
```

Then add the `Table`, `TableToolbar`, and **`TableCaption`** plugins to your plugin list and configure the table toolbar:

```js
import { Table, TableCaption, TableToolbar } from '@ckeditor/ckeditor5-table';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableToolbar, TableCaption, Bold, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
		table: {
			contentToolbar: [
				'toggleTableCaption'
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

By default, the table caption is placed above the table. You can change the placement by setting [`caption-side`](https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side) in your {@link installation/advanced/content-styles content styles} for the `.ck-content .table > figcaption` style. Changing it to `caption-side: bottom` will display the caption below the table.

## Common API

### UI components

The {@link module:table/tablecaption~TableCaption} plugin registers the following UI component:

* The `toggleTableCaption` button

#### Toolbars

{@link module:table/tablecaption~TableCaption} plugin allows adding the `toggleTableCaption` item to the toolbar. It is possible to {@link module:table/tableconfig~TableConfig#tableToolbar configure} its content.

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
			<td><code>'toggleTableCaption'</code></td>
			<td>{@link module:table/tablecaption/toggletablecaptioncommand~ToggleTableCaptionCommand}</td>
			<td>{@link module:table/tablecaption~TableCaption}</td>
		</tr>
	</tbody>
</table>

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
