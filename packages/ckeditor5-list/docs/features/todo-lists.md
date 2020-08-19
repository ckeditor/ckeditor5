---
category: features
---

# To-do lists

The {@link module:list/todolist~TodoList to-do list} feature lets you create a list of interactive checkboxes with labels. It supports all features of regular lists so you can nest a to-do list together with bulleted and numbered lists in any combination.

## Demo

{@snippet features/todo-list}

## Keyboard support

You can check and uncheck a list item by using the <kbd>Ctrl</kbd> + <kbd>Space</kbd> shortcut when the selection is in that item.

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
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
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

You can read more about those features in the {@link features/lists Lists} feature guide.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list.
