---
category: features
meta-title: Autosave | CKEditor 5 Documentation
modified_at: 2023-05-29
---

{@snippet installation/getting-and-setting-data/build-autosave-source}

# Autosave

The autosave feature allows you to automatically save the data (e.g. send it to the server) when needed. This can happen, for example, when the user changed the content.

## Demo

Type some text in the demo below to try out the autosave feature. Try adding rich content such as images or tables, and observe the feature's behavior. Demo elements and mechanisms are explained below the editor.

{@snippet features/autosave}

How to understand this demo:

* The status indicator shows if the editor has some unsaved content or pending actions.
	* If you drop a big image into this editor, you will see that it is busy during the entire period when the image is being uploaded.
	* The editor is also busy when saving the content is in progress (the `save()`'s promise was not resolved).
* The autosave feature has a throttling mechanism that groups frequent changes (e.g. typing) into batches.
* The autosave itself does not check whether the data has actually changed. It bases on changes in the {@link framework/architecture/editing-engine#model model} that sometimes may not be "visible" in the data. You can add such a check yourself if you would like to avoid sending the same data to the server twice.
* You will be asked whether you want to leave the page if an image is being uploaded or the data has not been saved successfully yet. You can test that by dropping a big image into the editor or changing the "HTTP server lag" to a high value (e.g. 9000ms) and typing something. These actions will make the editor busy for a longer time &mdash; try leaving the page then.

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box>
	This plugin is not enabled in any of the {@link installation/getting-started/predefined-builds predefined builds}, so you need to {@link installation/plugins/installing-plugins install it} by hand.
</info-box>

Assuming that you have implemented some form of the `saveData()` function that sends the data to your server and returns a promise which is resolved once the data is successfully saved, configuring the {@link module:autosave/autosave~Autosave} feature is simple:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Autosave,

			// ... other plugins.
		],

		autosave: {
			save( editor ) {
				return saveData( editor.getData() );
			}
		},

		// ... other configuration options.
	} );
```

The autosave feature listens to the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event, throttles it, and executes the {@link module:autosave/autosave~AutosaveConfig#save `config.autosave.save()`} function.

It also listens to the native [`window#beforeunload`](https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload) event and blocks it in the following cases:

* The data has not been saved yet (the `save()` function did not resolve its promise or it has not been called yet due to throttling).
* Or any of the editor features registered a {@link module:core/pendingactions~PendingActions "pending action"} (e.g. that an image is being uploaded).

This automatically secures you from the user leaving the page before the content is saved or some ongoing actions like image upload did not finish.

## Configuration

You can configure the minimum period between two save actions using the {@link module:autosave/autosave~AutosaveConfig#waitingTime `config.waitingTime`} property. This helps to avoid overloading the backend.

One second is the default waiting time before the next save action if nothing has changed after the editor data was last saved.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		autosave: {
			waitingTime: 5000, // in ms
			save( editor ) {}
		},

		// ... other configuration options.
	} );
```

### Demo code

The demo example at the beginning of this guide shows a simple integration of the editor with a fake HTTP server (which needs 1000ms to save the content). Here is the demo code:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Autosave,

			// ... other plugins.
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

// Update the "Status: Saving..." information.
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

You can read more about {@link installation/getting-started/getting-and-setting-data getting and setting data} in the Getting started section.

## Common API

The {@link module:autosave/autosave~Autosave} plugin registers the {@link module:autosave/autosave~AutosaveAdapter} used to save the data.

You can use {@link module:autosave/autosave~AutosaveConfig} to control the behavior of the adapter.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-autosave](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-autosave).
