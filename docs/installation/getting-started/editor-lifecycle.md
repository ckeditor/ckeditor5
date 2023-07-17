---
category: getting-started
order: 60
---

# Editor's lifecycle and APIs

<info-box hint>
**Quick recap**

In the {@link installation/getting-started/configuration previous tutorial} you have explored available configuration options of the editor. This article shows the lifecycle methods used to interact with the editor as well as its basic APIs.

</info-box>

TODO link to hands on tutorial (done by Filip)

Each CKEditor 5 **type** provides a different **editor class** that handles the creation of editor instances. Most of the examples in the documentation use the {@link module:editor-classic/classiceditor~ClassicEditor `ClassicEditor`} class, but things should work similarly with other types.

## Creating an editor with `create()`

Regardless of the chosen type, creating an editor is done using the static `create()` method. Usually you start with an HTML element that will be a place where an editor will render itself on a page.

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

After the editor's creation you might want to interact with the editor's API. There are two ways of doing this, you can either interact with the top-level API through the editor's instance or write a plugin that will

### Accessing editor's instance

To use the top-level API, you need the access to the editor's instance. This is often done via the usage of a window or some state management object. In our docs you will see often lines like this:

```js
// ...editor's setup
.then((editor) => {
	window.editor = editor;
})
```

The second option is a creation of a simple functional plugin that will be added to the plugins list. The first argument of such function will be editor's instance.

```js
function myPlugin(editor) {
	// ... interact with the API.
}

ClassicEditor.create(document.querySelector("#editor"), {
	// If you're using builds, this is going to be extraPlugins property.
	plugins: [
		myPlugin,
		// ...Other plugins.
	],
});
```

This method allows writing simple plugins. The ones that will be executed during the initialization of the editor, and don't interact with other plugins.

The last option is a creation of a plugin that inherits from the Plugin class which will make it more convenient and powerful.

```js
class MyPlugin extends Plugin {
	init() {
		// `listenTo()` and `editor` are available thanks to `Plugin`.
		// By using `listenTo()` you will ensure that the listener is removed when
		// the plugin is destroyed.
		this.listenTo(this.editor.data, "ready", () => {
			// Do something when the data is ready.
		});
	}
}
```

TODO add a closing sentance and links to to followups

### Using the API

The API allows you to do multiple things with the editor and its content.

```js
// Move selection to the end of the document.
editor.model.change((writer) => {
	writer.setSelection(
		writer.createPositionAt(editor.model.document.getRoot(), "end")
	);
});

// Execute the enter command.
editor.execute("enter");

// Insert text.
editor.model.change((writer) => {
	editor.model.insertContent(writer.createText("The End!"));
});
```

In the example above you interact with the editor's model to set selection. You execute a command, and at the end you

TODO add more to examples to Examples and link to it.
TODO link to model, etc. explanations, etc. New tutorial or framework?

### Editor's events

An editor instance also allows setting up listeners to its event system. For example, the {@link module:engine/model/document~Document#event:change:data `Document#change:data`} event is fired when the document changes in such a way that is "visible" in the editor data:

```js
editor.model.document.on("change:data", () => {
	console.log("The data has changed!");
});
```

Almost every plugin in the editor publishes some events that you can subscribe to. Check more in the examples as well as in our framework docs.
TODO link to follow up or examples

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
