
---
menu-title: Document lists
category: features-lists
order: 30
modified_at: 2022-09-20
---

{@snippet features/lists-source}


# Document list

The document list feature is based on a completely different approach than the regular list. Unlike regular list, which is a content block in itself, the document list plugin will let any part of the content be part of a list. Content blocks and elements – such as blockquotes, tables, paragraphs, and others – can now be put inside a list item, ensuring the continuity of numbering and retaining indentation.

Just like regular lists, the document list feature supports both ordered and unordered lists.

<info-box info>
	There are currently two plugins providing lists support for CKEditor 5: the original {@link features/lists lists feature} and this new **document lists** feature.

	The document lists feature is not enabled in any builds, you need to [install it](#installation) by hand.
</info-box>

## Demo

Use the demo below to add block elements like tables, images or nested lists and see the document retain ordering and list styles. Use the toolbar buttons to insert new ordered {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list} and unordered lists {@icon @ckeditor/ckeditor5-list/theme/icons/bulletedlist.svg Insert unordered list} list items.

{@snippet features/lists-document}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## List properties

Document lists offers additional formatting tools that allow controlling the lists, just like regular lists. There are ordered and unordered lists, selectable styles for list markers, the ability to set the start index or to reverse the list order. These additional features can be enabled separately or all together. You can test all of these in the demo above.

### List styles

The list style feature introduces some more styles for the list item markers. When {@link module:list/listproperties~ListPropertiesConfig#styles enabled}, it adds 3 styles for unordered lists and 6 styles for ordered lists to choose from. The user will be able to set or change the list style via the dropdown that opens when you click the arrow next to the appropriate list button in the toolbar.

### List start index

The list start index feature allows the user to choose the starting point of an ordered list. By default, this would be `1` (or `A`, or `I` &mdash; see the [list styles section](#list-styles)), but in certain situations it may be desired to start a list with some other digit or letter.

When this feature is {@link module:list/listproperties~ListPropertiesConfig#startIndex enabled}, an additional dropdown option is available in the ordered list toolbar button. Thanks to it, the user may set or change the starting marker.

### Reversed list

The reversed list feature lets the user reverse the numbering order of a list, changing it from ascending to descending. This is especially useful in countdowns and things-to-do lists that need to reproduce steps in a reversed order (for example, in a disassembling instruction in an owners manual).

When this feature is {@link module:list/listproperties~ListPropertiesConfig#reversed enabled}, an additional dropdown switch is available in the ordered list toolbar button. Thanks to it,  the user may easily reverse the order of a list with a single click.

## List indentation

Refer to the {@link features/indent#indenting-lists Indenting lists} section of the Block indentation feature guide.

## Related features

These features also provide similar functionality:
* {@link features/todo-lists To-do lists} &ndash; Create a list of interactive checkboxes with labels.
* {@link features/indent Block indentation} &ndash; Set indentation for text blocks such as paragraphs or headings and lists.
* {@link features/autoformat Autoformatting} &ndash; Format the text on the go with Markdown code.

## Installation

### Document list feature

To add this feature to your editor, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```
npm install --save @ckeditor/ckeditor5-list
```

Then add the `DocumentList` plugin to your plugin list and the toolbar configuration:

```js
import DocumentList from '@ckeditor/ckeditor5-list/src/documentlist';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ DocumentList, ... ],
		toolbar: [ 'bulletedList', 'numberedList', ... ]
	} )
	.then( ... )
	.catch( ... );
```

### Document list properties

To enable the list properties feature for document lists, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```
npm install --save @ckeditor/ckeditor5-list
```

Then add the `DocumentListProperties` plugin to your plugin list and configure the toolbar. To enable selected sub-features of the list properties, you need to add their configuration to your editor (set `true` for each feature you want to enable):

```js
import DocumentListProperties from '@ckeditor/ckeditor5-list/src/documentlistproperties';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ DocumentListProperties, ... ],
		toolbar: [ 'bulletedList', 'numberedList', ... ],
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link installation/getting-started/installing-plugins installing plugins}.
</info-box>

<info-box warning>
	The {@link module:list/documentlistproperties~DocumentListProperties} feature overrides UI button implementations from the {@link module:list/list/listui~ListUI}.
</info-box>

## Common API

The {@link module:list/documentlist~DocumentList} plugin registers:

* The {@link module:list/documentlist/documentlistcommand~DocumentListCommand `'numberedList'`} command.
* The {@link module:list/documentlist/documentlistcommand~DocumentListCommand `'bulletedList'`} command.
* The {@link module:list/documentlist/documentlistindentcommand~DocumentListIndentCommand `'indentList'`} command.
* The {@link module:list/documentlist/documentlistindentcommand~DocumentListIndentCommand `'outdentList'`} command.
* The `'numberedList'` UI button.
* The `'bulletedList'` UI button.

The {@link module:list/documentlistproperties~DocumentListProperties} plugin registers:

* The {@link module:list/documentlistproperties/documentliststylecommand~DocumentListStyleCommand `documentListStyle`} command that accepts the `type` of the list style to set. If not set, is uses the default marker (usually decimal).
    ```js
    editor.execute( 'documentListStyle', { type: 'lower-roman' } );
    ```
    The available types are:

    * For bulleted lists: `'disc'`, `'circle'` and `'square'`.
    * For numbered lists: `'decimal'`, `'decimal-leading-zero'`, `'lower-roman'`, `'upper-roman'`, `'lower-latin'` and `'upper-latin'`.
* The {@link module:list/documentlistproperties/documentliststartcommand~DocumentListStartCommand `documentListStart`} command which is a Number and defaults to `1` (meaning a list starts with `1`). If enabled, it accepts a numerical value for the `start` attribute.

	```js
    editor.execute( 'documentListStart', { startIndex: 3 } );
    ```

* The {@link module:list/documentlistproperties/documentlistreversedcommand~DocumentListReversedCommand `documentListReversed`} command which is a Boolean and defaults to `false` (meaning the list order is ascending).

	```js
    editor.execute( 'documentListReversed', { reversed: true } );
    ```

* The `numberedList` UI split button that overrides the UI button registered by the `List` plugin.
* The `bulletedList` UI split button that overrides the UI button registered by the `List` plugin.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list.
