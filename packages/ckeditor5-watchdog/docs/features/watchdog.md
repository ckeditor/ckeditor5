---
title: Watchdog
category: features
---

# Watchdog

Every non-trivial piece of software has bugs. Despite our high quality standards like 100% code coverage, regression testing and manual tests before every release, CKEditor 5 is not free of bugs. Neither is the browser used by the user, your application in which CKEditor 5 is integrated, or any third-party addons that you used.

In order to limit the effect of an editor crash on the user experience, you can automatically restart the WYSIWYG editor with the content saved just before the crash.

The {@link module:watchdog/watchdog~Watchdog} utility allows you to do exactly that. It ensures that an editor instance is running, despite a potential crash. It works by detecting that an editor crashed, destroying it, and automatically creating a new instance of that editor with the content of the previous editor.

Note that the most "dangerous" places in the CKEditor 5 API, like `editor.model.change()`, `editor.editing.view.change()` or emitters, are covered with checks and `try-catch` blocks that allow detecting unknown errors and restart the editor when they occur.

There are two available types of watchdogs:

* [Editor watchdog](#editor-watchdog) &ndash; To be used with a single editor instance.
* [Context watchdog](#context-watchdog) &ndash; To be used when your application uses the context.

<info-box>
	Note: A watchdog can be used only with an {@link builds/guides/integration/advanced-setup#scenario-2-building-from-source editor built from source}.
</info-box>

## Usage

### Editor watchdog

Install the [`@ckeditor/ckeditor5-watchdog`](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog) package:

```
npm install --save @ckeditor/ckeditor5-watchdog
```

Then, change your `ClassicEditor.create()` call to `watchdog.create()` as follows:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

// Create a watchdog for the given editor type.
const watchdog = new EditorWatchdog( ClassicEditor );

// Create a new editor instance.
watchdog.create( document.querySelector( '#editor' ), {
	plugins: [ Essentials, Paragraph, Bold, Italic ],
	toolbar: [ 'bold', 'italic', 'alignment' ]
} );
```

In other words, your goal is to create a watchdog instance and make the watchdog create an instance of the editor you want to use. The watchdog will then create a new editor and if it ever crashes, restart it by creating a new editor.

<info-box>
	A new editor instance is created every time the watchdog detects a crash. Thus, the editor instance should not be kept in your application's state. Use the {@link module:watchdog/editorwatchdog~EditorWatchdog#editor `EditorWatchdog#editor`} property instead.

	It also means that any code that should be executed for any new editor instance should be either loaded as an editor plugin or executed in the callbacks defined using {@link module:watchdog/editorwatchdog~EditorWatchdog#setCreator `EditorWatchdog#setCreator()`} and {@link module:watchdog/editorwatchdog~EditorWatchdog#setDestructor `EditorWatchdog#setDestructor()`}. Read more about controlling the editor creation and destruction in the next section.
</info-box>

#### Controlling editor creation and destruction

For more control over the creation and destruction of editor instances, you can use {@link module:watchdog/editorwatchdog~EditorWatchdog#setCreator `EditorWatchdog#setCreator()`} and, if needed, the {@link module:watchdog/editorwatchdog~EditorWatchdog#setDestructor `EditorWatchdog#setDestructor()`} methods:

```js
// Create an editor watchdog.
const watchdog = new EditorWatchdog();

// Define a callback that will create an editor instance and return it.
watchdog.setCreator( ( elementOrData, editorConfig ) => {
	return ClassicEditor
		.create( elementOrData, editorConfig )
		.then( editor => {
			// Do something with the new editor instance.
		} );
} );

// Do something before the editor is destroyed. Return a promise.
watchdog.setDestructor( editor => {
	// ...

	return editor
		.destroy()
		.then( () => {
			// Do something after the editor is destroyed.
		} );
} );

// Create an editor instance and start watching it.
watchdog.create( elementOrData, editorConfig );
```

<info-box>
	The default (not overridden by `setDestructor()`) editor destructor simply executes `Editor#destroy()`.
</info-box>

#### Editor watchdog API

Other useful {@link module:watchdog/editorwatchdog~EditorWatchdog methods, properties and events}:

```js
watchdog.on( 'error', () => { console.log( 'Editor crashed.' ) } );
watchdog.on( 'restart', () => { console.log( 'Editor was restarted.' ) } );

// Destroy the watchdog and the current editor instance.
watchdog.destroy();

// The current editor instance.
watchdog.editor;

// The current state of the editor.
// The editor might be in one of the following states:
//
// * `initializing` - Before the first initialization, and after crashes, before the editor is ready.
// * `ready` - A state when the user can interact with the editor.
// * `crashed` - A state when an error occurs. It quickly changes to `initializing` or `crashedPermanently` depending on how many and how frequent errors have been caught recently.
// * `crashedPermanently` - A state when the watchdog stops reacting to errors and keeps the editor crashed.
// * `destroyed` - A state when the editor is manually destroyed by the user after calling `watchdog.destroy()`.
watchdog.state;

// Listen to state changes.

let prevState = watchdog.state;

watchdog.on( 'stateChange', () => {
	const currentState = watchdog.state;

	console.log( `State changed from ${ currentState } to ${ prevState }` );

	if ( currentState === 'crashedPermanently' ) {
		watchdog.editor.isReadOnly = true;
	}

	prevState = currentState;
} );

// An array of editor crash information.
watchdog.crashes.forEach( crashInfo => console.log( crashInfo ) );
```

### Context watchdog

Install the [`@ckeditor/ckeditor5-watchdog`](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog) package:

```
npm install --save @ckeditor/ckeditor5-watchdog
```

And then change your editor and context initialization code:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Context from '@ckeditor/ckeditor5-core/src/context';

// Create a context watchdog and pass the context class with optional watchdog configuration:
const watchdog = new ContextWatchdog( Context, {
	crashNumberLimit: 10
} );

// Initialize the watchdog with the context configuration:
await watchdog.create( {
	plugins: [
	    // ...
	],
	// ...
} );

// Add editor instances.
// You may also use multiple `ContextWatchdog#add()` calls, each adding a single editor.
await watchdog.add( [ {
	id: 'editor1',
	type: 'editor',
	sourceElementOrData: document.querySelector( '#editor' ),
	config: {
		plugins: [ Essentials, Paragraph, Bold, Italic ],
		toolbar: [ 'bold', 'italic', 'alignment' ]
	},
	creator: ( element, config ) => ClassicEditor.create( element, config )
}, {
	id: 'editor2',
	type: 'editor',
	sourceElementOrData: document.querySelector( '#editor' ),
	config: {
		plugins: [ Essentials, Paragraph, Bold, Italic ],
		toolbar: [ 'bold', 'italic', 'alignment' ]
	},
	creator: ( element, config ) => ClassicEditor.create( element, config )
} ] );

// Or:
await watchdog.add( {
	id: 'editor1',
	type: 'editor',
	sourceElementOrData: document.querySelector( '#editor' ),
	config: {
		plugins: [ Essentials, Paragraph, Bold, Italic ],
		toolbar: [ 'bold', 'italic', 'alignment' ]
	},
	creator: ( element, config ) => ClassicEditor.create( element, config )
} );

await watchdog.add( {
    id: 'editor2',
    type: 'editor',
    sourceElementOrData: document.querySelector( '#editor' ),
    config: {
        plugins: [ Essentials, Paragraph, Bold, Italic ],
        toolbar: [ 'bold', 'italic', 'alignment' ]
    },
    creator: ( element, config ) => ClassicEditor.create( element, config )
} );
```

To destroy one of the item instances, use {@link module:watchdog/contextwatchdog~ContextWatchdog#remove `ContextWatchdog#remove`}:

```js
await watchdog.remove( [ 'editor1', 'editor2' ] );

// Or:
await watchdog.remove( 'editor1' );
await watchdog.remove( 'editor2' );
```

#### Context watchdog API

The context watchdog feature provides the following API:

```js
// Creating a watchdog that will use the context class and the watchdog configuration.
const watchdog = new ContextWatchdog( Context, watchdogConfig );

// Setting a custom creator for the context.
watchdog.setCreator( async config => {
	const context = await Context.create( config );

	// Do something when the context is initialized.

	return context;
} );

// Setting a custom destructor for the context.
watchdog.setDestructor( async context => {
	
	// Do something before destroy.

	await context.destroy();
} );

// Initializing the context watchdog with the context configuration.
await watchdog.create( contextConfig );

// Adding item configuration (or an array of item configurations).
await watchdog.add( {
	id: 'editor1',
	type: 'editor',
	sourceElementOrData: domElementOrEditorData
	config: editorConfig,
	creator: createEditor,
	destructor: destroyEditor,
} );

await watchdog.add( [
    {
    	id: 'editor1',
    	type: 'editor',
    	sourceElementOrData: domElementOrEditorData
    	config: editorConfig,
    	creator: createEditor,
    	destructor: destroyEditor,
    },
    // ...
] );

// Remove and destroy a given item (or items).
await watchdog.remove( 'editor1' );

await watchdog.remove( [ 'editor1', 'editor2', ... ] );

// Getting the given item instance.
const editor1 = watchdog.getItem( 'editor1' );

// Getting the state of the given item.
const editor1State = watchdog.getItemState( 'editor1' );

// Getting the context state.
const contextState = watchdog.state;

// The `error` event is fired when the context watchdog catches a context-related error.
// Note that errors fired by items are not delegated to `ContextWatchdog#event:error`.
// See also `ContextWatchdog#event:itemError`.
watchdog.on( 'error', ( _, { error } ) => {

// The `restart` event is fired when the context is set back to the `ready` state (after it was in the `crashed` state).
// Similarly, this event is not thrown for internal item restarts.
watchdog.on( 'restart', () => {
	console.log( 'The context has been restarted.' );
} );

// The `itemError` event is fired when an error occurred in one of the added items.
watchdog.on( 'itemError', ( _, { error, itemId } ) => {
	console.log( `An error occurred in an item with the '${ itemId }' ID.` );
} );

// The `itemRestart` event is fired when an item is set back to the `ready` state (after it was in the `crashed` state).
watchdog.on( 'itemRestart', ( _, { itemId } ) => {
	console.log( 'An item with with the '${ itemId }' ID has been restarted.' );
} );
```

## Configuration

Both {@link module:watchdog/editorwatchdog~EditorWatchdog#constructor `EditorWatchdog`} and {@link module:watchdog/contextwatchdog~ContextWatchdog#constructor `ContextWatchdog`} constructors accept a {@link module:watchdog/watchdog~WatchdogConfig configuration object} as the second argument with the following optional properties:

* `crashNumberLimit` &ndash; A threshold specifying the number of errors (defaults to `3`). After this limit is reached and the time between last errors is shorter than `minimumNonErrorTimePeriod`, the watchdog changes its state to `crashedPermanently` and it stops restarting the editor. This prevents an infinite restart loop.
* `minimumNonErrorTimePeriod` &ndash; An average number of milliseconds between the last editor errors (defaults to 5000). When the period of time between errors is lower than that and the `crashNumberLimit` is also reached, the watchdog changes its state to `crashedPermanently` and it stops restarting the editor. This prevents an infinite restart loop.
* `saveInterval` &ndash; A minimum number of milliseconds between saving the editor data internally (defaults to 5000). Note that for large documents this might impact the editor performance.

```js
const editorWatchdog = new EditorWatchdog( ClassicEditor, {
	minimumNonErrorTimePeriod: 2000,
	crashNumberLimit: 4,
	saveInterval: 1000
} );
```

<info-box>
	Note that the context watchdog passes its configuration to editor watchdogs that it creates for added editors.
</info-box>

## Limitations

The watchdogs do not handle errors thrown during the editor or context initialization (e.g. in `Editor.create()`) and editor destruction (e.g. in `Editor#destroy()`). Errors thrown at these stages mean that there is a problem in the code integrating the editor with your application and such problem cannot be fixed by restarting the editor.
