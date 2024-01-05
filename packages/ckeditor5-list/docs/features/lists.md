---
menu-title: Ordered and unordered lists
meta-title: Lists | CKEditor 5 Documentation
category: features-lists
order: 10
---

{@snippet features/lists-source}

# Ordered and unordered lists

The list feature lets you create ordered and unordered lists. The unique thing about them is that you can put any content inside each list item (including block elements like paragraphs and tables), retaining the continuity of numbering and indentation.

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
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## List properties

In addition to the basic functionality of creating the ordered and unordered lists, CKEditor&nbsp;5 offers formatting tools that let you control the lists. Features such as more styles for list markers, setting the start index, or reversing the list order can be enabled separately or all at once. Check out the individual demos below or see all list properties working together in the {@link examples/builds/full-featured-editor full-featured editor example}.

<info-box info>
	The {@link module:list/listproperties~ListProperties list properties feature} is enabled by default in the {@link installation/getting-started/predefined-builds#document-editor document editor build} only.

	See the {@link features/lists-installation#list-properties list properties} installation section to learn how to enable these in your editor.
</info-box>

#### List styles

The list style feature introduces some more styles for the list item markers. When {@link module:list/listconfig~ListPropertiesConfig#styles enabled}, it adds 3 styles for unordered lists and 6 styles for ordered lists to choose from. The user will be able to set or change the list style via the dropdown that opens when you click the arrow next to the appropriate list button in the toolbar.

#### Demo

In the editor below, use the ordered {@icon @ckeditor/ckeditor5-core/theme/icons/numberedlist.svg Insert ordered list} or unordered list dropdown {@icon @ckeditor/ckeditor5-core/theme/icons/bulletedlist.svg Insert unordered list} to choose the desired marker type for each list.

{@snippet features/lists-style}

#### List start index

The list start index feature allows the user to choose the starting point of an ordered list. By default, this would be `1` (or `A`, or `I` &ndash; see the [list styles section](#list-styles)), but in certain situations it may be desired to start a list with some other digit or letter.

When this feature is {@link module:list/listconfig~ListPropertiesConfig#startIndex enabled}, an additional dropdown option is available in the ordered list toolbar button. Thanks to it, the user may set or change the starting marker.

#### Demo

In the editor below, notice how the ordering continues in the second list. For continuous numbering of spaceships, go to the first item of the last list. Then use the ordered list {@icon @ckeditor/ckeditor5-core/theme/icons/numberedlist.svg Insert ordered list} dropdown input field to set the start index.

{@snippet features/lists-index}

#### Reversed list

The reversed list feature lets the user reverse the numbering order of a list, changing it from ascending to descending. This is especially useful in countdowns and things-to-do lists that need to reproduce steps in a reversed order (for example, in disassembly instructions).

When this feature is {@link module:list/listconfig~ListPropertiesConfig#reversed enabled}, an additional dropdown switch is available in the ordered list toolbar button. Thanks to it,  the user may easily reverse the order of a list with a single click.

#### Demo

Click the second list and use the ordered list {@icon @ckeditor/ckeditor5-core/theme/icons/numberedlist.svg Insert ordered list} dropdown switch to choose whether the numbering order should be reversed.

{@snippet features/lists-reversed}

<info-box info>
	You can see all the list properties together in action in the {@link examples/builds/full-featured-editor Feature-rich editor} and {@link examples/builds/document-editor Document editor} examples.
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
* The {@link module:list/list/listindentcommand~ListIndentCommand `'indentList'`} command.
* The {@link module:list/list/listindentcommand~ListIndentCommand `'outdentList'`} command.
* The `'numberedList'` UI button.
* The `'bulletedList'` UI button.

The {@link module:list/listproperties~ListProperties} plugin registers:

* The {@link module:list/listproperties/liststylecommand~ListStyleCommand `listStyle`} command that accepts the `type` of the list style to set. If not set, it uses the default marker (usually decimal).
    ```js
    editor.execute( 'listStyle', { type: 'lower-roman' } );
    ```
    The available types are:

    * For bulleted lists: `'disc'`, `'circle'`, and `'square'`.
    * For numbered lists: `'decimal'`, `'decimal-leading-zero'`, `'lower-roman'`, `'upper-roman'`, `'lower-latin'`, and `'upper-latin'`.
* The {@link module:list/listproperties/liststartcommand~ListStartCommand `listStart`} command that is a Number and defaults to `1` (meaning a list starts with `1`). If enabled, it accepts a numerical value for the `start` attribute.

	```js
    editor.execute( 'listStart', { startIndex: 3 } );
    ```

* The {@link module:list/listproperties/listreversedcommand~ListReversedCommand `listReversed`} command that is a Boolean and defaults to `false` (meaning the list order is ascending).

	```js
    editor.execute( 'listReversed', { reversed: true } );
    ```

* The `numberedList` UI split button that overrides the UI button registered by the `List` plugin.
* The `bulletedList` UI split button that overrides the UI button registered by the `List` plugin.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list).
