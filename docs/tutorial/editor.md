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

## The editor

The editors come in few flavors. While each of them visually looks very different, under the hook they're very similar.

Each editor consists of two parts:

* Editing engine,
* Editing UI.

In the next sections of this tutorial we'll learn more about both concepts, but at this moment all you need to know is that the **editing UI** is the interface that the user sees with buttons, dropdown, editing panel, etc. and the **editing engine** is responsible for reading, maintaning and outputting the editor's state and everything else that powers the editor under the hood.

## Creating an editor

The testing environment you setup earlier displays the "Hello world!" on the page. Let's learn the first editor method that will replace this element with the editor.

Open the `src/main.js` file and add the following code:

```js
// Import the editor
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

// Get the HTML element with the ID of 'app'
const element = document.querySelector( '#app' );

// Instantiate the editor using the `create` method
const editor = await ClassicEditor.create( element );

// Add the global `editor` variable (only needed for debugging)
window.editor = editor;
```

As you can see, the {@link module:core/editor/editor~Editor.create `create()`} method creates a new editor instance. It replaces the DOM element passed as a first argument with the editor UI and sets the initial state of the editor to the content of that DOM element.

However you might have noticed that the "Hello world!" text didn't apprear in the editor and that you can't write enything into it. It might seem weird at first, but this is by design. Let's fix this with proper configuration.

## Configuration

The editor by itself doesn't do much — it's just an empty shell. What provides almost all functionality to the editor are the plugins.

## Editor methods

Editors expose the following methods:

* `create()`,
* `destroy()`,
* `execute()`,
* `setData()` and `getData()`.
