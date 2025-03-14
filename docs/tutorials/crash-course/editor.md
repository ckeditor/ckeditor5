---
category: crash-course
order: 10
menu-title: Editor and configuration
meta-title: CKEditor 5 crash course - Editor and configuration | CKEditor 5 Documentation
meta-description: Learn how to use CKEditor 5 APIs to create a custom editor plugin.
modified_at: 2025-03-14
---

# Editor and configuration

## Test environment

For this tutorial, we have created a minimal setup required to use the editor. To follow along, run the commands below:

```bash
npx -y degit ckeditor/ckeditor5-tutorials-examples/crash-course crash-course
cd crash-course

npm install
npm run dev
```

Open the URL displayed in your terminal. If everything went well, you should see a "Hello world!" text displayed on the page.

We encourage you to follow the steps in the tutorial and type the code yourself to build the muscle and mental memory.

<info-box>
	If you want to use this tutorial with CDN, follow the steps in the [Adapt this tutorial to CDN](#adapt-this-tutorial-to-cdn) section.
</info-box>

## Creating an editor

The test environment you set up displays the "Hello world!" on the page. Let's learn the first editor method that replaces this element with the editor.

Open the `src/main.js` file and add the following code:

```js
// Import the editor.
import { ClassicEditor } from 'ckeditor5';

// Import the styles.
import 'ckeditor5/ckeditor5.css';

// Get the HTML element with the ID of 'app'.
const element = document.querySelector( '#app' );

// Instantiate the editor using the `create` method.
const editor = await ClassicEditor.create( element, {
	licenseKey: 'GPL' // Or '<YOUR_LICENSE_KEY>'.
} );
```

As you can see, the {@link module:core/editor/editor~Editor.create `create()`} method creates a new editor instance. It replaces the DOM element passed as the first argument with the editor UI, and sets the initial state of the editor to the content of that DOM element.

However, you may have noticed that the "Hello world!" text does not appear in the editor, and you cannot write anything in it. This may seem strange at first, but it is by design. Let's fix this with the right configuration.

## Configuration

The editor itself does not do much - it is just an empty shell at this stage. What gives the editor almost all of its functionality are the plugins. We will talk more about plugins in the next chapter, but for now, let's just install two plugins that provide the bare minimum needed to type in the editor.

```js
// Import plugins by adding them to the previously added import.
import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';

// Update the call to the `create()` method.
const editor = await ClassicEditor.create( element, {
	licenseKey: 'GPL', // Or '<YOUR_LICENSE_KEY>'.
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
	licenseKey: 'GPL', // Or '<YOUR_LICENSE_KEY>'.
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

The configuration object we have just updated controls the features, appearance, and behavior of the editor. If you want to change any aspect of the editor, it is most likely through this object.

The `licenseKey` option is needed for the editor to run. You can learn more about it in the {@link getting-started/licensing/license-key-and-activation License key and activation} guide.

## Editor methods

Now that you can type in the editor, let's test other editor methods besides `create()`. Add the following to the bottom of the `src/main.js` file. It will allow us to access the editor instance globally for testing purposes.

```js
// Add the global `editor` variable (only needed for debugging).
window.editor = editor;
```

Four common methods we will test are:

* {@link module:core/editor/editor~Editor#getData `getData()`}
* {@link module:core/editor/editor~Editor#setData `setData()`}
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

The `destroy()` method removes the editor and cleans up after it. This includes removing it from the DOM, removing all event listeners, etc.

Run the following command from a console:

```js
editor.destroy();
```

The editor and its contents should disappear. **This method returns a promise, so you need to `await` it** if you want to execute more logic after the editor is destroyed.

## Adapt this tutorial to CDN

If you want to use the editor from CDN, you can adapt this tutorial by following these steps.

First, clone the repository the same way as before. But do not install all the dependencies. Instead, run:
```
npm install vite
```
After that, open the `index.html` file and add the following tags:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>CKEditor 5 Framework – tutorial CDN</title>
		<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
	</head>
	<body>
		<div id="app">
			<p>Hello world!</p>
		</div>
		<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>

		<script type="module" src="/src/main.js"></script>
	</body>
</html>
```

The CSS file contains the editor and content styles. Therefore, you do not need to import styles into your JavaScript file.

```js
// Before:
import 'ckeditor5/ckeditor5.css';

// After:
// No need to import the styles.
```

The script tag loads the editor from the CDN. It exposes the global variable `CKEDITOR`. You can use it in your project to access the editor class and plugins. That is why you must change the import statements to destructuring in the JavaScript files:

```js
// Before:
import { ClassicEditor, Essentials, Bold, Italic, Paragraph } from 'ckeditor5';

// After:
const { ClassicEditor, Essentials, Bold, Italic, Paragraph } = CKEDITOR;
```

Also, since the `GPL` key can't be used for CDN integration, you need to go to our [pricing page](https://ckeditor.com/pricing/) and select a plan that best suits your needs to obtain a license key that can be used in cloud integration. In `src/main.js` set `licenseKey` to your license key.

After following these steps and running the `npm run dev` command, you should be able to open the editor in the browser.

## What's next

In the next chapter you will {@link tutorials/crash-course/plugins learn more about plugins} and we will start creating a new one from scratch.
