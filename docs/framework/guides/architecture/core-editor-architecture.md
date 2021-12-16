---
category: framework-architecture
order: 20
modified_at: 2021-10-25
---

# Core editor architecture

The [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core) package is relatively simple. It comes with just a handful of classes. The ones you need to know are presented below.

## Editor classes

The {@link module:core/editor/editor~Editor} class represents the base of the editor. It is the entry point of the application, gluing all other components. It provides a few properties that you need to know:

* {@link module:core/editor/editor~Editor#config} &ndash; The configuration object.
* {@link module:core/editor/editor~Editor#plugins} and {@link module:core/editor/editor~Editor#commands} &ndash; The collection of loaded plugins and commands.
* {@link module:core/editor/editor~Editor#model} &ndash; The entry point to the {@link framework/guides/architecture/editing-engine#model editor's data model}.
* {@link module:core/editor/editor~Editor#data} &ndash; The data controller. It controls how data is retrieved from the document and set inside it.
* {@link module:core/editor/editor~Editor#editing} &ndash; The editing controller. It controls how the model is rendered to the user for editing.
* {@link module:core/editor/editor~Editor#keystrokes} &ndash; The keystroke handler. It allows to bind keystrokes to actions.

Besides that, the editor exposes a few of methods:

* {@link module:core/editor/editor~Editor.create `create()`} &ndash; The static `create()` method. Editor constructors are protected and you should create editors using this static method. It allows the initialization process to be asynchronous.
* {@link module:core/editor/editor~Editor#destroy `destroy()`} &ndash; Destroys the editor.
* {@link module:core/editor/editor~Editor#execute `execute()`} &ndash; Executes the given command.
* {@link module:core/editor/utils/dataapimixin~DataApi#setData `setData()`} and {@link module:core/editor/utils/dataapimixin~DataApi#getData `getData()`} &ndash; A way to retrieve the data from the editor and set the data in the editor. The data format is controlled by the {@link module:engine/controller/datacontroller~DataController#processor data controller's data processor} and it does not need to be a string (it can be e.g. JSON if you implement such a {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor}). See, for example, how to {@link features/markdown produce Markdown output}.

For the full list of methods check the {@link api/index API docs} of the editor class you use. Specific editor implementations may provide additional methods.

The {@link module:core/editor/editor~Editor `Editor`} class is a base to implement your own editors. CKEditor 5 Framework comes with a few editor types (for example, {@link module:editor-classic/classiceditor~ClassicEditor classic}, {@link module:editor-inline/inlineeditor~InlineEditor inline}, {@link module:editor-balloon/ballooneditor~BalloonEditor balloon} and {@link module:editor-decoupled/decouplededitor~DecoupledEditor decoupled}) but you can freely implement editors which work and look completely different. The only requirement is that you implement the {@link module:core/editor/editor~Editor} interface.

## Plugins

Plugins are a way to introduce editor features. In CKEditor 5 even {@link module:typing/typing~Typing typing} is a plugin. What is more, the {@link module:typing/typing~Typing} plugin depends on the {@link module:typing/input~Input} and {@link module:typing/delete~Delete} plugins which are responsible for handling the methods of inserting text and deleting content, respectively. At the same time, some plugins need to customize <kbd>Backspace</kbd> behavior in certain cases and handle it by themselves. This leaves the base plugins free of any non-generic knowledge.

Another important aspect of how existing CKEditor 5 plugins are implemented is the split into engine and UI parts. For example, the {@link module:basic-styles/bold/boldediting~BoldEditing} plugin introduces the schema definition, mechanisms rendering `<strong>` tags, commands to apply and remove bold from text, while the {@link module:basic-styles/bold/boldui~BoldUI} plugin adds the UI of the feature (i.e. the button). This feature split is meant to allow for greater reuse (one can take the engine part and implement their own UI for a feature) as well as for running CKEditor 5 on the server side. Finally, there is the {@link module:basic-styles/bold~Bold} plugin that brings both plugins for a full experience.

The tl;dr of this is that:

* Every feature is implemented or at least enabled by a plugin.
* Plugins are highly granular.
* Plugins know everything about the editor.
* Plugins should know as little about other plugins as possible.

These are the rules based on which the official plugins were implemented. When implementing your own plugins, if you do not plan to publish them, you can reduce this list to the first point.

After this lengthy introduction (which is aimed at making it easier for you to digest the existing plugins), the plugin API can be explained.

All plugins need to implement the {@link module:core/plugin~PluginInterface}. The easiest way to do so is by inheriting from the {@link module:core/plugin~Plugin} class. The plugin initialization code should be located in the {@link module:core/plugin~PluginInterface#init `init()`} method (which can return a promise). If some piece of code needs to be executed after other plugins are initialized, you can put it in the {@link module:core/plugin~PluginInterface#afterInit `afterInit()`} method. The dependencies between plugins are implemented using the static {@link module:core/plugin~PluginInterface.requires} property.

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

## Commands

A command is a combination of an action (a callback) and a state (a set of properties). For instance, the `bold` command applies or removes the bold attribute from the selected text. If the text in which the selection is placed has bold applied already, the value of the command is `true`, `false` otherwise. If the `bold` command can be executed on the current selection, it is enabled. If not (because, for example, bold is not allowed in this place), it is disabled.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

All commands need to inherit from the {@link module:core/command~Command} class. Commands need to be added to the editor's {@link module:core/editor/editor~Editor#commands command collection} so they can be executed by using the {@link module:core/editor/editor~Editor#execute `Editor#execute()`} method.

Take this example:

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

Calling `editor.execute( 'myCommand', 'Foo!' )` will log `Foo!` to the console.

To see how state management of a typical command like `bold` is implemented, have a look at some pieces of the {@link module:basic-styles/attributecommand~AttributeCommand} class on which `bold` is based.

The first thing to notice is the {@link module:core/command~Command#refresh `refresh()`} method:

```js
refresh() {
	const doc = this.editor.document;

	this.value = doc.selection.hasAttribute( this.attributeKey );
	this.isEnabled = doc.schema.checkAttributeInSelection(
		doc.selection, this.attributeKey
	);
}
```

This method is called automatically (by the command itself) when {@link module:engine/model/document~Document#event:change any changes are applied to the model}. This means that the command automatically refreshes its own state when anything changes in the editor.

The important thing about commands is that every change in their state as well as calling the `execute()` method fire events (e.g. {@link module:core/command~Command#event-set:{property} `#set:value`} and {@link module:core/command~Command#event-change:{property} `#change:value`} when you change the `#value` property and {@link module:core/command~Command#event:execute `#execute`} when you execute the command).

<info-box>
	Read more about this mechanism in the {@link framework/guides/deep-dive/observables Observables} deep dive guide.
</info-box>

These events make it possible to control the command from the outside. For instance, if you want to disable specific commands when some condition is true (for example, according to your application logic, they should be temporarily disabled) and there is no other, cleaner way to do that, you can block the command manually:

```js
function disableCommand( cmd ) {
	cmd.on( 'set:isEnabled', forceDisable, { priority: 'highest' } );

	cmd.isEnabled = false;

	// Make it possible to enable the command again.
	return () => {
		cmd.off( 'set:isEnabled', forceDisable );
		cmd.refresh();
	};

	function forceDisable( evt ) {
		evt.return = false;
		evt.stop();
	}
}

// Usage:

// Disabling the command.
const enableBold = disableCommand( editor.commands.get( 'bold' ) );

// Enabling the command again.
enableBold();
```

The command will now be disabled as long as you do not {@link module:utils/emittermixin~EmitterMixin#off off} this listener, regardless of how many times `someCommand.refresh()` is called.

By default, editor commands are disabled when the editor is in the {@link module:core/editor/editor~Editor#isReadOnly read-only} mode. However, if your command does not change the editor data and you want it to stay enabled in the read-only mode, you can set the {@link module:core/command~Command#affectsData `affectsData`} flag to `false`:

```js
class MyAlwaysEnabledCommand extends Command {
	constructor( editor ) {
		super( editor );

		// This command will remain enabled even when the editor is read-only.
		this.affectsData = false;
	}
}
```

The {@link module:core/command~Command#affectsData `affectsData`} flag will also affect the command in {@link features/read-only#related-features other editor modes} that restrict user write permissions.

<info-box>
	The `affectsData` flag is set to `true` by default for all editor commands and, unless your command should be enabled when the editor is read-only, you do not need to change it. Also, please keep in mind that the flag is immutable during the lifetime of the editor.
</info-box>

## Event system and observables

CKEditor 5 has an event-based architecture so you can find {@link module:utils/emittermixin~EmitterMixin} and {@link module:utils/observablemixin~ObservableMixin} mixed all over the place. Both mechanisms allow for decoupling the code and make it extensible.

Most of the classes that have already been mentioned are either emitters or observables (observable is an emitter, too). An emitter can emit (fire) events as well as listen to them.

```js
class MyPlugin extends Plugin {
	init() {
		// Make MyPlugin listen to someCommand#execute.
		this.listenTo( someCommand, 'execute', () => {
			console.log( 'someCommand was executed' );
		} );

		// Make MyPlugin listen to someOtherCommand#execute and block it.
		// You listen with a high priority to block the event before
		// someOtherCommand's execute() method is called.
		this.listenTo( someOtherCommand, 'execute', evt => {
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

The second listener to `'execute'` shows one of the very common practices in CKEditor 5 code. Basically, the default action of `'execute'` (which is calling the `execute()` method) is registered as a listener to that event with a default priority. Thanks to that, by listening to the event using `'low'` or `'high'` priorities you can execute some code before or after `execute()` is really called. If you stop the event, then the `execute()` method will not be called at all. In this particular case, the {@link module:core/command~Command#execute `Command#execute()`} method was decorated with the event using the {@link module:utils/observablemixin~ObservableMixin#decorate `ObservableMixin#decorate()`} function:

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

<info-box>
	Check out the {@link framework/guides/deep-dive/event-system event system deep dive guide} and the {@link framework/guides/deep-dive/observables observables deep dive guide} to learn more about the advanced usage of events and observables with some additional examples.
</info-box>

Besides decorating methods with events, observables allow to observe their chosen properties. For instance, the `Command` class makes its `#value` and `#isEnabled` observable by calling {@link module:utils/observablemixin~ObservableMixin#set `set()`}:

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

Observables have one more feature which is widely used by the editor (especially in the UI library) &mdash; the ability to bind the value of one object's property to the value of some other property or properties (of one or more objects). This, of course, can also be processed by callbacks.

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

You can also find more about data bindings in the user interface in the {@link framework/guides/architecture/ui-library UI library architecture} guide.

## Read next

Once you have learned how to create plugins and commands you can read how to implement real editing features in the {@link framework/guides/architecture/editing-engine Editing engine} guide.
