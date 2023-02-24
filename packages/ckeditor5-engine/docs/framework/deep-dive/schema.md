---
category: framework-deep-dive
classes: schema-deep-dive
---

# Schema

This article assumes that you have already read the {@link framework/architecture/editing-engine#schema "Schema"} section of the {@link framework/architecture/editing-engine introduction to the editing engine architecture}.

## Quick recap

The editor's schema is available in the {@link module:engine/model/model~Model#schema `editor.model.schema`} property. It defines allowed model structures (how model elements can be nested), allowed attributes (of both elements and text nodes), and other characteristics (inline vs. block, atomicity in regards of external actions). This information is later used by editing features and the editing engine to decide how to process the model, where to enable features, etc.

Schema rules can be defined by using the {@link module:engine/model/schema~Schema#register `Schema#register()`} or the {@link module:engine/model/schema~Schema#extend `Schema#extend()`} methods. The former can be used only once for a given item name which ensures that only a single editing feature can introduce this item. Similarly, `extend()` can only be used for defined items.

Elements and attributes are checked by features separately by using the {@link module:engine/model/schema~Schema#checkChild `Schema#checkChild()`} and the {@link module:engine/model/schema~Schema#checkAttribute `Schema#checkAttribute()`} methods.

## Defining allowed structures

When a feature introduces a model element, it should register it in the schema. Besides defining that such an element may exist in the model, the feature also needs to define where this element can be placed. This information is provided by the {@link module:engine/model/schema~SchemaItemDefinition#allowIn} property of the {@link module:engine/model/schema~SchemaItemDefinition}:

```js
schema.register( 'myElement', {
	allowIn: '$root'
} );
```

This lets the schema know that `<myElement>` can be a child of `<$root>`. The `$root` element is one of the generic nodes defined by the editing framework. By default, the editor names the main root element a `<$root>`, so the above definition allows `<myElement>` in the main editor element.

In other words, this would be correct:

```xml
<$root>
	<myElement></myElement>
</$root>
```

While this would be incorrect:

```xml
<$root>
	<foo>
		<myElement></myElement>
	</foo>
</$root>
```

To declare which nodes are allowed inside the registered element, the {@link module:engine/model/schema~SchemaItemDefinition#allowChildren} property could be used:

```js
schema.register( 'myElement', {
	allowIn: '$root',
	allowChildren: '$text'
} );
```

To allow the following structure:

```xml
<$root>
	<myElement>
		foobar
	</myElement>
</$root>
```

Both the `{@link module:engine/model/schema~SchemaItemDefinition#allowIn}` and `{@link module:engine/model/schema~SchemaItemDefinition#allowChildren}` properties can also be inherited from other `SchemaItemDefinition` items.

<info-box>
	You can read more about the format of the item definition in the {@link module:engine/model/schema~SchemaItemDefinition} API guide.
</info-box>

## Defining additional semantics

In addition to setting allowed structures, the schema can also define additional traits of model elements. By using the `is*` properties, a feature author may declare how a certain element should be treated by other features and by the engine.

Here is a table listing various model elements and their properties registered in the schema:

<table>
	<thead>
		<tr>
			<th rowspan="2">Schema entry</th>
			<th colspan="6">Properties in the <a href="#defining-allowed-structures">definition</a></th>
		</tr>
		<tr>
			<th><a href="#block-elements"><code>isBlock</code></a></th>
			<th><a href="#limit-elements"><code>isLimit</code></a></th>
			<th><a href="#object-elements"><code>isObject</code></a></th>
			<th><a href="#inline-elements"><code>isInline</code></a></th>
			<th><a href="#selectable-elements"><code>isSelectable</code></a></th>
			<th><a href="#content-elements"><code>isContent</code></a></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>$block</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>$container</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>$blockObject</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited1"><sup>[1]</sup></a></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited2"><sup>[2]</sup></a></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited3"><sup>[3]</sup></a></td>
		</tr>
		<tr>
			<td><code>$inlineObject</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited1"><sup>[1]</sup></a></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited2"><sup>[2]</sup></a></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited3"><sup>[3]</sup></a></td>
		</tr>
		<tr>
			<td><code>$clipboardHolder</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>$documentFragment</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>$marker</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>$root</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>$text</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive"><code>true</code></td>
		</tr>
		<tr>
			<td><code>blockQuote</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>caption</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>codeBlock</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>heading1</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>heading2</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>heading3</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>horizontalLine</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited1"><sup>[1]</sup></a></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited2"><sup>[2]</sup></a></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited3"><sup>[3]</sup></a></td>
		</tr>
		<tr>
			<td><code>imageBlock</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited1"><sup>[1]</sup></a></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited2"><sup>[2]</sup></a></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited3"><sup>[3]</sup></a></td>
		</tr>
		<tr>
			<td><code>imageInline</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited1"><sup>[1]</sup></a></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited2"><sup>[2]</sup></a></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited3"><sup>[3]</sup></a></td>
		</tr>
		<tr>
			<td><code>listItem</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>media</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited1"><sup>[1]</sup></a></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited2"><sup>[2]</sup></a></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited3"><sup>[3]</sup></a></td>
		</tr>
		<tr>
			<td><code>pageBreak</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited1"><sup>[1]</sup></a></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited2"><sup>[2]</sup></a></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited3"><sup>[3]</sup></a></td>
		</tr>
		<tr>
			<td><code>paragraph</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>softBreak</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>table</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited1"><sup>[1]</sup></a></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited2"><sup>[2]</sup></a></td>
			<td class="value_positive_inherited"><code>true</code><a href="#inherited3"><sup>[3]</sup></a></td>
		</tr>
		<tr>
			<td><code>tableRow</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
		<tr>
			<td><code>tableCell</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_negative"><code>false</code></td>
			<td class="value_positive"><code>true</code></td>
			<td class="value_negative"><code>false</code></td>
		</tr>
	</tbody>
</table>

<info-box>
	* <span id="inherited1">[1]</span> The value of `isLimit` is `true` for this element because all [objects](#object-elements) are automatically [limit elements](#limit-elements).
	* <span id="inherited2">[2]</span> The value of `isSelectable` is `true` for this element because all [objects](#object-elements) are automatically [selectable elements](#selectable-elements).
	* <span id="inherited3">[3]</span> The value of `isContent` is `true` for this element because all [objects](#object-elements) are automatically [content elements](#content-elements).
</info-box>

### Limit elements

Consider a feature like an image caption. The caption text area should construct a boundary to some internal actions:

* A selection that starts inside should not end outside.
* Pressing <kbd>Backspace</kbd> or <kbd>Delete</kbd> should not delete the area. Pressing <kbd>Enter</kbd> should not split the area.

It should also act as a boundary for external actions. This is mostly enforced by a selection post-fixer that ensures that a selection that starts outside, should not end inside. It means that most actions will either apply to the "outside" of such an element or to the content inside it.

Taken these characteristics, the image caption should be defined as a limit element by using the {@link module:engine/model/schema~SchemaItemDefinition#isLimit `isLimit`} property.

```js
schema.register( 'myCaption', {
	isLimit: true
} );
```

The engine and various features then check it via {@link module:engine/model/schema~Schema#isLimit `Schema#isLimit()`} and can act accordingly.

<info-box>
	"Limit element" does not mean "editable element". The concept of "editability" is reserved for the view and expressed by the {@link module:engine/view/editableelement~EditableElement `EditableElement` class}.
</info-box>

### Object elements

For an image caption like in the example above it does not make much sense to select the caption box, then copy or drag it somewhere else.

A caption without the image it describes makes little sense. The image, however, is more self-sufficient. Most likely users should be able to select the entire image (with all its internals), then copy or move it around. The {@link module:engine/model/schema~SchemaItemDefinition#isObject `isObject`} property should be used to mark such behavior.

```js
schema.register( 'myImage', {
	isObject: true
} );
```
The {@link module:engine/model/schema~Schema#isObject `Schema#isObject()`} can later be used to check this property.

<info-box>
	There are also the `$blockObject` and the `$inlineObject` generic items which have the `isObject` property set to `true`. Most object type items will inherit from `$blockObject` or `$inlineObject` (through `inheritAllFrom`).
</info-box>

<info-box>
	Every object is automatically also:

	* A [limit element](#limit-elements) &ndash; For every element with `isObject` set to `true`, {@link module:engine/model/schema~Schema#isLimit `Schema#isLimit( element )`} will always return `true`.
	* A [selectable element](#selectable-elements) &ndash; For every element with `isObject` set to `true`, {@link module:engine/model/schema~Schema#isSelectable `Schema#isSelectable( element )`} will always return `true`.
	* A [content element](#content-elements) &ndash; For every element with `isObject` set to `true`, {@link module:engine/model/schema~Schema#isContent `Schema#isContent( element )`} will always return `true`.
</info-box>

### Block elements

Generally speaking, content is usually made out of blocks like paragraphs, list items, images, headings, etc. All these elements should be marked as blocks by using {@link module:engine/model/schema~SchemaItemDefinition#isBlock `isBlock`}.

Schema items with the `isBlock` property set are (among others) affecting the {@link module:engine/model/documentselection~DocumentSelection#getSelectedBlocks `Selection#getSelectedBlocks()`} behavior and by that allow setting block level attributes like `alignment` to appropriate elements. 

It is important to remember that a block should not allow another block inside. Container elements like `<blockQuote>`, which can contain other block elements, should not be marked as blocks.

<info-box>
	There are also the `$block` and the `$blockObject` generic items which have the `isBlock` property set to `true`. Most block type items will inherit from `$block` or `$blockObject` (through `inheritAllFrom`).

	Note that every item that inherits from `$block` has `isBlock` set, but not every item with `isBlock` set has to be a `$block`.
</info-box>

### Inline elements

In the editor, all HTML formatting elements such as `<strong>` or `<code>` are represented by text attributes. Therefore, inline model elements are not supposed to be used for these scenarios.

Currently, the {@link module:engine/model/schema~SchemaItemDefinition#isInline `isInline`} property is used for the `$text` token (so, text nodes) and elements such as `<softBreak>`, `<imageInline>` or placeholder elements such as described in the {@link framework/tutorials/implementing-an-inline-widget Implementing an inline widget} tutorial.

The support for inline elements in CKEditor 5 is so far limited to self-contained elements. Because of this, all elements marked with `isInline` should also be marked with `isObject`.

<info-box>
	There is also the `$inlineObject` generic item which has the `isInline` property set to `true`. Most inline object type items will inherit from `$inlineObject` (through `inheritAllFrom`).
</info-box>

### Selectable elements

Elements that users can select as a whole (with all their internals) and then, for instance, copy them or apply formatting, are marked with the {@link module:engine/model/schema~SchemaItemDefinition#isSelectable `isSelectable`} property in the schema:

```js
schema.register( 'mySelectable', {
	isSelectable: true
} );
```

The {@link module:engine/model/schema~Schema#isSelectable `Schema#isSelectable()`} method can later be used to check this property.

<info-box>
	All [object elements](#object-elements) are selectable by default. There are other selectable elements registered in the editor, though. For instance, there is also the `tableCell` model element (rendered as a `<td>` in the editing view) that is selectable while **not** registered as an object. The {@link features/tables#table-selection table selection} plugin takes advantage of this fact and allows users to create rectangular selections made of multiple table cells.
</info-box>

### Content elements

You can tell content model elements from other elements by looking at their representation in the editor data (you can use {@link module:editor-classic/classiceditor~ClassicEditor#getData `editor.getData()`} or {@link module:engine/model/model~Model#hasContent `Model#hasContent()`} to check this out).

Elements such as images or media will **always** find their way into the editor data and this is what makes them content elements. They are marked with the {@link module:engine/model/schema~SchemaItemDefinition#isContent `isContent`} property in the schema:

```js
schema.register( 'myImage', {
	isContent: true
} );
```

The {@link module:engine/model/schema~Schema#isContent `Schema#isContent()`} method can later be used to check this property.

At the same time, elements like paragraphs, list items, or headings **are not** content elements because they are skipped in the editor output when they are empty. From the data perspective they are transparent unless they contain other content elements (an empty paragraph is as good as no paragraph).

<info-box>
	[Object elements](#object-elements) and [`$text`](#generic-items) are content by default.
</info-box>

## Generic items

There are several generic items (classes of elements) available: `$root`, `$container`, `$block`, `$blockObject`, `$inlineObject`, and `$text`. They are defined as follows:

```js
schema.register( '$root', {
	isLimit: true
} );

schema.register( '$container', {
	allowIn: [ '$root', '$container' ]
} );

schema.register( '$block', {
	allowIn: [ '$root', '$container' ],
	isBlock: true
} );

schema.register( '$blockObject', {
	allowWhere: '$block',
	isBlock: true,
	isObject: true
} );

schema.register( '$inlineObject', {
	allowWhere: '$text',
	allowAttributesOf: '$text',
	isInline: true,
	isObject: true
} );

schema.register( '$text', {
	allowIn: '$block',
	isInline: true,
	isContent: true
} );
```

These definitions can then be reused by features to create their own definitions in a more extensible way. For example, the {@link module:paragraph/paragraph~Paragraph} feature will define its item as:

```js
schema.register( 'paragraph', {
	inheritAllFrom: '$block'
} );
```

Which translates to:

```js
schema.register( 'paragraph', {
	allowWhere: '$block',
	allowContentOf: '$block',
	allowAttributesOf: '$block',
	inheritTypesFrom: '$block'
} );
```

And this can be read as:

* The `<paragraph>` element will be allowed in elements in which `<$block>` is allowed (e.g. in `<$root>`).
* The `<paragraph>` element will allow all nodes that are allowed in `<$block>` (e.g. `$text`).
* The `<paragraph>` element will allow all attributes allowed in `<$block>`.
* The `<paragraph>` element will inherit all `is*` properties of `<$block>` (e.g. `isBlock`).

Thanks to the fact that the `<paragraph>` definition is inherited from `<$block>` other features can use the `<$block>` type to indirectly extend the `<paragraph>` definition. For example, the {@link module:block-quote/blockquote~BlockQuote} feature does this:

```js
schema.register( 'blockQuote', {
	inheritAllFrom: '$container'
} );
```

Because `<$block>` is allowed in `<$container>` (see `schema.register( '$block' ...)`), despite the fact that the block quote and paragraph features know nothing about each other, paragraphs will be allowed in block quotes: the schema rules allow chaining.

Taking this even further, if anyone registers a `<section>` element (with the `allowContentOf: '$root'` rule), because `<$container>` is also allowed in `<$root>` (see `schema.register( '$container' ...)`) the `<section>` elements will allow block quotes out–of–the–box.

<info-box>
	You can read more about the format of the item definition in {@link module:engine/model/schema~SchemaItemDefinition}.
</info-box>

### Relations between generic items

Relations between generic items (which one can be used where) can be visualized by the following abstract structure:

```xml
<$root>
	<$block>                <!-- example: <paragraph>, <heading1> -->
		<$text/>
		<$inlineObject/>    <!-- example: <imageInline> -->
	</$block>
	<$blockObject/>         <!-- example: <imageBlock>, <table> -->
	<$container>            <!-- example: <blockQuote> -->
		<$container/> 
		<$block/>
		<$blockObject/>
	</$container>
</$root>
```

The above rules will be met for instance by such a model content:

```xml
<$root>
	<heading1>            <!-- inheritAllFrom: $block -->
		<$text/>          <!-- allowIn: $block -->
	</heading1>
	<paragraph>           <!-- inheritAllFrom: $block -->
		<$text/>          <!-- allowIn: $block -->
		<softBreak/>      <!-- allowWhere: $text -->
		<$text/>          <!-- allowIn: $block --> 
		<imageInline/>    <!-- inheritAllFrom: $inlineObject -->
	</paragraph>
	<imageBlock>          <!-- inheritAllFrom: $blockObject -->
		<caption>         <!-- allowIn: imageBlock, allowContentOf: $block -->
			<$text/>      <!-- allowIn: $block -->
		</caption>
	</imageBlock>
	<blockQuote>                    <!-- inheritAllFrom: $container -->
		<paragraph/>                <!-- inheritAllFrom: $block -->
		<table>                     <!-- inheritAllFrom: $blockObject -->
			<tableRow>              <!-- allowIn: table -->
				<tableCell>         <!-- allowIn: tableRow, allowContentOf: $container -->
					<paragraph>     <!-- inheritAllFrom: $block -->
						<$text/>    <!-- allowIn: $block -->
					</paragraph>
				</tableCell>
			</tableRow>
		</table>
	</blockQuote>
</$root>
```

Which, in turn, has these [semantics](#defining-additional-semantics):

```xml
<$root>                   <!-- isLimit: true -->
	<heading1>            <!-- isBlock: true -->
		<$text/>          <!-- isInline: true, isContent: true -->
	</heading1>
	<paragraph>           <!-- isBlock: true -->
		<$text/>          <!-- isInline: true, isContent: true -->
		<softBreak/>      <!-- isInline: true -->
		<$text/>          <!-- isInline: true, isContent: true --> 
		<imageInline/>    <!-- isInline: true, isObject: true -->
	</paragraph>
	<imageBlock>          <!-- isBlock: true, isObject: true -->
		<caption>         <!-- isLimit: true -->
			<$text/>      <!-- isInline: true, isContent: true -->
		</caption>
	</imageBlock>
	<blockQuote>
		<paragraph/>                <!-- isBlock: true -->
		<table>                     <!-- isBlock: true, isObject: true -->
			<tableRow>              <!-- isLimit: true -->
				<tableCell>         <!-- isLimit: true -->
					<paragraph>     <!-- isBlock: true -->
						<$text/>    <!-- isInline: true, isContent: true -->
					</paragraph>
				</tableCell>
			</tableRow>
		</table>
	</blockQuote>
</$root>
```

## Defining advanced rules in `checkChild()` callbacks

The {@link module:engine/model/schema~Schema#checkChild `Schema#checkChild()`} method which is the a base method used to check whether some element is allowed in a given structure is {@link module:utils/observablemixin~ObservableMixin#decorate a decorated method}. It means that you can add listeners to implement your specific rules which are not limited by the {@link module:engine/model/schema~SchemaItemDefinition declarative `SchemaItemDefinition` API}.

These listeners can be added either by listening directly to the {@link module:engine/model/schema~Schema#event:checkChild} event or by using the handy {@link module:engine/model/schema~Schema#addChildCheck `Schema#addChildCheck()`} method.

For instance, to disallow nested `<blockQuote>` structures, you can define such a listener:

```js
schema.addChildCheck( ( context, childDefinition ) => {
	// Note that the context is automatically normalized to a SchemaContext instance and
	// the child to its definition (SchemaCompiledItemDefinition).

	// If checkChild() is called with a context that ends with blockQuote and blockQuote as a child
	// to check, make the checkChild() method return false.
	if ( context.endsWith( 'blockQuote' ) && childDefinition.name == 'blockQuote' ) {
		return false;
	}
} );
```
<!--
## Defining attributes

TODO
-->

## Implementing additional constraints

Schema's capabilities are limited to simple (and atomic) {@link module:engine/model/schema~Schema#checkChild `Schema#checkChild()`} and {@link module:engine/model/schema~Schema#checkAttribute `Schema#checkAttribute()`} checks on purpose. One may imagine that the schema should support defining more complex rules such as "element `<x>` must be always followed by `<y>`". While it is feasible to create an API that would enable feeding the schema with such definitions, it is unfortunately unrealistic to then expect that every editing feature will consider these rules when processing the model. It is also unrealistic to expect that it will be done automatically by the schema and the editing engine themselves.

For instance, let's get back to the "element `<x>` must be always followed by `<y>`" rule and this initial content:

```xml
<$root>
	<x>foo</x>
	<y>bar[bom</y>
	<z>bom]bar</z>
</$root>
```

Now imagine that the user presses the "Block quote" button. Normally it would wrap the two selected blocks (`<y>` and `<z>`) with a `<blockQuote>` element:

```xml
<$root>
	<x>foo</x>
	<blockQuote>
		<y>bar[bom</y>
		<z>bom]bar</z>
	</blockQuote>
</$root>
```

But it turns out that this creates an incorrect structure &mdash; `<x>` is not followed by `<y>` anymore.

What should happen instead? There are at least 4 possible solutions: the block quote feature should not be applicable in such a context, someone should create a new `<y>` right after `<x>`, `<x>` should be moved inside `<blockQuote>` together with `<y>` or vice versa.

While this is a relatively simple scenario (unlike most real-time collaborative editing scenarios), it turns out that it is already hard to say what should happen and who should react to fix this content.

Therefore, if your editor needs to implement such rules, you should do that through {@link module:engine/model/document~Document#registerPostFixer model's post-fixers} fixing incorrect content or actively prevent such situations (e.g. by disabling certain features). It means that these constraints will be defined specifically for your scenario by your code which makes their implementation much easier.

To sum up, the answer to who and how should implement additional constraints is: your features or your editor through the CKEditor 5 API.

## Who checks the schema?

The CKEditor 5 API exposes many ways to work on (change) the model. It can be done {@link framework/architecture/editing-engine#changing-the-model through the writer}, via methods like {@link module:engine/model/model~Model#insertContent `Model#insertContent()`}, via commands and so on.

### Low-level APIs

The lowest-level API is the writer (to be precise, there are also raw operations below, but they are used for very special cases only). It allows applying atomic changes to the content like inserting, removing, moving or splitting nodes, setting and removing an attribute, etc. It is important to know that the **writer does not prevent from applying changes that violate rules defined in the schema**.

The reason for this is that when you implement a command or any other feature you may need to perform multiple operations to do all the necessary changes. The state in the meantime (between these atomic operations) may be incorrect. The writer must allow that.

For instance, you need to move `<foo>` from `<$root>` to `<bar>` and (at the same time) rename it to `<oof>`. But the schema defines that `<oof>` is not allowed in `<$root>` and `<foo>` is disallowed in `<bar>`. If the writer checked the schema, it would complain regardless of the order of `rename` and `move` operations.

You can argue that the engine could handle this by checking the schema at the end of a {@link module:engine/model/model~Model#change `Model#change()` block} (it works like a transaction &mdash; the state needs to be correct at the end of it). In fact, we [plan to strip disallowed attributes](https://github.com/ckeditor/ckeditor5-engine/issues/1228) at the end of these blocks.

There are problems, though:

* How to fix the content after a transaction is committed? It is impossible to implement a reasonable heuristic that would not break the content from the user perspective.
* The model can become invalid during real-time collaborative changes. Operational Transformation, while implemented by us in a very rich form (with 11 types of operations instead of the base 3), ensures conflict resolution and eventual consistency, but not the model's validity.

Therefore, we chose to handle such situations on a case-by-case basis, using more expressive and flexible {@link module:engine/model/document~Document#registerPostFixer model's post-fixers}. Additionally, we moved the responsibility to check the schema to features. They can make a lot better decisions a priori, before doing changes. You can read more about this in the ["Implementing additional constraints"](#implementing-additional-constraints) section above.

### High-level APIs

What about other, higher-level methods? **We recommend that all APIs built on top of the writer should check the schema.**

For instance, the {@link module:engine/model/model~Model#insertContent `Model#insertContent()`} method will make sure that inserted nodes are allowed in the place of their insertion. It may also attempt to split the insertion container (if allowed by the schema) if that will make the element to insert allowed, and so on.

Similarly, commands &mdash; if implemented correctly &mdash; {@link module:core/command~Command#isEnabled get disabled} if they should not be executed in the current place.

Finally, the schema plays a crucial role during the conversion from the view to the model (also called "upcasting"). During this process converters decide whether they can convert specific view elements or attributes to the given positions in the model. Thanks to that if you tried to load incorrect data to the editor or when you paste content copied from another website, the structure and attributes of the data get adjusted to the current schema rules.

<info-box>
	Some features may miss schema checks. If you happen to find such a scenario, do not hesitate to [report it to us](https://github.com/ckeditor/ckeditor5/issues).
</info-box>

<style>
.schema-deep-dive table {
	text-align: center;
}

.schema-deep-dive table td,
.schema-deep-dive table th {
	border-color: hsl(72deg 6% 16%);
}

.schema-deep-dive table thead th {
	font-weight: bold;
	vertical-align: middle;
}

.schema-deep-dive table thead th code {
	white-space: nowrap;
}

.schema-deep-dive table tbody td.value_negative {
	background: hsl(354deg, 100%, 90%);
}

.schema-deep-dive table tbody td.value_positive {
	background: hsl(88deg, 50%, 60%);
}

.schema-deep-dive table tbody td.value_negative code,
.schema-deep-dive table tbody td.value_positive code,
.schema-deep-dive table tbody td.value_positive_inherited code {
	background: none;
	text-shadow: 0px 0px 2px hsl(0deg, 0%, 100%);
}

.schema-deep-dive table tbody td.value_positive_inherited {
	background-image: linear-gradient(45deg, hsl(88deg, 50%, 60%) 25%, hsl(89deg, 58% ,71%) 25%, hsl(89deg, 58%, 71%) 50%, hsl(88deg, 50%, 60%) 50%, hsl(88deg, 50%, 60%) 75%, hsl(89deg, 58%, 71%) 75%, hsl(89deg, 58%, 71%) 100%);
	background-size: 3px 3px;
}

.schema-deep-dive table tbody td sup {
	top: -0.5em;
	position: relative;
	font-size: 75%;
	line-height: 0;
	vertical-align: baseline;
}
</style>
