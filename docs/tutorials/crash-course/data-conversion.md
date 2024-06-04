---
category: crash-course
order: 40
menu-title: Data conversion
meta-title: CKEditor 5 crash course - Data conversion | CKEditor 5 Documentation
modified_at: 2023-08-16
---

# Data conversion

## Conversion helpers

There are three conversion helpers:

* {@link module:engine/conversion/conversion~Conversion#attributeToElement `attributeToElement()`},
* {@link module:engine/conversion/conversion~Conversion#attributeToAttribute `attributeToAttribute()`},
* {@link module:engine/conversion/conversion~Conversion#elementToElement `elementToElement()`}.

We used the first helper in the previous chapter of the tutorial to convert `<mark>` HTML elements to the model's `highlight` attribute and vice versa.

```js
editor.conversion.attributeToElement( {
	model: 'highlight',
	view: 'mark'
} );
```

You may have noticed that we used the term **helpers**. This is because these methods are often used for simple and symmetric conversions, abstracting away the internals and what really happens in the engine. However, there are cases where the conversion is a bit more complicated.

In this chapter we will learn more about data conversion so that you can better understand the editor and work with more complex cases.

## Upcast and downcast

The process of transforming input HTML data into model is called upcasting. The reverse process of transforming model data into HTML is called downcasting.

While there is only one type of upcast called **data upcast**, there are two types of downcast:

* **data downcast** for converting model data into output HTML data,
* **editing downcast** for converting model into editing view we see in editor UI.

{@img assets/img/tutorial/data-conversion.jpg Diagram showing data upcast going into the model and the downcasts going from the model}

The reason for two types of downcasts is that sometimes the resulting HTML should be different from what we see in the editor. One such example can be a table that in the output HTML data is just a plain HTML table, but in the editing view has additional UI handlers for resizing or buttons for adding new columns and rows. This is a asymmetric conversion for which these helpers are of no use.

## Under the hood

To better visualize the conversion, let's see what the above code would look like in a full implementation, without using a helper.

```js
// Convert the input `<mark>` HTML element to model attribute.
editor.conversion.for( 'upcast' ).elementToAttribute( {
	model: 'highlight',
	view: 'mark'
} );

// Convert model attribute to output `<mark>` HTML element.
editor.conversion.for( 'dataDowncast' ).attributeToElement( {
	model: 'highlight',
	view: 'mark'
} );

// Convert model attribute to `<mark>` in editing view.
editor.conversion.for( 'editingDowncast' ).attributeToElement( {
	model: 'highlight',
	view: 'mark'
} );
```

Notice that we called the `elementToAttribute` method in the upcast and the `attributeToElement` method in the downcast. This is because in the upcast we convert the HTML element to a model attribute, but in the downcast we do the opposite.

## What's next

If your case requires a more complex conversion than we covered in this tutorial, see the {@link framework/deep-dive/conversion/intro Conversion deep dive} document.

Otherwise, go to the next chapter, where you will {@link tutorials/crash-course/commands learn more about updating the model using commands}.
