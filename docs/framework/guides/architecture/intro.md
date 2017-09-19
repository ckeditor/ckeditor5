---
category: framework-architecture
order: 10
---

# Introduction

In this guide we will try to introduce all the most important parts of CKEditor 5's architecture. We assume that you have read the {@link framework/guides/overview Framework's overview} and saw some code in the {@link framework/guides/quick-start Quick start} guide. This should help you going through this one.

<info-box>
	CKEditor 5 reached its first alpha version. This means that it is feature complete and that we consider it stable enough for first production integrations. However, this means that **we are going to introduce many breaking changes** before the final 1.0.0 release. Many code refactorings were scheduled for after 1.0.0 alpha so a lot of API, including critical pieces, will still change. The goal is, in most cases, to simplify the API, so please excuse us some more cumbersome pieces. We will also avoid going too deep into details and creating many code samples, maintaining which would be a nightmare during upcoming code changes.
</info-box>

When implementing features you will usually work with these three CKEditor 5 packages:

* [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core) – the core editor architecture – a couple of core classes and interfaces which glue all the things together.
* [`@ckeditor/ckeditor5-engine`](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine) – the editing engine. The biggest and by far most complex package, implementing the custom data model, the view layer, conversion mechanisms, rendering engine responsible for [taming `contentEditable`](https://medium.com/content-uneditable/contenteditable-the-good-the-bad-and-the-ugly-261a38555e9c) and a lot more.
* [`@ckeditor/ckeditor5-ui`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui) – the standard UI library. Simple MVC implementation which main goal is to best fit CKEditor 5's needs.

<!-- TODO link to package pages once https://github.com/cksource/umberto/issues/303 is resolved -->

So, let's tackle one by one.

## Core editor architecture

The [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core) package is relatively simple. It comes with just a handful of classes. We present here the ones you need to know.

### Editor classes

The {@link module:core/editor/editor~Editor} and {@link module:core/editor/standardeditor~StandardEditor} are, respectively, the base editor class and its more typical implementation.

The editor is a root object, gluing all the other components. It holds a couple of properties that you need to know:

* {@link module:core/editor/editor~Editor#config} – the config object,
* {@link module:core/editor/editor~Editor#plugins} and {@link module:core/editor/editor~Editor#commands} – the collection of loaded plugins and commands,
* {@link module:core/editor/editor~Editor#document} – the document – the editing engine's entry point,
* {@link module:core/editor/editor~Editor#data} – the data controller (there's also the {@link module:core/editor/editor~Editor#editing editing controller} but [we plan to merge it](https://github.com/ckeditor/ckeditor5-engine/issues/678) into the data controller) – a set of high-level utils to work on the document,
* {@link module:core/editor/editor~Editor#keystrokes} – the keystroke handler – allows binding keystrokes to actions.

Besides that, the editor exposes a couple of methods:

* {@link module:core/editor/editor~Editor.create `create()`} – the static `create()` method. Editor constructors are protected and you should create editors using this static method. It allows the initialization process to be asynchronous.
* {@link module:core/editor/editor~Editor#destroy `destroy()`} – destroys the editor.
* {@link module:core/editor/editor~Editor#setData `setData()`} and {@link module:core/editor/editor~Editor#getData `getData()`} – a way to retrieve data from the editor and set data in the editor. The data format is controlled by the {@link module:engine/controller/datacontroller~DataController#processor data processor} and it does not need to be a string (can be e.g. JSON if you would implement such a {@link module:engine/dataprocessor~DataProcessor data processor}). See e.g. how to {@link features/markdown produce Markdown output}.
* {@link module:core/editor/editor~Editor#execute `execute()`} – executes the given command.

The editor classes are a base to implement your own editors. CKEditor 5 Framework comes with a couple of editor types (e.g. {@link module:editor-classic/classiceditor~ClassicEditor classic}, {@link module:editor-inline/inlineeditor~InlineEditor inline} and {@link module:editor-balloon/ballooneditor~BalloonEditor balloon}) but you can freely implement editors which work and look completely differently. The only requirement is that you implement the {@link module:core/editor/editor~Editor} and {@link module:core/editor/standardeditor~StandardEditor} interfaces.

<info-box>
	You are right – mentioned editors are classes, not interfaces. This is a part of API [needs to be improved](https://github.com/ckeditor/ckeditor5/issues/327). Less inheritance, more interfaces and composition. It should also be clear which interfaces feature require to work (at the moment it is half of the `StandardEditor`).
</info-box>

### Plugins

Plugins are the way to introduce editor features. In CKEditor 5 even {@link module:typing/typing~Typing typing} is a plugin. What's more – the {@link module:typing/typing~Typing} plugin requires {@link module:typing/input~Input} and {@link module:typing/delete~Delete} plugins which are responsible for handling, respectively, methods of inserting text and deleting content. At the same time, a couple of other plugins need to customize <kbd>Backspace</kbd> behavior in certain cases, which is handled by themselves. This leaves the base plugins free of any non-generic knowledge.

Another important aspect of how existing CKEditor 5 plugins are implemented is the split into engine and UI parts. E.g. the {@link module:basic-styles/boldengine~BoldEngine} plugin introduces schema definition, mechanisms rendering `<strong>` tags, commands to apply and remove bold from text, while the {@link module:basic-styles/bold~Bold} plugin adds UI of the feature (i.e. a button). This feature split is meant to allow for greater reuse (one can take the engine part and implement their own UI for a feature) as well as for running CKEditor 5 on the server side. The feature split, though, [is not yet perfect and will be improved](https://github.com/ckeditor/ckeditor5/issues/488).

The tl;dr of this is that:

* every feature is implemented or at least enabled by a plugin,
* plugins are highly granular,
* plugins know everything about the editor,
* plugins should know as little about other plugins as possible.

These are the rules based on which the official plugins were implemented. When implementing your own plugins, if you do not plan to publish them, you can reduce this list to the first point.

After this lengthy introduction (which aimed at making it easier for you to digest the existing plugins), let's talk about the plugin API.

All plugins needs to implement the {@link module:core/plugin~PluginInterface}. The easiest way to do so is by inheriting from the {@link module:core/plugin~Plugin} class. The plugin initialization code should be located in the {@link module:core/plugin~PluginInterface#init `init()`} method (which can return a promise). If some piece of code needs to be executed after other plugins are initialized, you can put it in the {@link module:core/plugin~PluginInterface#afterInit `afterInit()`} method. The dependencies between plugins are implemented using the static {@link module:core/plugin~PluginInterface.requires} property.

```js
import MyDependency from 'some/other/plugin';

class MyPlugin extends Plugin {
	static get requires() {
		return [ MyDependency ];
	}

	init() {
		// Initialize your plugin here.

		this.editor; // The editor instance which loaded this plugin.
	}
}
```

You can see how to implement a simple plugin in the {@link framework/guides/quick-start Quick start} guide.

### Commands

A command is combination of an action (a callback) and a state (a set of properties). For instance, the `bold` command applies or removes bold attribute from the selected text. If the text in which the selection is placed has bold applied already, the value of the command is `true`, `false` otherwise. If the `bold` command can be executed on the current selection, it is enabled. If not (because e.g. bold is not allowed in this place), it is disabled.

All commands need to inherit from the {@link module:core/command~Command} class. Commands need to be added to editor's {@link module:core/editor/editor~Editor#commands command collection} so they can be executed by using the {@link module:core/editor/editor~Editor#execute `Editor#execute()`} method.

Let's see an example:

```js
class MyCommand extends Command {
	execute( message ) {
		console.log( message );
	}
}

class MyPlugin extends Plugin {
	init() {
		const editor = this.editor;

		editor.commands.add( 'myCommand', new MyCommand( editor ) );
	}
}
```

Now, calling `editor.execute( 'myCommand', 'Foo!' )` will log `Foo!` on the console.

To see how a state management of a typical command like `bold` is implemented, let's see pieces of the {@link module:basic-styles/attributecommand~AttributeCommand} class on which `bold` is based.

First thing to notice is the {@link module:core/command~Command#refresh `refresh()`} method:

```js
refresh() {
	const doc = this.editor.document;

	this.value = doc.selection.hasAttribute( this.attributeKey );
	this.isEnabled = doc.schema.checkAttributeInSelection(
		doc.selection, this.attributeKey
	);
}
```

This method is automatically called (by the command itself) when {@link module:engine/model/document~Document#event:changesDone any changes are applied to the model}. This means that command automatically refreshes its own state when anything changes in the editor.

The important thing about commands is that every change in their state as well as calling the `execute()` method fires an event (e.g. {@link module:core/command~Command#event:change:{attribute} `change:value`} or {@link module:core/command~Command#event:execute `execute`}).

Those events make it possible to control the command from outside. For instance, if you want to disable specific commands when some condition is true (let's say – according to your application's logic, they should be temporarily disabled) and there is no other, cleaner mean to do that, you can block the command manually:

```js
const command = editor.commands.get( 'someCommand' );

command.on( 'change:isEnabled', forceDisable, { priority: 'lowest' } );
command.isEanabled = false;

function forceDisabled() {
	this.isEnabled = false;
}
```

Now, the command will be disabled as long as you won't {@link module:utils/emittermixin~EmitterMixin#off off} this listener, regardless of how many times `someCommand.refresh()` is called.

### Event system and observables

CKEditor 5 has an event-based architecture so you can find {@link module:utils/emittermixin~EmitterMixin} and {@link module:utils/observablemixin~ObservableMixin} mixed all over the place. Both mechanisms allow decoupling the code and make it extensible.

Most of the classes which we already mentioned are either emitters or observables (observable is an emitter too). Emitter can emit (fire events) as well as listening to ones.

```js
class MyPlugin extends Plugin {
	init() {
		// Make MyPlugin listen to someCommand#execute.
		this.listenTo( someCommand, 'execute', () => {
			console.log( 'someCommand was executed' );
		} );

		// Make MyPlugin listen to someOtherCommand#execute and block it.
		// We listen with high priority to block the event before
		// someOtherCommand's execute() method is called.
		this.listenTo( someOtherCommand, 'execute', ( evt ) => {
			evt.stop();
		}, { priority: 'high' } );
	}

	// Inherited from Plugin:
	destroy() {
		// Removes all listeners added with this.listenTo();
		this.stopListening();
	}
}
```

The second listener to `'execute'` shows one of the very common practice in CKEditor 5's code. Basically, the default action of `execute` (which is calling the `execute()` method) is registered as a listener of that event with a default priority. Thanks to that, by listening to the event using `'low'` or `'high'` priorities we can execute some code before or after `execute()` is really called. If we stop the event, then the `execute()` method will not be called at all. In this particular case, the {@link module:core/command~Command#execute `Command#execute()`} method was decorated with the event using the {@link module:utils/observablemixin~ObservableMixin#decorate `ObservableMixin#decorate()`} function:

```js
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

class Command {
	constructor() {
		this.decorate( 'execute' );
	}

	// Will now fire the #execute event automatically.
	execute() {}
}

// Mix ObservableMixin into Command.
mix( Command, ObservableMixin );
```

Besides decorating methods with events, the observables allow to observe their chosen properties. For instance, the `Command` class makes its `#value` and `#isEnabled` observable by calling {@link module:utils/observablemixin~ObservableMixin#set `set()`}:

```js
class Command {
	constructor() {
		this.set( 'value', undefined );
		this.set( 'isEnabled', undefined );
	}
}

mix( Command, ObservableMixin );

const command = new Command();

command.on( 'change:value', ( evt, propertyName, newValue, oldValue ) => {
	console.log(
		`${ propertyName } has changed from ${ oldValue } to ${ newValue }`
	);
} )

command.value = true; // -> 'value has changed from undefined to true'
```

<info-box>
	Observable properties are marked in API doc strings with `@observable` keyword but we do not mark them in {@link api/index API docs} ([yet](https://github.com/ckeditor/ckeditor5-dev/issues/285)).
</info-box>

Observables have one more feature which is widely used by the editor (especially in the UI library) – this is the ability to bind value of one object's property to the value of some other property or properties (of one or more objects). This, of course, can also be processed by callbacks.

Assuming that `target` and `source` are observables and that used properties are observable:

```js
target.bind( 'foo' ).to( source );

source.foo = 1;
target.foo; // -> 1

// Or:
target.bind( 'foo' ).to( source, 'bar' );
source.bar = 1;
target.foo; // -> 1
```

You can find more about bindings in the [UI library](#ui-library) section.

## Editing engine

## UI library
