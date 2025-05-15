---
category: installation-methods
menu-title: (Legacy) API and events
meta-title: API and events | Legacy CKEditor 5 documentation
order: 80
---

# (Legacy) API and events

<info-box warning>
	 ⚠️ We changed installation methods and this legacy guide is kept for users' convenience. If you want to learn more about these changes, please refer to the {@link updating/nim-migration/migration-to-new-installation-methods Migrating to new installation methods} guide.
</info-box>

CKEditor 5 API allows developers to interact with the editor and its plugins to create new behaviors. Through the event system, you can tailor reactions to specific actions that are happening.

## Using the API

The API allows you to do multiple things with the editor and its content:

```js
editor.model.change( writer => {
	// Move selection to the end of the document.
	writer.setSelection(
		writer.createPositionAt( editor.model.document.getRoot(), 'end' )
	);

	// Execute the enter command.
	editor.execute( 'enter' );

	// Insert text.
	editor.model.change( writer => {
		editor.model.insertContent( writer.createText( 'The End!' ) );
	} );
} );
```

In the example above, you use a selection and a command, and you change the content using the editor's model. All of this could be reverted with one undo step. This is a simple example of what the API can do.

Check more {@link framework/how-tos#editors-api examples how to use the API} or deep dive into our {@link tutorials/crash-course/editor step-by-step tutorial}.

## Using events

The editor's instance can also be used to set up listeners for events. Every plugin in the editor publishes events that you can subscribe to and interact with. For example, the {@link module:engine/model/document~Document#event:change:data `Document#change:data`} event is fired when the document changes in such a way that is "visible" in the editor data:

```js
editor.model.document.on( 'change:data', () => {
	console.log( 'The data has changed!' );
} );
```

Events could be used to alter the behavior of the editor. Imagine a user wants to swap the <kbd>Enter</kbd> keystroke with the <kbd>Shift</kbd> + <kbd>Enter</kbd> combination, so <kbd>Shift</kbd> + <kbd>Enter</kbd> will insert a new block, while <kbd>Enter</kbd> will insert a `<br>`.

```js
editor.editing.view.document.on( 'enter', ( evt, data ) => {
	data.preventDefault();
	evt.stop();

	if ( data.isSoft ) {
			editor.execute( 'enter' );
			editor.editing.view.scrollToTheSelection();

			return;
	}

	editor.execute( 'shiftEnter' );
	editor.editing.view.scrollToTheSelection();
}, { priority: 'high' } );
```

You can find more information about events in {@link framework/architecture/core-editor-architecture#event-system-and-observables the framework documentation}.
