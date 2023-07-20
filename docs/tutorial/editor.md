---
category: tutorial
order: 10
menu-title: Editor and configuration
meta-title: CKEditor 5 tutorial for new developers and integrators
meta-description: Learn how to use CKEditor 5 APIs to create a custom editor plugin.
---

# Editor and configuration

## Testing environment

For the purpose of this tutorial we created a repository with the minimal setup necessary to use the editor. To follow along:

1. [Clone this repository](https://github.com/ckeditor/tutorial-setup).
2. Run the `npm install` command to install the dependencies.
3. Run the `npm run dev` command to start the project.
4. Open the URL displayed in the terminal.

If everything went well, you should see a "Hello world!" text displayed on the page.

We encourage you to follow the steps in the tutorial and type the code yourself to build the muscle and mental memory.

## Creating an editor

The testing environment you setup displays the "Hello world!" on the page. Let's learn the first editor method that will replace this element with the editor.

Open the `src/main.js` file and add the following code:

```js
// Import the editor
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

// Get the HTML element with the ID of 'app'
const element = document.querySelector( '#app' );

// Instantiate the editor using the `create` method
const editor = await ClassicEditor.create( element );
```

As you can see, the {@link module:core/editor/editor~Editor.create `create()`} method creates a new editor instance. It replaces the DOM element passed as a first argument with the editor UI and sets the initial state of the editor to the content of that DOM element.

However you might have noticed that the "Hello world!" text didn't apprear in the editor and that you can't write enything into it. It might seem weird at first, but this is by design. Let's fix this with proper configuration.

## Configuration

The editor by itself doesn't do much — at this stage it's just an empty shell. What provides almost all functionality to the editor are the plugins. We'll get more into the plugins in the next chapter, but for now let's just install two plugins that provide the bare minimum needed to type in the editor.

```js
// Add these two imports
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

// Update the call to the `create()` method
const editor = await ClassicEditor.create( element, {
	plugins: [
		Essentials,
		Paragraph
	]
} );
```

As shown in the example above, the {@link module:core/editor/editor~Editor.create `create()`} method accepts configuration object as a second parameter. In this object, we can pass the `plugins` array with plugins we want to use.

When the page refreshes, you should see the "Hello world!" text in the editor and be able to type in it.

The `Essentials` plugin adds the `Undo` and `Redo` operations. Let's add them to the editor's toolbar.

```js
const editor = await ClassicEditor.create( element, {
	plugins: [
		Essentials,
		Paragraph
	],

	// Add the toolbar configuration
	toolbar: {
		items: [
			'undo',
			'redo'
		]
	}
} );
```

Refreshing the page again should add two buttons at the top of the editor. If you type anything into the editor and click the "back arrow" button, your changes should be removed. Clicking the "forward arrow" button should restore those changes.

The configuration object we just updated is what controls the features, look and behaviour of the editor. Once you'll want to change any aspect of the editor, it'll most likely happen through this object.

## Editor methods

Now that you can type inside the editor, let's test other editor methods besides `create()`. Add the following to the bottom of the `src/main.js` file. It'll allow us to access the editor instance globally for testing purposes.

```js
// Add the global `editor` variable (only needed for debugging)
window.editor = editor;
```

Four common methods we'll be testing are:

* {@link module:core/editor/utils/dataapimixin~DataApi#getData `getData()`}
* {@link module:core/editor/utils/dataapimixin~DataApi#setData `setData()`}
* {@link module:core/editor/editor~Editor#execute `execute()`}
* {@link module:core/editor/editor~Editor#destroy `destroy()`}

### `getData()` and `setData()`

Open the page in the browser and open the console. Inside the console run the following code:

```js
editor.getData();
```

It should print the `<p>Hello world!</p>` text which is the current content of the editor. Notice the opening and closing `<p>` tags. The `getData()` returns the resulting HTML content of the editor, not the content you see in the UI. This is explained in more detail in the following chapters of the tutorial.

You can also use the `setData()` method to change the content of the editor programmatically.

```js
editor.setData('<p>Modified from the console!</p>');
```

Running the above command should update the state of the editor. Notice the opening and closing `<p>` tags. This method expects a HTML as an argument, but editor displays this content in more user-friendly way.

### `execute()`

In the previous step of tutorial we used the "Undo" and "Redo" buttons to revert and restore our changes. Let's do the same from the console.

Before we can do that, type something in the editor. Then run the following code in the console:

```js
editor.execute('undo');
```

The editor should execute the `undo` command update to the state before your changes. Now run the `redo` command to restore those changes:

```js
editor.execute('redo');
```

### `destroy()`

Last but not least is the `destroy()` method. It removed the editor and cleans up after it, including removing it from the DOM, removing all event listeners, etc.

Run the following command in the console:

```js
editor.destroy();
```

Editor and it's content should disappear. Note that **this method returns a promise, so you must await it** if want to execute some more logic after the editor is destroyed.

## What's next

In the next chapter you'll {@link tutorial/plugins learn more about plugins} and we'll start creating a new one from scratch.
