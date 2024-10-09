---
category: features
menu-title: Bookmark
meta-title: Bookmark | CKEditor 5 Documentation
modified_at: 2024-10-08
---

# Bookmark

The bookmarks feature allows to add and manage the bookmarks attached to the content of editor. These provide fast access to important content sections, speed up the editing and contribute to a more efficient content creation.

## Demo

Use the bookmark toolbar button {@icon @ckeditor/ckeditor5-bookmark/theme/icons/bookmark.svg Add bookmark} in the editor below to see the feature in action. Or use the "Insert" command from the menu bar to add a bookmark. Add a unique name to identify the bookmark (for example, `Rights`). To use the bookmark as an anchor in the content, add a link {@icon @ckeditor/ckeditor5-link/theme/icons/link.svg Add link} and put the bookmark name as target. In this example it would be `#Rights`.

{@snippet features/bookmark}

<!-- We may decide to move this part above the demo, but I think it's OK here -->

You can change the bookmark's name or remove it by clicking the bookmark icon inside the content. A contextual bookmark panel will pop up.

Do not worry about setting a bookmark inside an empty paragraph. The block with the `a` tag will not be rendered in the final content (for example for printing).

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

```js
import { ClassicEditor, Bookmark } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Bookmark, /* ... */ ],
		toolbar: [ 'bookmark', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Configuration

By default the conversion of wrapped anchors is turned on. It allows to convert into bookmarks non-empty anchor elements:

```html
<a id="foo">Foo bar baz</a>
```

will be converted into bookmark and the output will look like on below example:

```html
<a id="foo"></a>Foo bar baz
```

You can disable it by setting the {@link module:bookmark/bookmarkconfig~BookmarkConfig#enableNonEmptyAnchorConversion `config.bookmark.enableNonEmptyAnchorConversion`} to `false` in editor config.

```js
import { ClassicEditor, Bookmark } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Bookmark, /* ... */ ],
		toolbar: [ 'bookmark', /* ... */ ],
		bookmark: {
			enableNonEmptyAnchorConversion: false
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Related features

Here are some other CKEditor&nbsp;5 features that you can use similarly to the bookmark plugin to crosslink and structure your text better:

* The {@link features/link link feature} allows adding local and global URLs to the content.
* The {@link features/document-outline document outline} displays the list of sections (headings) of the document next to the editor.
* The {@link features/document-outline table of contents} lets you insert a widget with a list of headings (section titles) that reflects the structure of the document.

## Common API

The {@link module:bookmark/bookmark~Bookmark} plugin registers the `'bookmark'` UI button component implemented by the {@link module:bookmark/bookmarkui~BookmarkUI bookmark UI feature}, and the following commands:
* the `'insertBookmark'` command implemented by the {@link module:bookmark/insertbookmarkcommand~InsertBookmarkCommand editing feature}.
* the `'updateBookmark'` command implemented by the {@link module:bookmark/updatebookmarkcommand~UpdateBookmarkCommand editing feature}.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-bookmark](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-bookmark).
