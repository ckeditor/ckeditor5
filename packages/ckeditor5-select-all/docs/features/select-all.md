---
title: Select all
meta-title: Select all | CKEditor 5 Documentation
category: features
---

The select all feature lets you select the entire content using the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>A</kbd> keystroke or a toolbar button. This way you can clear or copy all the content in one move.

## Demo

Press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>A</kbd> or use the toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/select-all.svg Select all} to select the entire content of the editor.

<info-box>
	When the selection is inside the {@link features/images-captions image caption}, it will only expand to the boundaries of the caption. Use the keystroke or the toolbar button again to include more content until the entire content of the editor is selected. The same rule applies when the selection is inside a table cell or any self–contained (nested) editable part of the content.
</info-box>

{@snippet features/select-all}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, SelectAll } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ SelectAll, /* ... */ ],
		toolbar: [ 'selectAll', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

<info-box info>
	Read more about {@link getting-started/setup/configuration installing plugins} and {@link getting-started/setup/toolbar toolbar configuration}.
</info-box>

## Related features

* {@link features/accessibility#keyboard-shortcuts Keyboard shortcuts} &ndash; Check other popular keyboard shortcuts supported by CKEditor&nbsp;5.

## Common API

The {@link module:select-all/selectall~SelectAll} plugin registers the `'selectAll'` UI button component and the `'selectAll'` command implemented by {@link module:select-all/selectallcommand~SelectAllCommand}.

You can execute the command using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Select the entire content of the editor.
editor.execute( 'selectAll' );
```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-select-all](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-select-all).
