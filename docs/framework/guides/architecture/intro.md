---
category: framework-architecture
order: 10
---

# Introduction

This guide introduces the most important parts of the CKEditor 5 architecture. It is assumed that you have read the {@link framework/guides/overview Framework's overview} and saw some code in the {@link framework/guides/quick-start Quick start} guide. This should help you going through this one.

<info-box>
	CKEditor 5 reached its first alpha version. This means that it is feature complete and that we consider it stable enough for first production integrations. However, this means that **we are going to introduce many breaking changes** before the final 1.0.0 release. Many code refactorings were scheduled for after 1.0.0 alpha so a lot of API, including critical pieces, will still change. The goal is, in most cases, to simplify the API, so please excuse us some more cumbersome pieces. We will thus avoid going too deep into details and creating many code samples, as maintaining them would be a nightmare during the upcoming code changes.
</info-box>

When implementing features you will usually work with these three CKEditor 5 packages:

* [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core) &ndash; The core editor architecture. A couple of core classes and interfaces that glue everything together.
* [`@ckeditor/ckeditor5-engine`](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine) &ndash; The editing engine. The biggest and by far most complex package, implementing the custom data model, the view layer, conversion mechanisms, rendering engine responsible for [taming `contentEditable`](https://medium.com/content-uneditable/contenteditable-the-good-the-bad-and-the-ugly-261a38555e9c) and a lot more.
* [`@ckeditor/ckeditor5-ui`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui) &ndash; The standard UI library. Simple MVC implementation whose main goal is to best fit CKEditor 5 needs.

<!-- TODO link to package pages once https://github.com/cksource/umberto/issues/303 is resolved -->

These packages will be explained one by one.

## Core editor architecture

The [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core) package is relatively simple. It comes with just a handful of classes. The ones you need to know are presented below.

### Editor classes

{@link module:core/editor/editor~Editor} and {@link module:core/editor/standardeditor~StandardEditor} are, respectively, the base editor class and its more typical implementation.

The editor is a root object, gluing all other components. It holds a couple of properties that you need to know:

* {@link module:core/editor/editor~Editor#config} &ndash; The configuration object.
* {@link module:core/editor/editor~Editor#plugins} and {@link module:core/editor/editor~Editor#commands} &ndash; The collection of loaded plugins and commands.
* {@link module:core/editor/editor~Editor#document} &ndash; The document. It is the editing engine's entry point.
* {@link module:core/editor/editor~Editor#data} &ndash; The data controller (there is also the {@link module:core/editor/editor~Editor#editing editing controller} but [we plan to merge it](https://github.com/ckeditor/ckeditor5-engine/issues/678) into the data controller). It is a set of high-level utilities to work on the document,
* {@link module:core/editor/standardeditor~StandardEditor#keystrokes} &ndash; The keystroke handler. It allows to bind keystrokes to actions.

Besides that, the editor exposes a few of methods:

* {@link module:core/editor/editor~Editor.create `create()`} &ndash; The static `create()` method. Editor constructors are protected and you should create editors using this static method. It allows the initialization process to be asynchronous.
* {@link module:core/editor/editor~Editor#destroy `destroy()`} &ndash; Destroys the editor.
* {@link module:core/editor/editor~Editor#setData `setData()`} and {@link module:core/editor/editor~Editor#getData `getData()`} &ndash; A way to retrieve data from the editor and set data in the editor. The data format is controlled by the {@link module:engine/controller/datacontroller~DataController#processor data controller's data processor} and it does not need to be a string (it can be e.g. JSON if you implement such a {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor}). See, for example, how to {@link features/markdown produce Markdown output}.
* {@link module:core/editor/editor~Editor#execute `execute()`} &ndash; Executes the given command.

The editor classes are a base to implement your own editors. CKEditor 5 Framework comes with a few editor types (for example, {@link module:editor-classic/classiceditor~ClassicEditor classic}, {@link module:editor-inline/inlineeditor~InlineEditor inline} and {@link module:editor-balloon/ballooneditor~BalloonEditor balloon}) but you can freely implement editors which work and look completely different. The only requirement is that you implement the {@link module:core/editor/editor~Editor} and {@link module:core/editor/standardeditor~StandardEditor} interfaces.

<info-box>
	You are right &mdash; the editors mentioned above are classes, not interfaces. This is a part of API that [needs to be improved](https://github.com/ckeditor/ckeditor5/issues/327). Less inheritance, more interfaces and composition. It should also be clear which interfaces a feature requires to work (at the moment it is half of the `StandardEditor`).
</info-box>

### Plugins

Plugins are a way to introduce editor features. In CKEditor 5 even {@link module:typing/typing~Typing typing} is a plugin. What is more, the {@link module:typing/typing~Typing} plugin requires {@link module:typing/input~Input} and {@link module:typing/delete~Delete} plugins which are responsible for handling, methods of inserting text and deleting content, respectively. At the same time, a couple of other plugins need to customize <kbd>Backspace</kbd> behavior in certain cases, which is handled by themselves. This leaves the base plugins free of any non-generic knowledge.

Another important aspect of how existing CKEditor 5 plugins are implemented is the split into engine and UI parts. For example, the {@link module:basic-styles/boldengine~BoldEngine} plugin introduces schema definition, mechanisms rendering `<strong>` tags, commands to apply and remove bold from text, while the {@link module:basic-styles/bold~Bold} plugin adds the UI of the feature (i.e. a button). This feature split is meant to allow for greater reuse (one can take the engine part and implement their own UI for a feature) as well as for running CKEditor 5 on the server side. At the same time, the feature split [is not perfect yet and will be improved](https://github.com/ckeditor/ckeditor5/issues/488).

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

### Commands

A command is a combination of an action (a callback) and a state (a set of properties). For instance, the `bold` command applies or removes bold attribute from the selected text. If the text in which the selection is placed has bold applied already, the value of the command is `true`, `false` otherwise. If the `bold` command can be executed on the current selection, it is enabled. If not (because, for example, bold is not allowed in this place), it is disabled.

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

This method is automatically called (by the command itself) when {@link module:engine/model/document~Document#event:changesDone any changes are applied to the model}. This means that the command automatically refreshes its own state when anything changes in the editor.

The important thing about commands is that every change in their state as well as calling the `execute()` method fires an event (e.g. {@link module:core/command~Command#event:change:{attribute} `change:value`} or {@link module:core/command~Command#event:execute `execute`}).

These events make it possible to control the command from the outside. For instance, if you want to disable specific commands when some condition is true (for example, according to your application's logic, they should be temporarily disabled) and there is no other, cleaner way to do that, you can block the command manually:

```js
const command = editor.commands.get( 'someCommand' );

command.on( 'change:isEnabled', forceDisable, { priority: 'lowest' } );
command.isEnabled = false;

function forceDisabled() {
	this.isEnabled = false;
}
```

The command will now be disabled as long as you will not {@link module:utils/emittermixin~EmitterMixin#off off} this listener, regardless of how many times `someCommand.refresh()` is called.

### Event system and observables

CKEditor 5 has an event-based architecture so you can find {@link module:utils/emittermixin~EmitterMixin} and {@link module:utils/observablemixin~ObservableMixin} mixed all over the place. Both mechanisms allow for decoupling the code and make it extensible.

Most of the classes which were already mentioned are either emitters or observables (observable is an emitter too). Emitter can emit (fire events) as well as listen to them.

```js
class MyPlugin extends Plugin {
	init() {
		// Make MyPlugin listen to someCommand#execute.
		this.listenTo( someCommand, 'execute', () => {
			console.log( 'someCommand was executed' );
		} );

		// Make MyPlugin listen to someOtherCommand#execute and block it.
		// You listen with high priority to block the event before
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

<info-box>
	Observable properties are marked in API documentation strings with the `@observable` keyword but we do not mark them in {@link api/index API documentation} ([yet](https://github.com/ckeditor/ckeditor5-dev/issues/285)).
</info-box>

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

You can find more about bindings in the [UI library](#ui-library) section.

## Editing engine

The [`@ckeditor/ckeditor5-engine`](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine) package is by far the biggest package of all. Therefore, this guide will only scratch the surface here by introducing the main architecture layers and concepts. More detailed guides will follow.

### Overview

The editing engine implements an MVC architecture. The shape of it is not enforced by the engine itself but in most implementations it can be described by this diagram:

[{@img assets/img/framework-architecture-engine-diagram.png Diagram of the engine's MVC architecture.}](%BASE_PATH%/assets/img/framework-architecture-engine-diagram.png)

What you can see are three layers: **model**, **controller** and **view**. There is one **model document** which is **converted** to two views &mdash; the **editing view** and the **data view**. These two views represent, respectively, the content that the user is editing (the DOM structure that you see in the browser) and the editor input and output data (in a format which the plugged data processor understands). Both views feature virtual DOM structures (custom, DOM-like structures) on which converters and features work and which are then **rendered** to the DOM.

The green blocks are the code introduced by editor features (plugins). So features control what changes are done to the model, how they are converted to the view and how the model needs to be changed based on fired events (view's and model's ones).

Let's now talk about each layer separately.

### Model

The model is implemented by a DOM-like tree structure of {@link module:engine/model/element~Element elements} and {@link module:engine/model/text~Text text nodes}. Like in the DOM, its central point is a {@link module:engine/model/document~Document document} which contains {@link module:engine/model/document~Document#roots root elements} (the model, as well as the view, may have multiple roots). The document also holds its {@link module:engine/model/documentselection~DocumentSelection selection}, {@link module:engine/model/history~History history of changes} and {@link module:engine/model/schema~Schema schema}.

All changes made to the document structure are done by applying {@link module:engine/model/operation/operation~Operation operations}. The concept of operations comes from [Operational Transformation](https://en.wikipedia.org/wiki/Operational_transformation) (in short: OT), a technology enabling collaboration functionality. Since OT requires that a system is able to transform every operation by every other one (to figure out the result of concurrently applied operations), the set of operations needs to be small. CKEditor 5 features a non-linear model (normally, OT implementations use flat, array-like models while CKEditor 5 uses a tree structure), hence the set of potential semantic changes is more complex. To handle that, the editing engine implements a small set of operations (six to be precise) and a bigger set of {@link module:engine/model/delta/delta~Delta "deltas"} &mdash; groups of operations with additional semantics attached (there are eleven deltas and the number will grow). Finally, deltas are grouped in {@link module:engine/model/batch~Batch batches}. A batch can be understood as a single undo step.

<info-box>
	<!-- TODO review this with Szymon -->

	The technology implemented by CKEditor 5 is experimental. The subject of applying Operational Transformation to tree structures is not yet well researched and, in early 2015 when we started designing and implementing our own system, we were aware of just one existing and proven implementation (of which there was little information).

	During the last 3 years we changed our approach and reworked the implementation multiple times. In fact, we are still learning about new types of issues and constantly align and improve the engine. One of the most important things that we learned was that implementing OT is just a part of the job on your way to real-time collaborative editing. We needed to create additional mechanisms and change the whole architecture to enable concurrent editing by multiple users with features like undo and ability to display selections of other users.

	As a result of all this, the API and some important concepts are constantly changing. We have the implementation well tested already, but the engine still requires [a lot of cleaning and some implementation tweaks](https://github.com/ckeditor/ckeditor5-engine/issues/1008).

	This means that information from this guide may be a bit confusing when confronted with the existing APIs. For instance, you may find that [model elements and text nodes can be modified directly](https://github.com/ckeditor/ckeditor5-engine/issues/858) (without applying operations). Please keep that in mind, and when in doubt, [report issues](https://github.com/ckeditor/ckeditor5-engine/issues/new).
</info-box>

As mentioned earlier, going into details would make an awfully long article, so only a few more notable facts will be explained here.

#### Text attributes

Text styles such as "bold" and "italic" are not kept in the model as elements but as text attributes (think &mdash; like element attributes). The following DOM structure:

```html
<p>
	"Foo "
	<strong>
		"bar"
	</strong>
</p>
```

would translate to the following model structure:

```html
<paragraph>
	"Foo "  // text node
	"bar"   // text node with bold=true attribute
</paragraph>
```

Such representation of inline text styling allows to significantly reduce the complexity of algorithms operating on the model. For instance, if you have the following DOM structure:

```html
<p>
	"Foo "
	<strong>
		"bar"
	</strong>
</p>
```

and you have a selection before the letter `"b"` (`"Foo ^bar"`), is this position inside or outside `<strong>`? If you use [native DOM Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection), you may get both positions &mdash; one anchored in `<p>` and the other anchored in `<strong>`. In CKEditor 5 this position translates exactly to `"Foo ^bar"`.

#### Selection attributes

OK, but how to let CKEditor 5 know that I want the selection to "be bold" in the case described above? This is important information because it affects whether or not the typed text will be bold, too.

To handle that, selection also {@link module:engine/model/selection~Selection#setAttribute has attributes}. If the selection is placed in `"Foo ^bar"` and it has the attribute `bold=true`, you know that the user will type bold text.

#### Positions

However, it has just been said that inside `<paragraph>` there are two text nodes: `"Foo "` and `"bar"`. If you know how [native DOM Ranges](https://developer.mozilla.org/en-US/docs/Web/API/Range) work you might thus ask: "But if the selection is at the boundary of two text nodes, is it anchored in the left one, the right one, or in the containing element?"

This is, indeed, another problem with DOM APIs. Not only can positions outside and inside some element be identical visually but also they can be anchored inside or outside a text node (if the position is at a text node boundary). This all creates extreme complications when implementing editing algorithms.

To avoid such troubles, and to make collaborative editing possible for real, CKEditor 5 uses the concepts of **indexes** and **offsets**. Indexes relate to nodes (elements and text nodes) while offsets relate to positions. For example, in the following structure:

```html
<paragraph>
	"Foo "
	<image></image>
	"bar"
</paragraph>
```

The `"Foo "` text node is at index `0` in its parent, `<image></image>` is at index `1` and `"bar"` is at index `2`.

On the other hand, offset `x` in `<paragraph>` translates to:

| offset | position                                         | node      |
|--------|--------------------------------------------------|-----------|
| `0`    | `<paragraph>^Foo <image></image>bar</paragraph>` | `"Foo "`  |
| `1`    | `<paragraph>F^oo <image></image>bar</paragraph>` | `"Foo "`  |
| `4`    | `<paragraph>Foo ^<image></image>bar</paragraph>` | `<image>` |
| `6`    | `<paragraph>Foo <image></image>b^ar</paragraph>` | `"bar"`   |

The engine also defines three main classes which operate on offsets:

* A {@link module:engine/model/position~Position} instance contains an {@link module:engine/model/position~Position#path array of offsets} (which is called a "path"). See the examples in {@link module:engine/model/position~Position#path `Position#path` API documentation} to better understand how paths work.
* {@link module:engine/model/range~Range} contains two positions: {@link module:engine/model/range~Range#start start} and {@link module:engine/model/range~Range#end end} ones.
* Finally, there is {@link module:engine/model/selection~Selection} which contains one or more ranges and attributes.

### View

### Controller

## UI library

The standard UI library of CKEditor 5 is [`@ckeditor/ckeditor5-ui`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui). It provides base classes and helpers that allow building a modular UI that seamlessly integrates with other components of the ecosystem.

### Views

Views use [templates](#Templates) to build the UI. They also provide observable interfaces that other features (e.g. [plugins](#Plugins), [commands](#Commands), etc.) can use to change the DOM without any actual interaction with the native API.

#### Definition

A simple input view class can be defined as follows:

```js
class SampleInputView extends View {
	constructor( locale ) {
		super( locale );

		// An entry point to binding observables with DOM attributes,
		// events and text nodes.
		const bind = this.bindTemplate;

		// Views define their interface (state) using observable attributes.
		this.set( {
			isEnabled: false,
			placeholder: ''
		} );

		this.setTemplate( {
			tag: 'input',
			attributes: {
				class: [
					'foo',
					// The value of view#isEnabled will control the presence
					// of the class.
					bind.if( 'isEnabled', 'ck-enabled' ),
				],

				// The HTML "placeholder" attribute is also controlled by the observable.
				placeholder: bind.to( 'placeholder' ),
				type: 'text'
			},
			on: {
				// DOM keydown events will fire the view#input event.
				keydown: bind.to( 'input' )
			}
		} );
	}

	setValue( newValue ) {
		this.element.value = newValue;
	}
}
```

Note that views encapsulate the DOM they render. Because the UI is organized according to the *view-per-tree* rule, it is clear which view is responsible for which part of the UI so it is unlikely that a collision occurs between two features writing to the same DOM node.

More often than not, views become children of other views (collections), nodes in the [UI view tree](#View-collections-and-the-UI-tree):

```js
class ParentView extends View {
	constructor( locale ) {
		super( locale );

		const childA = new SampleInputView( locale );
		const childB = new SampleInputView( locale );

		this.setTemplate( {
			tag: 'div',
			children: [
				childA
				childB
			]
		} );
	}
}

const parent = new ParentView( locale );

parent.init();

// Will insert <div><input .. /><input .. /></div>.
document.body.appendChild( parent.element );
```

It is also possible to create standalone views that do not belong to any collection. They must be {@link module:ui/view~View#init initialized} before  injection into DOM:

```js
const view = new SampleInputView( locale );

view.init();

// Will insert <input class="foo" type="text" placeholder="" />
document.body.appendChild( view.element );
```

#### Interaction

Features can interact with the state of the DOM via the attributes of the view, so the following:

```js
view.isEnabled = true;
view.placeholder = 'Type some text';
```

will result in:

```html
<input class="foo ck-enabled" type="text" placeholder="Type some text" />
```

Alternatively, they can [bind](#Event-system-and-observables) them directly to their own observable attributes:

```js
view.bind( 'placeholder', 'isEnabled' ).to( observable, 'placeholderText', 'isEnabled' );

// The following will be automatically reflected in the view#placeholder and
// view.element#placeholder HTML attribute in DOM.
observable.placeholderText = 'Some placeholder';
```

Also, since views propagate the DOM events, features can now react to the user actions:

```js
// Each "keydown" event in the input will execute a command.
view.on( 'input', () => {
	editor.execute( 'myCommand' );
} );
```

#### Best practices

A complete view should provide an interface for the features, encapsulating DOM nodes and attributes. Features should not touch the DOM of the view using the native API. Any kind of interaction must be handled by the view that owns an {@link module:ui/view~View#element} to avoid collisions:

```js
// Will change the value of the input.
view.setValue( 'A new value of the input.' );

// WRONG! This is **NOT** the right way to interact with DOM because it collides
// with an observable binding to the #placeholderText. The value will be
// permanently overridden when the state of the observable changes.
view.element.placeholder = 'A new placeholder';
```

### Templates

{@link module:ui/template~Template Templates} render DOM elements and text nodes in the UI library. Used primarily by [views](#Views), they are the lowest layer of the UI connecting the application to the web page.

<info-box>
	Check out the {@link module:ui/template~TemplateDefinition} to learn more about the template syntax and other advanced concepts.
</info-box>

Templates support [observable attribute](#Event-system-and-observables) bindings and handle native DOM events. A very simple template can look like this:

```js
new Template( {
	tag: 'p',
	attributes: {
		class: [
			'foo',
			bind.to( 'className' )
		],
		style: {
			backgroundColor: 'yellow'
		}
	},
	on: {
		click: bind.to( 'clicked' )
	}
	children: [
		'A paragraph.'
	]
} ).render();
```

and renders to an HTML element:

```html
<p class="foo bar" style="background-color: yellow;">A paragraph.</p>
```

where `observable#className` is `"bar"`. The `observable` in the example above can be a [view](#Views) or any object which is {@link module:utils/observablemixin~Observable observable}. When the value of the `className` attribute changes, the template updates the `class` attribute in DOM. From now on the element is permanently bound to the state of an application.

Similarly, when rendered, the template also takes care of DOM events. A binding to the `click` event in the definition makes the `observable` always fire the `clicked` event upon an action in DOM. This way the `observable` provides an event interface of the DOM element and all the communication should pass through it.

### View collections and the UI tree

Views are organized into {@link module:ui/viewcollection~ViewCollection collections} which manage their elements and propagate DOM events even further. Adding or removing a view in a collection moves the {@link module:ui/view~View#element view's element} in DOM to reflect the position.

Each editor UI has a {@link module:core/editor/editorui~EditorUI#view root view}, which can be found under `editor.ui.view`. Such view usually defines the container element of the editor and undermost view collections that other features can populate.

For instance, the `BoxedEditorUiView` class defines two collections:
* {@link module:ui/editorui/boxed/boxededitoruiview~BoxedEditorUIView#top} &ndash; A collection that hosts the toolbar.
* {@link module:ui/editorui/boxed/boxededitoruiview~BoxedEditorUIView#main} &ndash; A collection that contains the editable area of the editor.

It also inherits the {@link module:ui/editorui/editoruiview~EditorUIView#body} collection which resides directly in the `<body>` of the web page and stores floating elements like {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView balloon panels}.

Plugins can populate the root view collections with their children. Such child views become a part of the UI tree and will be managed by the editor, e.g. they will be initialized and destroyed along with the editor.

```js
class MyPlugin extends Plugin {
	init() {
		const editor = this.editor;
		const view = new MyPluginView();

		editor.ui.top.add( view );
	}
}
```

`MyPluginView` can {@link module:ui/view~View#createCollection create own view collections} and populate them during the life cycle of the editor. There is no limit to the depth of the UI tree, which usually looks like this:

```
EditorUIView
	├── "top" collection
	│	└── ToolbarView
	│		└── "items" collection
	│			├── DropdownView
	│			│	├── ButtonView
	│			│	└── PanelView
	│			├── ButtonViewA
	│			├── ButtonViewB
	│			└── ...
	├── "main" collection
	│	└── InlineEditableUIView
	└── "body" collection
		 ├── BalloonPanelView
		 │	└── "content" collection
		 │		└── ToolbarView
		 ├── BalloonPanelView
		 │	└── "content" collection
		 │		└── ...
		 └── ...
```

### Using the existing components

The framework provides a number of common {@link api/ui components} like {@link module:ui/button/buttonview~ButtonView `ButtonView`} or {@link module:ui/toolbar/toolbarview~ToolbarView `ToolbarView`} that can be helpful when developing a new user interface.

For example, to create a toolbar with a few buttons inside, `ToolbarView` and `ButtonView` classes need to be imported first:

```js
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
```

Create the toolbar and a couple of buttons with labels first. Then append the buttons to the toolbar:

```js
const toolbar = new ToolbarView();
const buttonFoo = new ButtonView();
const buttonBar = new ButtonView();

buttonFoo.set( {
	label: 'Foo',
	withText: true
} );

buttonBar.set( {
	label: 'Bar',
	withText: true
} );

toolbar.items.add( buttonFoo );
toolbar.items.add( buttonBar );
```

The toolbar can now join the [UI tree](##View-collections-and-the-UI-tree) or it can be injected straight into DOM. To keep the example simple, proceed with the latter scenario:

```js
toolbar.init();

document.body.appendChild( toolbar.element );
```

The result should look like this:

{@img assets/img/framework-architecture-toolbar.png 442 A simple toolbar created using existing components.}

The toolbar renders correctly but it does not do much. To execute an action when the button is clicked, a listener must be defined. To shorten the code and instead of two listeners define just one, the buttons can {@link module:utils/emittermixin~EmitterMixin#delegate delegate} the {@link module:ui/button/buttonview~ButtonView#execute `execute`} event to their parent:

```js
buttonFoo.delegate( 'execute' ).to( toolbar );
buttonBar.delegate( 'execute' ).to( toolbar );

toolbar.on( 'execute', evt => {
	console.log( `The "${ evt.source.label }" button was clicked!` );
} );
```

### Keystrokes and focus management

_Coming soon..._

The framework offers built–in classes that help manage keystrokes and focus in the UI. They are particularly useful when it comes to bringing accessibility features to the application.

#### Focus tracker

The {@link module:utils/focustracker~FocusTracker `FocusTracker`} class can observe a number of HTML elements and determine if one of them is focused either by the user (clicking, typing) or using the `HTMLElement.focus()` DOM method.

```js
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

// ...

const focusTracker = new FocusTracker();
```

To register elements in the tracker, use the {@link module:utils/focustracker~FocusTracker#add `add()`} method:

```js
focusTracker.add( document.querySelector( '.some-element' ) );
focusTracker.add( viewInstance.element );
```

Observing focus tracker's {@link module:utils/focustracker~FocusTracker#isFocused `isFocused`} attribute allows to determine whether one of the registered elements is currently focused:

```js
focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
	if ( isFocused ) {
		console.log( 'The', focusTracker.focusedElement, 'is focused now.' );
	} else {
		console.log( 'The elements are blurred.' );
	}
} );
```

This information is useful when implementing a certain type of UI whose behavior depends on the focus, for example, contextual panels and floating balloons containing forms should hide when the user decides to abandon them.

#### Keystroke handler

The {@link module:utils/keystrokehandler~KeystrokeHandler `KeystrokeHandler`} listens to the keystroke events fired by an HTML element or any of its descendants and executes pre–defined actions when the keystroke is pressed. Usually, each [view](#Views) creates its own keystroke handler instance which takes care of the keystrokes fired by the elements the view has rendered.

```js
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

// ...

const keystrokeHandler = new KeystrokeHandler();
```

To define the scope of the keystroke handler in DOM, use the {@link module:utils/keystrokehandler~KeystrokeHandler#listenTo `listenTo()`} method:

```js
keystrokeHandler.listenTo( document.querySelector( '.some-element' ) );
keystrokeHandler.listenTo( viewInstance.element );
```

<info-box>
	Check out the list of {@link module:utils/keyboard#keyCodes known key names} supported by the keystroke handler.
</info-box>

Keystroke action callbacks are functions. To prevent the default action of the keystroke and stop further propagation, use the `cancel()` function provided in the callback.

```js
keystrokeHandler.set( 'Tab', ( keyEvtData, cancel ) => {
	console.log( 'Tab was pressed!' );

	// This keystroke has been handled and can be canceled.
	cancel();
} );
```

<info-box>
	There is also an {@link module:core/editingkeystrokehandler~EditingKeystrokeHandler `EditingKeystrokeHandler`} class which has the same API as `KeystrokeHandler` but it offers direct keystroke bindings to editor commands.

	Usually, the editor provides such keystroke handler under the {@link module:core/editor/standardeditor~StandardEditor#keystrokes `editor.keystrokes`} property so any plugin can register keystrokes associated with editor commands. For example, the {@link module:undo/undo~Undo `Undo`} plugin registers `editor.keystrokes.set( 'Ctrl+Z', 'undo' );` to execute its "undo" command.
</info-box>

When multiple callbacks are assigned to the same keystroke, priorities can be used to decide which one should be handled first and whether other callbacks should be executed at all:

```js
keystrokeHandler.set( 'Ctrl+A', ( keyEvtData ) => {
	console.log( 'A normal priority listener.' );
} );

keystrokeHandler.set( 'Ctrl+A', ( keyEvtData ) => {
	console.log( 'A high priority listener.' );

	// The normal priority listener will not be executed.
	cancel();
}, { priority: 'high' } );
```

Pressing <kbd>Ctrl</kbd>+<kbd>A</kbd> will only log:

```
"A high priority listener."
```
