---
category: tables
menu-title: Table scrolling
meta-title: Table scrolling | CKEditor 5 Documentation
meta-description: Let tables that are wider than the editor scroll horizontally instead of squeezing their columns or breaking the page layout.
order: 45
modified_at: 2026-07-09
---

# Table scrolling

{@snippet features/build-table-source empty}

The {@link module:table/tablescroll~TableScroll} plugin keeps wide tables usable. Whenever a table would be wider than the space available to it, the table scrolls horizontally inside its own frame instead of squeezing its columns down to an unreadable width or breaking out of the page layout.

## Demo

Try shrinking your browser window, or dragging the table below wider with the {@link features/tables-resize column resize} handle &ndash; once the table no longer fits, it starts scrolling horizontally on its own. While dragging, the table's edge snaps to exactly 100% of the available width and resists being dragged past it, making it easy to land on a table that fits its container exactly &ndash; a longer drag still lets it overflow on purpose.

{@snippet features/table-scroll}

<snippet-footer>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</snippet-footer>

## Installation

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list:

<code-switcher>
```js
import { ClassicEditor, Table, TableScroll } from 'ckeditor5';

ClassicEditor
	.create( {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableScroll, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

<info-box info>
	By default, this feature requires no configuration or additional UI &ndash; a **content** table starts and stops scrolling automatically, based on its own width and the space available to it. It works together with the {@link features/tables-resize table and column resize} and {@link features/tables-caption table caption} features. See {@link features/tables-scroll#configuring-which-tables-can-scroll below} for how to also enable it for layout tables.
</info-box>

## Configuring which tables can scroll

By default, only **content** tables become scrollable when they overflow their container. **Layout** tables are excluded by default, since letting a layout table grow past its container can easily break the intended page layout &ndash; dragging its column resize handle stops at the container's edge instead of overflowing it.

To also allow layout tables to scroll (and to be resized past the container width), add `'layout'` to {@link module:table/tableconfig~TableScrollConfig#tableTypes `config.table.tableScroll.tableTypes`}:

<code-switcher>
```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Table, TableScroll, /* ... */ ],
		toolbar: [ 'insertTable', /* ... */ ],
		table: {
			tableScroll: {
				tableTypes: [ 'content', 'layout' ]
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

<info-box>
	A table nested inside another table never becomes scrollable, regardless of this configuration &ndash; scrolling only ever applies to a table sitting directly in the editing root.
</info-box>

## Common API

The {@link module:table/tablescroll~TableScroll} plugin does not register any commands or UI components.

<!-- No commands or buttons, only automatic, so this box has nothing else to point to. -->

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Known issues

This feature only affects the editing view &ndash; a table only ever scrolls while you are editing it, it never scrolls in the actual document data. Because of that, it does not carry over to the {@link features/export-word Export to Word} and {@link features/export-pdf Export to PDF} features: an overflowing table is exported at its full, intended width, and appears exactly as it would with the scrolling feature disabled.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
