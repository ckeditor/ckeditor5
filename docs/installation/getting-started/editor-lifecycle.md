---
category: getting-started
order: 60
---

# Editor's lifecycle and APIs

<info-box hint>
**Quick recap**

In the {@link installation/getting-started/configuration previous tutorial} you have explored available configuration options of the editor. This article shows the lifecycle methods used to interact with the editor as well as its basic APIs.

</info-box>

Each CKEditor 5 **type** provides a different **editor class** that handles the creation of editor instances. Most of the examples in the documentation use the {@link module:editor-classic/classiceditor~ClassicEditor `ClassicEditor`} class, but things should work similarly with other types.

## Creating an editor with `create()`

Regardless of the chosen type, creating an editor is done using the static `create()` method. Usually, you start with an HTML element that will be a place where an editor will render itself on a page.

```html
<div id="editor">
	<p>Here goes the initial content of the editor.</p>
</div>
```

Then you call {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} to **replace** the `<div>` element with a {@link installation/getting-started/predefined-builds#classic-editor classic editor}:

```js
ClassicEditor.create(document.querySelector("#editor"))
	.then((editor) => {
		console.log(editor);
	})
	.catch((error) => {
		console.error(error);
	});
```

After creation the editor will appear on the page in the selected area.

<info-box tip>
Every editor class may accept different parameters in the `create()` method and may handle the initialization differently. For instance, the classic editor will **replace** the given element with an editor, while the inline editor will use the given element to initialize an editor on it. Decoupled document needs to initialize the toolbar separately from the editable area. See each editor's documentation to learn the details.
</info-box>

## Editor's API

After creating the editor, you might want to use the editor's API. But first, you need to the editor's instance.

### Acquiring the editor's instance

The simplest way would be to save the reference to the editor somewhere after you create it. This is often done by using a window or some state management object. You will often see lines like this in our docs.

```js
// Editor's creation steps.
// ...
.then((editor) => {
	window.editor = editor;
})
```

The second option is to make a simple function plugin that will be added to the plugins list. The first parameter of this function will be the editor's instance.

```js
function myPlugin(editor) {
	// Interact with the API.
	// ...
}

ClassicEditor.create(document.querySelector("#editor"), {
	// If you're using builds, this is going to be extraPlugins property.
	plugins: [
		myPlugin,
		// Other plugins.
		// ...
	],
});
```

This method allows writing simple plugins that will be executed during the initialization of the editor, and don't need to interact with other plugin schema's or UI.

The last option is to make a plugin that inherits from the Plugin class:

```js
class MyPlugin extends Plugin {
	init() {
		const editor = this.editor;
		// Interact with the API.
		// ...
	}
}

ClassicEditor.create(document.querySelector("#editor"), {
	// If you're using builds, this is going to be extraPlugins property.
	plugins: [
		MyPlugin,
		// Other plugins.
		// ...
	],
});
```

Plugins created in this way can do things after initialization (afterInit) as well as set up new editor UI components.
TODO links to plugin interface and framework.

### Using the API

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

In the example above, you use a selection, a command, and you change the editor's model. All of this could be reverted with one undo step. This is a simple example of what the API can do. To learn more, read the... or look at other API how-tos.

TODO add more to examples to Examples and link to it. and framwork.

### Editor's events

An editor instance can also be used to set up listeners for events. For example, the {@link module:engine/model/document~Document#event:change:data `Document#change:data`} event is fired when the document changes in such a way that is "visible" in the editor data:

```js
editor.model.document.on("change:data", () => {
	console.log("The data has changed!");
});
```

Every plugin in the editor publishes events that you can subscribe to and interact with. You can find more information in the examples and in our framework guidelines.
TODO add more to examples to Examples and link to it. and framwork.

## Destroying the editor with `destroy()`

In modern applications, it is common to create and remove elements from the page interactively through JavaScript. In such cases CKEditor 5 instances should be destroyed by using the `destroy()` method:

```js
editor.destroy().catch((error) => {
	console.log(error);
});
```

Once destroyed, resources used by the editor instance are released and the original element used to create the editor is automatically displayed and updated to reflect the final editor data.

<info-box hint>
**What's next?**

Now you know how to interact with the editor instance. But an editor without the ability to get its content is not particularly useful. It's time to learn how to work with the editor's data {@link installation/getting-started/getting-and-setting-data in the following tutorial}.
</info-box>
