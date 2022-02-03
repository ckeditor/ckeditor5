---
category: framework-deep-dive-conversion
menu-title: View to model (upcast)
order: 30
since: 33.0.0
---

# Model to view (downcast)

## Introduction

The process of converting the **view** to the **model** is called an **downcast**.

{@img assets/img/upcast-basic.png 760 Basic downcast conversion diagram.}

The upcast process conversion happens every time any data is being loaded into the editor.

Incoming data becomes the view which is then converted into the model via registered converters.

{@snippet framework/mini-inspector}

## Registering a converter

In order to tell the engine how to convert a specific view element into a model element, you need to register an **upcast converter** by using the `editor.conversion.for( 'upcast' )` method:

```js
editor.conversion
	.for( 'upcast' )
	.elementToElement( {
		view: 'p',
		model: 'paragraph'
	} );
```

The above converter will handle the conversion of every `<p>` view element to a `<paragraph>` model element.

{@snippet framework/mini-inspector-paragraph}

<info-box>
	This is just an example. Paragraph support is provided by the {@link api/paragraph paragraph plugin} so you don't have to write your own `<p>` element to `<paragraph>` element conversion.
</info-box>

<info-box>
	You just learned about the `elementToElement()` **upcast** conversion helper method! More helpers are documented in the following chapters.
</info-box>

## Upcast pipeline

Contrary to the downcast, the upcast process happens only in the data pipeline and is called **data upcast.**

The editing view may be changed only via changing the model first, hence editing pipeline needs only the downcast process.

{@img assets/img/upcast-pipeline.png 760 Upcast conversion pipeline diagram.}

The previous code example registers a converter for both pipelines at once. It means that `<paragraph>` model element will be converted to a `<p>` view element in both **data view** and **editing view**.

## Converting to text attribute

View elements representing inline text formatting (such as `<strong>` or `<i>`) need to be converted to an attribute on a model text node.

To register such a converter, use `elementToAttribute()`:

```js
editor.conversion
	.for( 'upcast' )
	.elementToAttribute( {
		view: 'strong',
		model: 'bold'
	} );
```

Text wrapped with the `<strong>` tag will be converted to a model text node with a `bold` attribute applied to it.

{@snippet framework/mini-inspector-bold}

If you need to “copy” an attribute from a view element to a model element, use `attributeToAttribute()`.

Keep in mind that the model element must have its own converter registered, otherwise there is nothing the attribute can be copied to.

```js
editor.conversion
	.for( 'upcast' )
	.attributeToAttribute( {
		view: 'src',
		model: 'source'
	} );
```

{@snippet framework/mini-inspector-bold}

## Converting to element

Converting a view element to a corresponding model element can be achieved by registering the converter by using the `elementToElement()` method:

```js
editor.conversion
	.for( 'upcast' )
	.elementToElement( {
		view: {
			name: 'div',
			classes: [ 'example' ]
		},
		model: 'example'
	} );
```

The above converter will handle the conversion of every `<div class="example">` view element into an `<example>` model element.

{@snippet framework/mini-inspector-bold}

<info-box>
	Using your own custom model element requires defining it in the schema. More information in the example below.
</info-box>

## Converting structures

As you may learned in the {@link framework/guides/deep-dive/conversion/downcast previous chapter}, a single model element can be downcasted into a structure of multiple view elements.

The opposite process will have to detect that structure (e.g. the main element) and convert that into a simple model element.

You can use `elementToStructure()` conversion helper for this purpose:

```js
editor.conversion.for( 'upcast' ).add( dispatcher => {
	// Listen on every view div element
	dispatcher.on( 'element:div', ( evt, data, conversionApi ) => {
		// Get all the necessary items from the conversion API object
		const {
			consumable,
			writer,
			safeInsert,
			convertChildren,
			updateConversionResult
		} = conversionApi;

		// Get view item from data object
		const { viewItem } = data;

		// Define elements consumables
		const wrapper = { name: true, classes: 'wrapper' };
		const innerWrapper = { name: true, classes: 'inner-wrapper' };

		// Tests if the view element can be consumed
		if ( !consumable.test( viewItem, wrapper ) ) {
			return;
		}

		// Check if there is only one child
		if ( viewItem.childCount !== 1 ) {
			return;
		}

		// Get the first child element
		const firstChildItem = viewItem.getChild( 0 );

		// Check if the first element is a div
		if ( !firstChildItem.is( 'element', 'div' ) ) {
			return;
		}

		// Tests if the first child element can be consumed
		if ( !consumable.test( firstChildItem, innerWrapper ) ) {
			return;
		}

		// Create model element
		const modelElement = writer.createElement( 'myElement' );

		// Insert element on cursor location
		if ( !safeInsert( modelElement, data.modelCursor ) ) {
			return;
		}

		// Consume the main outer wrapper element
		consumable.consume( viewItem, wrapper );
		// Consume the inner wrapper element
		consumable.consume( firstChildItem, innerWrapper );

		// Handle children conversion inside inner wrapper element
		convertChildren( firstChildItem, modelElement );

		// Necessary function call to help setting model range and cursor
		// for some specific cases when elements being split
		updateConversionResult( modelElement, data );
	} );
} );
```

The above converter will detect all `<div class="wrapper"><div class="wrapper-inner"><p>...</p></div></div>` structures (by scanning for the outer `<div>` and turn those into a single `<myElement>` model element.

{@snippet framework/mini-inspector-structure}

## Read next

{@link framework/guides/deep-dive/conversion/helpers/intro Conversion helpers}
