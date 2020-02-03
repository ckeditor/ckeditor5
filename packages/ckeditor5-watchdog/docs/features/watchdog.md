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
* [editor watchdog](#editor-watchdog) - it fills the most basic scenario when only one editor is created
* [context watchdog](#context-watchdog) - it

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
const watchdog = EditorWatchdog.for( ClassicEditor );

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
	Note: the ContextWatchdog can be used only with an {@link builds/guides/integration/advanced-setup#scenario-2-building-from-source editor built from source}.
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

// Create a watchdog for the context and pass the context configuration:
const watchdog = ContextWatchdog.for( Context, {
	plugins: [],

	// Rest of the configuration.
} );

// Add editor instances:
watchdog.add( {
	editor1: {
		type: 'editor',
		sourceElementOrData: document.querySelector( '#editor' ),
		config: {
			plugins: [ Essentials, Paragraph, Bold, Italic ],
			toolbar: [ 'bold', 'italic', 'alignment' ]
		},
		creator: ( element, config ) => ClassicEditor.create( element, config )
	},
	editor2: {
		type: 'editor',
		sourceElementOrData: document.querySelector( '#editor' ),
		config: {
			plugins: [ Essentials, Paragraph, Bold, Italic ],
			toolbar: [ 'bold', 'italic', 'alignment' ]
		},
		creator: ( element, config ) => ClassicEditor.create( element, config )
	},
} );
```

The Watchdog will keep the context and editor (and other types of items in the future) instances running
that are added via the {@link module:watchdog/contextwatchdog~ContextWatchdog#add `ContextWatchdog#add` method}. This method can be called multiple times during the `ContextWatchdog` lifetime.

To destroy one of the editor instances use the {@link module:watchdog/contextwatchdog~ContextWatchdog#remove `ContextWatchdog#remove` method}. This method can be called multiple times during the `ContextWatchdog` lifetime as well.

```js
watchdog.remove( [ 'editor1' ] );
```

<info-box>
	Note that the above examples does not use promises returning by the context watchdog methods while these methods are asynchronous. You should not depend on these promises because they are resolved only once while your component might be restarted multiple times internally causing watchdog to unmount the editor and to mount again. Read further below for more information about events and watchdog states.
</info-box>

#### Context watchdog API

The ContextWatchdog feature provides the following API:

```js
// A simple initialization way with default Context creation and destruction functions:
const watchdog = ContextWatchdog.for( Context, contextConfig, watchdogConfig )

// An advanced initialization where custom creation and destruction functions can be passed:
const watchdog = new ContextWatchdog( contextConfig, watchdogConfig )

watchdog.setCreator( async config => {
	const context = await Context.create( config ) );

	// Do something when the context is initialized.

	return context;
} );

watchdog.setDestructor( async context => {
	// Do something before destroy.

	await context.destroy();
} );

watchdog.create();

// Adding, removing and getting item instances:
watchdog.add( {
	editor1: {
		type: 'editor',
		sourceElementOrData: editorSourceElementOrEditorData
		config: editorConfig,
		creator: createEditor,
		destructor: destroyEditor,
	},
	// Possibly more items.
} );

watchdog.remove( [ 'editor1' ] );

// Given item instance.
const editor1 = watchdog.get( 'editor1' );

// Given item state.
const editor1State = watchdog.getState( 'editor1' );

// Context state.
const contextState = watchdog.state;

// An event fired when the context watchdog catches the context-related error.
// Note that the editor errors are not re-fired in the `ContextWatchdog#error`.
watchdog.on( 'error', () => {} );

// An event fired when the context is back to the `ready` state.
// Similarly, this event is not thrown for internal editor instances.
watchdog.on( 'restart', () => {} );
```

## Configuration

Both, the {@link module:watchdog/watchdog~Watchdog#constructor `Watchdog#constructor`} and the {@link module:watchdog/watchdog~Watchdog.for `Watchdog.for`} methods accept a {{@link module:watchdog/watchdog~WatchdogConfig configuration object} with the following optional properties:

* `crashNumberLimit` - A threshold specifying the number of editor errors (defaults to `3`). After this limit is reached and the time between last errors is shorter than `minimumNonErrorTimePeriod` the watchdog changes its state to `crashedPermanently` and it stops restarting the editor. This prevents an infinite restart loop.
* `minimumNonErrorTimePeriod` - An average amount of milliseconds between last editor errors (defaults to 5000). When the period of time between errors is lower than that and the `crashNumberLimit` is also reached the watchdog changes its state to `crashedPermanently` and it stops restarting the editor. This prevents an infinite restart loop.
* `saveInterval` - A minimum number of milliseconds between saving editor data internally (defaults to 5000). Note that for large documents this might have an impact on the editor performance.

```js
const watchdog = new Watchdog( {
	minimumNonErrorTimePeriod: 2000,
	crashNumberLimit: 4,
	saveInterval: 1000
} )
```

Note that the ContextWatchdog spreads its configuration to the added items.

## Limitations

The watchdog does not handle errors thrown during the editor or context initialization (by e.g. `Editor.create()`) and editor destruction (e.g. `Editor#destroy()`). Errors thrown at these stages mean that there is a serious problem in the code integrating the editor with your application and such problem cannot be easily fixed by restarting the editor.
