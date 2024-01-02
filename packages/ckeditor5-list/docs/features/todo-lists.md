---
menu-title: To-do lists
meta-title: To-do lists | CKEditor 5 Documentation
category: features-lists
order: 20
---

# To-do lists

The to-do list feature lets you create a list of interactive checkboxes with labels. It supports all features of {@link features/lists bulleted and numbered lists}, so you can nest a to-do list together with any combination of other lists.

## Demo

Use the to-do list toolbar button {@icon @ckeditor/ckeditor5-core/theme/icons/todolist.svg To-do list} to add a list to the editor content.

{@snippet features/todo-list}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

You can add to-do lists using a dedicated toolbar button. Thanks to the integration with the {@link features/autoformat autoformatting feature}, they can also be added with Markdown code. Simply start a line with `[ ]` or `[x]` followed by a space to insert an unchecked or checked list item, respectively.

## Keyboard support

You can check and uncheck a list item by using the <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (<kbd>Cmd</kbd> + <kbd>Enter</kbd> on Mac) shortcut when the selection is in that item.

## Related features

These features provide similar functionality:
* {@link features/lists Ordered and unordered lists} &ndash; Create ordered and unordered lists with configurable markers.
* {@link features/autoformat Autoformatting} &ndash; Format the text on the go with Markdown code.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list).
