---
category: update-guides
meta-title: Migrating from the Watchdog | CKEditor 5 Documentation
meta-description: Learn how to move off the removed CKEditor 5 Watchdog, in plain JavaScript and in the React, Vue, and Angular integrations.
menu-title: Migrating from the Watchdog
order: 12
modified_at: 2026-09-07
---

# Migrating from the Watchdog

The Watchdog was removed in CKEditor&nbsp;5 v49. It watched an editor, and when the editor crashed, it destroyed the instance and created a new one with the content it had saved shortly before the crash.

Nothing does that anymore. Errors are reported to you instead, and your application decides what happens next.

This guide covers the move for a plain JavaScript integration and for the React, Vue, and Angular components. It sets out what to delete, what changes, and what has no replacement. For what to do with a reported error, see the {@link getting-started/setup/error-handling error handling} guide.

<info-box warning>
	The React, Vue, and Angular integrations now require CKEditor&nbsp;5 in version 49 or higher. That is where the error reporting they use was introduced.
</info-box>

## What replaces it

One function, `onEditorError()`, which reports the errors that escape a running editor. It is registered once for the whole page and returns a function that unregisters it:

```js
import { onEditorError } from 'ckeditor5';

const off = onEditorError( ( { error, source } ) => {
	if ( source === myEditor ) {
		reportToMyErrorTracker( error );
	}
} );
```

`source` is the editor or context the error was attributed to, so comparing it with your own instance tells you whether the error is yours to handle.

The framework integrations already do this for you and pass the error to the callback they have always had. If you use one of them, you do not register anything yourself for the errors of an editor. Errors attributed to a `Context` are the exception, and only React reports those through a component of its own.

If you relied on the restart itself, you can put it back together out of the same pieces: switch the editor to read-only, recreate it, and give the new one content from your own source. The {@link getting-started/setup/error-handling#responding-to-an-error error handling} guide covers all three.

## Plain JavaScript

### Editor watchdog

Create the editor directly and keep the instance yourself. The watchdog created a new instance on every crash, which is why its documentation told you not to hold on to one. Nothing replaces the instance behind your back anymore, so a variable of your own is enough. If you recreate the editor after an error, as described below, you replace it yourself. Everything that reads the instance then has to read that variable rather than a copy taken once.

Before:

```js
import { ClassicEditor, EditorWatchdog } from 'ckeditor5';

const watchdog = new EditorWatchdog( ClassicEditor );

await watchdog.create( {
	attachTo: document.querySelector( '#editor' )
	// The rest of the editor configuration.
} );

watchdog.on( 'error', ( evt, { error } ) => {
	console.error( error );
} );

// The current instance, which changed on every restart.
watchdog.editor;
```

After:

```js
import { ClassicEditor, onEditorError } from 'ckeditor5';

const editor = await ClassicEditor.create( {
	attachTo: document.querySelector( '#editor' )
	// The rest of the editor configuration.
} );

onEditorError( ( { error, source } ) => {
	if ( source === editor ) {
		console.error( error );
	}
} );
```

If you used `setCreator()` to run code for every new instance, that code moves to where you create the editor; if you recreate after an error, put it in a function both paths call. `setDestructor()` moves to where you destroy it the same way.

### Context watchdog

Create the context yourself and pass it to each editor in its configuration. Editors are no longer added to and removed from a shared object; they are created and destroyed like any other editor.

Before:

```js
import { ClassicEditor, Context, ContextWatchdog } from 'ckeditor5';

const watchdog = new ContextWatchdog( Context );

await watchdog.create( {
	// The context configuration.
} );

await watchdog.add( {
	id: 'editor1',
	type: 'editor',
	config: {
		attachTo: document.querySelector( '#editor-1' )
		// The rest of the editor configuration.
	},
	creator: config => ClassicEditor.create( config )
} );

const editor1 = watchdog.getItem( 'editor1' );

await watchdog.remove( 'editor1' );
await watchdog.destroy();
```

After:

```js
import { ClassicEditor, Context } from 'ckeditor5';

const context = await Context.create( {
	// The context configuration.
} );

const editor1 = await ClassicEditor.create( {
	context,
	attachTo: document.querySelector( '#editor-1' )
	// The rest of the editor configuration.
} );

// Where you used to call `watchdog.remove( 'editor1' )`.
await editor1.destroy();

await context.destroy();
```

<info-box warning>
	The context is yours now. `ContextWatchdog` used to destroy it for you, so make sure something in your application still does. One call is enough: {@link module:core/context~Context#destroy `Context#destroy()`} destroys the editors that use the context as well, the way `watchdog.destroy()` used to.
</info-box>

One callback covers the context and every editor in it. `source` is the editor the error was attributed to, or the `Context` itself when no editor in it claims the error:

```js
import { onEditorError } from 'ckeditor5';

onEditorError( ( { error, source } ) => {
	if ( source === context ) {
		console.error( 'The context failed.', error );
	} else if ( source === editor1 ) {
		console.error( 'Editor 1 failed.', error );
	}
} );
```

Where `itemError` used to hand you the `itemId` you had registered the editor under, `source` is the instance itself. If you identify your editors by id, keep a map from instance to id and look the id up here.

## React

Remove the `disableWatchdog` and `watchdogConfig` props from `<CKEditor>` and `useMultiRootEditor()`, and `watchdogConfig` from `<CKEditorContext>`. The `CKEditor#watchdog` getter goes too; if you read it to reach the current editor instance, read `CKEditor#editor` instead. The `onError` prop stays and keeps its `phase` detail, but no longer receives `willEditorRestart` or `willContextRestart` &ndash; nothing restarts, so there is nothing to announce.

```jsx-diff
  <CKEditor
  	editor={ ClassicEditor }
  	data={ data }
- 	disableWatchdog={ true }
- 	watchdogConfig={ { crashNumberLimit: 5 } }
- 	onError={ ( error, { phase, willEditorRestart } ) => report( error, willEditorRestart ) }
+ 	onError={ ( error, { phase } ) => report( error, phase ) }
  />
```

The same props go from `useMultiRootEditor()`, which takes them in its options object rather than as attributes.

`<CKEditorContext>` changes shape, so it will not compile until you update it. Drop `contextWatchdog`, which used to be the required one, and pass the context class as `context`, which used to be typed as optional even though leaving it out failed at runtime:

```jsx-diff
- import { Context, ContextWatchdog } from 'ckeditor5';
+ import { Context } from 'ckeditor5';

- <CKEditorContext context={ Context } contextWatchdog={ ContextWatchdog }>
+ <CKEditorContext context={ Context }>
```

Its `onReady` now receives only the context; the `ContextWatchdog` it used to pass as a second argument no longer exists. The second argument of `onChangeInitializedEditors` is a `Context` for the same reason.

Three exports were renamed because the value they carry is a `Context` rather than a `ContextWatchdog`:

| Before                         | After                         |
|--------------------------------|-------------------------------|
| `ContextWatchdogContext`       | `CKEditorContextValueContext` |
| `useCKEditorWatchdogContext()` | `useCKEditorContextValue()`   |
| `ContextWatchdogValue`         | `CKEditorContextValue`        |

Inside that value, the `watchdog` member of an initialized context is now `context`, and the `error` member of a failed one is typed `Error` rather than the error details object.

`<CKEditorContext>` reports the errors of the context itself through an `onError` of its own, which takes the same two arguments as the one on `<CKEditor>`:

```jsx
<CKEditorContext
	context={ Context }
	onError={ ( error, { phase } ) => report( error, phase ) }
>
	{ /* ... */ }
</CKEditorContext>
```

### Recreating the editor

Change the `key` of the component, or its `id` if it has one. A new key is a new element, so React unmounts the old one, which destroys the editor, and mounts a fresh one in its place:

```jsx
const [ generation, setGeneration ] = useState( 0 );

<CKEditor
	key={ generation }
	editor={ ClassicEditor }
	data={ data }
	onError={ ( error, { phase } ) => {
		if ( phase === 'runtime' ) {
			setGeneration( current => current + 1 );
		}
	} }
/>
```

Check `phase` before you remount. `onError` also reports an editor that failed to start, and remounting on that only fails again.

The new editor initializes from `data`, so keep that state current from `onChange`. If the configuration also carries initial data through `config.root.initialData`, that wins over the prop, so set the content in one place rather than both.

`useMultiRootEditor()` has no element to re-key, but it takes the same `id`. Either route resets the hook to its options, and note that it hands the current state back as `data` and `attributes` while the options that seed a new editor are `data` and `rootsAttributes`.

## Vue

Remove the `watchdog-config` and `disable-watchdog` props from `<ckeditor>` and `<ckeditor-multi-root>`, and the matching `watchdogConfig` and `disableWatchdog` options from `useMultiRootEditor()`.

<info-box warning>
	Remove the bindings from your templates, rather than leaving them in place. They are no longer declared props, so on `<ckeditor>` Vue passes whatever is left through to the rendered element as a plain attribute instead of ignoring it, and on `<ckeditor-multi-root>` it warns about attributes it cannot apply. Nothing in the type checker will point them out either way.
</info-box>

The `error` event stays. Its second argument describes the error and tells initialization from runtime through its `phase` property. For a runtime error it no longer carries `causesRestart` or the `watchdog` instance, only `phase` and the `editor` the error came from.

```vue-html-diff
  <ckeditor
  	:editor="editor"
  	v-model="data"
- 	:watchdog-config="{ crashNumberLimit: 5 }"
- 	:disable-watchdog="true"
  	@error="onError"
  />
```

```js-diff
- function onError( error, { phase, causesRestart, watchdog, editor } ) {
+ function onError( error, details ) {
  	report( error );
  }
```

`EditorErrorDescription` is a discriminated union, so in TypeScript narrow on `phase` before reading `editor`. Destructuring it out of the argument does not compile:

```ts
function onError( error: Error, details: EditorErrorDescription<ClassicEditor> ) {
	if ( details.phase === 'runtime' ) {
		report( error, details.editor );
	}
}
```

If you type a multi-root editor class, `MultiRootEditorWithWatchdogRelaxedConstructor` was renamed to `MultiRootEditorRelaxedConstructor`. Where the old type mentioned an optional static `EditorWatchdog`, the new one requires a static `onEditorError`, which every editor class has. Only a handwritten editor class has to do anything about it.

<info-box>
	Runtime errors are now reported in cases where they were not before. The runtime half of the `error` event used to be wired up only when a watchdog was actually attached, so for an editor created with `disable-watchdog`, or one whose class did not expose a static `EditorWatchdog`, a handler bound to `@error` never fired at runtime. The event was declared either way, so nothing about the template looked wrong. It fires now, without you changing anything about it. React and Angular did the same for `disableWatchdog`, so a handler you had disabled along with the watchdog starts running there too.
</info-box>

### Sharing a context

Vue never had a way to pass a watchdog, so nothing about the component itself changes here. If you shared a `Context` between editors, you did it through `config.context`, and that still works. What changes is that errors attributed to the context rather than to one of its editors reach no component at all, because Vue has no context component. Register a callback for those and unregister it when the component goes away:

```js
import { onUnmounted } from 'vue';
import { Context } from 'ckeditor5';

const context = await Context.create( { /* ... */ } );

onUnmounted( Context.onEditorError( ( { error, source } ) => {
	if ( source === context ) {
		report( error );
	}
} ) );
```

### Recreating the editor

Change the `:key` of the component. A new key is a new component instance, so Vue unmounts the old one, which destroys the editor, and mounts a fresh one:

```vue
<script setup>
import { ref } from 'vue';

const generation = ref( 0 );

function onError( error, details ) {
	if ( details.phase === 'runtime' ) {
		generation.value++;
	}
}
</script>

<template>
	<ckeditor :key="generation" :editor="editor" v-model="data" @error="onError" />
</template>
```

Check `phase` before you remount, for the same reason as in React: the `error` event reports a failure to start as well.

`v-model` gives the new editor its content, and here it does win over initial data in the configuration. It is debounced by 300&nbsp;ms, though, and destroying the editor cancels an update still waiting, so a remount can lose the last moment of typing. Read `editor.getData()` in the handler first if that matters.

`<ckeditor-multi-root>` is different: re-keying it discards the roots the user added and their attributes, so remount it only if you can supply `modelValue` and `rootsAttributes` back yourself.

## Angular

Remove the `watchdog`, `editorWatchdogConfig`, and `disableWatchdog` inputs from `<ckeditor>`.

```angular-html-diff
  <ckeditor
  	[editor]="Editor"
  	[config]="config"
- 	[watchdog]="contextWatchdog"
- 	[editorWatchdogConfig]="{ crashNumberLimit: 5 }"
- 	[disableWatchdog]="false"
  	(error)="onError( $event )"
  ></ckeditor>
```

The `watchdog` input was the only way the Angular component let you share a context between editors, and it took a `ContextWatchdog` instance you had created yourself. There is no context component in Angular to take that over, so if you used it, create the `Context` yourself and pass it in the editor configuration instead:

```angular-ts
import type { OnDestroy, OnInit } from '@angular/core';
import type { Context, EditorConfig } from 'ckeditor5';

export class MyComponent implements OnInit, OnDestroy {
	public Editor = MyEditor;
	public config?: EditorConfig;

	private context?: Context;

	public async ngOnInit(): Promise<void> {
		this.context = await MyEditor.Context.create( {
			// The context configuration.
		} );

		this.config = { context: this.context };
	}

	public async ngOnDestroy(): Promise<void> {
		await this.context?.destroy();
	}
}
```

```angular-html
<ckeditor *ngIf="config" [editor]="Editor" [config]="config"></ckeditor>
```

<info-box warning>
	The `*ngIf` is not optional. Creating the context is asynchronous, and the component reads its configuration only once, when it creates the editor. Without the guard, Angular renders the template before `Context.create()` resolves. The editor then gets no context, and setting the configuration later changes nothing.
</info-box>

<info-box warning>
	The context is yours now, so destroy it when you are done with it. `ContextWatchdog` used to own that.
</info-box>

The `error` output now carries the error itself. A runtime crash used to arrive as `null`, which is what the watchdog passed where an `EventInfo` would otherwise go, or as `undefined` when the editor was an item of a `ContextWatchdog`. It now carries the `CKEditorError` that escaped, and whatever `create()` rejected with when the editor failed to start. The output is still declared as `unknown`, because those two are different things, so narrow it yourself before reading anything off it.

An error attributed to a `Context` rather than to a single editor is not emitted by the component, which reports only what belongs to its own editor. If you share a context and want those errors too, register your own callback on the context class:

```angular-ts
export class MyComponent implements OnInit, OnDestroy {
	// ...

	private offContextError?: () => void;

	public async ngOnInit(): Promise<void> {
		// ...

		this.offContextError = MyEditor.Context.onEditorError( ( { error, source } ) => {
			if ( source === this.context ) {
				console.error( 'The context failed.', error );
			}
		} );
	}

	public async ngOnDestroy(): Promise<void> {
		this.offContextError?.();

		await this.context?.destroy();
	}
}
```

The `DisabledEditorWatchdog` class was removed. It stood in for a watchdog when `disableWatchdog` was set, which is now the only behavior. The `editor` input no longer requires a static `EditorWatchdog` on the class and requires a static `onEditorError` instead, which every editor class has. Only a handwritten editor class has to do anything about it.

### Recreating the editor

Angular has no key, so hide the component and show it again. The two changes must fall in different ticks: setting the flag to `false` and back to `true` inside one handler renders once, `*ngIf` sees no change, and the component is never destroyed.

The `error` output carries no `phase`, so it cannot tell you whether the editor ever started. Use the `ready` output for that, and recreate only an editor that had been running:

```angular-ts
export class MyComponent {
	public isVisible = true;

	private isReady = false;

	public onReady(): void {
		this.isReady = true;
	}

	public onError(): void {
		if ( !this.isReady ) {
			return;
		}

		this.isReady = false;
		this.isVisible = false;

		setTimeout( () => {
			this.isVisible = true;
		} );
	}
}
```

```angular-html
<ckeditor
	*ngIf="isVisible"
	[editor]="Editor"
	[(ngModel)]="data"
	(ready)="onReady()"
	(error)="onError()"
></ckeditor>
```

Bind the content. Angular's `data` input defaults to an empty string and is merged into the configuration when the editor is created, so a component remounted without a binding comes back holding whatever it was first given. The component has no `dataChange` output, so use `[(ngModel)]`, which it supports as a form control, and import `FormsModule` where the component is declared.

If the editor also shares a `Context`, combine this `*ngIf` with the one from the section above into `*ngIf="config && isVisible"`, and keep `[config]="config"` on the element. Angular allows only one structural directive per element.

The timeout above relies on zone.js running change detection again. In a zoneless application, mark the change yourself with `ChangeDetectorRef#markForCheck()`, or hold `isVisible` in a signal.

## What has no replacement

The Watchdog is gone in full. As described above, restarting and recovering are yours to rebuild, but these parts of it have no equivalent at all:

* **Automatic restart and the content restore that came with it.** For why no content is handed back, and where to recover it from instead, see the {@link getting-started/setup/error-handling#recover-the-content Recover the content} section of the error handling guide.
* **The `crashed` and `crashedPermanently` states**, and with them the watchdog-level `state` property and its `stateChange` event. For an editor's lifecycle, {@link module:core/editor/editor~Editor#state `Editor#state`} is observable and holds `'initializing'`, `'ready'`, or `'destroyed'`. A `Context` has nothing equivalent, so if you read `state` off a `ContextWatchdog`, track that yourself.
* **The `crashes` history.** Errors are reported as they happen, and keeping a record of them is up to your application.
* **The `restart`, `itemError`, and `itemRestart` events.**
* **`setCreator()` and `setDestructor()`** as hooks. The code that ran in them still runs at the place where you create and destroy the editor yourself.
* **`getItem()` and `getItemState()`.** Keep your own reference to each editor, or iterate {@link module:core/context~Context#editors `Context#editors`}, and read `Editor#state` for the health check.
* **The whole watchdog configuration**: `crashNumberLimit`, `minimumNonErrorTimePeriod`, and `saveInterval`. The first two bounded automatic restarts, so if you recreate the editor yourself, bounding it is now your job.

If you used `crashedPermanently` to tell the user that the editor was beyond saving, your own bound is where that goes: the run where it refuses to recreate is the same moment.

Finally, the `@ckeditor/ckeditor5-watchdog` package is gone, along with everything it exported: `Watchdog`, `EditorWatchdog`, `ContextWatchdog`, and their configuration, state, and event types. The `EditorWatchdog` and `ContextWatchdog` static fields that every editor class carried are gone with it.

`ActionsRecorder` is the one exception. It moved to `@ckeditor/ckeditor5-core` rather than being removed, so change the specifier if you imported it from the Watchdog package. Importing it from `ckeditor5` keeps working unchanged.
