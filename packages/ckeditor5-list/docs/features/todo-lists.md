---
menu-title: To-do lists
category: features-lists
order: 20
---

# To-do lists

The {@link module:list/todolist~TodoList to-do list} feature lets you create a list of interactive checkboxes with labels. It supports all features of regular lists so you can nest a to-do list together with {@link features/lists bulleted and numbered lists} in any combination.

To-do lists can be introduced using the dedicated toolbar button. Thanks to the integration with the {@link features/autoformat autoformatting feature}, they can also be added with Markdown code. Simply start a line with `[ ]` or `[x]` followed by a space to insert an unchecked or checked list item, respectively.

After reading this guide, you may find additional interesting details and examples in the [Lists in CKEditor 5](https://ckeditor.com/blog/Feature-of-the-month-Lists-in-CKEditor-5/) blog post.

## Demo

Use the Insert to-do list toolbar button {@icon @ckeditor/ckeditor5-list/theme/icons/todolist.svg Insert a to-do list} to add a list to the editor content.

{@snippet features/todo-list}

## Keyboard support

You can check and uncheck a list item by using the <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (<kbd>Cmd</kbd> + <kbd>Enter</kbd> on Mac) shortcut when the selection is in that item.

## Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```bash
npm install --save @ckeditor/ckeditor5-list
```

Then add the `TodoList` plugin to your plugin list and the toolbar configuration:

```js
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ TodoList, ... ],
		toolbar: [ 'todoList', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link installation/getting-started/installing-plugins installing plugins}.
</info-box>

## HTML structure

When you call {@link module:core/editor/utils/dataapimixin~DataApi#function-getData `editor.getData()`}, a to-do list will be represented as the following HTML:

```html
<ul class="todo-list">
	<li>
		<label class="todo-list__label">
			<input type="checkbox" disabled [checked] />
			<span class="todo-list__label__description">Foo</span>
		</label>
	</li>
</ul>
```

For nested lists:

```html
<ul class="todo-list">
	<li>
		<label class="todo-list__label">
			<input type="checkbox" disabled [checked] />
			<span class="todo-list__label__description">Foo</span>
		</label>
		<ul class="todo-list">
			<li>
				<label class="todo-list__label">
					<input type="checkbox" disabled [checked] />
					<span class="todo-list__label__description">Bar</span>
				</label>
			</li>
		</ul>
	</li>
</ul>
```

### Model representation

From the technical point of view, to-do lists are built on top of the {@link module:list/list~List list feature}. In the CKEditor 5 data model they are represented as a special `listType`, with an optional `todoListChecked` attribute:

```html
<listItem listType="todo">Foo</listItem>
```

```html
<listItem listType="todo" todoListChecked="true">Bar</listItem>
```

## Ordered and unordered lists

You can read more about these features in the {@link features/lists lists feature guide}.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list.
