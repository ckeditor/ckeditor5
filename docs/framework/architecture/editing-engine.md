---
category: framework-architecture
meta-title: Editing engine | CKEditor 5 Framework Documentation
order: 30
---

# Editing engine

The [`@ckeditor/ckeditor5-engine`](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine) package is the largest package in CKEditor&nbsp;5. This guide introduces the main architecture and key concepts. More detailed guides are available for specific topics.

**Development tip:** We recommend using the official CKEditor&nbsp;5 inspector for development and debugging. It provides valuable information about the editor's internal state, including data structures, selection, commands, and more.

## Overview

The editing engine uses a Model-View-Controller (MVC) architecture. While the engine does not enforce a specific structure, most implementations follow this pattern:

[{@img assets/img/framework-architecture-engine-diagram.png Diagram of the engine's MVC architecture.}](%BASE_PATH%/assets/img/framework-architecture-engine-diagram.png)

The architecture has three layers: **model**, **controller**, and **view**. There is one **model document** that gets **converted** into two separate views: the **editing view** and the **data view**. These views represent different things:
* The editing view shows the content users see in the browser and interact with
* The data view handles the editor's input and output data in a format the data processor understands

Both views use virtual DOM structures (custom, DOM-like structures) that converters and features work with. These structures are then **rendered** to the actual DOM.

The green blocks in the diagram represent code from editor features (plugins). Features control what changes happen to the model, how those changes convert to the view, and how the model updates based on events.

Let's explore each layer separately.

## Model

The model uses a DOM-like tree structure made of {@link module:engine/model/element~ModelElement elements} and {@link module:engine/model/text~ModelText text nodes}. Unlike the actual DOM, both elements and text nodes in the model can have attributes.

Like the DOM, the model structure lives inside a {@link module:engine/model/document~ModelDocument document} that contains {@link module:engine/model/document~ModelDocument#roots root elements}. The model and view can both have multiple roots. The document also holds the {@link module:engine/model/documentselection~ModelDocumentSelection selection} and the {@link module:engine/model/history~History history of its changes}.

The document, its {@link module:engine/model/schema~ModelSchema schema} and {@link module:engine/model/markercollection~MarkerCollection document markers} are properties of the {@link module:engine/model/model~Model} class. You can access an instance of the `Model` class through {@link module:core/editor/editor~Editor#model `editor.model`}. Besides holding these properties, the model provides the API for changing the document and its markers.

```js
editor.model;                       // -> The data model
editor.model.document;              // -> The document
editor.model.document.getRoot();    // -> The document's root
editor.model.document.selection;    // -> The document's selection
editor.model.schema;                // -> The model's schema
```

### Changing the model

You can only change the document structure, selection, and create elements using the {@link module:engine/model/writer~ModelWriter model writer} Access the writer instance in the {@link module:engine/model/writer~ModelWriter model writer} blocks.

```js
// Inserts text "foo" at the selection position
editor.model.change(writer => {
	writer.insertText('foo', editor.model.document.selection.getFirstPosition());
});

// Apply bold to the entire selection
editor.model.change(writer => {
	for (const range of editor.model.document.selection.getRanges()) {
		writer.setAttribute('bold', true, range);
	}
});
```

All changes within a single `change()` block combine into one undo step (added to a single {@link module:engine/model/batch~Batch batch}). When you nest `change()` blocks, all changes go to the outermost block's batch. For example, this code creates a single undo step:

```js
editor.model.change(writer => {
	writer.insertText('foo', paragraph, 'end'); // foo

	editor.model.change(writer => {
		writer.insertText('bar', paragraph, 'end'); // foobar
	});

	writer.insertText('bom', paragraph, 'end'); // foobarbom
});
```

<info-box>
	All document structure changes happen through {@link module:engine/model/operation/operation~Operation operations}. This concept comes from Operational Transformation (OT), a technology that enables collaboration. OT requires the system to transform every operation by every other operation to determine the result of concurrently applied operations. Because OT requires a small set of operations and CKEditor&nbsp;5 uses a non-linear tree model (not the flat, array-like models typical in OT), the set of potential semantic changes is more complex. Operations are grouped in {@link module:engine/model/batch~Batch batches}, which you can think of as single undo steps.
</info-box>

### Text attributes

Text styles like "bold" and "italic" are stored in the model as text attributes, not as elements (think of them like element attributes). This DOM structure:

```html
<p>
	"Foo "
	<strong>
		"bar"
	</strong>
</p>
```

translates to this model structure:

```html
<paragraph>
	"Foo "  // text node
	"bar"   // text node with bold=true attribute
</paragraph>
```

This representation of inline text styling significantly reduces the complexity of algorithms working with the model. For instance, with this DOM structure:

```html
<p>
	"Foo "
	<strong>
		"bar"
	</strong>
</p>
```

if you have a selection before the letter "b" (`"Foo ^bar"`), is this position inside or outside `<strong>`? With [native DOM Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection), you could get both positions &ndash; one anchored in `<p>` and another in `<strong>`. In CKEditor&nbsp;5, this position translates exactly to `"Foo ^bar"`.

### Selection attributes

How does CKEditor&nbsp;5 know that the selection should "be bold" in the case described above? This matters because it determines whether typed text will be bold.

The selection also {@link module:engine/model/selection~ModelSelection#setAttribute has attributes}. If the selection is at `"Foo ^bar"` with the attribute `bold=true`, you know the user will type bold text.

### Indexes and offsets

In the previous example, inside `<paragraph>` there are two text nodes: `"Foo "` and `"bar"`. If you know how [native DOM Ranges](https://developer.mozilla.org/en-US/docs/Web/API/Range) work, you might ask: "If the selection is at the boundary of two text nodes, is it anchored in the left one, the right one, or in the containing element?"

This is another problem with DOM APIs. Positions outside and inside some element can be visually identical, and they can be anchored inside or outside a text node (if the position is at a text node boundary). This creates complications when implementing editing algorithms.

To avoid these problems and enable real collaborative editing, CKEditor&nbsp;5 uses **indexes** and **offsets**. Indexes relate to nodes (elements and text nodes) while offsets relate to positions. For example, in this structure:

```html
<paragraph>
	"Foo "
	<imageInline></imageInline>
	"bar"
</paragraph>
```

* The `"Foo "` text node is at index `0` in its parent
* `<imageInline>` is at index `1`
* `"bar"` is at index `2`

Meanwhile, offset `x` in `<paragraph>` translates to:

| Offset | Position | Node |
|--------|----------|------|
| `0` | `<paragraph>^Foo <imageInline></imageInline>bar</paragraph>` | `"Foo "` |
| `1` | `<paragraph>F^oo <imageInline></imageInline>bar</paragraph>` | `"Foo "` |
| `4` | `<paragraph>Foo ^<imageInline></imageInline>bar</paragraph>` | `<imageInline>` |
| `6` | `<paragraph>Foo <imageInline></imageInline>b^ar</paragraph>` | `"bar"` |

### Positions, ranges and selections

The engine defines three levels of classes that work with offsets:

* A {@link module:engine/model/position~ModelPosition} instance contains an {@link module:engine/model/position~ModelPosition#path array of offsets} (which is called a "path"). See the {@link module:engine/model/position~ModelPosition#path `Position#path` API documentation} for examples of how paths work.
* A {@link module:engine/model/range~ModelRange} contains two positions: {@link module:engine/model/range~ModelRange#start start} and {@link module:engine/model/range~ModelRange#end end} ones.
* Finally, there is a {@link module:engine/model/selection~ModelSelection} which contains one or more ranges, attributes, and has a direction (whether it was done from left to right or right to left). You can make as many instances of it as you need and you can freely modify it whenever you want. Additionally, there is a single {@link module:engine/model/documentselection~ModelDocumentSelection}. It represents the document's selection and can only be changed through the {@link module:engine/model/writer~ModelWriter model writer}. It is automatically updated when the document structure changes.

### Markers

Markers are a special type of range with these characteristics:

* Managed by {@link module:engine/model/markercollection~MarkerCollection}
* Can only be created and changed through the {@link module:engine/model/writer~ModelWriter model writer}
* Can be synchronized over the network with collaborating clients
* Automatically update when the document structure changes
* Can be converted to the editing view to display in the editor (as {@link module:engine/conversion/downcasthelpers~DowncastHelpers#markerToHighlight highlights} or {@link module:engine/conversion/downcasthelpers~DowncastHelpers#markerToElement elements})
* Can be converted {@link module:engine/conversion/downcasthelpers~DowncastHelpers#markerToData converted to the data view} to store with the document data
* Can be {@link module:engine/conversion/upcasthelpers~UpcastHelpers#dataToMarker loaded with the document data}

Markers are perfect for storing and maintaining additional data related to document portions, such as comments or other users' selections.

### Schema

The {@link module:engine/model/schema~ModelSchema model's schema} defines several aspects of the model structure:

* **Where nodes are allowed or disallowed.** For example, `paragraph` is allowed in `$root`, but not in `heading1`.
* **What attributes are allowed for a node.** For example, `image` can have `src` and `alt` attributes.
* **Additional semantics of model nodes.** For example, `image` is of the "object" type and `paragraph` is of the "block" type.

The schema can also define specifically disallowed children and attributes. This is useful when nodes inherit properties from other nodes but need to exclude certain things:

* **Disallowed nodes in certain places.** For example, a custom `specialParagraph` element inherits all properties from `paragraph` but disallows `imageInline`.
* **Disallowed attributes on a node.** For example, a custom `specialPurposeHeading` element inherits attributes from `heading2` but does not allow the `alignment` attribute.

Features and the engine use this information to make processing decisions. The schema affects:

* What happens with pasted content and what gets filtered out (note: for pasting, conversion is also important. HTML elements and attributes not converted by registered converters are filtered out before becoming model nodes, so the schema does not apply to them)
* Which elements the heading feature can be applied to (which blocks can become headings and which elements are blocks)
* Which elements can be wrapped with a block quote
* Whether the bold button is enabled when the selection is in a heading (and whether text in the heading can be made bold)
* Where the selection can be placed (only in text nodes and on object elements)
* And more

By default, editor plugins configure the schema. We recommend that every editor feature comes with rules that enable and pre-configure it. This ensures plugin users can enable features without worrying about reconfiguring their schema.

**Current limitation:** There is no straightforward way to override the schema pre-configured by features. If you want to override default settings when initializing the editor, the best solution is to replace `editor.model.schema` with a new instance. However, this requires rebuilding the editor.

Access the schema instance at {@link module:engine/model/model~Model#schema `editor.model.schema`} For an extensive guide on using the schema API, see the Schema deep dive guide.

## View

Let's look at the editing engine's architecture again:

[{@img assets/img/framework-architecture-engine-diagram.png Diagram of the engine's MVC architecture.}](%BASE_PATH%/assets/img/framework-architecture-engine-diagram.png)

We have discussed the topmost layer &ndash; the model. The model layer creates an abstraction over the data. Its format was designed to allow storing and modifying data conveniently while enabling complex features. Most features operate on the model (reading from it and changing it).

The view, on the other hand, is an abstract representation of the DOM structure that should be presented to the user for editing and that should (in most cases) represent the editor's input and output (the data returned by `editor.getData()`, data set by `editor.setData()`, pasted content, etc.).

This means:

* The view is another custom structure
* It resembles the DOM. While the model's tree structure only slightly resembled the DOM (for example, by introducing text attributes), the view is much closer. In other words, it is a **virtual DOM**
* There are two "pipelines": the [**editing pipeline**](#editing-pipeline) (also called the "editing view") and the [**data pipeline**](#data-pipeline) (the "data view"). Think of them as two separate views of one model. The editing pipeline renders and handles the DOM that users see and can edit. The data pipeline is used when you call `editor.getData()`, `editor.setData()`, or paste content into the editor
* The views are rendered to the DOM by the {@link module:engine/view/renderer~ViewRenderer}, which handles all the quirks required to tame `contentEditable` used in the editing pipeline

The two views are visible in the API:

```js
editor.editing;                 // The editing pipeline (EditingController)
editor.editing.view;            // The editing view's controller
editor.editing.view.document;   // The editing view's document
editor.data;                    // The data pipeline (DataController)
```

<info-box>
	The data pipeline does not have a document and a view controller. It operates on detached view structures created for processing data.

	The data pipeline is much simpler than the editing pipeline. In the following sections, we'll discuss the editing view.

	Refer to the {@link module:engine/controller/editingcontroller~EditingController}'s and {@link module:engine/controller/datacontroller~DataController}'s API documentation for more details.
</info-box>

### Element types and custom data

The structure of the view resembles the structure in the DOM closely. The semantics of HTML is defined in its specification. The view structure comes "DTD-free," so to provide additional information and to better express the semantics of the content, the view structure implements six element types ({@link module:engine/view/containerelement~ViewContainerElement}, {@link module:engine/view/attributeelement~ViewAttributeElement}, {@link module:engine/view/emptyelement~ViewEmptyElement}, {@link module:engine/view/rawelement~ViewRawElement}, {@link module:engine/view/uielement~ViewUIElement}, and {@link module:engine/view/editableelement~ViewEditableElement}) and so-called {@link module:engine/view/element~ViewElement#getCustomProperty "custom properties"} (that is custom element properties which are not rendered). This additional information provided by the editor features is then used by the {@link module:engine/view/renderer~ViewRenderer} and [converters](#conversion).

The element types are:

* **Container element** &ndash; Elements that build the content structure. Used for block elements like `<p>`, `<h1>`, `<blockQuote>`, `<li>`, etc.
* **Attribute element** &ndash; Elements that cannot hold container elements inside them. Most model text attributes convert to view attribute elements. Used mostly for inline styling elements like `<strong>`, `<i>`, `<a>`, `<code>`. The view writer flattens similar attribute elements. For example, `<a href="..."><a class="bar">x</a></a>` automatically optimizes to `<a href="..." class="bar">x</a>`.
* **Empty element** &ndash; Elements that must not have child nodes, like `<img>`.
* **UI element** &ndash; Elements that are not part of the "data" but need to be "inlined" in the content. The selection ignores them (jumps over them) as does the view writer in general. The contents and events from these elements are also filtered out.
* **Raw element** &ndash; Elements that work as data containers ("wrappers," "sandboxes") but their children are transparent to the editor. Useful when non-standard data must be rendered but the editor should not be concerned with what it is or how it works. Users cannot put the selection inside a raw element, split it into smaller chunks, or directly modify its content.
* **Editable element** &ndash; Elements used as "nested editable elements" of non-editable content fragments. For example, a caption in an image widget, where the `<figure>` wrapping the image is not editable (it is a widget) and the `<figcaption>` inside it is an editable element.

Additionally, you can define {@link module:engine/view/element~ViewElement#getCustomProperty custom properties} to store information like:

* Whether an element is a widget (added by {@link module:widget/utils~toWidget `toWidget()`})
* How an element should be marked when a [marker](#markers) highlights it
* Whether an element belongs to a certain feature &ndash; if it is a link, progress bar, caption, etc.

#### Non-semantic views

Not all view trees need to (or can) be built with semantic element types. View structures generated directly from input data (for instance, pasted HTML or with `editor.setData()`) consist only of {@link module:engine/view/element~ViewElement base element} instances. These view structures are (usually) converted to model structures and then converted back to view structures for editing or data retrieval, at which point they become semantic views again.

The additional information in semantic views and the special operations feature developers want to perform on those trees (compared to simple tree operations on non-semantic views) means both structures need to be [modified by different tools](#changing-the-view).

We'll explain [conversion](#conversion) later in this guide. For now, just know that there are semantic views for rendering and data retrieval, and non-semantic views for data input.

### Changing the view

Do not change the view manually unless you really know what you are doing. If the view needs to change, in most cases the model should change first. Then, the changes you apply to the model are converted to the view by specific converters ([conversion](#conversion) is covered below).

You may need to change the view manually if the cause of the change is not represented in the model. For example, the model does not store information about focus, which is a {@link module:engine/view/document~ViewDocument#isFocused property of the view}. When focus changes, and you want to represent that in an element is a class, you need to change that class manually.

For that, like in the model, use the `change()` block (of the view) where you will have access to the view downcast writer.

```js
editor.editing.view.change(writer => {
	writer.insert(position, writer.createText('foo'));
});
```

<info-box>
	There are two view writers:

	* {@link module:engine/view/downcastwriter~ViewDowncastWriter} &ndash; available in the `change()` blocks, used during downcasting the model to the view. It operates on a "semantic view" so a view structure which differentiates between different types of elements (see [Element types and custom data](#element-types-and-custom-data)).
	* {@link module:engine/view/upcastwriter~ViewUpcastWriter} &ndash; a writer to be used when pre-processing the "input" data (for example, pasted content) which usually happens before the conversion (upcasting) to the model. It operates on ["non-semantic views"](#non-semantic-views).
</info-box>

### Positions

Like [in the model](#positions-ranges-and-selections), there are 3 levels of classes in the view that describe points in the view structure: **positions**, **ranges**, and **selections**. A position is a single point in the document. A range consists of two positions (start and end). A selection consists of one or more ranges and has a direction (left to right or right to left).

A view range is similar to its [DOM counterpart](https://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html). View positions are represented by a parent and an offset in that parent. This means, unlike model offsets, view offsets describe:

* Points between child nodes of the position's parent if it is an element
* Or points between characters of a text node if the position's parent is a text node

Therefore, view offsets work more like model indexes than model offsets.

| Parent | Offset | Position |
|--------|--------|----------|
| `<p>` | `0` | `<p>^Foo<img></img>bar</p>` |
| `<p>` | `1` | `<p>Foo^<img></img>bar</p>` |
| `<p>` | `2` | `<p>Foo<img></img>^bar</p>` |
| `<img>` | `0` | `<p>Foo<img>^</img>bar</p>` |
| `Foo` | `1` | `<p>F^oo<img></img>bar</p>` |
| `Foo` | `3` | `<p>Foo^<img></img>bar</p>` |

As you can see, two of these positions represent what you might consider the same point in the document:

* `{ parent: paragraphElement, offset: 1 }`
* `{ parent: fooTextNode, offset: 3 }`

Some browsers (Safari, Chrome, and Opera) consider them identical when used in a selection and often normalize the first position (anchored in an element) to a position anchored in a text node (the second position). Do not be surprised if the view selection is not directly where you expect it to be. The good news is that the CKEditor&nbsp;5 renderer can tell that two positions are identical and avoids unnecessarily re-rendering the DOM selection.

<info-box>
	Sometimes in the documentation you will find positions marked in HTML with `{}` and `[]` characters. The difference is that `{}` indicates positions anchored in text nodes and `[]` indicates positions in elements. For instance:

	```html
	<p>{Foo]<b>Bar</b></p>
	```

	describes a range that starts in the text node `Foo` at offset `0` and ends in the `<p>` element at offset `1`.
</info-box>

The inconvenient representation of DOM positions is yet another reason to think about and work with model positions.

### Observers

To create a safer and more useful abstraction over native DOM events, the view implements the concept of {@link module:engine/view/observer/observer~Observer observers}. This improves the editor's testability and simplifies listeners added by editor features by transforming native events into a more useful form.

An observer listens to one or more DOM events, does preliminary processing, and then fires a custom event on the {@link module:engine/view/document~ViewDocument view document}. An observer creates an abstraction not only on the event itself, but also on its data. Ideally, an event is consumer should not have any access to the native DOM.

By default, the view adds these observers:

* {@link module:engine/view/observer/mutationobserver~MutationObserver}
* {@link module:engine/view/observer/selectionobserver~SelectionObserver}
* {@link module:engine/view/observer/focusobserver~FocusObserver}
* {@link module:engine/view/observer/keyobserver~KeyObserver}
* {@link module:engine/view/observer/fakeselectionobserver~FakeSelectionObserver}
* {@link module:engine/view/observer/compositionobserver~CompositionObserver}
* {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver}

Additionally, some features add their own observers. For instance, the {@link module:clipboard/clipboard~Clipboard clipboard feature} adds {@link module:clipboard/clipboardobserver~ClipboardObserver}.

<info-box tip>
	For a complete list of events fired by observers, check the {@link module:engine/view/document~ViewDocument}'s list of events.
</info-box>

You can add your own observer (which should be a subclass of {@link module:engine/view/observer/observer~Observer}) by using the {@link module:engine/view/view~EditingView#addObserver `view.addObserver()`} method. Check the code of existing observers to learn how to write them: [https://github.com/ckeditor/ckeditor5-engine/tree/master/src/view/observer](https://github.com/ckeditor/ckeditor5-engine/tree/master/src/view/observer).

<info-box>
	Since all events are by default fired on {@link module:engine/view/document~ViewDocument}, we recommend that third-party packages prefix their events with a project identifier to avoid name collisions. For example, MyApp's features should fire `myApp:keydown` instead of `keydown`.
</info-box>

## Conversion

We have talked about the model and the view as two completely independent subsystems. It is time to connect them. The three main situations where these two layers meet are:

| Conversion&nbsp;name | Description |
|-----------------|-------------|
| {@link framework/deep-dive/conversion/upcast Data&nbsp;upcasting}  | **Loading the data to the editor.**<br> First, the data (for example, an HTML string) is processed by a {@link module:engine/dataprocessor/dataprocessor~DataProcessor} to a view {@link module:engine/view/documentfragment~ViewDocumentFragment}. Then, this view document fragment is converted to a model {@link module:engine/model/documentfragment~ModelDocumentFragment document fragment}. Finally, the model document's {@link module:engine/model/document~ModelDocument#roots root} is filled with this content. |
| {@link framework/deep-dive/conversion/downcast#downcast-pipelines Data&nbsp;downcasting} | **Retrieving the data from the editor.**<br> First, the content of the model's root is converted to a view document fragment. Then this view document fragment is processed by a data processor to the target data format. |
| {@link framework/deep-dive/conversion/downcast#downcast-pipelines Editing&nbsp;downcasting} | **Rendering the editor content to the user for editing.**<br> This process takes place for the entire time when the editor is initialized. First, the model's root is converted to the view's root once *data upcasting* finishes. After that this view root is rendered to the user in the editor's `contentEditable` DOM element (also called "the editable element"). Then, every time the model changes, those changes are converted to changes in the view. Finally, the view can be re-rendered to the DOM if needed (if the DOM differs from the view). |

Let's look at the diagram of the engine's MVC architecture and see where each conversion process happens:

[{@img assets/img/framework-architecture-engine-diagram.png Diagram of the engine's MVC architecture.}](%BASE_PATH%/assets/img/framework-architecture-engine-diagram.png)

### Data pipeline

{@link framework/deep-dive/conversion/upcast **Data upcasting**} is a process that starts in the bottom right corner of the diagram (in the view layer), passes from the data view through a converter (green box) in the controller layer to the model document in the top right corner. As you can see, it goes from bottom to top, hence "upcasting." Also, it is handled by the data pipeline (the right branch of the diagram), hence "data upcasting." Note: Data upcasting is also used to process pasted content (which is similar to loading data).

{@link framework/deep-dive/conversion/downcast#downcast-pipelines **Data downcasting**} is the opposite process to data upcasting. It starts in the top right corner and goes down to the bottom right corner. Again, the conversion process name matches the direction and the pipeline.

### Editing pipeline

{@link framework/deep-dive/conversion/downcast#downcast-pipelines **Editing downcasting**} is a bit different from the other two processes:

* It takes place in the "editing pipeline" (the left branch of the diagram)
* It does not have a counterpart. There is no editing upcasting because all user actions are handled by editor features listening to [view events](#observers), analyzing what happened, and applying necessary changes to the model. Hence, this process does not involve conversion
* Unlike {@link module:engine/controller/datacontroller~DataController} (which handles the *data pipeline*), {@link module:engine/controller/editingcontroller~EditingController} maintains a single instance of the {@link module:engine/view/document~ViewDocument} view document for its entire life. Every change in the model is converted to changes in that view so changes in that view can then be rendered to the DOM (if needed &ndash; that is, if the DOM actually differs from the view at this stage)

### More information

You can find a more in-depth introduction with examples in the {@link framework/deep-dive/conversion/intro dedicated conversion guide}.

For additional information, you can also check out the {@link tutorials/widgets/implementing-a-block-widget#defining-converters Implementing a block widget} and {@link tutorials/widgets/implementing-an-inline-widget#defining-converters Implementing an inline widget} tutorials.

<!--TODO: upcasting, downcasting, mapping nodes and positions, API.

## Architecture of a typical feature
-->
## Read next

Once you have learned how to implement editing features, it is time to add a UI for them. You can read about the CKEditor&nbsp;5 standard UI framework and UI library in the UI library guide.
