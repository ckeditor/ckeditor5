---
category: features
modified_at: 2023-05-29
---

{@snippet installation/getting-and-setting-data/build-autosave-source}

# Autosave

The autosave feature allows you to automatically save the data (e.g. send it to the server) when needed (when the user changed the content).

## Demo

{@snippet installation/getting-and-setting-data/autosave}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

How to understand this demo:

* The status indicator shows when the editor has some unsaved content or pending actions.
	* If you drop a big image into this editor, you will see that it is busy during the entire period when the image is being uploaded.
	* The editor is also busy when saving the content is in progress (the `save()`'s promise was not resolved).
* The autosave feature has a throttling mechanism that groups frequent changes (e.g. typing), these are grouped in batches.
* The autosave itself does not check whether the data has actually changed. It bases on changes in the model which, in special cases, may not be "visible" in the data. You can add such a check yourself if you would like to avoid sending the same data to the server twice in a row.
* You will be asked whether you want to leave the page if an image is being uploaded or the data has not been saved successfully yet. You can test that by dropping a big image into the editor or changing the "HTTP server lag" to a high value (e.g. 9000ms) and typing something. These actions will make the editor "busy" for a longer time &mdash; try leaving the page then.

## Installation

<info-box>
	This plugin is unavailable in any of the builds by default so you need to {@link installation/plugins/installing-plugins install it}.
</info-box>

Assuming that you implemented a `saveData()` function that sends the data to your server and returns a promise which is resolved once the data is successfully saved, configuring the {@link module:autosave/autosave~Autosave} feature is as simple as:

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

The autosave feature listens to the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event, throttles it, and executes the `config.autosave.save()` function.

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

## Related features

* You can read more about {@link installation/getting-started/getting-and-setting-data getting and setting data} in the Installation section.

## Common API

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core).
