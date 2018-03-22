---
category: framework-architecture
order: 30
---

# Editing engine

The [`@ckeditor/ckeditor5-engine`](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine) package is by far the biggest package of all. Therefore, this guide will only scratch the surface here by introducing the main architecture layers and concepts. More detailed guides will follow.

## Overview

The editing engine implements an MVC architecture. The shape of it is not enforced by the engine itself but in most implementations it can be described by this diagram:

[{@img assets/img/framework-architecture-engine-diagram.png Diagram of the engine's MVC architecture.}](%BASE_PATH%/assets/img/framework-architecture-engine-diagram.png)

What you can see are three layers: **model**, **controller** and **view**. There is one **model document** which is **converted** to two views &mdash; the **editing view** and the **data view**. These two views represent, respectively, the content that the user is editing (the DOM structure that you see in the browser) and the editor input and output data (in a format which the plugged data processor understands). Both views feature virtual DOM structures (custom, DOM-like structures) on which converters and features work and which are then **rendered** to the DOM.

The green blocks are the code introduced by editor features (plugins). So features control what changes are done to the model, how they are converted to the view and how the model needs to be changed based on fired events (view's and model's ones).

Let's now talk about each layer separately.

## Model

The model is implemented by a DOM-like tree structure of {@link module:engine/model/element~Element elements} and {@link module:engine/model/text~Text text nodes}. Unlike in the DOM, in the model, both, elements and text nodes can have attributes.

Like in the DOM, the model's structure is contained within a {@link module:engine/model/document~Document document} which contains {@link module:engine/model/document~Document#roots root elements} (the model, as well as the view, may have multiple roots). The document also holds its {@link module:engine/model/documentselection~DocumentSelection selection} and the {@link module:engine/model/history~History history of its changes}.

Finally, the document, its {@link module:engine/model/schema~Schema schema} and {@link module:engine/model/markercollection~MarkerCollection document markers} are properties of the {@link module:engine/model/model~Model}. Instance of the `Model` class is available in the {@link module:core/editor/editor~Editor#model `editor.model`} property. The model, besides holding the properties described above, provides also the API for changing the document and its markers.

```js
editor.model;                       // -> The data model
editor.model.document;              // -> The document
editor.model.document.getRoot();    // -> Document's root
editor.model.document.selection;    // -> Document's selection
editor.model.schema;                // -> Model's schema
```

### Changing the model

All changes in the document structure, of the document's selection and even creation of elements, can only be done by using the {@link module:engine/model/writer~Writer model writer}. Its instance is available in {@link module:engine/model/model~Model#change `change()`} and {@link module:engine/model/model~Model#enqueueChange `enqueueChange()`} blocks.

```js
// Inserts text "foo" at the selection position.
editor.model.change( writer => {
	writer.insertText( 'foo', editor.model.document.selection.getFirstPosition() );
} );

// Apply bold to the entire selection.
editor.model.change( writer => {
	for ( const range of editor.model.document.selection.getRanges() ) {
		writer.setAttribute( 'bold', true, range );
	}
} );
```

All changes done within a single `change()` block are combined into one undo step (they are added to a single {@link module:engine/model/batch~Batch batch}). When nesting `change()` blocks, all changes are added to the outermost `change()` block's batch. For example, the below code will create a single undo step:

```js
editor.model.change( writer => {
	writer.insertText( 'foo', paragraph, 'end' ); // foo.

	editor.model.change( writer => {
		writer.insertText( 'bar', paragraph, 'end' ); // foobar.
	} );

	writer.insertText( 'bom', paragraph, 'end' ); // foobarbom.
} );
```

<info-box>
	All changes made to the document structure are done by applying {@link module:engine/model/operation/operation~Operation operations}. The concept of operations comes from [Operational Transformation](https://en.wikipedia.org/wiki/Operational_transformation) (in short: OT), a technology enabling collaboration functionality. Since OT requires that a system is able to transform every operation by every other one (to figure out the result of concurrently applied operations), the set of operations needs to be small. CKEditor 5 features a non-linear model (normally, OT implementations use flat, array-like models while CKEditor 5 uses a tree structure), hence the set of potential semantic changes is more complex. To handle that, the editing engine implements a small set of operations and a bigger set of {@link module:engine/model/delta/delta~Delta "deltas"} &mdash; groups of operations with additional semantics attached. Finally, deltas are grouped in {@link module:engine/model/batch~Batch batches}. A batch can be understood as a single undo step.
</info-box>

### Text attributes

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

### Selection attributes

OK, but how to let CKEditor 5 know that I want the selection to "be bold" in the case described above? This is important information because it affects whether or not the typed text will be bold, too.

To handle that, selection also {@link module:engine/model/selection~Selection#setAttribute has attributes}. If the selection is placed in `"Foo ^bar"` and it has the attribute `bold=true`, you know that the user will type bold text.

### Indexes and offsets

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

### Positions, ranges and selections

The engine also defines three levels of classes which operate on offsets:

* A {@link module:engine/model/position~Position} instance contains an {@link module:engine/model/position~Position#path array of offsets} (which is called a "path"). See the examples in {@link module:engine/model/position~Position#path `Position#path` API documentation} to better understand how paths work.
* {@link module:engine/model/range~Range} contains two positions: {@link module:engine/model/range~Range#start start} and {@link module:engine/model/range~Range#end end} ones.
* Finally, there is a {@link module:engine/model/selection~Selection} which contains one or more ranges and attributes. You can make as many instances of it as you needed and you can freely modify it whenever you want.  Additionally, there is a single {@link module:engine/model/documentselection~DocumentSelection}. It represents the document's selection and can only be changed through the {@link module:engine/model/writer~Writer model writer}. It is automatically updated when the document's structure is changed.

### Markers

Markers are a special type of ranges.

* They are managed by {@link module:engine/model/markercollection~MarkerCollection}.
* They can only be created and changed through the {@link module:engine/model/writer~Writer model writer}.
* They cane be synchronized over the network with other collaborating clients.
* They are automatically updated when the document's structure is changed.
* They can be converted to attributes or elements in the [view](#view).

This makes them ideal for storing and maintaining additional data in the model – such as comments, selections of other users, etc.

### Schema

The {@link module:engine/model/schema~Schema model's schema} defines several aspects of how the model should look:

* where a node is allowed or disallowed (e.g. `paragraph` is allowed in `$root`, but not in `heading1`),
* what attributes are allowed on a certain node (e.g. `image` can have `src` and `alt` attributes),
* additional semantics of model nodes (e.g. `image` is of the "object" type and paragraph of the "block" type).

This information is then used by features and the engine to make decisions how to process the model. For instance, the information from the schema will affect:

* what happens with a pasted content - what is filtered out (note: in case of pasting the other important mechanism is the conversion – HTML elements and attributes which are not upcasted by any of the registered converters are filtered out before they even become model nodes, so the schema is not applied to them; we'll cover conversion later in this guide),
* to which elements the heading feature can be applied (which blocks can be turned to headings and which elements are blocks in the first place),
* which elements can be wrapped with a block quote,
* whether the bold button is enabled when the selection is in a heading (and whether text in this heading can be bolded),
* where the selection can be placed (which is – only in text nodes and on object elements),
* etc.

The schema is, by default, configured by editor plugins. It is recommended that every editor feature come with rules which enable and preconfigure it in the editor. This will make sure that the plugin's user can enable it without worrying to re-configure her/his schema.

<info-box>
	Currently, there is [no straightforward way to override the schema](https://github.com/ckeditor/ckeditor5-engine/issues/1367) preconfigured by features. If you want to override the default settings when initializing the editor, the best solution is to replace `editor.model.schema` with a new instance of. This, however, requires rebuilding the editor.
</info-box>

The instance of the schema is available in {@link module:engine/model/model~Model#schema `editor.model.schema`}. Read an extensive guide about using the schema API in {@link module:engine/model/schema~Schema API docs for the `Schema` class}.

## View

Let's again take a look at the editing engine's architecture:

[{@img assets/img/framework-architecture-engine-diagram.png Diagram of the engine's MVC architecture.}](%BASE_PATH%/assets/img/framework-architecture-engine-diagram.png)

So far, we talked about the topmost layer of this diagram – the model. The role of the model layer is to create an abstraction over the data. Its format was designed to allow storing and modifying the data in the most convenient way, while enabling implementation of complex features. Most features operate (read from it and change it) on the model.

The view, on the other hand, is an abstract representation of the DOM structure which should be presented to the user (for editing) and which should (in most cases) represent the editor's input/output (i.e. data returned by `editor.getData()`, data set by `editor.setData()`, pasted content, etc.).

What this means is that:

* The view is yet another custom structure.
* It resembles the DOM. While the model's tree structure only slightly resembled the DOM (e.g. by introducing text attributes), the view is much closer to the DOM. In other words, it is a **virtual DOM**.
* There are two "pipelines" – the **editing pipeline** (also called the "editing view") and the **data pipeline** ("the data view"). Treat them as two separate views of one model. The editing pipeline renders and handles the DOM which the user sees and can edit. The data pipeline is used when you call `editor.getData()`, `editor.setData()` or paste content into the editor.

The fact that there are two views is visible in the API:

```js
editor.editing;                 // The editing pipeline (EditingController).
editor.editing.view;            // Editing view's controller.
editor.editing.view.document;   // Editing view's document.
editor.data;                    // The data pipeline (DataController).
```

<info-box>
	Technically, the data pipeline does not have a document and a view controller. It operates on detached view structures, created for the purposes of processing a data.

	It is much simpler than the editing pipeline and in the following part of this section we will be talking about the editing view.

	Check out the {@link module:engine/controller/editingcontroller~EditingController}'s and {@link module:engine/controller/datacontroller~DataController}'s API.
</info-box>

### Changing the view

Do not change the view manually, unless you really know what you do. If the view needs to be changed, in most cases, it means that the model should be changed first. Then, the changes you apply to the model are converted ([conversion](#conversion) is covered below) to the view by specific converters.

The view may need to be changed manually if the cause of such a change is not represented in the model. For example, the model does not store information about the focus, which is a {@link module:engine/view/document~Document#isFocused property of the view}. When the focus changes, and you want to represent that in some element's class, you need to change that class manually.

For that, just like in the model, you should use the `change()` block (of the view) in which you will have access to the view writer.

```js
editor.data.view.change( writer => {
	writer.insert( position1, writer.createText( 'foo' ) );
} );
```

### Element types

### Positions

### Observers

## Conversion

TODO: upcasting, downcasting, why and how.

## Read next

Once you learnt how to implement editing features, it is time to add a UI for them. You can read about the CKEditor 5's standard UI framework and UI library in the {@link framework/guides/architecture/ui-library UI library} guide.
