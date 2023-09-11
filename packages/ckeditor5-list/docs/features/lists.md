---
menu-title: Ordered and unordered lists
meta-title: Lists | CKEditor 5 Documentation
category: features-lists
order: 10
modified_at: 2023-09-08
---

{@snippet features/lists-source}

# Ordered and unordered lists

The list feature lets you create ordered and unordered lists. The unique thing about them is that you can put any content inside each list item (including block elements like paragraphs and tables), retaining the continuity of numbering and indentation.

<info-box info>
	There are currently two plugins providing list support for CKEditor&nbsp;5: this regular {@link features/lists lists feature} and the {@link features/legacy-lists legacy lists feature}.
</info-box>

## Demo

Use the demo below to add block elements like tables, images, or nested lists. Notice that the document retains the ordering and list styles. Use the toolbar buttons to insert new ordered {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list} and unordered lists {@icon @ckeditor/ckeditor5-list/theme/icons/bulletedlist.svg Insert unordered list}.

{@snippet features/lists-document}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>


## List properties

In addition to the basic functionality of creating the ordered and unordered lists, CKEditor&nbsp;5 offers formatting tools that let you control the lists. Features such as more styles for list markers, setting the start index, or reversing the list order can be enabled separately or all at once. Check out the individual demos below or see all list properties working together in the {@link examples/builds/full-featured-editor full-featured editor example}.

<info-box info>

	UPDATE THIS

	The {@link module:list/listproperties~ListProperties list properties feature} is enabled by default in the {@link installation/getting-started/predefined-builds#document-editor document editor build} only.

	The {@link module:list/documentlistproperties~DocumentListProperties document list properties feature} is not available in any builds by default.

	See the [installation](#list-properties-2) section to learn how to enable these in your editor.
</info-box>

#### List styles

The list style feature introduces some more styles for the list item markers. When {@link module:list/listconfig~ListPropertiesConfig#styles enabled}, it adds 3 styles for unordered lists and 6 styles for ordered lists to choose from. The user will be able to set or change the list style via the dropdown that opens when you click the arrow next to the appropriate list button in the toolbar.

In the demo above, use the ordered {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list} or unordered list dropdown {@icon @ckeditor/ckeditor5-list/theme/icons/bulletedlist.svg Insert unordered list} to choose the desired marker type for each list.

#### List start index

The list start index feature allows the user to choose the starting point of an ordered list. By default, this would be `1` (or `A`, or `I` &mdash; see the [list styles section](#list-styles)), but in certain situations it may be desired to start a list with some other digit or letter.

When this feature is {@link module:list/listconfig~ListPropertiesConfig#startIndex enabled}, an additional dropdown option is available in the ordered list toolbar button. Thanks to it, the user may set or change the starting marker.

 Add a second ordered list in the demo above to test this feature. Then use the ordered list {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list} dropdown input field to set the start index.

#### Reversed list

The reversed list feature lets the user reverse the numbering order of a list, changing it from ascending to descending. This is especially useful in countdowns and things-to-do lists that need to reproduce steps in a reversed order (for example, in disassembly instructions).

When this feature is {@link module:list/listconfig~ListPropertiesConfig#reversed enabled}, an additional dropdown switch is available in the ordered list toolbar button. Thanks to it,  the user may easily reverse the order of a list with a single click. Click anywhere in the ordered list in the demo above and use the ordered list {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list} dropdown switch to choose whether the numbering order should be reversed.

<!-- <info-box info>
	You can see all the list properties together in action in the {@link examples/builds/full-featured-editor Feature-rich editor} and {@link examples/builds/document-editor Document editor} examples.
</info-box> -->

## List indentation

Refer to the {@link features/indent#indenting-lists Indenting lists} section of the Block indentation feature guide.

## List merging

By default, two lists of the same type (ordered and unordered) that are next to each other are merged together. This is done so that lists that visually appear to be one continuous list actually are, even if the user has accidentally created several of them.

Unfortunately, in some cases this can be undesirable behavior. For example, two adjacent numbered lists, each with two items, will merge into a single list with the numbers 1 through 4.

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
