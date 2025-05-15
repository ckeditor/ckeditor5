---
category: features
menu-title: Bookmarks
meta-title: Bookmarks | CKEditor 5 Documentation
meta-description: The bookmarks feature allows for adding and managing bookmark anchors attached to the content.
modified_at: 2025-04-07
---

# Bookmarks

The bookmarks feature allows for adding and managing the bookmarks anchors attached to the content of the editor. These provide fast access to important content sections, speed up the editing navigation and contribute to a more efficient content creation.

## Demo

Use the bookmark toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/bookmark.svg Add bookmark} in the editor below to see the feature in action. Or use the "Insert" command from the menu bar to add a bookmark. Add a unique name to identify the bookmark (for example, `Rights`). You can change the bookmark's name or remove it by clicking the bookmark icon inside the content.

To use the bookmark as an anchor in the content, add a link {@icon @ckeditor/ckeditor5-icons/theme/icons/link.svg Add link} and put the bookmark name as target. In the example below it could be `#Rights`. The link insertion panel will display all bookmarks available in the edited content (see the [Integration with the link feature](#integration-with-the-link-feature) section below). 

{@snippet features/bookmark}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Handling the anchor markup

Do not worry about setting a bookmark inside an empty paragraph. The block with the `a` tag will not be rendered in the final content (for example for printing).

The feature converts anchors into bookmarks during the {@link getting-started/setup/getting-and-setting-data#initializing-the-editor-with-data initialization of the editor} or while {@link getting-started/setup/getting-and-setting-data#replacing-the-editor-data-with-setdata replacing the editor data with `setData()`}. The notation based on the `id` attribute in an `a` HTML element without a `href` attribute is converted. Similar notations meet the conditions, too:

* an `a` HTML element with a `name` attribute,
* an `a` HTML element with the same `name` and `id` attributes,
* an `a` HTML element with different `name` and `id` attributes.

By default, all bookmarks created in the editor only have the `id="..."` attribute in the {@link getting-started/setup/getting-and-setting-data#getting-the-editor-data-with-getdata editor data}.

## Integration with the link feature

Bookmarks integrate with {@link features/link links}, providing a smooth linking experience. If you have any bookmarks in your content, you can access the "Bookmarks" panel available during link creation. It will display all bookmarks available in the edited content. Choose one of the anchors from the list and use it as a link target.

{@img assets/img/bookmarks-panel.png 600 The bookmarks panel displayed during link creation}

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Bookmark } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Bookmark, /* ... */ ],
		toolbar: [ 'bookmark', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

By default, the conversion of wrapped anchors is turned on. It allows to convert non-empty anchor elements into bookmarks. For example:

```html
<a id="foo">Foo bar baz</a>
```

will be converted into a bookmark and the output will look like on the example below:

```html
<a id="foo"></a>Foo bar baz
```

You can disable the automatic conversion by setting the {@link module:bookmark/bookmarkconfig~BookmarkConfig#enableNonEmptyAnchorConversion `config.bookmark.enableNonEmptyAnchorConversion`} to `false` in the editor configuration.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		bookmark: {
			enableNonEmptyAnchorConversion: false
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Bookmark toolbar configuration

The bookmark UI contains a contextual toolbar that appears when a bookmark is selected. You can configure what items appear in this toolbar using the {@link module:bookmark/bookmarkconfig~BookmarkConfig#toolbar `config.bookmark.toolbar`} option.

The following toolbar items are available:

* `'bookmarkPreview'` &ndash; Shows the name of the bookmark.
* `'editBookmark'` &ndash; Opens a form to edit the bookmark name.
* `'removeBookmark'` &ndash; Removes the bookmark.

By default, the bookmark toolbar is configured as follows:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		bookmark: {
			toolbar: [ 'bookmarkPreview', '|', 'editBookmark', 'removeBookmark' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Custom toolbar items

You can extend the bookmark toolbar with custom items by registering them in the {@link module:ui/componentfactory~ComponentFactory component factory} and adding them to the toolbar configuration.

Here is an example of registering a custom component:

```js
class MyCustomPlugin extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'myCustomBookmarkInfo', locale => {
			const button = new ButtonView( locale );
			const bookmarkCommand = editor.commands.get( 'insertBookmark' );

			button.bind( 'isEnabled' ).to( bookmarkCommand, 'value', href => !!href );
			button.bind( 'label' ).to( bookmarkCommand, 'value' );

			button.on( 'execute', () => {
				// Add your custom component logic here
			} );

			return button;
		} );
	}
}
```

Once registered, the component can be used in the toolbar configuration:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ MyCustomPlugin, /* ... */ ],
		bookmark: {
			toolbar: [ 'myCustomBookmarkInfo', '|', 'editBookmark', 'removeBookmark' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Bookmarks on blocks

At this time, if a bookmark is attached to a block, it appears before it. However, we plan to expand this solution in the future. We invite you to help us [gather feedback for linking directly to blocks and auto generating IDs](https://github.com/ckeditor/ckeditor5/issues/17264).

## Related features

Here are some other CKEditor&nbsp;5 features that you can use similarly to the bookmark plugin to cross-link and structure your text better:

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
