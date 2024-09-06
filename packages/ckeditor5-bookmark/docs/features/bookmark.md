---
category: features
menu-title: Bookmark
meta-title: Bookmark | CKEditor 5 Documentation
---

# Bookmark



## Demo

Use the bookmark toolbar button {@icon @ckeditor/ckeditor5-core/theme/icons/bookmark.svg Add bookmark} in the editor below to see the feature in action.

{@snippet features/bookmark}

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


## Related features

Here are some other CKEditor&nbsp;5 features that you can use similarly to the bookmark plugin to structure your text better:

* TODO

## Common API

The {@link module:bookmark/bookmark~Bookmark} plugin registers:

* TODO

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-block-quote](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-block-quote).
