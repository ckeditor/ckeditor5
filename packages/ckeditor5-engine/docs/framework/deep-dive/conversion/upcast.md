---
category: framework-deep-dive-conversion
menu-title: View to model (upcast)
meta-title: Upcast conversion - view to model | CKEditor 5 Framework Documentation
order: 30
since: 33.0.0
modified_at: 2022-03-02
---

# Upcast conversion &ndash; view to model

## Introduction

The process of converting the **view** to the **model** is called an **upcast**.

{@img assets/img/upcast-basic.svg 214 Basic upcast conversion diagram.}

The upcast process conversion happens every time any data is being loaded into the editor.

Incoming data becomes the view which is then converted into the model via registered converters.

<info-box>
	If you just want to quickly enable some common HTML tags that are not explicitly supported by the dedicated CKEditor&nbsp;5 features, you can use the {@link features/general-html-support General HTML Support} feature instead of writing your own custom upcast converters.
</info-box>

## Registering a converter

To instruct the engine how to convert a specific view element into a model element, you need to register an **upcast converter** by using the `editor.conversion.for( 'upcast' )` method:

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
	You have just learnt about the {@link framework/deep-dive/conversion/helpers/upcast#element-to-element-conversion-helper `elementToElement()` **upcast** conversion helper method}! More helpers are documented in the following chapters.
</info-box>

## Upcast pipeline

Contrary to the downcast where you deal with both the data and editing pipelines, the upcast process only happens in the data pipeline and is called **data upcast**.

The editing view may be only changed via changing the model first, hence editing pipeline needs only the downcast process.

{@img assets/img/upcast-pipeline.svg 612 Upcast conversion pipeline diagram.}

The previous code example registers a converter for both pipelines at once. It means that a `<paragraph>` model element will be converted to a `<p>` view element in both the **data view** and the **editing view**.

## Converting to text attribute

View elements representing inline text formatting (such as `<strong>` or `<i>`) need to be converted to an attribute on a model text node.

To register such a converter, use the {@link framework/deep-dive/conversion/helpers/upcast#element-to-attribute-conversion-helper `elementToAttribute()` method}:

```js
editor.conversion
	.for( 'upcast' )
	.elementToAttribute( {
		view: 'strong',
		model: 'bold'
	} );
```

A text wrapped with the `<strong>` tag will be converted to a model text node with a `bold` attribute applied to it, as shown:

{@snippet framework/mini-inspector-bold}

If you need to “copy” an attribute from a view element to a model element, use the {@link framework/deep-dive/conversion/helpers/upcast#attribute-to-attribute-conversion-helper `attributeToAttribute()` method}.

The model element must have its own converter registered, otherwise there is nothing the attribute can be copied to.

```js
editor.conversion
	.for( 'upcast' )
	.attributeToAttribute( {
		view: 'src',
		model: 'source'
	} );
```

Assuming that some other feature registered the `<img>` to `<image>` model element upcast converter in the editor, you can extend this feature to allow the `src` attribute. This attribute will be converted into a `source` attribute on a model element, the way it is shown in the following snippet:

{@snippet framework/mini-inspector-upcast-attribute}

<info-box>
	This is just an example. Actually, the image elements and source attributes support is provided by the {@link features/images-overview images feature} so you do not have to write your own `<image source="xxx">` to `<img src="xxx">` element conversion.
</info-box>

## Converting to element

Converting a view element to a corresponding model element can be achieved by registering the converter using the {@link framework/deep-dive/conversion/helpers/upcast#element-to-element-conversion-helper `elementToElement()` method}:

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

This converter will handle the conversion of every `<div class="example">` view element into an `<example>` model element.

{@snippet framework/mini-inspector-upcast-element}

<info-box>
	Using your own custom model element requires defining it in the {@link framework/deep-dive/schema schema} first.
</info-box>

## Converting structures

As you have learnt in the {@link framework/deep-dive/conversion/downcast previous chapter}, a single model element can be downcast into a structure of multiple view elements.

The opposite process will have to detect that structure (for example, the main element) and convert it into a simple model element.

There is no `structureToElement()` helper available for the upcast conversion. To register an upcast converter for the entire structure and create a single model element, you must use the event-based API. The following example shows how to achieve it:

```js
editor.conversion.for( 'upcast' ).add( dispatcher => {
	// Look for every view <div> element.
	dispatcher.on( 'element:div', ( evt, data, conversionApi ) => {
		// Get all the necessary items from the conversion API object.
		const {
			consumable,
			writer,
			safeInsert,
			convertChildren,
			updateConversionResult
		} = conversionApi;

		// Get view item from data object.
		const { viewItem } = data;

		// Define elements consumables.
		const wrapper = { name: true, classes: 'wrapper' };
		const innerWrapper = { name: true, classes: 'inner-wrapper' };

		// Tests if the view element can be consumed.
		if ( !consumable.test( viewItem, wrapper ) ) {
			return;
		}

		// Check if there is only one child.
		if ( viewItem.childCount !== 1 ) {
			return;
		}

		// Get the first child element.
		const firstChildItem = viewItem.getChild( 0 );

		// Check if the first element is a <div>.
		if ( !firstChildItem.is( 'element', 'div' ) ) {
			return;
		}

		// Tests if the first child element can be consumed.
		if ( !consumable.test( firstChildItem, innerWrapper ) ) {
			return;
		}

		// Create model element.
		const modelElement = writer.createElement( 'myElement' );

		// Insert element on a current cursor location.
		if ( !safeInsert( modelElement, data.modelCursor ) ) {
			return;
		}

		// Consume the main outer wrapper element.
		consumable.consume( viewItem, wrapper );
		// Consume the inner wrapper element.
		consumable.consume( firstChildItem, innerWrapper );

		// Handle children conversion inside inner wrapper element.
		convertChildren( firstChildItem, modelElement );

		// Necessary function call to help setting model range and cursor
		// for some specific cases when elements being split.
		updateConversionResult( modelElement, data );
	} );
} );
```

This converter will detect all `<div class="wrapper"><div class="inner-wrapper"><p>...</p></div></div>` structures (by scanning for the outer `<div>`s and turning those into a single `<myElement>` model element). The effect should return as follows:

{@snippet framework/mini-inspector-structure}

<info-box>
	Using your own custom model element requires defining it in the {@link framework/deep-dive/schema schema} first.
</info-box>

## Further reading

If you want to learn more about upcast helpers mentioned in this guide, we have {@link framework/deep-dive/conversion/helpers/upcast rounded them up} for you with complete descriptions and examples. We also recommend you to check out the {@link framework/deep-dive/conversion/downcast downcast conversion} guide and learn how to convert the editor model state into data output and editing view.
