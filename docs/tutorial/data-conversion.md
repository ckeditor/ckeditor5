---
category: tutorial
order: 40
menu-title: Data conversion
---

# Data conversion

## Conversion helpers

There are three conversion helpers:

* {@link module:engine/conversion/conversion~Conversion#attributeToElement `attributeToElement()`},
* {@link module:engine/conversion/conversion~Conversion#attributeToAttribute `attributeToAttribute()`},
* {@link module:engine/conversion/conversion~Conversion#elementToElement `elementToElement()`}.

We used the first helper in the previous chapter of the tutorial to convert `<mark>` HTML elements into the model `highlight` attribute and vice versa.

```js
editor.conversion.attributeToElement( {
	model: 'highlight',
	view: 'mark'
} );
```

Noticed that we used the term **helpers**. It's because these methods are comonly used for simple conversions and abstract away the internals and what's really happening in the engine. However, there are cases when the conversion is a little bit more complicated.

In this chapter we will learn more about data conversion, so you can better understand the editor and work with more complex cases.

## Upcast and downcast

Process of transforming input HTML data into model is called upcast. Reverse process of transforming model data into HTML is called downcast.

While there is only one type of upcast called **data upcast**, there are two types of downcast:

* **data downcast** for converting model into output HTML data,
* **editing downcast** for converting model into editing view we see in the editor UI.

The reason for two types of downcast is that sometimes the resulting HTML should be different from the one we see in the editor. One such example can be a table, which in output HTML data is just a plain HTML table, but in editing view have additional UI handlers for resizing, buttons for adding new columns and rows, etc.

## Under the hood

To better visualize conversion, let's see how the code above would look like in a full implementation, without using a helper.

```js
// Convert the input `<mark>` HTML element to model attribute
editor.conversion.for( 'upcast' ).elementToAttribute( {
	model: 'highlight',
	view: 'mark'
} );

// Convert model attribute to output `<mark>` HTML element
editor.conversion.for( 'dataDowncast' ).attributeToElement( {
	model: 'highlight',
	view: 'mark'
} );

// Convert model attribute to `<mark>` in editing view
editor.conversion.for( 'editingDowncast' ).attributeToElement( {
	model: 'highlight',
	view: 'mark'
} );
```

Notice that in upcast we called the `elementToAttribute` method and in downcasts we called the `attributeToElement` methods. That's because during upcast, we convert HTML element to model attribute, but in downcast we perform the reverse process.

## What's next?

If your case requires conversion more complex than we covered in this tutorial, see the {@link framework/deep-dive/conversion/intro Conversion deep dive} document.

Otherwise go to the next chapter, where you'll {@link tutorial/commands learn more about updating model using commands}.
