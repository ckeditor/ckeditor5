---
category: features
meta-title: Undo/Redo | CKEditor 5 Documentation
modified_at: 2022-08-29
---

# Undo/Redo

The undo feature lets you withdraw recent changes to your content as well as bring them back. You can also selectively revert past changes, not just the latest ones.

## Demo

Use the demo below to try out the undo and redo mechanism. Play around with the content. Try introducing some changes and then use the toolbar buttons to undo {@icon @ckeditor/ckeditor5-icons/theme/icons/undo.svg Undo} or redo {@icon @ckeditor/ckeditor5-icons/theme/icons/redo.svg Redo} them.

Alternatively, use the well-known keyboard shortcut <kbd>Ctrl</kbd> + <kbd>Z</kbd> (this would be <kbd>Cmd</kbd> + <kbd>Z</kbd> on Mac) for undo. For redo, you can use either <kbd>Ctrl</kbd> + <kbd>Y</kbd> or <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> (respectively with <kbd>Cmd</kbd> on Mac).

{@snippet features/undo-redo}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

All operations of the undo feature are remembered and organized into batches that can later be easily undone or redone. Thanks to this approach, the feature can selectively revert past changes, not just the latest ones. This allows handling asynchronous actions such as image uploads without blocking the user from editing the document in the meantime.

The selective undo is heavily used in {@link features/real-time-collaboration real-time collaboration} environments. In such a scenario, a specific user should only be able to revert their changes, while keeping the changes made by other users intact (unless there is an editing conflict). By omitting some changes and going down the stack, it is possible to only revert selected changes.

The feature supports both toolbar buttons and {@link features/accessibility#keyboard-shortcuts keyboard shortcuts} for convenient and easy operation.

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Undo } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Undo, /* ... */ ],
		toolbar: [ 'undo', 'redo', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

<info-box info>
	Read more about {@link getting-started/setup/configuration installing plugins} and {@link getting-started/setup/toolbar toolbar configuration}.
</info-box>

## Common API

The {@link module:undo/undo~Undo Undo} plugin is a "glue" plugin that loads the {@link module:undo/undoediting~UndoEditing} engine and the {@link module:undo/undoui~UndoUI} features.

The `UndoEditing` feature registers the following commands:

* The {@link module:undo/undocommand~UndoCommand} which can be programmatically called as `undo` and is used to retrieve editor history from a batch.

	```js
	editor.execute( 'undo');
	```

	You can use it to retrieve changes from the latest batch, or from some previous batch (for example, changes made by a selected user in a collaborative environment):

	```js
	editor.execute( 'undo', batchToUndo );
	```

* The {@link module:undo/redocommand~RedoCommand} is used to restore undo state from batch and is called as `redo`.

	```js
	editor.execute( 'redo');
	```


The {@link module:undo/undoui~UndoUI} feature introduces the `undo` and `redo` buttons to the editor toolbar.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-undo](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-undo).
