---
menu-title: Ordered and unordered lists
category: features-lists
order: 10
---

# Lists

The {@link module:list/list~List list} feature allows creating ordered (numbered) and unordered (bulleted) lists. This allows for better structuring and presenting specific content such as enumerating elements, creating tables of content or {@link features/todo-lists to-do lists}.

Lists are useful when you want to emphasize selected information, highlight a series of steps, enumerate items of a collection. They draw the reader's attention and, just like {@link features/block-quote block quotes} or {@link features/indent indentation}, give the text a structure and breathing room. They help visually separate passages for a better reading experience and make skimming for information easier.

You may find additional interesting details and examples in the [Lists in CKEditor 5](https://ckeditor.com/blog/Feature-of-the-month-Lists-in-CKEditor-5/) blog post after reading this guide.

<info-box info>
	The feature is enabled by default in all CKEditor 5 WYSIWYG editor builds.
</info-box>

{@snippet features/lists-source}

## Ordered and unordered lists

An unordered (bulleted) list can represent items where the order is not important, for example, a list of ingredients required for preparing a dish or a drink.

An ordered (numbered) list can be used if the order of the items matters, for example, when creating an instruction. Here, the sequence of steps that must be done is important.

### Demo

Use the editor below to see the list feature plugin in action. Toolbar buttons can be used to insert both ordered {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list} and unordered lists {@icon @ckeditor/ckeditor5-list/theme/icons/bulletedlist.svg Insert unordered list}.

A Markdown code provided by the {@link features/autoformat autoformatting feature} can also be utilized:

* Start a line with `*` or `-` followed by a space for a bulleted list.
* Start a line with `1.` or `1)` followed by a space for a numbered list.

{@snippet features/lists-basic}

## List styles

The {@link module:list/liststyle~ListStyle list style} feature introduces some more styles for the list item markers. When enabled, it adds 3 styles for unordered lists and 6 styles for ordered lists to choose from. The styles can be changed via the dropdown that opens when you click the arrow next to the appropriate list button in the toolbar.

### Demo

Use the editor below to see the list style plugin in action.

{@snippet features/lists-style}

## Related features

These features also provide similar functionality:
* {@link features/todo-lists To-do lists} &ndash; Create a list of interactive checkboxes with labels.
* {@link features/indent Block indentation} &ndash; Set indentation for text blocks such as paragraphs or headings and lists.
* {@link features/autoformat Autoformatting} &ndash; Format the text on the go with Markdown code.

## Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```
npm install --save @ckeditor/ckeditor5-list
```

Then add the `ListStyle` plugin to your plugin list and the toolbar configuration:

```js
import ListStyle from '@ckeditor/ckeditor5-list/src/liststyle';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ListStyle, ... ],
		toolbar: [ 'bulletedList', 'numberedList', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

<info-box warning>
	The {@link module:list/liststyle~ListStyle} feature overrides UI button implementations from the {@link module:list/listui~ListUI}.
</info-box>

## List indentation

Refer to the {@link features/indent Indenting lists} section of the Block indentation feature guide.

## Common API

The {@link module:list/list~List} plugin registers:

* The {@link module:list/listcommand~ListCommand `'numberedList'`} command.
* The {@link module:list/listcommand~ListCommand `'bulletedList'`} command.
* The {@link module:list/indentcommand~IndentCommand `'indentList'`} command.
* The {@link module:list/indentcommand~IndentCommand `'outdentList'`} command.
* The `'numberedList'` UI button.
* The `'bulletedList'` UI button.

The {@link module:list/liststyle~ListStyle} plugin registers:

* The {@link module:list/liststylecommand~ListStyleCommand `'listStyle'`} command that accepts a `type` of the list style to set.
    ```js
    editor.execute( 'listStyle', { type: 'decimal' } );
    ```
    The available types are:

    * For bulleted lists: `'disc'`, `'circle'`, and `'square'`.
    * For numbered lists: `'decimal'`, `'decimal-leading-zero'`, `'lower-roman'`, `'upper-roman'`, `'lower-latin'`, and `'upper-latin'`.
* The `'numberedList'` UI split button (it overrides the UI button registered by the `List` plguin.
* The `'bulletedList'` UI split button (it overrides the UI button registered by the `List` plguin.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list.
