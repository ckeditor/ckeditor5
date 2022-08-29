---
category: features
modified_at: 2022-08-29
---

# Undo/Redo support


<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

## Demo

Use the demo below to toggle between editing modes and test the feature. Some features, like exports or search, are still functional even in the read-only mode. While the search is available, the replace function, however, is disabled, as changing the content is blocked.

{@snippet features/undo-redo}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Common API

The {@link module:undo/undo~Undo Undo} feature registers:

* The {@link module:undo/undocommand~UndoCommand} stores batches applied to the document and is able to undo a batch by reversing it and transforming.
* The {@link module:undo/redocommand~RedoCommand} stores batches that were used to undo a batch by UndoCommand.
* The {@link module:undo/undoui~UndoUI} introduces the `undo` and `redo` buttons to the editor.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

