---
menu-title: Lists editing behavior
meta-title: Lists editing behavior | CKEditor 5 Documentation
category: features-lists
order: 40
modified_at: 2024-04-01
---

# Lists editing behavior

This article describes the functionality and behaviors of lists in CKEditor&nbsp;5.

## Block lists

Since version 41.0.0, the list feature allows any part of the content to be part of a list. You can put content blocks and elements &ndash; such as images, tables, paragraphs, headings, and others &ndash; inside a list item, ensuring the continuity of numbering and retaining indentation.

To edit a block inside a list item, press <kbd>Enter</kbd> to create a new line and then <kbd>Backspace</kbd> to remove the new list item marker. Keep on entering content. Observe this behavior in the screencast below.

{@img assets/img/adding-list-items.gif 860 Editing a block list item.}

## Managing lists with keyboard

Press <kbd>Enter</kbd> to create a new list item. Press <kbd>Tab</kbd> to nest the item (in multi-level lists) or indent it (in regular lists). Press <kbd>Enter</kbd> to turn an item into a higher level in the list or to remove it completely.

{@img assets/img/adding-multi-list-items.gif 836 Editing a multi-level list item.}

## Simple lists

When working with simple content or in small editing areas, you might not need the support for multi-block lists. You can use the {@link module:list/listconfig~ListConfig#multiBlock `config.list.multiBlock`} configuration setting to turn off the block list functionality. When you set this option to `false`, users can only insert text into list items. They will not be able to nest content blocks &ndash; like paragraphs or tables &ndash; inside a list item. We sometimes refer to this setup as "simple lists."

<code-switcher>
```js
import { ClassicEditor, List } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ List, /* ... */ ],
		toolbar: [ 'bulletedList', 'numberedList', /* ... */ ],
		list: {
			multiBlock: false // Turn off the multi-block support (enabled by default).
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Merging adjacent lists

By default, the editor merges two ordered and unordered lists of the same type that are next to each other. This happens to preserve the user intention. Lists that visually appear to be one continuous list should constitute one list even if the user has accidentally created several of them.

Sometimes this can be an undesirable behavior. For example, two adjacent numbered lists, each with two items, will merge into a single list with the numbers 1 through 4.

To prevent this behavior, enable the {@link module:list/list/adjacentlistssupport~AdjacentListsSupport `AdjacentListsSupport`} plugin.

<code-switcher>
```js
import { ClassicEditor, List, AdjacentListsSupport } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ List, AdjacentListsSupport, /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

This feature only works for pasted contents or on data load, it {@link updating/update-to-41#changes-to-list-merging does not support entering adjacent lists via the editor UI}. If you are interested in this functionality, refer to [this issue on GitHub](https://github.com/ckeditor/ckeditor5/issues/14478).

## Indenting lists

Besides controlling {@link features/indent text block indentation}, the indent {@icon @ckeditor/ckeditor5-icons/theme/icons/indent.svg Indent} and outdent {@icon @ckeditor/ckeditor5-icons/theme/icons/outdent.svg Outdent} buttons allow for indenting list items (nesting them).

This mechanism is transparent to the user. From the code perspective, the buttons are implemented by the {@link module:indent/indent~Indent} plugin. Neither these buttons nor the respective commands implement any functionality by default.

The target behavior comes from two other plugins:

* {@link module:indent/indentblock~IndentBlock} &ndash; The indent block feature controls the indentation of elements such as paragraphs and headings.
* {@link module:list/list~List} &ndash; The list feature implements the indentation (nesting) of lists.

This means that if you want to allow indenting lists only, you can do that by loading just the `Indent` and `List` plugins.<!-- If you want the full behavior, you need to load all 3 plugins (`Indent`, `IndentBlock`, and `List`). -->
