---
category: framework-deep-dive-conversion-helpers
menu-title: Downcast helpers
meta-title: Downcast helpers | CKEditor 5 Framework Documentation
order: 20
since: 33.0.0
modified_at: 2022-03-02
---

# Downcast helpers &ndash; model to view conversion

This article lists all editor helpers available in the {@link framework/deep-dive/conversion/downcast downcast conversion}.

## Element to element conversion helper

Converting a model element to a view element is the most common case of conversion. It is used to create view elements like `<p>` or `<h1>`, that we call "container elements."

When using the `elementToElement()` helper, a **single model element** will be converted to a **single view element**. The children of this model element need to have their own converters defined and the engine will recursively convert them and insert into the created view element.

### Basic element to element conversion

If you want to convert a model element to a simple view element without any additional attributes, simply provide their names through the converter, as shown in this example:

```js
editor.conversion
	.for( 'downcast' )
	.elementToElement( {
		model: 'paragraphSeparator',
		view: 'hr'
} );
```

### Using view element definition

Sometimes you may need to output a view element that has certain attributes, like a class name. To achieve this, you can provide an [element definition](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_elementdefinition-ElementDefinition.html) in the `view` property:

```js
editor.conversion
	.for( 'downcast' )
	.elementToElement( {
		model: 'fancyParagraph',
		view: {
			name: 'p',
			classes: 'fancy'
		}
	} );
```

Check out the [ElementDefinition documentation](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_elementdefinition-ElementDefinition.html) for more details.

### Creating a view element using a callback

An alternative way to write a converter from the previous section using a callback would look as follows:

```js
editor.conversion
	.for( 'downcast' )
	.elementToElement( {
		model: 'fancyParagraph',
		view: ( modelElement, { writer } ) => {
			return writer.createContainerElement(
				'p', { class: 'fancy' }
			);
		}
	} );
```

Here, the second parameter of the view callback is the [DowncastConversionApi](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcastdispatcher-DowncastConversionApi.html) object. It contains many properties and methods that can be useful when writing a more complex converters.

The callback should return a single container element. This element should not contain any children except UI elements. If you want to create a richer structure, use the `elementToStructure()` method.

### Handling model elements with attributes

If the view element does not only depend on the model element itself but also on its attributes, you need to specify these attributes in the `model` property.

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

<info-box>
	If you forget to specify these attributes, the converter will still work for the insertion of the model element part but it will not handle any changes of the attribute value.
</info-box>

### Changing converter priority

In case there are other converters with overlapping `model` patterns already present, you can prioritize your converter to override these. To do that, use the `converterPriority` property:

```js
editor.conversion
	.for( 'downcast' )
	.elementToElement( {
		model: 'userComment',
		view: 'div'
	} );

editor.conversion
	.for( 'downcast' )
	.elementToElement( {
		model: 'userComment',
		view: 'article',
		converterPriority: 'high'
	} );
```

In the example above, the first converter has no explicitly set priority hence it assumes default priority, which is `normal`. The second one overrides it by setting the priority to `high`. Using both of these converters at once will result in the `<userComment>` element being converted to an `<article>` element.

This solution may also be handy if you want your converter to act as a fallback when other converters for a given element are not present (for example, a plugin has not been loaded). It can be easily achieved by setting the `converterProperty` to `low`.

## Element to structure conversion helper

Convert a single model element to multiple view elements (a structure of view elements).

### Handling empty model elements

To convert a single model element `horizontalLine` to the following structure:

```html
<div class="horizontal-line">
	<hr />
</div>
```

you can use a converter similar to this one:

```js
editor.conversion
	.for( 'downcast' )
	.elementToStructure( {
		model: 'horizontalLine',
		view: ( modelElement, { writer } ) => {
			return writer.createContainerElement( 'div', { class: 'horizontal-line' }, [
				writer.createEmptyElement( 'hr' )
			] );
		}
} );
```

Note that in this example we create two elements, which is not possible by using the previously mentioned `elementToElement()` helper.

<info-box>
	For editor users, the best way to interact with complex structures is to act as independent entities and stay intact, for instance, when copied, pasted, and edited. CKEditor&nbsp;5 allows that through the {@link module:widget/utils~toWidget widget API}. If you want to learn how to use it on top of `elementToStructure()`, be sure to check out the {@link tutorials/widgets/implementing-a-block-widget Implementing a block widget} tutorial.
</info-box>

### Handling model element’s children

The example above uses an empty model element. If your model element may contain children, you need to specify where in the view these children should be placed. To do that, use the `writer.createSlot()` helper.

```js
editor.conversion
	.for( 'downcast' )
	.elementToStructure( {
		model: 'wrappedParagraph',
		view: ( modelElement, conversionApi ) => {
			const { writer } = conversionApi;
			const paragraphViewElement = writer.createContainerElement( 'p', {}, [
				writer.createSlot()
			] );

			return writer.createContainerElement( 'div', { class: 'wrapper' }, [
				paragraphViewElement
			] );
		}
	} );
```

<info-box>
	For editor users, the best way to interact with complex structures is to act as independent entities and stay intact, for instance, when copied, pasted, and edited. CKEditor&nbsp;5 allows that through the {@link module:widget/utils~toWidget widget API}. If you want to learn how to use it on top of `elementToStructure()`, be sure to check out the {@link tutorials/widgets/implementing-a-block-widget Implementing a block widget} tutorial.
</info-box>

## Attribute to element conversion helper

The attribute to element conversion is used to create formatting view elements like `<b>` or `<span style="font-family: ...">` (that we call attribute elements). In this case, we do not convert a model element but a text node’s attribute. It is important to note that text formatting, such as bold or font size, should be represented in the model as text node attributes.

<info-box>
	In general, the model does not implement a concept of “inline elements” (in the sense in which they are defined by CSS). The only scenarios in which inline elements can be used, are self-contained objects such as soft breaks (`<br>`) or inline images.
</info-box>

### Basic text attribute to model conversion

```js
editor.conversion
	.for( 'downcast' )
	.attributeToElement( {
		model: 'bold',
		view: 'strong'
	} );
```

A model text node `"CKEditor&nbsp;5"` with a `bold` attribute will become a `<strong>"CKEditor&nbsp;5"</strong>` in the view.

### Using view element definition

You might want to output a view element that has more attributes, like a class name. To achieve that, you can provide an [element definition](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_elementdefinition-ElementDefinition.html) in the `view` property:

```js
editor.conversion
	.for( 'downcast' )
	.attributeToElement( {
		model: 'invert',
		view: {
			name: 'span',
			classes: [ 'font-light', 'bg-dark' ]
		}
	} );
```

Check out the [ElementDefinition documentation](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_elementdefinition-ElementDefinition.html) for more details.

### Creating a view element using a callback

You can also generate the view element by a callback. This method is useful when the view element depends on the value of the model attribute.

```js
editor.conversion
	.for( 'downcast' )
	.attributeToElement( {
		model: 'bold',
		view: ( modelAttributeValue, conversionApi ) => {
			const { writer } = conversionApi;

			return writer.createAttributeElement( 'span', {
				style: 'font-weight:' + modelAttributeValue
			} );
		}
	} );
```

The second parameter of the view callback is the [DowncastConversionApi](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcastdispatcher-DowncastConversionApi.html) object. It contains many properties and methods that can be useful when writing more complex converters.

### Changing converter priority

In case there are other converters already present, you can prioritize your converter to override the existing ones. To do that, use the `converterPriority` property:

```js
editor.conversion
	.for( 'downcast' )
	.attributeToElement( {
		model: 'bold',
		view: 'strong'
	} );

editor.conversion
	.for( 'downcast' )
	.attributeToElement( {
		model: 'bold',
		view: 'b',
		converterPriority: 'high'
	} );
```

In the example above, the first converter has no explicitly set priority hence it assumes default priority, which is `normal`. The second one overrides it by setting the priority to `high`. Using both of these converters at once will result in the `bold` attribute being converted to a `<b>` element.

## Attribute to attribute conversion helper

The `attributeToAttribute()` helper allows registering a converter that handles a specific attribute and converts it to an attribute of a view element.

Usually, when registering converters for elements (for example, by using `elementToElement()` or `elementToStructure()`), you will want to handle their attributes while handling the element itself.

The `attributeToAttribute()` helper comes in handy when for some reason you cannot cover a specific attribute inside the `elementToElement()` helper. For instance, when you are extending someone else’s plugin.

<info-box>
	This type of converter helper only works if there is already an element converter provided. Trying to convert to an attribute while there is no receiving view element will cause an error.
</info-box>

### Basic attribute to attribute conversion

This conversion results in adding an attribute to a view node, basing on an attribute from a model node. For example, `<imageInline src='foo.jpg'></imageInline>` is converted to `<img src='foo.jpg'></img>`.

```js
editor.conversion
	.for( 'downcast' )
	.attributeToAttribute( {
		model: 'source',
		view: 'src'
	} );
```

### Converting specific model element and attribute

The converter in the example above will convert **all** the `source` model attributes in the document. You can limit its scope by providing the model element name. You achieve it with the following code:

```js
editor.conversion
	.for( 'downcast' )
	.attributeToAttribute( {
		model: {
			name: 'imageInline',
			key: 'source'
		},
		view: 'src'
	} );
```

This updated converter will only convert the `source` model attributes present on the `imageInline` model element.

### Creating a custom view element from a selected list of model values

Once you provide the array in the `model.values` property, the `view` property is expected to be an object with keys matching these values. This is best explained using the example below:

```js
editor.conversion
	.for( 'downcast' )
	.attributeToAttribute( {
		model: {
			name: 'styled',
			values: [ 'dark', 'light' ]
		},
		view: {
			dark: {
				key: 'class',
				value: [ 'styled', 'styled-dark' ]
			},
			light: {
				key: 'class',
				value: [ 'styled', 'styled-light' ]
			}
		}
	} );
```

### Creating a view attribute with a custom value based on the model value

The value of the view attribute can be modified in the converter. Below is a simple mapper that sets the class attribute based on the model attribute value:

```js
editor.conversion
	.for( 'downcast' )
	.attributeToAttribute( {
		model: 'styled',
		view: modelAttributeValue => ( {
			key: 'class',
			value: 'styled-' + modelAttributeValue
		} )
	} );
```

It is worth noting that providing a style property in this manner requires the returned `value` to be an object:

```js
editor.conversion
	.for( 'downcast' )
	.attributeToAttribute( {
		model: 'lineHeight',
		view: modelAttributeValue => ( {
			key: 'style',
			value: {
				'line-height': modelAttributeValue,
				'border-bottom': '1px dotted #ba2'
			}
		} )
	} );
```

### Changing converter priority

You can override the existing converters by specifying higher priority, like in the example below:

```js
editor.conversion
	.for( 'downcast' )
	.attributeToAttribute( {
		model: 'source',
		view: 'href'
	} );

editor.conversion
	.for( 'downcast' )
	.attributeToAttribute( {
		model: 'source',
		view: 'src',
		converterPriority: 'high'
	} );
```

First converter has the default priority, `normal`. The second converter will be called earlier because of its higher priority, thus the `source` model attribute will get converted to `src` view attribute instead of `href`.

## Further reading

Check out the {@link framework/deep-dive/conversion/helpers/upcast dedicated guide} with a full list of complementary {@link framework/deep-dive/conversion/upcast upcast conversion helpers}.
