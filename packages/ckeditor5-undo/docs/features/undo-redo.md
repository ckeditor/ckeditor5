---
category: features
modified_at: 2022-08-29
---

# Undo/Redo

The undo feature lets you withdraw recent changes to your content as well as bring them back. You can also selectively revert past changes, not just the latest ones.

## Demo

Use the demo below to try out the undo and redo mechanism. Play around the content, try to introduce some changes and then use the toolbar buttons to undo {@icon @ckeditor/ckeditor5-undo/theme/icons/undo.svg Undo} or redo {@icon @ckeditor/ckeditor5-undo/theme/icons/redo.svg Redo} these.

Alternatively, utilize the well-known keyboard shortcut <kbd>Ctrl</kbd> + <kbd>Z</kbd> (it would be <kbd>Cmd</kbd> + <kbd>Z</kbd> on Mac) for undo. For a redo you can use either <kbd>Ctrl</kbd> + <kbd>Y</kbd> or <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> (respectively with <kbd>Cmd</kbd> on Mac).

{@snippet features/undo-redo}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Additional feature information

All operations of the undo feature are remembered and organized into batches that can later be easily undone or redone. Thanks to this approach, the feature can selectively revert past changes, not just the latest ones. This allows handling asynchronous actions such as image uploads without blocking the user from editing the document in the meantime.

The selective undo is heavily used in {@link features/real-time-collaboration real-time collaboration} environments. In such a scenario, a specific user should only be able to revert their changes, while keeping the changes made by other users intact (unless there is an editing conflict). By omitting some changes and going down the stack, it is possible to only revert selected changes.

The feature supports both toolbar buttons and {@link features/keyboard-support keyboard shortcuts} for convenient and easy operation.

## Installation

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds} (loaded by the {@link module:essentials/essentials~Essentials} plugin). The installation instructions are for developers interested in building their own, custom rich text editor or willing to configure the toolbar button.
</info-box>

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-undo`](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo) package:

```
npm install --save @ckeditor/ckeditor5-undo
```

Then add the `Undo` plugin to your plugin list and to the toolbar:

```js
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Load the plugin.
		plugins: [ Undo, /* ... */ ],

		// Display the "Undo" and "Redo" buttons in the toolbar.
		toolbar: [ 'undo', 'redo', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins} and {@link features/toolbar toolbar configuration}.
</info-box>

## Common API

The {@link module:undo/undo~Undo Undo} plugin is a "glue" plugin that loads the {@link module:undo/undoediting~UndoEditing} engine and the {@link module:undo/undoui~UndoUI} features.

The `UndoEditing` feature registers the following commands:

* The {@link module:undo/undocommand~UndoCommand} which can be programmatically called as `undo` and is used to retrieve editor history from a batch.

	```js
	editor.execute( 'undo');
	```

	It can be used to retrieve changes from the latest batch, or from some previous batch (e.g. changes made by a selected user in a collaborative environment):

	```js
	editor.execute( 'undo', batchToUndo );
	```

* The {@link module:undo/redocommand~RedoCommand} is used to restore undo state from batch and is called as `redo`.

	```js
	editor.execute( 'redo');
	```


The {@link module:undo/undoui~UndoUI} feature introduces the `undo` and `redo` buttons to the editor toolbar.

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-undo](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-undo).
