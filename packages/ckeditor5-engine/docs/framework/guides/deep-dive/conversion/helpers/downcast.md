---
category: framework-deep-dive-conversion-helpers
menu-title: Downcast helpers (model to view)
order: 20
since: 33.0.0
---

# Downcast helpers (model to view)

## Element to element

Converting a model element to a view element is the most common case of conversion. It is used to create view elements like `<p>` or `<h1>` (that we call container elements).

When using the `elementToElement()` helper, a **single model element** will be converted to a **single view element**. The children of this model element have to have their own converters defined and the engine will recursively convert them and insert into the created view element.

### Basic element to element conversion

If you want to convert a model element to a simple view element without additional attributes, simply provide their names:

```js
editor.conversion
	.for( 'downcast' )
	.elementToElement( {
		model: 'paragraphSeparator',
		view: 'hr'
} );
```

### Using view element definition

You might want to output a view element that has more attributes, e.g. a class name. To achieve that you can provide [element definition](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_elementdefinition-ElementDefinition.html) in the `view` property:

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

Another way of writing a converter from the previous section using a callback would look like this:

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

The second parameter of the view callback is the [DowncastConversionApi](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcastdispatcher-DowncastConversionApi.html) object, that contains many properties and methods that can be useful when writing a more complex converters.

The callback should return a single container element. That element should not contain any children except UI elements. If you want to create a richer structure, use `elementToStructure()`.

### Handling model elements with attributes

If the view element depends not only on the model element itself but also on its attributes you need to specify these attributes in the `model` property.

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
	If you forget about specifying these attributes, the converter will work for the insertion of the model element but it will not handle changes of the attribute value.
</info-box>

### Changing converter priority

In case there are other converters with the overlapping `model` patterns already present, you can prioritize your converter in order to override t. To do that use the `converterPriority` property:

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

Above, the first converter has a default priority, `normal`. The second one overrides it by setting the priority to `high`. Using both of these converters at once will result in the `<userComment>` element being converted to an `<article>` element.

Another case might be when you want your converter to act as a fallback when other converters for a given element are not present (e.g. a plugin has not been loaded). Achieving this is as simple as setting the `converterProperty` to `low`.

## Element to structure

Convert a single model element to many view elements (a structure of view elements).

### Handling empty model elements

To convert a single model element `horizontalLine` to a following structure:

```html
<div class="horizontal-line">
	<hr />
</div>
```

you can use a converter similar to this:

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

Note that in this example we create two elements, which is not possible by using previously mentioned `elementToElement()` helper.

Another thing to remember is that in the real life scenario it would be recommended for this element to be {@link framework/guides/tutorials/implementing-a-block-widget a widget}.

### Handling model element’s children

The example above uses an empty model element. If your model element may contain children you need to specify in the view where these children should be placed. To do that use `slotFor( 'children' )`

```js
editor.conversion
	.for( 'downcast' )
	.elementToStructure( {
		model: 'wrappedParagraph',
		view: ( modelElement, conversionApi ) => {
			const { writer, slotFor } = conversionApi;
			const paragraphViewElement = writer.createContainerElement( 'p', {}, [
				slotFor( 'children' )
			] );

			return writer.createContainerElement( 'div', { class: 'wrapper' }, [
				paragraphViewElement
			] );
		}
	} );
```
## Attribute to element

The attribute to element conversion is used to create formatting view elements like `<b>` or `<span style="font-family: ...">` (that we call attribute elements). In this case, we don’t convert a model element but a text node’s attribute. It is important to note that text formatting such as bold or font size should be represented in the model as text nodes attributes.

<info-box>
	In general, the model does not implement a concept of “inline elements” (in the sense in which they are defined by CSS). The only scenarios in which inline elements can be used are self-contained objects such as soft breaks (`<br>`) or inline images.
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

A model text node `"CKEditor 5"` with a `bold` attribute will become a `<strong>CKEditor 5</strong>` in the view.

### Using view element definition

You might want to output a view element that has more attributes, e.g. a class name. To achieve that you can provide [element definition](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_elementdefinition-ElementDefinition.html) in the `view` property:

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

The second parameter of the view callback is the [DowncastConversionApi](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcastdispatcher-DowncastConversionApi.html) object, that contains many properties and methods that can be useful when writing a more complex converters.

### Changing converter priority

In case there are other converters already present, you can prioritize your converter in order to override existing ones. To do that use the `converterPriority` property:

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

Above, the first converter has a default priority, `normal`. The second one overrides it by setting the priority to `high`. Using both of these converters at once will result in the `bold` attribute being converted to a `<b>` element.

## Attribute to attribute

The `attributeToAttribute()` helper allows registering a converter that handles a specific attribute and converts it to an attribute of a view element.

Usually, when registering converters for elements (e.g. by using `elementToElement()` or `elementToStructure()`), you will want to handle their attributes while handling the element itself.

The `attributeToAttribute()` helper comes handy when for some reason you can’t cover a specific attribute inside `elementToElement()`. For instance, you are extending someone else’s plugin.

<info-box>
	This type of converter helper works only if there is already an element converter provided. Trying to convert to an attribute while there is no receiving view element will cause an error.
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

The converter in the example above will be convert all the `source` model attributes in the document. You can limit its scope by providing the model element name.

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

The converter above will convert all the `source` model attributes, but only those present on the `imageInline` model element.

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

The value of the view attribute can be modified in the converter. Below is a simple mapper, that sets the class attribute based on the model attribute value:

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
