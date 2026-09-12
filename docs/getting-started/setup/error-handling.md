---
category: setup
meta-title: Error handling | CKEditor 5 Documentation
meta-description: Learn how to be told about errors that escape a CKEditor 5 editor, and what to do about them.
order: 22
modified_at: 2026-09-10
---

# Error handling

Sometimes an editor hits a problem it cannot carry on from. CKEditor&nbsp;5 tells you when that happens and leaves the decision about what to do next to your application. This guide covers how to hear about such errors and what your options are afterward.

Nothing is restarted for you, and no editor content is saved or handed back. For why it works this way, see the [What we deliberately do not do](#what-we-deliberately-do-not-do) section.

## Registering a handler

Register a callback with {@link module:core/errorreporter~onEditorError `onEditorError()`}. It returns a function that unregisters the callback:

```js
import { onEditorError } from 'ckeditor5';

const off = onEditorError( ( { error, source } ) => {
	console.error( 'An error escaped', source, error );
} );
```

Keep the returned function if you will ever want to stop listening, and call `off()` at that point.

There is one registration for the whole page rather than one per editor. You can register as many callbacks as you like, and each unregisters on its own.

The same function is also available as a static field on every editor and context class:

```js
const off = ClassicEditor.onEditorError( ( { error, source } ) => {
	// ...
} );
```

<info-box hint>
	The static field matters when your code is handed an editor class instead of importing one, which is how the framework integrations work: importing anything from CKEditor&nbsp;5 as a value would load the npm build and stop the editor from being loaded from a CDN, so they reach for the class you passed to them. See the [Framework integrations](#framework-integrations) section.
</info-box>

## What does the handler receive?

The callback gets one {@link module:core/errorreporter~EditorErrorData object with two properties}.

1. `error` is the {@link module:utils/ckeditorerror~CKEditorError `CKEditorError`} that escaped.

2. `source` is the editor or the {@link module:core/context~Context `Context`} that the error was attributed to. You can use the property to compare it with your own instance to tell whether the error came from an editor you manage:

```js
onEditorError( ( { error, source } ) => {
	if ( source !== myEditor ) {
		return;
	}

	reportToMyErrorTracker( error );
} );
```

The object that actually threw is in {@link module:utils/ckeditorerror~CKEditorError#context `error.context`}. It is whatever the throwing code had at hand, such as a plugin, a command, the model, or a writer, so it is rarely what you want to act on.

## Which errors are reported?

Only a `CKEditorError` reaches your callback, and only while the editor it belongs to is ready. An error that cannot be attributed at all is not reported.

That covers more than it may sound like. The editor wraps unexpected errors itself, through {@link module:utils/ckeditorerror~CKEditorError.rethrowUnexpectedError `CKEditorError.rethrowUnexpectedError()`}, in {@link module:engine/model/model~Model#change `model.change()`} and {@link module:engine/model/model~Model#enqueueChange `enqueueChange()`}, in view rendering, in `Editor`, and in the emitter mixins. Anything thrown from a listener on a CKEditor&nbsp;5 emitter, therefore, arrives already wrapped, together with the object it came from.

An ordinary `Error` thrown by your own code, outside any editor's emitter or change block, is not an editor error and is not reported.

Nothing is swallowed. Every reported error still reaches the console, exactly as it does without a handler registered.

## Responding to an error

The editor stays as it is. Its content, its selection, and its undo history are all still there, and it keeps working. Whether that state is worth keeping is a judgment only your application can make, which is why the decision is yours. You have three options, and they combine.

### Tell the user and stop editing

Switching the editor to read-only stops further adjustments without throwing anything away, which gives you room to decide:

```js
onEditorError( ( { source } ) => {
	if ( source === myEditor ) {
		myEditor.enableReadOnlyMode( 'error-handling' );
	}
} );
```

The lock is released with {@link module:core/editor/editor~Editor#disableReadOnlyMode `disableReadOnlyMode( 'error-handling' )`} when you are ready to let editing continue. Features may also switch the editor to read-only on their own for errors they consider critical. See the {@link features/read-only read-only mode} guide for how the locks work.

### Recreate the editor

Destroy the instance and create a new one. Declare the reference with `let`, so that you can point it at the new editor afterward:

```js
let myEditor = await ClassicEditor.create( { /* ... */ } );

onEditorError( ( { source } ) => {
	if ( source !== myEditor ) {
		return;
	}

	recreate().catch( error => console.error( error ) );
} );

async function recreate() {
	await myEditor.destroy();

	myEditor = await ClassicEditor.create( { /* ... */ } );
}
```

The callback does not need re-registering. It reads `myEditor` every time it runs, so reassigning the variable is enough for the comparison to match the new editor. Copying the instance into another variable at registration time is what would break it, because that copy keeps pointing at the destroyed editor.

The content of the new editor comes from whatever data you pass in. CKEditor&nbsp;5 does not keep a copy for you, so the data has to come from your own source. See the [Recover the content](#recover-the-content) section.

<info-box warning>
	Do not recreate on every error. An error that keeps happening will make the editor fail, be recreated, fail again, and loop for as long as the page is open. Guard it, for instance, by counting how many times you have recreated the editor and how recently.
</info-box>

In a framework integration this is usually one line, because remounting the component destroys and recreates the editor for you. The component also reattaches its own error callback, so there is nothing for you to re-register.

### Recover the content

You already hold a better copy of the content than the editor could hand you. There are a few places to look, depending on your setup.

* **Your own backend.** If you used the {@link features/autosave autosave feature}, your application has been saving the content at points where it was known to be complete.
* **Cloud Services document storage.** If it is enabled for your environment, `GET /storage/{document_id}` returns the stored content of a document. See the [document storage guide](https://ckeditor.com/docs/cs/latest/guides/collaboration/document-storage.html) for what is stored and how to read it back.

## Framework integrations

The {@link getting-started/integrations/react-default-npm React}, {@link getting-started/integrations/vue-default-npm Vue}, and {@link getting-started/integrations/angular Angular} components report errors through their own callback, so you usually do not register `onEditorError()` yourself.

Errors attributed to a `Context` rather than to a single editor are a separate case. In React the `<CKEditorContext>` component reports them through its own {@link getting-started/integrations/react-default-npm#context-feature `onError`}. Vue and Angular have no context component, so register a callback yourself off the context class.

## The Cloud Services editor bundle

Skip this section unless you upload an editor bundle to Cloud Services, so that it can run an editor on the server without a browser.

Error handling is a browser-side mechanism, and it does not apply there. The bundle exports an editor class, and Cloud Services creates the instance itself, so there is nowhere for you to register a callback. Cloud Services reports errors from server-side scripts on its own instead.

## What we deliberately do not do

* **Nothing restarts.** Not automatically, and not as an option you can switch on.
* **No content is saved or handed back.** An error can happen while an operation is only half applied, so a copy taken at that moment may be a state that never legitimately existed. Rather than hand you data we cannot be sure about, we leave recovery to the sources listed above, which are written at points where the content is known to be complete.
* **No crash history.** The callback reports each error as it happens, and keeping a record of them is up to your application.
* **No per-editor or configuration-based registration.** There is one page-level function, and you compare `source` with your own instance.

## Limitations

Errors thrown while an editor is being created or destroyed are not reported. An editor that is not ready cannot be told apart from any other, and there is little you could do with one that is half-built or already gone.

Those errors are not lost, though. Both `create()` and `destroy()` return a promise, so catch them there:

```js
ClassicEditor
	.create( { /* ... */ } )
	.catch( error => {
		console.error( error );
	} );
```

An error at either stage usually means the editor is being integrated incorrectly rather than that something went wrong at runtime. See the {@link getting-started/setup/editor-lifecycle editor lifecycle} guide for both methods.
