---
title: Find and replace
category: features
---

{@snippet features/build-select-all-source}

The {@link module:find-and-replace/findandreplace~FindAndReplace} feature allows for finding and replacing text in the editor easily.

## Demo

Use the toolbar "Find and replace" button to find and replace parts of the text you'd wish to find, and/or replace.

{@snippet features/find-and-replace}

<info-box>
	When the selection is inside the {@link features/image#image-captions image caption}, it will only expand to the boundaries of the caption. Use the keystroke or the toolbar button again to include more content until the entire content of the editor is selected. The same rule applies, for instance, when the selection is inside a table cell or any self–contained (nested) editable region in the content.
</info-box>

## Related features

* No related features as of now.

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-find-and-replace`](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace) package:

```
npm install --save @ckeditor/ckeditor5-find-and-replace
```

<!-- TODO: possibly this will needs to be updated -->
Then add the `FindAndReplace` plugin to your plugin list:

```js
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Load the plugin.
		plugins: [ FindAndReplace, ... ],

		// Display the "Find and Replace" button in the toolbar.
		toolbar: [ 'findAndReplace', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<!-- TODO: Update this with proper description and values -->
## Common API

The {@link module:find-and-replace/findandreplace~FindAndReplace} plugin registers the `'findAndReplace'` UI button component and the `'findNext'`, `'findPrev'`, `'replace'`, `'replaceAll'` commands implemented by {@link module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView}.

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Find next element
editor.execute( 'findNext', { searchText: data.searchText } );
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-find-and-replace.
