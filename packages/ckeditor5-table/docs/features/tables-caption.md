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

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

```js
import { ClassicEditor, Table, TableCaption, TableToolbar } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Table, TableToolbar, TableCaption, /* ... */ ],
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

By default, the table caption is placed above the table. You can change the placement by setting [`caption-side`](https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side) in your {@link getting-started/advanced/content-styles content styles} for the `.ck-content .table > figcaption` style. Changing it to `caption-side: bottom` will display the caption below the table.

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
