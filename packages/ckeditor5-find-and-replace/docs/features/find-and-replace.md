---
title: Find and replace
category: features
modified_at: 2021-06-29
---

{@snippet features/build-find-and-replace-source}

The find and replace feature lets you find and replace any text in your document. This speeds up your work and helps with the consistency of your content.

## Demo

Use the find and replace toolbar button {@icon @ckeditor/ckeditor5-find-and-replace/theme/icons/find-replace.svg Find and replace} to invoke the search panel and find and replace desired words or phrases. You can also use the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>F</kbd> keyboard shortcut. Try replacing "steam" with "diesel" to make the content more up-to-date. Be careful to match the case!

{@snippet features/find-and-replace}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	The find and replace feature is enabled by default in the {@link installation/getting-started/predefined-builds#superbuild superbuild} only.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-find-and-replace`](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace) package:

```
npm install --save @ckeditor/ckeditor5-find-and-replace
```

Then add the `FindAndReplace` plugin to your plugin list:

```js
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ FindAndReplace, /* ... */ ],
		toolbar: [ 'findAndReplace', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Related features

* {@link features/text-transformation Automatic text transformation} &ndash; Enables automatic turning of snippets such as `(tm)` into `™` and `"foo"` into `“foo”`.

<!-- TODO: Update this with proper description and values, and code snippet for replace / replaceAll -->
## Common API

The {@link module:find-and-replace/findandreplace~FindAndReplace} plugin registers the `'findAndReplace'` UI button component and the {@link module:find-and-replace/findcommand~FindCommand `'find'`}, {@link module:find-and-replace/findnextcommand~FindNextCommand `'findNext'`}, {@link module:find-and-replace/findpreviouscommand~FindPreviousCommand `'findPrevious'`}, {@link module:find-and-replace/replacecommand~ReplaceCommand `'replace'`} and {@link module:find-and-replace/replaceallcommand~ReplaceAllCommand `'replaceAll'`} commands.

The commands can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Find all occurrences of a given text.
editor.execute( 'find', 'steam' );
```

You can also move the highlight through all matched results with the {@link module:find-and-replace/findnextcommand~FindNextCommand `'findNext'`} and {@link module:find-and-replace/findpreviouscommand~FindPreviousCommand `'findPrevious'`} commands:

```js
// Move the search highlight to the next match.
editor.execute( 'findNext' );
```

You can also replace all occurrences of a given text in the editor instance using the {@link module:find-and-replace/replaceallcommand~ReplaceAllCommand `'replaceAll'`} command:

```js
editor.execute( 'replaceAll', 'diesel', 'steam' );
```

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-find-and-replace](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-find-and-replace).
