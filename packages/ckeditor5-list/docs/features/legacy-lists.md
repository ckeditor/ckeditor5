---
menu-title: Legacy lists plugin
meta-title: Legacy lists plugin | CKEditor 5 Documentation
category: features-lists
order: 50
modified_at: 2023-09-08
---

# Legacy lists plugin

The main difference between the regular and legacy lists, is that the legacy lists plugin does not support block elements inside list items.

{@snippet features/lists-source}


## Demo <!-- UPDATE -->

Use the editor below to see the list feature in action. You can use toolbar buttons to insert ordered {@icon @ckeditor/ckeditor5-list/theme/icons/numberedlist.svg Insert ordered list} and unordered lists {@icon @ckeditor/ckeditor5-list/theme/icons/bulletedlist.svg Insert unordered list} and add a to-do list {@icon @ckeditor/ckeditor5-list/theme/icons/todolist.svg To-do list} to the editor content.

{@snippet features/lists-basic}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Ordered and unordered lists

<info-box info>
	There are currently two plugins providing list support for CKEditor&nbsp;5: the regular {@link features/lists lists feature} and this {@link features/lists legacy lists feature}.
</info-box>

The list feature lets you create ordered (numbered) and unordered (bulleted) lists. You can use ordered lists where the order of the items matters (as in instructions) and unordered lists where it is not that important (as in a list of ingredients).

After reading this guide, check out the [Lists in CKEditor&nbsp;5](https://ckeditor.com/blog/Feature-of-the-month-Lists-in-CKEditor-5/) blog post where you will find more information about lists with examples.

## List properties

Legacy lists offer additional formatting tools, just like regular lists. The list style feature introduces some more styles for the list item markers. When enabled, it adds 3 styles for unordered lists and 6 styles for ordered lists to choose from. The user will be able to set or change the list style via the dropdown that opens when you click the arrow next to the appropriate list button in the toolbar.

## To-do lists

The to-do list feature lets you create a list of interactive checkboxes with labels. It supports all features of {@link features/lists bulleted and numbered lists}, so you can nest a to-do list together with any combination of other lists.

### Additional feature information

You can add to-do lists using a dedicated toolbar button. Thanks to the integration with the {@link features/autoformat autoformatting feature}, they can also be added with Markdown code. Simply start a line with `[ ]` or `[x]` followed by a space to insert an unchecked or checked list item, respectively.

After reading this guide, you may find additional interesting details and examples in the [Lists in CKEditor&nbsp;5](https://ckeditor.com/blog/Feature-of-the-month-Lists-in-CKEditor-5/) blog post.

### Keyboard support

You can check and uncheck a list item by using the <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (<kbd>Cmd</kbd> + <kbd>Enter</kbd> on Mac) shortcut when the selection is in that item.

### HTML structure

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

#### Model representation

From the technical point of view, to-do lists are built on top of the {@link module:list/list~List list feature}. In the CKEditor&nbsp;5 data model they are represented as a special `listType`, with an optional `todoListChecked` attribute:

```html
<listItem listType="todo">Foo</listItem>
```

```html
<listItem listType="todo" todoListChecked="true">Bar</listItem>
```


### List indentation

Refer to the {@link features/indent#indenting-lists Indenting lists} section of the Block indentation feature guide.

## Installation <!-- UPDATE WITH TO-DOs -->

<info-box>
	The legacy lists feature is not enabled in any of the {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

### List feature 

To add this feature to your editor, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```bash
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

#### List properties

To enable the list properties feature, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```
npm install --save @ckeditor/ckeditor5-list
```

Then add the `ListProperties` plugin to your plugin list and configure the toolbar. To enable selected sub-features of the list properties, you need to add their configuration to your editor (set `true` for each feature you want to enable):

```js
import { ListProperties } from '@ckeditor/ckeditor5-list';

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
