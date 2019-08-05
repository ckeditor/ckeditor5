---
title: To-do list
category: features
---

The {@link module:list/todo-list~TodoList} feature let you create lists of interactive unordered lists of checkbooks with labels. They support all features of regular lists so you can nest to-do list together with bullet and numbered list.

## Demo

snippet

## Keyboard support

You can check/uncheck item using `ctrl` + `space` shortcut whenever the selection is in that item,

## Installation

<info-box info>
    The list package is installed as a dependency of all builds, so as long as you do not building your own, custom rich text editor, you do not need to install npm packages. However, to-do list feature is not included and you need to rebuild the editor with the custom configuration.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```bash
npm install --save @ckeditor/ckeditor5-list
```

Then add `TodoList` plugin to your plugin list and the toolbar configuration:

```js
import TodoList from '@ckeditor/ckeditor5-list/src/todo-list';

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

## Representation:

### In data:

```html
<ul class="todo-list">
  <li>
     <label class="todo-list__label [todo-list__label_checked]">
        <input class="todo-list__label__checkmark" type="checkbox" disabled checked />
        <span class="todo-list__label__description">Foo</span>  
     </label>
  </li>
</ul>
```

For nested lists:

```html
<ul class="todo-list">
  <li>
     <label class="todo-list__label [todo-list__label_checked]">
        <input class="todo-list__label__checkmark" type="checkbox" disabled checked />
        <span class="todo-list__label__description">Foo</span>  
     </label>
      <ul class="todo-list">
        <li>
           <label class="todo-list__label [todo-list__label_checked]">
              <input class="todo-list__label__checkmark" type="checkbox" disabled checked />
              <span class="todo-list__label__description">Bar</span>  
           </label>
        </li>
      </ul>
  </li>
</ul>
```
### In the model:

Todo lists will be define in model as a separate list type:

```html
<listItem listType="todo" todoListChecked="true">foo</listItem>
<listItem listType="todo">bar</listItem>
```

Note that, it does not prevent us from implementing "orderedTodo" type in the future if we will implement such lists. We will be also able to provide any UI on top of it if needed.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-list.
