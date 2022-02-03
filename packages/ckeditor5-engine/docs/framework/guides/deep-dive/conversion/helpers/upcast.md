---
category: framework-deep-dive-conversion-helpers
menu-title: Upcast helpers (view to model)
order: 30
since: 33.0.0
---

# Upcast helpers (view to model)

## Element to element

Converting a view element to a model element is the most common case of conversion. It is used to handle view elements like `<p>` or `<h1>` (which needs to be converted to model elements).

When using the `elementToElement()` helper, a **single view element** will be converted to a **single model element**. The children of this view element have to have their own converters defined and the engine will recursively convert them and insert into the created model element.

### Basic element to element conversion

The simplest case of an element to element conversion, where a view element becomes a paragraph model element can be achieved by providing their names:

```jsx
editor.conversion
	.for( 'upcast' )
	.elementToElement( {
		view: 'p',
		model: 'paragraph'
	} );
```

The above example creates a model element `<paragraph>` from every `<p>` view element.

### Using view element definition

You can limit the view elements that qualify for the conversion by specifying their attributes, e.g. a class name. Provide respective element definition in the `view` property like in the example below:

```jsx
editor.conversion
	.for( 'upcast' )
	.elementToElement( {
		view: {
			name: 'p',
			classes: 'fancy'
		},
		model: 'fancyParagraph'
	} );
```

Check out the [ElementDefinition documentation](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_elementdefinition-ElementDefinition.html) for more details.

### Creating a model element using a callback

Model element resulting from the conversion can be created manually using a callback provided as a `model` property.

```jsx
editor.conversion
	.for( 'upcast' )
	.elementToElement( {
		view: {
			name: 'p',
			classes: 'heading'
		},
		model: ( viewElement, { writer } ) => {
			return writer.createElement( 'heading' );
		}
	} );
```

In the example above the model element is created only from a view element `<p class="heading">`. The `<p>` elements without that class name will be omitted.

The second parameter of the model callback is the [UpcastConversionApi](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_upcastdispatcher-UpcastConversionApi.html) object, that contains many properties and methods useful when writing more a complex converters.

### Handling view elements with attributes

If the model element depends not only on the view element itself but also on its attributes, you need to specify those attributes in the `view` property.

```jsx
editor.conversion
	.for( 'upcast' )
	.elementToElement( {
		view: {
			name: 'p',
			attributes: [ 'data-level' ]
		},
		model: ( viewElement, { writer } ) => {
			return writer.createElement( 'heading', { level: viewElement.getAttribute( 'data-level' ) } );
		}
	} );
```

<info-box>
	If you forget about specifying these attributes, another converter e.g. from General HTML Support feature may also handle these attributes resulting in duplicating them in the model.
</info-box>

### Changing converter priority

In case there are other converters with the overlapping `view` patterns already present, you can prioritize your converter in order to override them. To do so use the `converterPriority` property:

```jsx
editor.conversion
	.for( 'upcast' )
	.elementToElement( {
		view: 'div',
		model: 'mainContent',
	} );

editor.conversion
	.for( 'upcast' )
	.elementToElement( {
		view: 'div',
		model: 'sideContent',
		converterPriority: 'high'
	} );
```

Above, the first converter has the default priority, `normal`. The second one override it by setting the priority to `high`. Using both of these converters at once will result in the `<div>` view element being converted to `sideContent`.

Another case might be when you want your converter to act as a fallback when other converters for a given element are not present (e.g. a plugin has not been loaded) or existing converters were too specific. Achieving this is as simple as setting the `converterProperty` to `low`.

## Element to attribute

The element to attribute conversion is used to handle formatting view elements like `<b>` or `<span style="font-family: ...">` (which needs to be converted to text attributes). It is important to note that text formatting such as bold or font size should be represented in the model as text nodes attributes.

<info-box>
	In general, the model does not implement a concept of “inline elements” (in the sense in which they are defined by CSS). The only scenarios in which inline elements can be used are self-contained objects such as soft breaks (`<br>`) or inline images.
</info-box>

### Basic element to attribute conversion

```jsx
editor.conversion
	.for( 'upcast' )
	.elementToAttribute( {
		view: 'strong',
		model: 'bold'
	} );
```

A view `<strong>CKEditor 5</strong>` will become the `"CKEditor 5"` model text node with a `bold` attribute set to `true`.

### Converting attribute in a specific view element

You might want to convert only view elements with a specific class name or other attribute. To achieve that you can provide [element definition](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_elementdefinition-ElementDefinition.html) in the `view` property.

```jsx
editor.conversion
	.for( 'upcast' )
	.elementToAttribute( {
		view: {
			name: 'span',
			classes: 'bold'
		},
		model: 'bold'
	} );
```

Check out the [ElementDefinition documentation](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_elementdefinition-ElementDefinition.html) for more details.

### Setting a predefined value to model attribute

You can specify the value model attribute will take. To achieve that provide the name of the resulting model attribute as a `key` and its value as a `value` in `model` property object:

```jsx
editor.conversion
	.for( 'upcast' )
	.elementToAttribute( {
		view: {
			name: 'span',
			classes: [ 'styled', 'styled-dark' ]
		},
		model: {
			key: 'styled',
			value: 'dark'
		}
	} );
```

The code above will convert `<span class="styled styled-dark">CKEditor5</span>` into a model text node `CKEditor5` with `styled` attribute set to `dark`.

### Handling attribute values via a callback

In case when the value of an attribute needs additional processing (like mapping, filtering, etc.) you can define the `model.value` as a callback.

```jsx
editor.conversion
	.for( 'upcast' )
	.elementToAttribute( {
		view: {
			name: 'span',
			styles: {
				'font-size': /[\s\S]+/
			}
		},
		model: {
			key: 'fontSize',
			value: ( viewElement, conversionApi ) => {
				const fontSize = viewElement.getStyle( 'font-size' );
				const value = fontSize.substr( 0, fontSize.length - 2 );

				if ( value <= 10 ) {
					return 'small';
				} else if ( value > 12 ) {
					return 'big';
				}

				return null;
			}
		}
	} );
```

In the above example we turn a numeric `font-size` inline style into an either `small` or `big` model attribute.

### Changing converter priority

You can override the existing converters by specifying higher priority, like in the example below:

```jsx
editor.conversion
	.for( 'upcast' )
	.elementToAttribute( {
		view: 'strong',
		model: 'bold'
	} );

editor.conversion
	.for( 'upcast' )
	.elementToAttribute( {
		view: 'strong',
		model: 'important',
		converterPriority: 'high'
	} );
```

Above, the first converter has the default priority, `normal`. The second one overrides it by setting the priority to `high`. Using both of these converters at once will result in the `<strong>` view element being converted to an `important` model attribute.

## Attribute to attribute

The `attributeToAttribute()` helper allows registering a converter that handles a specific attribute and converts it to an attribute of a model element.

Usually, when registering converters for elements (e.g. by using `elementToElement()`), you will want to handle their attributes while handling the element itself.

The `attributeToAttribute()` helper comes handy when for some reason you can’t cover a specific attribute inside `elementToElement()`. For instance, you are extending someone else’s plugin.

<info-box>
	This type of converter helper works only if there is already an element converter provided. Trying to convert to an attribute while there is no receiving model element will cause an error.
</info-box>

### Basic attribute to attribute conversion

This conversion result in adding an attribute to a model element, based on an attribute from a view element. For example, the `src` attribute in `<img src="foo.jpg">` will be converted to `source` in `<imageInline source="foo.jpg"></imageInline>`.

```jsx
editor.conversion
	.for( 'upcast' )
	.attributeToAttribute( {
		view: 'src',
		model: 'source'
	} );
```

Another way of writing this converter is to provide a `view.key` property as in the example below:

```jsx
editor.conversion
	.for( 'upcast' )
	.attributeToAttribute( {
		view: {
			key: 'src'
		},
		model: 'source'
	} );
```

Both snippets will result in the creating exactly the same converter.

### Converting specific view element’s attribute

You can limit the element holding the attribute as well as the value of that attributes. Such a converter will be executed only in case of a full match.

```jsx
editor.conversion
	.for( 'upcast' )
	.attributeToAttribute( {
		view: {
			name: 'p',
			key: 'class',
			value: 'styled-dark'
		},
		model: {
			key: 'styled',
			value: 'dark'
		}
	} );
```

In the example above only a `styled-dark` class of a `<p>` element will be converted to a model attribute `styled` with a predefined value `dark`.

### Converting view attributes that match a more complex pattern

The pattern provided in a `view` property can be much more elaborate. Besides a string, you can also provide a regexp or a function that takes the attribute value and returns `true` or `false`.

```jsx
editor.conversion
	.for( 'upcast' )
	.attributeToAttribute( {
		view: {
			key: 'data-style',
			value: /\S+/
		},
		model: 'styled'
	} );
```

In the example above we are utilizing regular expression to match only an attribute `data-style` that has no whitespace characters in its value. Attributes that match this expression will have their value assigned to a `styled` model attribute.

### Processing attributes via callback

In case when the value of an attribute needs additional processing (like mapping, filtering, etc.) you can define the `model.value` as a callback.

```jsx
editor.conversion
	.for( 'upcast' )
	.attributeToAttribute( {
		view: {
			key: 'class',
			value: /styled-[\S]+/
		},
		model: {
			key: 'styled'
			value: viewElement => {
				const regexp = /styled-([\S]+)/;
				const match = viewElement.getAttribute( 'class' ).match( regexp );

				return match[ 1 ];
			}
		}
	} );
```

The converter in the example above will extract the style name from each `class` attribute that starts with `styled-` and assign it to a model attribute `styled`.

### Changing converter priority

You can override the existing converters by specifying higher priority, like in the example below:

```jsx
editor.conversion
	.for( 'upcast' )
	.attributeToAttribute( {
		view: 'src',
		model: 'source'
	} );

editor.conversion
	.for( 'upcast' )
	.attributeToAttribute( {
		view: 'src',
		model: 'sourceAddress',
		converterPriority: 'high'
	} );
```

First converter has the default priority, `normal`. The second converter will be called earlier because of its higher priority, thus the `src` view attribute will get converted to a `sourceAddress` model attribute (instead of `source`).
