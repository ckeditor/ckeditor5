---
menu-title: Ordered and unordered lists
category: features-lists
order: 10
modified_at: 2022-05-12
---

# Ordered and unordered lists

The list feature lets you create ordered (numbered) and unordered (bulleted) lists. You can use ordered lists where the order of the items matters (as in instructions) and unordered lists where it is not that important (as in a list of ingredients).

{@snippet features/lists-source}

## Demo

Use the editor below to see the CKEditor 5 list feature in action. Toolbar buttons can be used to insert both ordered {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list} and unordered lists {@icon @ckeditor/ckeditor5-list/theme/icons/bulletedlist.svg Insert unordered list}.

A Markdown code provided by the {@link features/autoformat autoformatting feature} can also be utilized:

* Start a line with `*` or `-` followed by a space for a bulleted list.
* Start a line with `1.` or `1)` followed by a space for a numbered list.

{@snippet features/lists-basic}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

After reading this guide, check out the [Lists in CKEditor 5](https://ckeditor.com/blog/Feature-of-the-month-Lists-in-CKEditor-5/) blog post where you will find more information about lists with examples.

## List properties

In addition to the basic functionality of creating the ordered and unordered lists, CKEditor 5 offers formatting tools that let you control the lists. Features such as more styles for list markers, setting the start index, or reversing the list order can be enabled separately or all at once. Check out the individual demos below or see all list properties working together in the {@link examples/builds/full-featured-editor full-featured editor example}.

<info-box info>
	The {@link module:list/listproperties~ListProperties list properties feature} is enabled by default in the {@link installation/getting-started/predefined-builds#document-editor document editor build} only.

	The {@link module:list/documentlistproperties~DocumentListProperties document list properties feature} is not available in any builds by default.

	See the [installation](#list-properties-2) section to learn how to enable these in your editor.
</info-box>

### List styles

The list style feature introduces some more styles for the list item markers. When {@link module:list/listproperties~ListPropertiesConfig#styles enabled}, it adds 3 styles for unordered lists and 6 styles for ordered lists to choose from. The user will be able to set or change the list style via the dropdown that opens when you click the arrow next to the appropriate list button in the toolbar.

#### Demo

In the editor below use the ordered or unordered list dropdown to choose the desired marker type for each list.

{@snippet features/lists-style}

### List start index

The list start index feature allows the user to choose the starting point of an ordered list. By default, this would be `1` (or `A`, or `I` &mdash; see the [list styles section](#list-styles)), but in certain situations it may be desired to start a list with some other digit or letter.

When this feature is {@link module:list/listproperties~ListPropertiesConfig#startIndex enabled}, an additional dropdown option is available in the ordered list toolbar button. Thanks to it, the user may set or change the starting marker.

#### Demo

In the editor below, notice how the ordering is continued in the second list. You can go to the first item of the last list and use the ordered list {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list} dropdown input field to set the start index to achieve continuous numbering of spaceships.

{@snippet features/lists-index}

### Reversed list

The reversed list feature lets the user reverse the numbering order of a list, changing it from ascending to descending. This is especially useful in countdowns and things-to-do lists that need to reproduce steps in a reversed order (for example, in disassembly instructions).

When this feature is {@link module:list/listproperties~ListPropertiesConfig#reversed enabled}, an additional dropdown switch is available in the ordered list toolbar button. Thanks to it,  the user may easily reverse the order of a list with a single click.

#### Demo

Click the second list and use the ordered list {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list} dropdown switch to choose whether it should be reversed.

{@snippet features/lists-reversed}

<info-box info>
	You can see all the list properties together in action in the {@link examples/builds/full-featured-editor Full-featured editor} and {@link examples/builds/document-editor Document editor} examples.
</info-box>

## List indentation

Refer to the {@link features/indent#indenting-lists Indenting lists} section of the Block indentation feature guide.

## Installation

<info-box info>
	There are currently two plugins providing lists support for CKEditor 5: this regular **lists feature** and the new {@link features/document-lists document lists feature}, based on a different approach.

	The lists feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}.

	If you wish to switch to the document list feature, you need to {@link features/document-lists#installation install it} first.
</info-box>

### List feature

<info-box info>
	The base list feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined editor builds}. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```
npm install --save @ckeditor/ckeditor5-list
```

Then add the `List` plugin to your plugin list and the toolbar configuration:

```js
import List from '@ckeditor/ckeditor5-list/src/list';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ List, /* ... */ ],
		toolbar: [ 'bulletedList', 'numberedList', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

#### List properties

<info-box info>
	The {@link module:list/listproperties~ListProperties list properties feature} is enabled by default in the {@link installation/getting-started/predefined-builds#document-editor document editor build} only.
</info-box>

To enable the list properties feature, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```
npm install --save @ckeditor/ckeditor5-list
```

Then add the `ListProperties` plugin to your plugin list and configure the toolbar. To enable selected sub-features of the list properties, you need to add their configuration to your editor (set `true` for each feature you want to enable):

```js
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ListProperties, ... ],
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
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

<info-box warning>
	The {@link module:list/listproperties~ListProperties} feature overrides UI button implementations from the {@link module:list/list/listui~ListUI}.
</info-box>

## Related features

These features provide similar functionality:
* {@link features/todo-lists To-do lists} &ndash; Create a list of interactive checkboxes with labels.
* {@link features/indent Block indentation} &ndash; Set indentation for text blocks such as paragraphs or headings and lists.
* {@link features/autoformat Autoformatting} &ndash; Format the text on the go with Markdown code.

## Common API

The {@link module:list/list~List} plugin registers:

* The {@link module:list/list/listcommand~ListCommand `'numberedList'`} command.
* The {@link module:list/list/listcommand~ListCommand `'bulletedList'`} command.
* The {@link module:list/list/indentcommand~IndentCommand `'indentList'`} command.
* The {@link module:list/list/indentcommand~IndentCommand `'outdentList'`} command.
* The `'numberedList'` UI button.
* The `'bulletedList'` UI button.

The {@link module:list/listproperties~ListProperties} plugin registers:

* The {@link module:list/listproperties/liststylecommand~ListStyleCommand `listStyle`} command that accepts the `type` of the list style to set. If not set, is uses the default marker (usually decimal).
    ```js
    editor.execute( 'listStyle', { type: 'lower-roman' } );
    ```
    The available types are:

    * For bulleted lists: `'disc'`, `'circle'`, and `'square'`.
    * For numbered lists: `'decimal'`, `'decimal-leading-zero'`, `'lower-roman'`, `'upper-roman'`, `'lower-latin'`, and `'upper-latin'`.
* The {@link module:list/listproperties/liststartcommand~ListStartCommand `listStart`} command which is a Number and defaults to `1` (meaning a list starts with `1`). If enabled, it accepts a numerical value for the `start` attribute.

	```js
    editor.execute( 'listStart', { startIndex: 3 } );
    ```

* The {@link module:list/listproperties/listreversedcommand~ListReversedCommand `listReversed`} command which is a Boolean and defaults to `false` (meaning the list order is ascending).

	```js
    editor.execute( 'listReversed', { reversed: true } );
    ```

* The `numberedList` UI split button that overrides the UI button registered by the `List` plugin.
* The `bulletedList` UI split button that overrides the UI button registered by the `List` plugin.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list).
