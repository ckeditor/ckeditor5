---
title: Select all
category: features
---

{@snippet features/build-select-all-source}

The {@link module:select-all/selectall~SelectAll} feature allows selecting the entire content of the WYSIWYG editor using the <kbd>Ctrl/⌘</kbd>+<kbd>A</kbd> keystroke or the toolbar button.

## Demo

Press <kbd>Ctrl/⌘</kbd>+<kbd>A</kbd> or use the toolbar button to select the entire content of the editor.

{@snippet features/select-all}

<info-box>
	When the selection is inside the {@link features/image#image-captions image caption}, it will only expand to the boundaries of the caption. Use the keystroke or the toolbar button again to include more content until the entire content of the editor is selected. The same rule applies, for instance, when the selection is inside a table cell or any self–contained (nested) editable region in the content.
</info-box>

## Installation

<info-box info>
	This feature is enabled by default in all builds (loaded by the {@link module:essentials/essentials~Essentials} plugin). The installation instructions are for developers interested in building their own, custom rich text editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-select-all`](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all) package:

```
npm install --save @ckeditor/ckeditor5-select-all
```

Then add the `SelectAll` plugin to your plugin list:

```js
import SelectAll from '@ckeditor/ckeditor5-select-all/src/selectall';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Load the plugin.
		plugins: [ SelectAll, ... ],

		// Display the "Select all" button in the toolbar.
		toolbar: [ 'selectAll', ... ],
	} )
	.then( ... )
	.catch( ... );
```

## Common API

The {@link module:select-all/selectall~SelectAll} plugin registers the `'selectAll'` UI button component and the `'selectAll'` command implemented by {@link module:select-all/selectallcommand~SelectAllCommand}.

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Select the entire content of the editor.
editor.execute( 'selectAll' );
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-select-all.
