---
category: getting-started
order: 70
---

{@snippet installation/getting-and-setting-data/build-autosave-source}

# Getting and setting data

<info-box hint>
**Quick recap**

In the {@link installation/getting-started/editor-lifecycle previous tutorial} you have learned about lifecycle methods. Having the editor created, you can now set or get its data. 
</info-box>

CKEditor 5 allows you to retrieve the data from and save it to your server (or to your system in general) in various ways. In this guide you can learn about the available options along with their pros and cons.

## Automatic integration with HTML forms

This is the classic way of integrating the editor. It is typically used in simpler CMSes, forums, comment sections, etc.

This approach is only available in the {@link installation/getting-started/predefined-builds#classic-editor Classic editor} and only if the editor was used to replace a `<textarea>` element:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 - Classic editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/classic/ckeditor.js"></script>
</head>
<body>
	<h1>Classic editor</h1>
	<form action="[URL]" method="post">
		<textarea name="content" id="editor">
			&lt;p&gt;This is some sample content.&lt;/p&gt;
		</textarea>
		<p><input type="submit" value="Submit"></p>
	</form>
	<script>
		ClassicEditor
			.create( document.querySelector( '#editor' ) )
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

<info-box>
	When you print the data from the database to a `<textarea>` element in an HTML page, you need to encode it correctly. For instance, if you use PHP then a minimal solution would look like this:

	```php
	<?php
		$data = str_replace( '&', '&amp;', $data );
	?>

	<textarea name="content" id="editor"><?= $data ?></textarea>
	```

	Thanks to that, the `<textarea>` will be printed out like this:

	```html
	<textarea>&lt;p>This is some sample content.&lt;/p></textarea>
	```

	Instead of being printed like this:

	```html
	<textarea><p>This is some sample content.</p></textarea>
	```

	While simple content like mentioned above does not itself require to be encoded, encoding the data will prevent losing text like "&lt;" or "&lt;img&gt;".
</info-box>

## Manually retrieving the data

When you:

* Use Ajax requests instead of the classic integration with HTML forms,
* Implement a single-page application,
* Use a different editor type than the Classic editor (and hence, cannot use the previous method),

### Getting the editor data with `getData()`

If the editor content needs to be retrieved for any reason, like for sending it to the server through an Ajax call, use the `getData()` method:

```js
const data = editor.getData();
```
<!-- you can retrieve the data from the editor by using the {@link module:editor-classic/classiceditor~ClassicEditor#getData `editor.getData()`} method. -->

### Setting the editor data with `setData()`

To replace the editor content with new data, use the `setData()` method:

```js
editor.setData( '<p>Some text.</p>' );
```

For that, you need to store the reference to the `editor` because &mdash; unlike in CKEditor 4 &mdash; there is no global `CKEDITOR.instances` property. You can do that in multiple ways, for example by assigning the `editor` to a variable defined outside the `then()`'s callback:

```js
let editor;

ClassicEditor
	.create( document.querySelector( '#editor' ) )
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

## Updating the source element

If the source element is not `<textarea>`, CKEditor 5 clears its content after the editor is destroyed. However, if you would like to enable updating the source element with the output coming from the data pipeline, you can use the {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`} configuration option.

```js
ClassicEditor.create( document.querySelector( '#editor' ), {
    // ...
    updateSourceElementOnDestroy: true
} );
```

<info-box warning>
Enabling the `updateSourceElementOnDestroy` option in your configuration might have some security implications, depending on plugins you use. While the editing view is secured, there might be some unsafe content in the data output, so enable this option only if you know what you are doing. Be especially careful when using the Markdown, General HTML Support and HTML embed features.
</info-box>

## Autosave feature

The {@link module:autosave/autosave~Autosave} feature allows you to automatically save the data (e.g. send it to the server) when needed (when the user changed the content).

<info-box>
	This plugin is unavailable in any of the builds by default so you need to {@link installation/plugins/installing-plugins install it}.
</info-box>

Assuming that you implemented a `saveData()` function that sends the data to your server and returns a promise which is resolved once the data is successfully saved, configuring the autosave feature is as simple as:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Autosave,

			// ... other plugins
		],

		autosave: {
			save( editor ) {
				return saveData( editor.getData() );
			}
		},

		// ... other configuration options
	} );
```

The autosave feature listens to the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event, throttles it and executes the `config.autosave.save()` function.

It also listens to the native [`window#beforeunload`](https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload) event and blocks it in the following cases:

* The data has not been saved yet (the `save()` function did not resolve its promise or it was not called yet due to throttling).
* Or any of the editor features registered a {@link module:core/pendingactions~PendingActions "pending action"} (e.g. that an image is being uploaded).

This automatically secures you from the user leaving the page before the content is saved or some ongoing actions like image upload did not finish.

The minimum time period between two save actions can be configured using the {@link module:autosave/autosave~AutosaveConfig#waitingTime `config.waitingTime`} property to not overload the backend. 1 second is the default waiting time before the next save action if nothing has changed in the meantime after the editor data has changed.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		autosave: {
			waitingTime: 5000, // in ms
			save( editor ) {}
		},

		// ... other configuration options
	} );
```

### Demo

This demo shows a simple integration of the editor with a fake HTTP server (which needs 1000ms to save the content).

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Autosave,

			// ... other plugins
		],

		autosave: {
			save( editor ) {
				return saveData( editor.getData() );
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		displayStatus( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Save the data to a fake HTTP server (emulated here with a setTimeout()).
function saveData( data ) {
	return new Promise( resolve => {
		setTimeout( () => {
			console.log( 'Saved', data );

			resolve();
		}, HTTP_SERVER_LAG );
	} );
}

// Update the "Status: Saving..." info.
function displayStatus( editor ) {
	const pendingActions = editor.plugins.get( 'PendingActions' );
	const statusIndicator = document.querySelector( '#editor-status' );

	pendingActions.on( 'change:hasAny', ( evt, propertyName, newValue ) => {
		if ( newValue ) {
			statusIndicator.classList.add( 'busy' );
		} else {
			statusIndicator.classList.remove( 'busy' );
		}
	} );
}
```

How to understand this demo:

* The status indicator shows when the editor has some unsaved content or pending actions.
	* If you drop a big image into this editor, you will see that it is busy during the entire period when the image is being uploaded.
	* The editor is also busy when saving the content is in progress (the `save()`'s promise was not resolved).
* The autosave feature has a throttling mechanism which groups frequent changes (e.g. typing) are grouped in batches.
* The autosave itself does not check whether the data has really changed. It bases on changes in the model which, in special cases, may not be "visible" in the data. You can add such a check yourself if you would like to avoid sending the same data to the server twice in a row.
* You will be asked whether you want to leave the page if an image is being uploaded or the data has not been saved successfully yet. You can test that by dropping a big image into the editor or changing the "HTTP server lag" to a high value (e.g. 9000ms) and typing something. These actions will make the editor "busy" for a longer time &mdash; try leaving the page then.

{@snippet installation/getting-and-setting-data/autosave}

## Handling users exiting the page

An additional concern when integrating the editor in your website is that the user may mistakenly leave before saving the data. This problem is automatically handled by the [autosave feature](#autosave-feature) described above, but if you do not use it and instead chose different integration methods, you should consider handling these two scenarios:

* The user leaves the page before saving the data (e.g. mistakenly closes a tab or clicks some link).
* The user saved the data, but there are some pending actions like an image upload.

To handle the former situation you can listen to the native [`window#beforeunload`](https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload) event. The latter situation can be handled by using CKEditor 5 {@link module:core/pendingactions~PendingActions} plugin.

### Demo

The example below shows how all these mechanisms can be used together to enable or disable a "Save" button and block the user from leaving the page without saving the data.

<info-box>
	The {@link module:core/pendingactions~PendingActions} plugin is unavailable in any of the builds by default so you need to {@link installation/plugins/installing-plugins install it}.
</info-box>

```js
// Note: We need to build the editor from source.
// We cannot use existing builds in this case.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions';

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
* You will be asked whether you want to leave the page if an image is being uploaded or the data has not been saved successfully yet. You can test that by dropping a big image into the editor or changing the "HTTP server lag" to a high value (e.g. 9000ms) and clicking the "Save" button. These actions will make the editor "busy" for a longer time &mdash; try leaving the page then.

{@snippet installation/getting-and-setting-data/manualsave}

<info-box hint>
**What's next?**

Having read this guide, you know how to communicate with the editor, but remember that CKEditor 5 offers a rich API to interact with it. Check out the {@link api/index API documentation} for more.

If you would like to integrate your CKEditor 5 installation with the Angular, React and Vue.js JavaScript frameworks, {@link installation/frameworks/overview we have dedicated guides for that}.
</info-box>
