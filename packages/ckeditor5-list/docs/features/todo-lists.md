---
menu-title: To-do lists
meta-title: To-do lists | CKEditor 5 Documentation
category: features-lists
order: 20
---

# To-do lists

The to-do list feature lets you create a list of interactive checkboxes with labels. It supports all features of {@link features/lists bulleted and numbered lists}, so you can nest a to-do list together with any combination of other lists.

## Demo

Use the to-do list toolbar button {@icon @ckeditor/ckeditor5-core/theme/icons/todolist.svg To-do list} to add a list to the editor content. Thanks to the integration with the {@link features/autoformat autoformatting feature}, you can also start a line with `[ ]` or `[x]` followed by a space to insert an unchecked or checked list item.

{@snippet features/todo-list}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Keyboard support

You can check and clear a list item by using the <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (<kbd>Cmd</kbd> + <kbd>Enter</kbd> on Mac) shortcut when the selection is in that item.

## Related features

These CKEditor&nbsp;5 features provide similar functionality:
* {@link features/lists Ordered and unordered lists} &ndash; Create ordered and unordered lists with configurable markers.
* {@link features/autoformat Autoformatting} &ndash; Format the text on the go with Markdown code.

## Common API

The {@link module:list/todolist~TodoList} plugin registers:

* The {@link module:list/list/listcommand~ListCommand `'todoList'`} command.
* The {@link module:list/todolist/checktodolistcommand~CheckTodoListCommand `'checkTodoList'`} command.
* The `'todoList'` UI button.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list).
