---
category: features
modified_at: 2022-08-29
---

# Undo/Redo support

The undo features lets the user withdraw recent changes done to the editor content, as well as bring them back again. All operations are remembered and organized info batches, that can later be easily undone or redone.

The feature supports both {@link features/keyboard-support keyboard shortcuts} and toolbar buttons for convenient operation.

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

## Demo

Use the demo below to try out the undo and redo mechanism. Introduce some changes and then withdraw the with the toolbar buttons: {@icon @ckeditor/ckeditor5-undo/theme/icons/undo.svg Undo} and {@icon @ckeditor/ckeditor5-undo/theme/icons/redo.svg Redo}. Alternatively, utilize the popular  keyboard shortcuts: <kbd>Ctrl</kbd> + <kbd>Z</kbd> (it would be <kbd>Cmd</kbd> + <kbd>Z</kbd> on Mac) for undo and <kbd>Ctrl</kbd> + <kbd>Y</kbd> for redo.

{@snippet features/undo-redo}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Common API

The {@link module:undo/undo~Undo Undo} feature registers:

* The {@link module:undo/undoediting~UndoEditing} is a class that introduces the following commands:
	* The {@link module:undo/undocommand~UndoCommand} stores batches applied to the document and is able to undo a batch by reversing it and transforming.
	* The {@link module:undo/redocommand~RedoCommand} stores batches that were used to undo a batch by UndoCommand.
* The {@link module:undo/undoui~UndoUI} introduces the `undo` and `redo` buttons to the editor.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>
