---
category: framework-deep-dive-conversion
menu-title: Model to view (downcast)
meta-title: Downcast conversion - model to view | CKEditor 5 Framework Documentation
order: 20
since: 33.0.0
modified_at: 2022-03-02
---

# Downcast conversion &ndash; model to view

## Introduction

The process of converting the **model** to the **view** is called a **downcast**.

{@img assets/img/downcast-basic.svg 238 Basic downcast conversion diagram.}

The downcast process happens every time a model node or attribute needs to be converted into a view node or attribute.

The editor engine runs the conversion process and uses converters registered by the plugins.

## Registering a converter

To tell the engine how to convert a specific model element into a view element, you need to register a **downcast converter** by using the `editor.conversion.for( 'downcast' )` method, listing the elements that should be converted in the process:

```js
editor.conversion
	.for( 'downcast' )
	.elementToElement( {
		model: 'paragraph',
		view: 'p'
	} );
```

The above converter will handle the conversion of every `<paragraph>` model element into a `<p>` view element. You can see the input and output in the snippet below.

{@snippet framework/mini-inspector-paragraph}

<info-box>
	This is just an example. In fact, paragraph support is already provided by the {@link api/paragraph paragraph plugin} so you do not really need to write your own `<paragraph>` element to `<p>` element conversion.
</info-box>

<info-box>
	You just learned about the {@link framework/deep-dive/conversion/helpers/downcast#element-to-element-conversion-helper `elementToElement()` **downcast** conversion helper method}! More helpers are documented in the following chapters.
</info-box>

## Downcast pipelines

The CKEditor&nbsp;5 engine uses two different views: the **data view** and the **editing view**.

The **data view** is used when generating the editor output. This process is controlled by the data pipeline.

The **editing view**, on the other hand, is what you see when you open the editor. This is controlled by the editing pipeline.

{@img assets/img/downcast-pipelines.svg 444 Downcast conversion pipelines diagram.}

The simple code example presented before registers a converter for both of these pipelines at once. It means that a `<paragraph>` model element will be converted to a `<p>` view element in both the **data view** and the **editing view** all the same.

Sometimes you may want to alter the converter logic for a specific pipeline. For example, in the editing view you may want to add some additional class to the view element. This kind of operation requires setting separate converters for both views, unlike the previous example where one, general downcast was set up.

```js
// dataDowncast for data pipeline
editor.conversion
	.for( 'dataDowncast' )
	.elementToElement( {
		model: 'paragraph',
		view: 'p'
	} );

// editingDowncast for editing pipeline
editor.conversion
	.for( 'editingDowncast' )
	.elementToElement( {
		model: 'paragraph',
		view: {
			name: 'p',
			classes: 'paragraph-in-editing-view'
		}
	} );
```

## Converting text attributes

As you should already know from the {@link framework/architecture/editing-engine#model chapter about the model}, an **attribute** may be applied to a model text node.

Such text node attributes may be converted into view elements.

To do so, you can register a converter by using the {@link framework/deep-dive/conversion/helpers/downcast#attribute-to-element-conversion-helper `attributeToElement()` conversion helper}:

```js
editor.conversion
	.for( 'downcast' )
	.attributeToElement( {
		model: 'bold',
		view: 'strong'
	} );
```

The above converter will handle the conversion of every `bold` model text node attribute to a `<strong>` view element, as shown in the snippet below.

{@snippet framework/mini-inspector-bold}

<info-box>
	Again, this is just an example for the sake of simplicity. Bold support is actually provided by the {@link features/basic-styles basic styles} plugin so you do not have to write your own bold attribute to strong element conversion.
</info-box>

## Converting element to element

Similar to the previous example, you can convert a `<heading>` model element into an `<h1>` view element with the use of the {@link framework/deep-dive/conversion/helpers/downcast#element-to-element-conversion-helper `elementToElement()` conversion helper}. A code to achieve it would look like this:

```js
editor.conversion
	.for( 'downcast' )
	.elementToElement( {
		model: 'heading',
		view: 'h1'
	} );
```

Which is equivalent to:

```js
editor.conversion
	.for( 'downcast' )
	.elementToElement( {
		model: 'heading',
		view: ( modelElement, { writer } ) => {
			return writer.createContainerElement(
				'h1'
			);
		}
	} );
```

You have previously learned that the `view` property can be a simple string or an object. The example above shows it is also possible to define a custom callback function to return the created element instead. The effect for this kind of conversion can be observed in the snippet below:

{@snippet framework/mini-inspector-heading}

The `<heading>` element makes the most sense if you can set the heading level in the view.

In the previous chapter you have learned that you can apply attributes to text nodes. It is also possible to add attributes to elements, like in this example:

```js
editor.conversion
	.for( 'downcast' )
	.elementToElement( {
		model: {
			name: 'heading',
			attributes: [ 'level' ]
		},
		view: ( modelElement, { writer } ) => {
			return writer.createContainerElement(
				'h' + modelElement.getAttribute( 'level' )
			);
		}
	} );
```

From now on, every time a level attribute updates, the whole `<heading>` element will be converted to the `<h[level]>` element (for example `<h1>`, `<h2>`, etc).

You can check this in action by using the example below. Use the dropdown to change heading level in the model and see how view elements are updated by the converter:

{@snippet framework/mini-inspector-heading-interactive}

<info-box>
	This, again, is just an example. Heading support is actually provided by the {@link features/headings headings feature} so you do not have to write your own `<heading level="1">` to `<h1>` element conversion.
</info-box>

## Converting element to structure

Sometimes you may want to convert a **single model element** into a more complex view structure consisting of a **single view element with children**.

You can use the {@link framework/deep-dive/conversion/helpers/downcast#element-to-structure-conversion-helper `elementToStructure()` conversion helper} for this purpose:

```js
editor.conversion
	.for( 'downcast' ).elementToStructure( {
		model: 'myElement',
		view: ( modelElement, { writer } ) => {
			return writer.createContainerElement( 'div', { class: 'wrapper' }, [
				writer.createContainerElement( 'div', { class: 'inner-wrapper' }, [
					writer.createSlot()
				] )
			] );
		}
	} );
```

The above converter will convert all `<myElement>` model elements to `<div class="wrapper"><div class="inner-wrapper"><p>...</p></div></div>` structures, as shown below:

{@snippet framework/mini-inspector-structure}

<info-box>
	Using your own custom model element requires defining it in the {@link framework/deep-dive/schema schema} first.
</info-box>

<info-box>
	For editor users, the best way to interact with complex structures is to act as independent entities and stay intact, for instance, when copied, pasted, and edited. CKEditor&nbsp;5 allows that through the {@link module:widget/utils~toWidget widget API}. If you want to learn how to use it on top of `elementToStructure()`, be sure to check out the {@link tutorials/widgets/implementing-a-block-widget Implementing a block widget} tutorial.
</info-box>

## Further reading

If you want to learn more about downcast helpers mentioned in this guide, we have {@link framework/deep-dive/conversion/helpers/downcast rounded them up} for you with complete descriptions and examples. We also recommend you to check out the {@link framework/deep-dive/conversion/upcast upcast conversion} guide and learn how to convert raw data on the editor input into a live model state.
