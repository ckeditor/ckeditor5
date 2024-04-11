---
menu-title: Ordered and unordered lists
meta-title: Lists | CKEditor 5 Documentation
category: features-lists
order: 10
---

{@snippet features/lists-source}

# Ordered and unordered lists

The list feature lets you create ordered (numbered) and unordered (bulleted) lists. The unique thing about them is that you can put any content inside each list item (including block elements like paragraphs and tables), retaining the continuity of numbering and indentation.

<info-box warning>
	Since version 41.0.0, the list support plugin has changed for CKEditor&nbsp;5. You can read more about this change in the {@link updating/update-to-41#breaking-changes-to-the-list-plugin Update to CKEditor 41.0.0} guide.
</info-box>

## Demo

Use the editor below to see the list feature in action. You can use toolbar buttons to insert both ordered {@icon @ckeditor/ckeditor5-core/theme/icons/numberedlist.svg Insert ordered list} and unordered lists {@icon @ckeditor/ckeditor5-core/theme/icons/bulletedlist.svg Insert unordered list}.

You can also use Markdown code recognized by the {@link features/autoformat autoformatting feature}:

* Start a line with `*` or `-` followed by a space for a bulleted list.
* Start a line with `1.` or `1)` followed by a space for a numbered list.

{@snippet features/lists-document}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## List properties

Besides the basic functionality of creating ordered and unordered lists, CKEditor&nbsp;5 offers formatting tools that let you control the lists. You can enable features such as more styles for list markers, setting the start index, or reversing the list order separately or all at once. Check out the individual demos below or see all list properties working together in the {@link examples/builds/full-featured-editor full-featured editor example}.

<info-box info>
	The {@link module:list/listproperties~ListProperties list properties feature} is enabled by default in the {@link installation/getting-started/predefined-builds#document-editor document editor build}.

	See the [list properties installation section](#list-properties-2) to learn how to enable these in your editor.
</info-box>

### List styles

The list style feature introduces some more styles for the list item markers. When {@link module:list/listconfig~ListPropertiesConfig#styles enabled}, it adds 3 styles for unordered lists and 6 styles for ordered lists to choose from. The user will be able to set or change the list style via the dropdown. It opens when you click the arrow next to the appropriate list button in the toolbar.

#### Demo

In the editor below, use the ordered {@icon @ckeditor/ckeditor5-core/theme/icons/numberedlist.svg Insert ordered list} or unordered list dropdown {@icon @ckeditor/ckeditor5-core/theme/icons/bulletedlist.svg Insert unordered list} to choose the desired marker type for each list.

{@snippet features/lists-style}

### List start index

The list start index feature allows the user to choose the starting point of an ordered list. By default, this would be `1` (or `A`, or `I` &ndash; see the [list styles section](#list-styles)). Sometimes you may want to start a list with some other digit or letter, though.

When this feature is {@link module:list/listconfig~ListPropertiesConfig#startIndex enabled}, an extra dropdown option is available in the ordered list toolbar button. Thanks to it, the user may set or change the starting marker.

#### Demo

In the editor below, notice how the ordering continues in the second list. To achieve continuous numbering of all spaceships from the example, go to the first item of the last list. Then use the ordered list {@icon @ckeditor/ckeditor5-core/theme/icons/numberedlist.svg Insert ordered list} dropdown input field to set the start index.

{@snippet features/lists-index}

### Reversed list

The reversed list feature lets the user reverse the numbering order of a list, changing it from ascending to descending. This is useful in countdowns and things-to-do lists that need to reproduce steps in a reversed order (for example, in disassembly instructions).

When this feature is {@link module:list/listconfig~ListPropertiesConfig#reversed enabled}, an extra dropdown switch is available in the ordered list toolbar button. Thanks to it,  the user may reverse the order of a list with a single click.

#### Demo

Click the second list and use the ordered list {@icon @ckeditor/ckeditor5-core/theme/icons/numberedlist.svg Insert ordered list} dropdown switch to choose whether to reverse the numbering order.

{@snippet features/lists-reversed}

<info-box info>
	You can see all the list properties together in action in the {@link examples/builds/full-featured-editor Feature-rich editor} and {@link examples/builds/document-editor Document editor} examples.
</info-box>

## Installation

The `List` plugin provides the {@link features/lists ordered (numbered) and unordered (bulleted) features} for CKEditor&nbsp;5. {@link features/lists#list-properties Additional list properties}, such as list marker styles, start index, or reversed list order, are provided by the `ListProperties` plugin.

### List feature

<info-box info>
	The list feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}. The installation instructions are for developers interested in building their own, custom rich text editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```
npm install --save @ckeditor/ckeditor5-list
```

Then add the `List` plugin to your plugin list and the toolbar configuration:

```js
import { List } from '@ckeditor/ckeditor5-list';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ List, /* ... */ ],
		toolbar: [ 'bulletedList', 'numberedList', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### List properties

<info-box info>
	The {@link module:list/listproperties~ListProperties list properties feature} is enabled by default in the {@link installation/getting-started/predefined-builds#document-editor document editor build}.
</info-box>

To enable the list properties feature for ordered and unordered lists, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```
npm install --save @ckeditor/ckeditor5-list
```

Then add the `ListProperties` plugin to your plugin list and configure the toolbar.

To enable selected sub-features of the list properties, add their configuration to your editor. Set `true` for each feature you want to enable:

```js
import { ListProperties } from '@ckeditor/ckeditor5-list';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ListProperties, /* ... */ ],
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

<info-box warning>
	The {@link module:list/listproperties~ListProperties} feature overrides UI button implementations from the {@link module:list/list/listui~ListUI}.
</info-box>

## Related features

These CKEditor&nbsp;5 features provide similar functionality:

* {@link features/todo-lists To-do lists} &ndash; Create a list of interactive checkboxes with labels.
* {@link features/multi-level-lists Multi-level lists} &ndash; Multi-level lists allow the user to set different markers (symbols, text or numbers) to display at each level of the list.
* {@link features/indent Block indentation} &ndash; Set indentation for text blocks such as paragraphs or headings and lists.
* {@link features/autoformat Autoformatting} &ndash; Format the text on the go with Markdown code.

## Common API

The {@link module:list/list~List} plugin registers:

* The {@link module:list/list/listcommand~ListCommand `'numberedList'`} command.
* The {@link module:list/list/listcommand~ListCommand `'bulletedList'`} command.
* The {@link module:list/list/listindentcommand~ListIndentCommand `'indentList'`} command.
* The {@link module:list/list/listindentcommand~ListIndentCommand `'outdentList'`} command.
* The `'numberedList'` UI button.
* The `'bulletedList'` UI button.

The {@link module:list/listproperties~ListProperties} plugin registers:

* The {@link module:list/listproperties/liststylecommand~ListStyleCommand `listStyle`} command. It accepts the `type` of the list style to set. If not set, it uses the default marker (usually decimal).
	```js
	editor.execute( 'listStyle', { type: 'lower-roman' } );
	```
	The available types are:

	* For bulleted lists: `'disc'`, `'circle'`, and `'square'`.
	* For numbered lists: `'decimal'`, `'decimal-leading-zero'`, `'lower-roman'`, `'upper-roman'`, `'lower-latin'`, and `'upper-latin'`.
* The {@link module:list/listproperties/liststartcommand~ListStartCommand `listStart`} command. It is a number and defaults to `1` (meaning a list starts with `1`). If enabled, it accepts a numerical value for the `start` attribute.

	```js
	editor.execute( 'listStart', { startIndex: 3 } );
	```

* The {@link module:list/listproperties/listreversedcommand~ListReversedCommand `listReversed`} command. It is a Boolean and defaults to `false` (meaning the list order is ascending).

	```js
	editor.execute( 'listReversed', { reversed: true } );
	```

* The `numberedList` UI split button. It overrides the UI button registered by the `List` plugin.
* The `bulletedList` UI split button. It overrides the UI button registered by the `List` plugin.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list).
