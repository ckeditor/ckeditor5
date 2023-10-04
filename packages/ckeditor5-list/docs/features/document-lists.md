---
menu-title: Document lists
meta-title: Document lists | CKEditor 5 Documentation
category: features-lists
order: 30
modified_at: 2023-09-28
---

{@snippet features/lists-source}

# Document lists

The document list feature lets you create ordered and unordered lists. The unique thing about them is that you can put any content inside each list item (including block elements like paragraphs and tables), retaining the continuity of numbering and indentation. As of CKEditor 5 v40.0.0, they support **ordered**, **unordered**, and **to-do** lists.

<info-box warning>
	The document lists feature will become the default list feature for CKEditor&nbsp;5 in the upcoming releases and will replace the {@link features/lists current one}. This plugin will then be withdrawn at the beginning of 2024.
	See [#14767](https://github.com/ckeditor/ckeditor5/issues/14767) for more details.
</info-box>

## Demo

Use the demo below to add block elements like tables, images, or nested lists. Notice that the document retains the ordering and list styles. Use the toolbar buttons to insert new ordered {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list}, unordered {@icon @ckeditor/ckeditor5-list/theme/icons/bulletedlist.svg Insert unordered list} and to-do {@icon @ckeditor/ckeditor5-list/theme/icons/todolist.svg To-do list} lists.

{@snippet features/lists-document}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## List styles

Document lists offer additional formatting tools, just like regular lists. The list style feature introduces some more styles for the list item markers. When enabled, it adds 3 styles for unordered lists and 6 styles for ordered lists to choose from. The user will be able to set or change the list style via the dropdown that opens when you click the arrow next to the appropriate list button in the toolbar.

## List indentation

Refer to the {@link features/indent#indenting-lists Indenting lists} section of the Block indentation feature guide.

## Installation

<info-box info>
	There are currently two plugins providing list support for CKEditor&nbsp;5: the regular {@link features/lists lists feature} and this new **document lists feature**.

	The document lists feature is not enabled in any builds, so you need to install it by hand.
</info-box>

### Document list feature

To add this feature to your editor, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```
npm install --save @ckeditor/ckeditor5-list
```

Then add the `DocumentList` plugin to your plugin list and the toolbar configuration:

```js
import { DocumentList } from '@ckeditor/ckeditor5-list';

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
import { DocumentListProperties } from '@ckeditor/ckeditor5-list';

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

### To-do lists

To add the to-do lists feature to your editor, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```bash
npm install --save @ckeditor/ckeditor5-list
```

Then add the `TodoDocumentList` plugin to your plugin list and the toolbar configuration:

```js
import { TodoDocumentList } from '@ckeditor/ckeditor5-list';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ TodoDocumentList, /* ... */ ],
		toolbar: [ 'todoList', /* ... */ ],
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

## List merging

By default, two lists of the same type (ordered and unordered) that are next to each other are merged together. This is done so that lists that visually appear to be one continuous list actually are, even if the user has accidentally created several of them.

Unfortunately, in some cases, this can be undesirable behavior. For example, two adjacent numbered lists, each with two items, will merge into a single list with the numbers 1 through 4.

To prevent this behavior, enable the `AdjacentListsSupport` plugin.

```js
import AdjacentListsSupport from '@ckeditor/ckeditor5-list/src/documentlist/adjacentlistssupport.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			AdjacentListsSupport,
			/* Other plugins */
		],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Simple lists

The simple list config option is a great solution for users who do not need to turn block elements into list items. When this setting is active, users can only insert text into list items and will not be able to nest content blocks &ndash; like paragraphs,  or tables &ndash; inside a list item. This would be handy for small editing areas and for content creation solutions that mostly need to work with less advanced documents. Turning off the default block support will make editing easier with limited capabilities and also affect some fields like keyboard shortcuts.

Turn the block list support off in the config:

```js
import { DocumentList } from '@ckeditor/ckeditor5-list';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ DocumentList, /* ... */ ],
		toolbar: [ 'bulletedList', 'numberedList', /* ... */ ],
		list: {
		    multiBlock: false // Turn off the multi block support (enabled by default).
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

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

The {@link module:list/tododocumentlist~TodoDocumentList} plugin registers:

* The {@link module:list/documentlist/documentlistcommand~DocumentListCommand `'todoList'`} command.
* The {@link module:list/tododocumentlist/checktododocumentlistcommand~CheckTodoDocumentListCommand `'checkTodoList'`} command.
* The `'todoList'` UI button.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list).
