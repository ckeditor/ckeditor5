---
category: getting-started
order: 80
---

# API and Events

CKEditor 5 and its plugins expose structured API and Events that are allowing to interact with an editor and to react to changes.

## Using the API

The API allows you to do multiple things with the editor and its content:

```js
editor.model.change((writer) => {
	// Move selection to the end of the document.
	writer.setSelection(
		writer.createPositionAt(editor.model.document.getRoot(), "end")
	);

	// Execute the enter command.
	editor.execute("enter");

	// Insert text.
	editor.model.change((writer) => {
		editor.model.insertContent(writer.createText("The End!"));
	});
});
```

In the example above, you use a selection, a command, and you change the content using the editor's model. All of this could be reverted with one undo step. This is a simple example of what the API can do.

Check more {@link examples/how-tos#editors-api examples}, {@link framework/architecture/core-editor-architecture CKEditor 5 core architecture} , and {@link api/index API reference}.

## Using events

An editor instance can also be used to set up listeners for events. For example, the {@link module:engine/model/document~Document#event:change:data `Document#change:data`} event is fired when the document changes in such a way that is "visible" in the editor data:

```js
editor.model.document.on("change:data", () => {
	console.log("The data has changed!");
});
```

Every plugin in the editor publishes events that you can subscribe to and interact with. You can find more information in {@link framework/architecture/core-editor-architecture#event-system-and-observables the framework documentation}
