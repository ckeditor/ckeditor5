---
menu-title: Installation
meta-title: Lists installation | CKEditor 5 Documentation
category: features-lists
order: 40
modified_at: 2024-01-02
---

# Installation

List functionality in CKEditor&nbsp;5 is provided by several plugins. This article explains how to install them.

## Ordered and unordered lists installation

The `List` plugin provides the {@link features/lists ordered (numbered) and unordered (bulleted) features} for CKEditor&nbsp;5. {@link features/lists#list-properties Additional list properties}, such as list marker styles, start index, or reversed list order, are provided by the `ListProperties` plugin.

### List feature

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

```js
import { ClassicEditor, List } from 'ckeditor5';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ List, /* ... */ ],
	toolbar: [ 'bulletedList', 'numberedList', /* ... */ ]
} )
.then( /* ... */ );
```

### List properties

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration.

To enable selected sub-features of the list properties, add their configuration to your editor. Set `true` for each feature you want to enable:

```js
import { ClassicEditor, List, ListProperties } from 'ckeditor5';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ List, ListProperties, /* ... */ ],
	toolbar: [ 'bulletedList', 'numberedList', /* ... */ ],
	list: {
		properties: {
			styles: true,
			startIndex: true,
			reversed: true
		}
	}
} )
.then( /* ... */ );
```

<info-box info>
	Read more about {@link getting-started/setup/installing-plugins installing plugins}.
</info-box>

<info-box warning>
	The {@link module:list/listproperties~ListProperties} feature overrides UI button implementations from the {@link module:list/list/listui~ListUI}.
</info-box>

## To-do lists installation

The `TodoList` plugin provides the {@link features/todo-lists to-do list feature} for CKEditor&nbsp;5.

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

```js
import { ClassicEditor, TodoList } from '@ckeditor/ckeditor5-list';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ TodoList, /* ... */ ],
	toolbar: [ 'todoList', /* ... */ ],
} )
.then( /* ... */ );
```

<info-box info>
	Read more about {@link getting-started/setup/installing-plugins installing plugins}.
</info-box>
