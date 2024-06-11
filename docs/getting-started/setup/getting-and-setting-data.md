---
category: setup
meta-title: Getting and setting data | CKEditor 5 documentation
order: 10
---

{@snippet installation/getting-and-setting-data/build-autosave-source}

# Getting and setting data

In CKEditor&nbsp;5 there are several ways to load and save data. In this guide, you can learn about the available options and their advantages and disadvantages.

## Autosaving

One of the best ways to improve the user experience is to automatically save editor data as it changes. This ensures that users do not have to remember to save their data and prevents work loss.

We provide and autosave feature that automatically saves the data (for example sends it to the server) when needed. Please refer to the {@link features/autosave Autosave} guide for details.

## Initializing the editor with data

By default, the editor has the content of the DOM element on which it was initialized on.

```html
<div id="editor">
	<!-- This content will appear in the editor if you initialize with this element. -->
	<p>Hello, world!</p>
</div>
```

However, if you cannot alter the HTML or you load the data asynchronously using JavaScript, you can use the `initialData` configuration property to set the initial state of the editor.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ /* ... */ ],
		toolbar: [ /* ... */ ],
		initialData: '<p>Hello, world!</p>'
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

The {@link module:core/editor/editorconfig~EditorConfig.initialData `initialData`} property will initialize the editor with the provided data, overriding the content provided at the HTML level.

If you are setting up the editor with integrations like {@link getting-started/integrations/react React}, consult the documentation for additional properties provided to initialize the data.

## Getting the editor data with `getData()`

You can use the `getData()` method, if you need to get the editor content on demand, such as for sending it to the server using JavaScript APIs.

```js
const data = editor.getData();
```

For that, you need to store the reference to the `editor` because there is no global property. You can do that in multiple ways, for example by assigning the `editor` to a variable defined outside the `then()`'s callback:

```js
let editor;

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ /* ... */ ],
		toolbar: [ /* ... */ ]
	} )
	.then( newEditor => {
		editor = newEditor;
	} )
	.catch( error => {
		console.error( error );
	} );

// Assuming there is a <button id="submit">Submit</button> in your application.
document.querySelector( '#submit' ).addEventListener( 'click', () => {
	const editorData = editor.getData();

	// ...
} );
```

The {@link module:core/editor/editor~Editor.getData getData()} method may accept options that alter the returned content.

## Replacing the editor data with `setData()`

In some scenarios you may wish to replace the editor content on demand with new data. For this operation use the `setData()` method:

```js
editor.setData( '<p>Some text.</p>' );
```

As with getting data, you will need access to the editor’s instance. Refer to the previous section for an example of how to save the instance.

## Automatic integration with HTML forms

This is the classic way of integrating the editor. It is typically used in simpler CMSes, forums, comment sections, etc.

This approach is **only available in the Classic editor**, and only if the editor was used to replace a `<textarea>` element:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 - Classic editor</title>
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
</head>
<body>
	<h1>Classic editor</h1>
	<form action="[URL]" method="post">
		<textarea name="content" id="editor">
			&lt;p&gt;This is some sample content.&lt;/p&gt;
		</textarea>
		<p><input type="submit" value="Submit"></p>
	</form>
	<script type="importmap">
		{
			"imports": {
				"ckeditor5": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.js",
				"ckeditor5/": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/"
			}
		}
	</script>
	<script type="module">
	  	import {
			ClassicEditor,
			Essentials,
			Paragraph,
			Bold,
			Italic
		} from 'ckeditor5';

		ClassicEditor
			.create( document.querySelector( '#editor' ), {
				plugins: [ Essentials, Paragraph, Bold, Italic ],
				toolbar: [ 'bold', 'italic' ]
			} )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

Classic editor will automatically update the value of the `<textarea>` element once the user submits the form. You do not need any additional JavaScript code to send the editor data to the server.

In your HTTP server, you can now read the editor data from the `content` variable of the POST request. For instance, in PHP, you can get it in this way:

```php
<?php
	$editor_data = $_POST[ 'content' ];
?>
```

<info-box>
	Please note that the replaced `<textarea>` element is updated automatically by CKEditor straight before the submission. If you need to access the `<textarea>` value programmatically with JavaScript (e.g. in the `onsubmit` handler to validate the entered data), there is a chance that the `<textarea>` element would still store the original data. In order to update the value of the replaced `<textarea>`, use the {@link module:editor-classic/classiceditor~ClassicEditor#updateSourceElement `editor.updateSourceElement()`} method.

	If you need to get the actual data from CKEditor at any moment using JavaScript, use the {@link module:editor-classic/classiceditor~ClassicEditor#getData `editor.getData()`} method as described in the next section.
</info-box>

When you print the data from the database to a `<textarea>` element in an HTML page, you need to encode it correctly. For instance, if you use PHP then a minimal solution would look like this:

```php
<?php
	$data = htmlspecialchars("<p>Hello, world!</p>", ENT_QUOTES, 'UTF-8');
?>

<textarea name="content" id="editor"><?= $data ?></textarea>
```

Thanks to that, the `<textarea>` will be printed out like this:

```html
<textarea>&lt;p&gt;Hello, world!&lt;/p&gt;</textarea>
```

Instead of being printed like this:

```html
<textarea><p>Hello, world!</p></textarea>
```

While simple content like that mentioned above does not itself require to be encoded, encoding the data will prevent losing text like `<` or `<IMPORTANT>`.

## Updating the source element

If the source element is not `<textarea>`, CKEditor 5 clears its content after the editor is destroyed. However, if you would like to enable updating the source element with the output coming from the data pipeline, you can use the {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`} configuration option.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
		updateSourceElementOnDestroy: true
	} );
```

<info-box warning>
	Enabling the `updateSourceElementOnDestroy` option in your configuration might have some security implications, depending on the plugins you use. While the editing view is secured, there might be some unsafe content in the data output, so enable this option only if you know what you are doing. Be especially careful when using the Markdown, General HTML Support, and HTML embed features.
</info-box>

## Alerting users exiting the page

An additional concern when integrating the editor into your website is that the user may mistakenly leave before saving the data. This problem is automatically handled by the {@link features/autosave autosave feature}, but if you do not use it and instead choose different integration methods, you should consider handling these two scenarios:

* The user leaves the page before saving the data (e.g. mistakenly closes a tab or clicks some link).
* The user saved the data, but there are some pending actions like an image upload.

To handle the former situation you can listen to the native [`window#beforeunload`](https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload) event. The latter situation can be handled by using the CKEditor&nbsp;5 {@link module:core/pendingactions~PendingActions} plugin.

### Demo

The example below shows how all these mechanisms can be used together to enable or disable a "Save" button and block the user from leaving the page without saving the data.
<!-- Not sure how to handle that info
<info-box>
	The {@link module:core/pendingactions~PendingActions} plugin is unavailable in any of the builds by default so you need to install it.
</info-box>
-->

```js
// Note: We need to build the editor from source.
import { ClassicEditor, PendingActions } from 'ckeditor5';

let isDirty = false;

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			PendingActions,

			// ... other plugins
		]
	} )
	.then( editor => {
		window.editor = editor;

		handleStatusChanges( editor );
		handleSaveButton( editor );
		handleBeforeunload( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Handle clicking the "Save" button by sending the data to a
// fake HTTP server (emulated here with setTimeout()).
function handleSaveButton( editor ) {
	const saveButton = document.querySelector( '#save' );
	const pendingActions = editor.plugins.get( 'PendingActions' );

	saveButton.addEventListener( 'click', evt => {
		const data = editor.getData();

		// Register the action of saving the data as a "pending action".
		// All asynchronous actions related to the editor are tracked like this,
		// so later on you only need to check `pendingActions.hasAny` to check
		// whether the editor is busy or not.
		const action = pendingActions.add( 'Saving changes' );

		evt.preventDefault();

		// Save the data to a fake HTTP server.
		setTimeout( () => {
			pendingActions.remove( action );

			// Reset isDirty only if the data did not change in the meantime.
			if ( data == editor.getData() ) {
				isDirty = false;
			}

			updateStatus( editor );
		}, HTTP_SERVER_LAG );
	} );
}

// Listen to new changes (to enable the "Save" button) and to
// pending actions (to show the spinner animation when the editor is busy).
function handleStatusChanges( editor ) {
	editor.plugins.get( 'PendingActions' ).on( 'change:hasAny', () => updateStatus( editor ) );

	editor.model.document.on( 'change:data', () => {
		isDirty = true;

		updateStatus( editor );
	} );
}

// If the user tries to leave the page before the data is saved, ask
// them whether they are sure they want to proceed.
function handleBeforeunload( editor ) {
	const pendingActions = editor.plugins.get( 'PendingActions' );

	window.addEventListener( 'beforeunload', evt => {
		if ( pendingActions.hasAny ) {
			evt.preventDefault();
		}
	} );
}

function updateStatus( editor ) {
	const saveButton = document.querySelector( '#save' );

	// Disables the "Save" button when the data on the server is up to date.
	if ( isDirty ) {
		saveButton.classList.add( 'active' );
	} else {
		saveButton.classList.remove( 'active' );
	}

	// Shows the spinner animation.
	if ( editor.plugins.get( 'PendingActions' ).hasAny ) {
		saveButton.classList.add( 'saving' );
	} else {
		saveButton.classList.remove( 'saving' );
	}
}
```

How to understand this demo:

* The button changes to "Saving..." when the data is being sent to the server or there are any other pending actions (e.g. an image being uploaded).
* You will be asked whether you want to leave the page if an image is being uploaded or the data has not been saved successfully yet. You can test that by dropping a big image into the editor or changing the "HTTP server lag" to a high value (e.g. 9000ms) and clicking the "Save" button. These actions will make the editor "busy" for a longer time &ndash; try leaving the page then.

{@snippet installation/getting-and-setting-data/manualsave}
