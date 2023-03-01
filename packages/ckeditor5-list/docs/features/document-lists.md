---
menu-title: Document lists
category: features-lists
order: 30
modified_at: 2022-09-20
---

{@snippet features/lists-source}

# Document list

The document list feature lets you create ordered and unordered lists. The unique thing about them is that you can put any content inside each list item (including block elements like paragraphs and tables), retaining the continuity of numbering and indentation.

## Demo

Use the demo below to add block elements like tables, images or nested lists and see the document retain ordering and list styles. Use the toolbar buttons to insert new ordered {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list} and unordered lists {@icon @ckeditor/ckeditor5-list/theme/icons/bulletedlist.svg Insert unordered list} list items.

{@snippet features/lists-document}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## List styles

Document lists offer additional formatting tools, just like regular lists. The list style feature introduces some more styles for the list item markers. When enabled, it adds 3 styles for unordered lists and 6 styles for ordered lists to choose from. The user will be able to set or change the list style via the dropdown that opens when you click the arrow next to the appropriate list button in the toolbar.

## List indentation

Refer to the {@link features/indent#indenting-lists Indenting lists} section of the Block indentation feature guide.

## Installation

<info-box info>
	There are currently two plugins providing list support for CKEditor 5: the regular {@link features/lists lists feature} and this new **document lists feature**.

	The document lists feature is not enabled in any builds, so you need to install it by hand.
</info-box>

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
		plugins: [ DocumentList, /* ... */ ],
		toolbar: [ 'bulletedList', 'numberedList', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
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
		plugins: [ DocumentListProperties, /* ... */ ],
		toolbar: [ 'bulletedList', 'numberedList', /* ... */ ],
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

<info-box warning>
	The {@link module:list/documentlistproperties~DocumentListProperties} feature overrides UI button implementations from the {@link module:list/list/listui~ListUI}.
</info-box>

## Related features

These features also provide similar functionality:
* {@link features/todo-lists To-do lists} &ndash; Create a list of interactive checkboxes with labels.
* {@link features/indent Block indentation} &ndash; Set indentation for text blocks such as paragraphs or headings and lists.
* {@link features/autoformat Autoformatting} &ndash; Format the text on the go with Markdown code.

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

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list).
