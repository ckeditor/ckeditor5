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

## List properties

Beside the basic functionality of creating the ordered and unordered list, CKEditor 5 offers additional formatting tools that allow controlling the lists.

<info-box info>
	The feature is enabled by default in the document editor build.
</info-box>

### List start index

The {@link module:list/liststartcommand~ListStartCommand list start index} feature offers the user to choose the starting point of an ordered list. By default, this would be `1` (or `A`, or `I` &ndash; see the [list styles section](#list-styles)), but in certain situations it may be desired to start a list with some other digit or letter.

Additional dropdown option is available, where the user may set the starting marker.

### Reversed list

The {@link module:list/listreversedcommand~ListReversedCommand reversed list} feature lets the editor reverse the numbering order of a list. This is especially useful in countdowns and thing-to-do lists that need to reproduce steps in a reversed order (for example disassembling instruction in an owners manual).

Additional dropdown switch makes it easy to reverse the order of a list with a single click.

### List styles

The {@link module:list/listproperties~ListProperties list style} feature introduces some more styles for the list item markers. When enabled, it adds 3 styles for unordered lists and 6 styles for ordered lists to choose from. The styles can be changed via the dropdown that opens when you click the arrow next to the appropriate list button in the toolbar.

### List properties demo

Use the editor below to see the list properties in action.

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

Then add the `ListProperties` plugin to your plugin list and the toolbar configuration:

```js
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ListProperties, ... ],
		toolbar: [ 'bulletedList', 'numberedList', ... ],
	} )
	.then( ... )
	.catch( ... );
```

To enable chosen list properties, you need to add the following configuration (set `true` for each feature you want to enable):

```js
ClassicEditor
	.create( editorElement, {
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
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

<info-box warning>
	The {@link module:list/listproperties~ListProperties} feature overrides UI button implementations from the {@link module:list/listui~ListUI}.
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

The {@link module:list/listproperties~ListProperties} plugin registers:

* The {@link module:list/liststylecommand~ListStyleCommand `'listStyle'`} command that accepts a `type` of the list style to set.
    ```js
    editor.execute( 'listStyle', { type: 'decimal' } );
    ```
    The available types are:

    * For bulleted lists: `'disc'`, `'circle'`, and `'square'`.
    * For numbered lists: `'decimal'`, `'decimal-leading-zero'`, `'lower-roman'`, `'upper-roman'`, `'lower-latin'`, and `'upper-latin'`.
* The {@link module:list/liststartcommand~ListStartCommand `'listStart'`} command that accepts a numerical value
* The {@link module:list/listreversedcommand~ListReversedCommand `'listReversed`} command which is a boolean
* The `'numberedList'` UI split button (it overrides the UI button registered by the `List` plugin.
* The `'bulletedList'` UI split button (it overrides the UI button registered by the `List` plugin.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list.
