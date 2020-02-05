---
title: Watchdog
category: features
---

# Watchdog

Every non-trivial piece of software has bugs. Despite our high quality standards like 100% code coverage, regression testing and manual tests before every release, CKEditor 5 is not free of bugs. Neither is the browser used by the user, your application in which CKEditor 5 is integrated, or any third-party addons that you used.

In order to limit the effect of an editor crash on the user experience, you can automatically restart the WYSIWYG editor with the content saved just before the crash.

The {@link module:watchdog/watchdog~Watchdog} utility allows you to do exactly that. It ensures that an editor instance is running, despite a potential crash. It works by detecting that an editor crashed, destroying it, and automatically creating a new instance of that editor with the content of the previous editor.

It should be noticed that the most "dangerous" places in the API - like `editor.model.change()`, `editor.editing.view.change()`, emitters - are covered with checks and `try-catch` blocks that allow detecting unknown errors and restart editor when they occur.

Currently there are two available watchdogs, which can be used depending on your needs:
* [editor watchdog](#editor-watchdog) - that fills the most basic scenario when only one editor is created,
* [context watchdog](#context-watchdog) - that keeps an advanced structure of connected editors via te context feature running

## Usage

### Editor watchdog

<info-box>
	Note: The editor watchdog can be used only with an {@link builds/guides/integration/advanced-setup#scenario-2-building-from-source editor built from source}.
</info-box>

Install the [`@ckeditor/ckeditor5-watchdog`](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog) package:

```bash
npm install --save @ckeditor/ckeditor5-watchdog
```

And then change your `ClassicEditor.create()` call to `watchdog.create()` as follows:

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

	It also means that any code that should be executed for any new editor instance should be either loaded as an editor plugin or executed in the callbacks defined by {@link module:watchdog/editorwatchdog~EditorWatchdog#setCreator `EditorWatchdog#setCreator()`} and {@link module:watchdog/editorwatchdog~EditorWatchdog#setDestructor `EditorWatchdog#setDestructor()`}. Read more about controlling the editor creation and destruction in the next section.
</info-box>

#### Controlling editor creation and destruction

For more control over the creation and destruction of editor instances, you can use the {@link  module:watchdog/editorwatchdog~EditorWatchdog#setCreator `EditorWatchdog#setCreator()`} and, if needed, the {@link  module:watchdog/editorwatchdog~EditorWatchdog#setDestructor `EditorWatchdog#setDestructor()`} methods:

```js
// Instantiate the watchdog manually (do not use the for() helper).
const watchdog = new EditorWatchdog();

watchdog.setCreator( ( elementOrData, editorConfig ) => {
	return ClassicEditor
		.create( elementOrData, editorConfig )
		.then( editor => {
			// Do something with the new editor instance.
		} );
} );

watchdog.setDestructor( editor => {
	// Do something before the editor is destroyed.

	return editor
		.destroy()
		.then( () => {
			// Do something after the editor is destroyed.
		} );
 } );

watchdog.create( elementOrData, editorConfig );
```

<info-box>
	The default (not overridden) editor destructor is the `editor => editor.destroy()` function.
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
// * `initializing` - before the first initialization, and after crashes, before the editor is ready,
// * `ready` - a state when a user can interact with the editor,
// * `crashed` - a state when an error occurs - it quickly changes to `initializing` or `crashedPermanently` depending on how many and how frequency errors have been caught recently,
// * `crashedPermanently` - a state when the watchdog stops reacting to errors and keeps the editor crashed,
// * `destroyed` - a state when the editor is manually destroyed by the user after calling `watchdog.destroy()`.
// This property is observable.
watchdog.state;

// Listen to state changes.
watchdog.on( 'change:state' ( evt, name, currentState, prevState ) => {
	console.log( `State changed from ${ currentState } to ${ prevState }` );

	if ( currentState === 'crashedPermanently' ) {
		watchdog.editor.isReadOnly = true;
	}
} );

// An array of editor crashes info.
watchdog.crashes.forEach( crashInfo => console.log( crashInfo ) );
```

### Context watchdog

<info-box>
	Note: the context watchdog can be used only with an {@link builds/guides/integration/advanced-setup#scenario-2-building-from-source editor built from source}.
</info-box>

Install the [`@ckeditor/ckeditor5-watchdog`](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog) package:

```bash
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

// Create a watchdog for the context and pass the `Context` class with optional watchdog configuration:
const watchdog = new ContextWatchdog( Context, {
	crashNumberLimit: 10
} );

// Initialize it with the context configuration:
await watchdog.create( {
	plugins: []
} )

// Add editor instances:
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
```

<info-box>
	The Watchdog will keep the context and item instances running
	that are added via the {@link module:watchdog/contextwatchdog~ContextWatchdog#add `ContextWatchdog#add` method}. This method can be called multiple times during the `ContextWatchdog` lifetime.

	To destroy one of the item instances use the {@link module:watchdog/contextwatchdog~ContextWatchdog#remove `ContextWatchdog#remove` method}. This method can be called multiple times during the `ContextWatchdog` lifetime as well.
</info-box>

```js
await watchdog.remove( [ 'editor1', 'editor2' ] );

// Or
await watchdog.remove( 'editor1' );
await watchdog.remove( 'editor2' );
```

<info-box>
	Examples presents the "synchronous way" of the integration with the context watchdog feature, however it's not needed to wait for the promises returned by the `create()`, `add()` and `remove()` methods. There might be a need
	to create and destroy items dynamically with shared context and that's can be easily achieved as all promises operating on the internal API will be chained.
</info-box>

#### Context watchdog API

The context watchdog feature provides the following API:

```js
// Creating watchdog that will use the `Context` class and given configuration.
const watchdog = new ContextWatchdog( Context, watchdogConfig );

// Setting a custom creator.
watchdog.setCreator( async config => {
	const context = await Context.create( config ) );

	// Do something when the context is initialized.

	return context;
} );

// Setting a custom destructor.
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
	sourceElementOrData: editorSourceElementOrEditorData
	config: editorConfig,
	creator: createEditor,
	destructor: destroyEditor,
} );

// Removing and destroy given item.
await watchdog.remove( [ 'editor1' ] );

// Getting given item instance.
const editor1 = watchdog.get( 'editor1' );

// Getting given item state.
const editor1State = watchdog.getState( 'editor1' );

// Getting the context state.
const contextState = watchdog.state;

// The `error` event is fired when the context watchdog catches the context-related error.
// Note that the item errors are not re-fired in the `ContextWatchdog#error`.
watchdog.on( 'error', ( evt, { error } ) => {
	console.log( 'The context crashed.' );
} );

// The `restarted` event is fired when the context is set back to the `ready` state (after it was in `error` state).
// Similarly, this event is not thrown for internal item restarts.
watchdog.on( 'restart', () => {
	console.log( 'The context has been restarted.' );
} );

// The `itemError` event is fired when an error occurred in one of the added items
watchdog.on( 'itemError', ( evt, { error, itemId } ) => {
	console.log( `An error occurred in an item with the '${ itemId }' id.` );
} );

// The `itemRestarted` event is fired when the item is set back to the `ready` state (after it was in `error` state).
watchdog.on( 'itemRestart', ( evt, { itemId } ) => {
	console.log( 'An item with with the '${ itemId }' id has been restarted.' );
} );
```

## Configuration

Both, {@link module:watchdog/editorwatchdog~EditorWatchdog#constructor `EditorWatchdog`} and {@link module:watchdog/contextwatchdog~ContextWatchdog#constructor `ContextWatchdog`} constructors accept a {{@link module:watchdog/watchdog~WatchdogConfig configuration object} as the second argument with the following optional properties:

* `crashNumberLimit` - A threshold specifying the number of editor errors (defaults to `3`). After this limit is reached and the time between last errors is shorter than `minimumNonErrorTimePeriod` the watchdog changes its state to `crashedPermanently` and it stops restarting the editor. This prevents an infinite restart loop.
* `minimumNonErrorTimePeriod` - An average amount of milliseconds between last editor errors (defaults to 5000). When the period of time between errors is lower than that and the `crashNumberLimit` is also reached the watchdog changes its state to `crashedPermanently` and it stops restarting the editor. This prevents an infinite restart loop.
* `saveInterval` - A minimum number of milliseconds between saving editor data internally (defaults to 5000). Note that for large documents this might have an impact on the editor performance.

```js
const editorWatchdog = new EditorWatchdog( ClassicEditor, {
	minimumNonErrorTimePeriod: 2000,
	crashNumberLimit: 4,
	saveInterval: 1000
} )
```

<info-box>
	Note that the context watchdog passes its configuration to the added editors.
</info-box>

## Limitations

The watchdog does not handle errors thrown during the editor or context initialization (by e.g. `Editor.create()`) and editor destruction (e.g. `Editor#destroy()`). Errors thrown at these stages mean that there is a problem in the code integrating the editor with your application and such a problem cannot be fixed by restarting the editor.
