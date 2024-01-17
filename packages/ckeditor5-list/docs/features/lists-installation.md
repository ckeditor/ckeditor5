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

## To-do lists installation

The `TodoList` plugin provides the {@link features/todo-lists to-do list feature} for CKEditor&nbsp;5.

<info-box info>
	The to-do list feature is enabled by default in the {@link installation/getting-started/predefined-builds#superbuild superbuild} only.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```bash
npm install --save @ckeditor/ckeditor5-list
```

Then add the `TodoList` plugin to your plugin list and the toolbar configuration:

```js
import { TodoList } from '@ckeditor/ckeditor5-list';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ TodoList, /* ... */ ],
		toolbar: [ 'todoList', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>
