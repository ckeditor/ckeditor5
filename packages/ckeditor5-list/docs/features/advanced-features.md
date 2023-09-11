---
menu-title: Advanced lists features
meta-title: Advanced lists features | CKEditor 5 Documentation
category: features-lists
order: 30
modified_at: 2023-09-08
---

# Advanced lists features

## Simple lists

## Block lists

## Adjacent lists

## List indentation

Refer to the {@link features/indent#indenting-lists Indenting lists} section of the Block indentation feature guide.

## List merging

By default, two lists of the same type (ordered and unordered) that are next to each other are merged together. This is done so that lists that visually appear to be one continuous list actually are, even if the user has accidentally created several of them.

Unfortunately, in some cases this can be undesirable behavior. For example, two adjacent numbered lists, each with two items, will merge into a single list with the numbers 1 through 4.

To prevent this behavior, enable the `AdjacentListsSupport` plugin.

```js
import AdjacentListsSupport from '@ckeditor/ckeditor5-list/src/documentlist/adjacentlistssupport.js';

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