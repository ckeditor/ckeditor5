---
category: builds-integration
order: 40
---

{@snippet builds/saving-data/build-autosave-source}

# Getting and saving data

CKEditor 5 allows you to retrieve and save the data to your server (or to your system in general) in various ways. In this guide you can learn about the options and their pros and cons.

## Automatic integration with HTML forms

This is the classical way of integrating the editor. It is typically used in simpler CMSes, forums, comment sections, etc.

This approach is only available in the {@link builds/guides/overview#classic-editor Classic editor} and only if it was used to replace a `<textarea>` element:

```html
<!DOCTYPE html>
<html>
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
````

The Classic editor will automatically update the value of the `<textarea>` element once the user submits the form. You do not need any additional JavaScript code to sent the editor data to the server.

In your HTTP server, you can now read the editor data from the `content` variable of the POST request. For instance, in PHP, you can get them this way:

```php
<?php
    $editor_data = $_POST[ 'content' ];
?>
```

<info-box>
	Please note that the replaced `<textarea>` element is updated automatically by CKEditor straight before the submission. If you need to access the `<textarea>` value programmatically with JavaScript (e.g. in the `onsubmit` handler to validate the entered data), there is a chance that the `<textarea>` element would still store the original data. In order to update the value of replaced `<textarea>`, use the {@link module:editor-classic/classiceditor~ClassicEditor#updateSourceElement `editor.updateSourceElement()`} method.

	If you need to get the actual data from CKEditor at any moment using JavaScript, use the {@link module:editor-classic/classiceditor~ClassicEditor#getData `editor.getData()`} method as described in the next section.
</info-box>

<!-- Hidden due to https://github.com/cksource/umberto/issues/558
<info-box>
	When you print the data from the database to a `<textarea>` element in an HTML page, you need to encode them correctly. For instance, if you use PHP then a minimal solution would look like this:

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

	While a simple content like mentioned above does not itself require to be encoded, encoding the data will prevent losing text like `&lt;` or `&lt;img&gt;`.
</info-box>
-->

## Manually retrieving the data

When you use AJAX requests instead of the classical integration with HTML forms, implement a single-page application or you use a different editor type than the Classic editor (and hence, you cannot use the previous method), you can retrieve the data from the editor by using the {@link module:editor-classic/classiceditor~ClassicEditor#getData `editor.getData()`} method.

For that, you need to store the reference to the `editor` because, unlike in CKEditor 4, there is no global `CKEDITOR.instances` property. You can do that in multiple ways, e.g. assigning the `editor` to a variable defined outside the `then()`'s callback:

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

// Assuming there's a <button id="submit">Submit</button> in your application.
document.querySelector( '#submit' ).addEventListener( 'click', () => {
	const editorData = editor.getData();

	// ...
} );
```

## Autosave feature

The {@link module:autosave/autosave~Autosave} allows you to automatically save the data (e.g. send it to the server) when needed (when the user changed the content).

<info-box>
	This plugin is unavailable in any of the builds by default so you need to {@link builds/guides/development/installing-plugins install it}.
</info-box>

Assuming that you implemented a `saveData()` function which sends the data to your server and returns a promise which is resolved once the data is successfully saved, configuring the autosave feature is as simple as:

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

* the data has not been saved yet (the `save()` function did not resolve its promise or it was not called yet due to throttling),
* or any of the editor features registered a {@link module:core/pendingactions~PendingActions "pending action"} (e.g. that an image is being uploaded).

This automatically secures you from the user leaving the page before the content is saved or some ongoing actions like image upload did not finish.

### Demo

This demo shows a simple integration of the editor with a fake HTTP server (which needs 1000ms to save the content).

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
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

// Save the data to a fake HTTP server.
function saveData( data ) {
	return new Promise( resolve => {

		setTimeout( () => {
			console.log( data );

			resolve();
		}, HTTP_SERVER_LAG );
	} );
}

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
	* If you drop a big image into this editor, you will see that it is busy during the entire period while the image is being uploaded.
	* The editor is also busy when saving the content is in progress (the `save()`'s promise was not resolved).
* The autosave feature has a throttling mechanism which groups frequent changes (e.g. typing) in batches.
* The autosave itself does not check whether the data has really changed. It bases on changes in the model which, in special cases, may not be "visible" in the data. You can add such a check yourself if you would like to avoid sending the same data to the server twice in a row.
* You will be asked whether you want to leave the page if an image is being uploaded or the data has not been saved successfully yet. You can test that by dropping a big image into the editor or changing the "HTTP server lag" to a high value (e.g. 9000ms) and typing something. Those actions will make the editor "busy" for a longer time – you can try leaving the page in the meanwhile.

{@snippet builds/saving-data/autosave}

## Handling users exiting the page

The additional concern when integrating the editor in your website is that the user may mistakenly leave before saving the data. This problem is automatically handled by the [autosave feature](#autosave-feature) described above, but if you do not use it and instead chose different integration methods, you should consider handling these two scenarios:

* The user leaves the page before saving the data (e.g. mistakenly closes a tab or clicks some link).
* The user saved the data, but there are some pending actions like an image upload.

To handle the former situation you can listen to the native [`window#beforeunload`](https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload) event. The latter situation can be handled by using CKEditor 5's {@link module:core/pendingactions~PendingActions} plugin.

### Demo

The below example shows how all these mechanism can be used together to enable/disable a "Save" button and blocking the user from leaving the page without saving the data.

```js
let isDirty = false;

ClassicEditor
	.create( document.querySelector( '#editor' ) )
	.then( editor => {
		window.editor = editor;

		handleStatusChanges( editor );
		handleSaveButton( editor );
		handleBeforeunload( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Handle clicking the "Save" button.
function handleSaveButton( editor ) {
	const saveButton = document.querySelector( '#save' );
	const pendingActions = editor.plugins.get( 'PendingActions' );

	saveButton.addEventListener( 'click', evt => {
		const data = editor.getData();
		const action = pendingActions.add( 'Saving changes' );

		evt.preventDefault();

		// Fake HTTP server's lag.
		setTimeout( () => {
			log( data );

			pendingActions.remove( action );

			// Reset isDirty only if data didn't change in the meantime.
			if ( data == editor.getData() ) {
				isDirty = false;
			}

			updateStatus( editor );
		}, HTTP_SERVER_LAG );
	} );
}

function handleStatusChanges( editor ) {
	const pendingActions = editor.plugins.get( 'PendingActions' );

	pendingActions.on( 'change:hasAny', () => updateStatus( editor ) );

	editor.model.document.on( 'change:data', () => {
		isDirty = true;

		updateStatus( editor );
	} );
}

function handleBeforeunload( editor ) {
	const pendingActions = editor.plugins.get( 'PendingActions' );

	window.addEventListener( 'beforeunload', evt => {
		if ( pendingActions.hasAny ) {
			evt.returnValue = pendingActions.first.message;
		}
	} );
}

function updateStatus( editor ) {
	const saveButton = document.querySelector( '#save' );

	if ( isDirty ) {
		saveButton.classList.add( 'active' );
	} else {
		saveButton.classList.remove( 'active' );
	}

	if ( editor.plugins.get( 'PendingActions' ).hasAny ) {
		saveButton.classList.add( 'saving' );
	} else {
		saveButton.classList.remove( 'saving' );
	}
}
```

How to understand this demo:

* The "Save" button becomes active when there are some changes to be saved.
* The button changes to "Saving..." when the data is being sent to the server or there are any other pending actions (e.g. image being uploaded).
* You will be asked whether you want to leave the page if an image is being uploaded or the data has not been saved successfully yet. You can test that by dropping a big image into the editor or changing the "HTTP server lag" to a high value (e.g. 9000ms) and clicking the "Save" button. Those actions will make the editor "busy" for a longer time – try leaving the page in the meanwhile.

{@snippet builds/saving-data/manualsave}
