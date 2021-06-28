---
title: Find and replace
category: features
modified_at: 2021-06-07
---

{@snippet features/build-find-and-replace-source}

The {@link module:find-and-replace/findandreplace~FindAndReplace} feature allows for finding and replacing text in the editor easily. It helps the user find words, word parts or phrases matching the case of the searched text, which is especially helpful in lengthy documents and one that may utilize certain words in different contexts. It also lets the editor replace a chosen one or all instances of the searched phrase with a single click, making tedious, repeated changes fast and easy. This may e.g. help ensuring the cohesion of an edited piece of code, while renaming a variable or a function.

## Demo

Use the toolbar "Find and replace" button to find and replace parts of the text you'd wish to find, and/or replace. Or use the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>F</kbd> keyboard shortcut to invoke the search and replace panel. For a starter, try replacing "steam" with "diesel" to make the demo content more up to date. Be careful to match the case, for there are different instances of the word present in the document!

{@snippet features/find-and-replace}

## Related features

* No related features as of now.

## Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-find-and-replace`](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace) package:

```
npm install --save @ckeditor/ckeditor5-find-and-replace
```

Then add the `FindAndReplace` plugin to your plugin list:

```js
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ FindAndReplace, ... ],
		toolbar: [ 'findAndReplace', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

<!-- TODO: Update this with proper description and values, and code snippet for replace / replaceAll-->
## Common API

The {@link module:find-and-replace/findandreplace~FindAndReplace} plugin registers the `'findAndReplace'` UI button component and the `'find'`, `'replace'`, `'replaceAll'` commands implemented by {@link module:find-and-replace/findcommand~FindCommand}, {@link module:find-and-replace/replacecommand~ReplaceCommand}, {@link module:find-and-replace/replaceallcommand~ReplaceAllCommand}.

The commands can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Find some element
editor.execute( 'find', 'Cupcake' )
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-find-and-replace.
