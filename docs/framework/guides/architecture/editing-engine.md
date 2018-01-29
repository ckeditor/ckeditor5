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

The model is implemented by a DOM-like tree structure of {@link module:engine/model/element~Element elements} and {@link module:engine/model/text~Text text nodes}. Like in the DOM, its central point is a {@link module:engine/model/document~Document document} which contains {@link module:engine/model/document~Document#roots root elements} (the model, as well as the view, may have multiple roots). The document also holds its {@link module:engine/model/documentselection~DocumentSelection selection}, {@link module:engine/model/history~History history of changes} and {@link module:engine/model/schema~Schema schema}.

All changes made to the document structure are done by applying {@link module:engine/model/operation/operation~Operation operations}. The concept of operations comes from [Operational Transformation](https://en.wikipedia.org/wiki/Operational_transformation) (in short: OT), a technology enabling collaboration functionality. Since OT requires that a system is able to transform every operation by every other one (to figure out the result of concurrently applied operations), the set of operations needs to be small. CKEditor 5 features a non-linear model (normally, OT implementations use flat, array-like models while CKEditor 5 uses a tree structure), hence the set of potential semantic changes is more complex. To handle that, the editing engine implements a small set of operations (six to be precise) and a bigger set of {@link module:engine/model/delta/delta~Delta "deltas"} &mdash; groups of operations with additional semantics attached (there are eleven deltas and the number will grow). Finally, deltas are grouped in {@link module:engine/model/batch~Batch batches}. A batch can be understood as a single undo step.

<info-box>
	The technology implemented by CKEditor 5 is experimental. The subject of applying Operational Transformation to tree structures is not yet well researched and, in early 2015 when we started designing and implementing our own system, we were aware of just one existing and proven implementation (of which there was little information).

	During the last 3 years we changed our approach and reworked the implementation multiple times. In fact, we are still learning about new types of issues and constantly align and improve the engine. One of the most important things that we learned was that implementing OT is just a part of the job on your way to real-time collaborative editing. We needed to create additional mechanisms and change the whole architecture to enable concurrent editing by multiple users with features like undo and ability to display selections of other users.

	As a result of all this, the API and some important concepts are constantly changing. We have the implementation well tested already, but the engine still requires [a lot of cleaning and some implementation tweaks](https://github.com/ckeditor/ckeditor5-engine/issues/1008).

	This means that information from this guide may be a bit confusing when confronted with the existing APIs. For instance, you may find that [model elements and text nodes can be modified directly](https://github.com/ckeditor/ckeditor5-engine/issues/858) (without applying operations). Please keep that in mind, and when in doubt, [report issues](https://github.com/ckeditor/ckeditor5-engine/issues/new).
</info-box>

As mentioned earlier, going into details would make an awfully long article, so only a few more notable facts will be explained here.

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

### Positions

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

## View

## Controller

## Read next

Once you learnt how to implement editing features, it is time to add a UI for them. You can read about the CKEditor 5's standard UI framework and UI library in the {@link framework/guides/architecture/ui-library UI library} guide.
