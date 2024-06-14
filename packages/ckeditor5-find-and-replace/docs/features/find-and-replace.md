---
title: Find and replace
meta-title: Find and replace | CKEditor 5 Documentation
category: features
modified_at: 2024-01-03
---

{@snippet features/build-find-and-replace-source}

The find and replace feature lets you find and replace any text in your document. This speeds up your work and helps with the consistency of your content.

## Demo

Use the find and replace toolbar button {@icon @ckeditor/ckeditor5-find-and-replace/theme/icons/find-replace.svg Find and replace} to open the search dialog. Use it to find and replace words or phrases. You can also use the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>F</kbd> keyboard shortcut. Try replacing "AI" with "artificial intelligence" to make the content appeal to less tech-savvy users. Be careful to match the case!

{@snippet features/find-and-replace}

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
import { ClassicEditor, FindAndReplace } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ FindAndReplace, /* ... */ ],
		toolbar: [ 'findAndReplace', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Configuration

### Configuring the UI type

By default, the find and replace form displays inside a dialog. That allows for keeping it open while editing the document at the same time. Alternatively, you can display the feature in a dropdown. To do this, use the {@link module:find-and-replace/findandreplaceconfig~FindAndReplaceConfig `config.findAndReplace.uiType`} configuration option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		findAndReplace: {
			uiType: 'dropdown'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

{@snippet features/find-and-replace-dropdown}

## Related features

* {@link features/text-transformation Automatic text transformation} &ndash; Enables automatic turning of snippets such as `(tm)` into `™` and `"foo"` into `“foo”`.

<!-- TODO: Update this with proper description and values, and code snippet for replace / replaceAll -->
## Common API

The {@link module:find-and-replace/findandreplace~FindAndReplace} plugin registers the `'findAndReplace'` UI button component and the {@link module:find-and-replace/findcommand~FindCommand `'find'`}, {@link module:find-and-replace/findnextcommand~FindNextCommand `'findNext'`}, {@link module:find-and-replace/findpreviouscommand~FindPreviousCommand `'findPrevious'`}, {@link module:find-and-replace/replacecommand~ReplaceCommand `'replace'`} and {@link module:find-and-replace/replaceallcommand~ReplaceAllCommand `'replaceAll'`} commands.

You can execute the commands using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

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
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-find-and-replace](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-find-and-replace).
