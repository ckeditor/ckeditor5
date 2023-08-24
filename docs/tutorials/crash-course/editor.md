---
category: crash-course
order: 10
menu-title: Editor and configuration
meta-title: CKEditor 5 crash course - Editor and configuration | CKEditor 5 Documentation
meta-description: Learn how to use CKEditor 5 APIs to create a custom editor plugin.
modified_at: 2023-08-16
---

# Editor and configuration

## Test environment

For the purposes of this tutorial, we have created a repository with the minimal setup required to use the editor. To follow along:

1. Clone [this repository](https://github.com/ckeditor/tutorial-setup).
2. Run the `npm install` command to install the dependencies.
3. Run the `npm run dev` command to start the project.
4. Open the URL displayed in your terminal.

If everything went well, you should see a "Hello world!" text displayed on the page.

We encourage you to follow the steps in the tutorial and type the code yourself to build the muscle and mental memory.

## Creating an editor

The test environment you set up displays the "Hello world!" on the page. Let's learn the first editor method that replaces this element with the editor.

Open the `src/main.js` file and add the following code:

```js
// Import the editor
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

// Get the HTML element with the ID of 'app'.
const element = document.querySelector( '#app' );

// Instantiate the editor using the `create` method.
const editor = await ClassicEditor.create( element );
```

As you can see, the {@link module:core/editor/editor~Editor.create `create()`} method creates a new editor instance. It replaces the DOM element passed as the first argument with the editor UI, and sets the initial state of the editor to the content of that DOM element.

However, you may have noticed that the "Hello world!" text does not appear in the editor, and you can't write anything into it. This may seem strange at first, but it is by design. Let's fix this with the right configuration.

## Configuration

The editor itself does not do much - it's just an empty shell at this stage. What gives the editor almost all of its functionality are the plugins. We will talk more about plugins in the next chapter, but for now let's just install two plugins that provide the bare minimum needed to type in the editor.

```js
// Add these two imports.
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

// Update the call to the `create()` method.
const editor = await ClassicEditor.create( element, {
	plugins: [
		Essentials,
		Paragraph
	]
} );
```

As shown in the example above, the {@link module:core/editor/editor~Editor.create `create()`} method takes a configuration object as its second parameter. In this object, we can pass the `plugins` array with the plugins we want to use.

When the page refreshes, you should see the "Hello world!" text in the editor and be able to type in it.

The `Essentials` plugin adds the `Undo` and `Redo` operations. Let's add them to the editor's toolbar.

```js
const editor = await ClassicEditor.create( element, {
	plugins: [
		Essentials,
		Paragraph
	],

	// Add the toolbar configuration.
	toolbar: {
		items: [
			'undo',
			'redo'
		]
	}
} );
```

After refreshing the page, the editor should have two buttons at the top. If you type something into the editor and click the "back arrow" button, your changes should be removed. Clicking the "forward arrow" button should restore those changes.

The configuration object we just updated controls the features, appearance, and behavior of the editor. If you want to change any aspect of the editor, it's most likely through this object.

## Editor methods

Now that you can type in the editor, let's test other editor methods besides `create()`. Add the following to the bottom of the `src/main.js` file. It will allow us to access the editor instance globally for testing purposes.

```js
// Add the global `editor` variable (only needed for debugging).
window.editor = editor;
```

Four common methods we will test are:

* {@link module:core/editor/utils/dataapimixin~DataApi#getData `getData()`}
* {@link module:core/editor/utils/dataapimixin~DataApi#setData `setData()`}
* {@link module:core/editor/editor~Editor#execute `execute()`}
* {@link module:core/editor/editor~Editor#destroy `destroy()`}

### `getData()` and `setData()`

Open the page in your browser and open the console. Inside the console, run the following code:

```js
editor.getData();
```

It should print the text `<p>Hello world!</p>`, which is the current content of the editor. Note the opening and closing `<p>` tags. The`getData()` returns the resulting HTML content of the editor, not the content you see in the UI. This is explained in more detail in the following chapters of the tutorial.

You can also use the `setData()` method to change the content of the editor programmatically.

```js
editor.setData( '<p>Modified from the console!</p>' );
```

Running the above command should update the state of the editor. Note the opening and closing `<p>` tags. This method expects HTML as an argument, but the editor displays this content in a more user-friendly way.

### `execute()`

In the previous step of this tutorial, we used the Undo and Redo buttons to revert and restore our changes. Let's do the same thing from the console.

Before we do that, type something in the editor. Then run the following code from the console:

```js
editor.execute( 'undo' );
```

The editor should execute the `undo` command and restore the state to before your changes. Now run the `redo` command to restore those changes:

```js
editor.execute( 'redo' );
```

### `destroy()`

Last but not least is the `destroy()` method. It removes the editor and cleans up after it, including removing it from the DOM, removing all event listeners, etc.

Run the following command from a console:

```js
editor.destroy();
```

The editor and it's contents should disappear. Note that **this method returns a promise, so you need to `await` it** if you want to execute more logic after the editor is destroyed.

## What's next

In the next chapter you will {@link tutorials/crash-course/plugins learn more about plugins} and we will start creating a new one from scratch.
