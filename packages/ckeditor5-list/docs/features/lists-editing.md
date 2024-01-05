---
menu-title: Lists editing behavior
meta-title: Lists editing behavior | CKEditor 5 Documentation
category: features-lists
order: 30
modified_at: 2024-01-02
---

# Lists editing behavior

## Block lists

The current list feature lets any part of the content be part of a list. Content blocks and elements &ndash; such as images, tables, paragraphs, headings, and others &ndash; can be put inside a list item, ensuring the continuity of numbering and retaining indentation.

To edit a block inside a list item, press <kbd>Enter</kbd> to create a new line and then <kbd>Backspace</kbd> to remove the new list item marker. Keep on entering content. Observe this behavior in the screencast below.

{@img assets/img/adding-list-items.gif 860 Editing a block list item.}


## Simple lists

The simple list configuration option is a great solution for users who do not need to turn block elements into list items. When this setting is active, users can only insert text into list items and will not be able to nest content blocks &ndash; like paragraphs,  or tables &ndash; inside a list item. This would be handy for small editing areas and for content creation solutions that mostly need to work with less advanced documents.

Turning off the block list capabilities as shown below will make editing easier with limited capabilities and also affect some fields like keyboard shortcuts.

```js
import { List } from '@ckeditor/ckeditor5-list';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ List, /* ... */ ],
		toolbar: [ 'bulletedList', 'numberedList', /* ... */ ],
		list: {
		    multiBlock: false // Turn off the multi block support (enabled by default).
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Adjacent lists merging

By default, two lists of the same type (ordered and unordered) that are next to each other are merged together. This is done so that lists that visually appear to be one continuous list actually are, even if the user has accidentally created several of them.

Unfortunately, in some cases, this can be undesirable behavior. For example, two adjacent numbered lists, each with two items, will merge into a single list with the numbers 1 through 4.

To prevent this behavior, enable the `AdjacentListsSupport` plugin.

```js
import { AdjacentListsSupport } from '@ckeditor/ckeditor5-list';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			AdjacentListsSupport,
			/* Other plugins */
		],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Indenting lists

Besides controlling {@link features/indent text block indentation}, the indent {@icon @ckeditor/ckeditor5-core/theme/icons/indent.svg Indent} and outdent {@icon @ckeditor/ckeditor5-core/theme/icons/outdent.svg Outdent} buttons allow for indenting list items (nesting them).

This mechanism is completely transparent to the user. From the code perspective, the buttons are implemented by the {@link module:indent/indent~Indent} plugin, but neither these buttons nor the respective commands implement any functionality by default.

The target behavior comes from two other plugins:

* {@link module:indent/indentblock~IndentBlock} &ndash; The indent block feature controls the indentation of elements such as paragraphs and headings.
* {@link module:list/list~List} &ndash; The list feature implements the indentation (nesting) of lists.

This means that if you want to allow indenting lists only, you can do that by loading just the `Indent` and `List` plugins.<!-- If you want the full behavior, you need to load all 3 plugins (`Indent`, `IndentBlock`, and `List`). -->
