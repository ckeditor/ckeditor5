---
category: framework-deep-dive
menu-title: Extending editor content
---

{@snippet framework/build-extending-content-source}

# Extending editor content

This article will help you learn how to quickly extend (customize) the content produced by the existing editor features. For instance, you will learn how to add custom attributes and CSS classes to the editor output or how to load into the editor pieces of data which are not officially supported.

<info-box>
	It is highly recommended to learn about the {@link framework/guides/architecture/editing-engine basics of CKEditor 5 editing engine architecture} before reading this guide.
</info-box>

## Selected concepts of data conversion

Before we will move to examples, let us take a look at some concepts that drive the structure of the content in the editor:

### Inline and block content

Generally speaking, there are two main types of the content in the editor view and data output: inline and block.

The inline content means elements like `<strong>`, `<a>` or `<span>`. Unlike `<p>`, `<blockquote>` or `<div>`, inline elements do not structure the data. Instead, they mark some text in a specific (visual and semantical) way. These elements are a characteristic of a text. For instance, we could say that some part of a text is bold, or a linked, etc.. This concept has its reflection in the model of the editor where `<a>` or `<strong>` are not represented as elements. Instead, they are attributes of the text.

For example &mdash; in the model, we might have a `<paragraph>` element with "Foo bar" text, where "bar" has the `bold` attribute set `true`. A pseudo–code of this *model* data structure could look as follows:

```html
<paragraph>
	"Foo "			// no attributes
	"bar"			// bold=true
</paragraph>
```

<info-box>
	Throughout the rest of this guide we will use the following, shortert convention to represent model text attributes:

	```html
	<paragraph>Foo <$text bold="true">bar</$text></paragraph>
	```
</info-box>

Note that there is no `<strong>` or any other additional element there, it is just some text with an attribute.

So, when this text becomes wrapped with a `<strong>` element? This happens during conversion to the view. It is also important to know which type of a view element needs to be used. In case of elements which represent inline formatting, this should be a {@link module:engine/view/attributeelement~AttributeElement}.

### Conversion of multiple text attributes

A model text node may have multiple attributes (e.g. be bolded and linked) and all of them are converted to their respective view elements by independent converters.

Keep in mind that in the model, attributes do not have any specific order. This is contrary to the editor view or HTML output, where inline elements are nested one in another. Fortunately, the nesting happens automatically during conversion from the model to the view. This makes working in the model simpler, as features do not need to take care of breaking or rearranging elements in the model.

For instance, consider the following model structure:

```html
<paragraph>
	<$text bold="true" linkHref="url">Foo </$text>
	<$text linkHref="url">bar</$text>
	<$text bold="true"> baz</$text>
</paragraph>
```

During conversion, it will be converted to the following view structure:

```html
<p>
	<a href="url"><strong>Foo </strong>bar</a><strong> baz</strong>
</p>
```

Note, that the `<a>` element is converted in such way that it always becomes the "topmost" element. This is intentional so that no element ever breaks a link, which would otherwise look as follows:

```html
<p>
	<strong><a href="url">Foo </a></strong><a href="url">bar</a><strong> baz</strong>
</p>
```

There are two links with the same `href` next to each other in the generated view (editor output), which is semantically wrong. To make sure that it never happens the view element which represents  a link must have a *priority* defined. Most elements, like for instance `<strong>` do not care about it and stick to the default priority (`10`). The {@link features/link link feature} ensures that all view `<a>` elements have priority set to `5` so they are kept outside other elements.

### Merging attribute elements during conversion

Most of the simple view inline elements like `<strong>` or `<em>` do not have any attributes. Some of them have just one, for instance `<a>` has its `href`.

But it is easy to come up with features that style a part of a text in a more complex way. An example would be a {@link features/font Font family feature}. When used, it adds the `fontFamily` attribute to a text in the model, which is later converted to a `<span>` element with a corresponding `style` attribute.

So what would happen if several attributes are set on the same part of a text? Take this model example where `fontSize` is used next to `fontFamily`:

```
<paragraph>
	<$text fontFamily="Tahoma" fontSize="big">foo</$text>
</paragraph>
```

Editor features are implemented in a granular way, which means that e.g. the font size converter is completely independent from the font family converter. This means that the above converts as follows:

* `fontFamily="value"` converts to `<span style="font-family: value;">`,
* `fontSize="value"` converts to `<span class="text-value">`.

and, in theory, we could expect the following HTML as a result:

```html
<p>
	<span style="font-family: Tahoma;">
		<span class="text-big">foo</span>
	</span>
</p>
```

But this is not the most optimal output we can get from the editor. Why not have just one `<span>` element instead?

```html
<p>
	<span style="font-family: Tahoma;" class="text-big">foo</span>
</p>
```

Obviously a single `<span>` makes more sense. And thanks to the merging mechanism built in the conversion process, this would be the actual result of the conversion.

Why is it so? In the above scenario, two attributes that convert to `<span>`. When the first attribute (say, `fontFamily`) is converted, there is no `<span>` in the view yet. So the first `<span>` is added with the `style` attribute. But then, when `fontSize` is converted, the `<span>` is already in the view. The {@link module:engine/view/downcastwriter~DowncastWriter writer} recognizes it and checks whether those elements can be merged, following these 3 rules:

1. both elements must have the same {@link module:engine/view/element~Element#name name},
2. both elements must have the same {@link module:engine/view/attributeelement~AttributeElement#priority priority},
3. neither can have an {@link module:engine/view/attributeelement~AttributeElement#id id}.

## Examples

It is recommended that the code that customizes editor data and editing pipelines is delivered as {@link framework/guides/architecture/core-editor-architecture#plugins plugins} and all examples in this chapter follow this convention.

Also for the sake of simplicity all examples use the same {@link module:editor-classic/classiceditor~ClassicEditor `ClassicEditor`} but keep in mind that code snippets will work with other editors too.

### Extending editor output ("downcast" only)

In this section, we will focus on customization to the one–way {@link framework/guides/architecture/editing-engine#editing-pipeline "downcast"} pipeline of the editor, which transforms data from the model to the editing view and the output data only. The following examples do not customize the model and do not process the (input) data — you can picture them as post–processors (filters) applied to the output only.

If you want to learn how to load some extra content (element, attributes, classes) into the editor, check out the [next chapter](#loading-custom-content-into-the-editor-downcast-and-upcast) of this guide.

<info-box>
	You can create separate converters for data and editing (downcast) pipelines. The former (`dataDowncast`) will customize the data in the editor output (e.g. when {@link module:core/editor/utils/dataapimixin~DataApi#getData `editor.getData()`}) and the later (`editingDowncast`) will only work for the content of the editor when editing.

	If you do not want to complicate your conversion, you can just add a single (`downcast`) converter which will apply both to the data and the editing view. We did that in all examples to keep them simple but keep in mind you have options:

	```js
	// Adds a conversion dispatcher for the editing downcast pipeline only.
	editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
		// ...
	} );

	// Adds a conversion dispatcher for the data downcast pipeline only.
	editor.conversion.for( 'dataDowncast' ).add( dispatcher => {
		// ...
	} );

	// Adds a conversion dispatcher for both data and editing downcast pipelines.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		// ...
	} );
	```
</info-box>

#### Adding a CSS class to inline elements

In this example all links (`<a href="...">...</a>`) get the `.my-green-link` CSS class. That includes all links in the editor output (`editor.getData()`) and all links in the edited content (existing and future ones).

<info-box>
	Note that the same behavior can be obtained with {@link features/link#custom-link-attributes-decorators link decorators}:

	```js
	ClassicEditor
		.create( ..., {
			// ...
			link: {
				decorators: {
					addGreenLink: {
						mode: 'automatic',
						attributes: {
							class: 'my-green-link'
						}
					}
				}
			}
		} )
	```
</info-box>

{@snippet framework/extending-content-add-link-class}

Adding a custom CSS class to all links is made by a custom converter plugged into the downcast pipeline, following the default converters brought by the {@link features/link Link} feature:

```js
// This plugin brings customization to the downcast pipeline of the editor.
function AddClassToAllLinks( editor ) {
	// Both data and editing pipelines are affected by this conversion.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		// Links are represented in the model as a "linkHref" attribute.
		// Use the "low" listener priority to apply the changes after the Link feature.
		dispatcher.on( 'attribute:linkHref', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;
			const viewSelection = viewWriter.document.selection;

			// Adding a new CSS class is done by wrapping all link ranges and selection
			// in a new attribute element with a class.
			const viewElement = viewWriter.createAttributeElement( 'a', {
					class: 'my-green-link'
				}, {
					priority: 5
				} );

			if ( data.item.is( 'selection' ) ) {
				viewWriter.wrap( viewSelection.getFirstRange(), viewElement );
			} else {
				viewWriter.wrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
			}
		}, { priority: 'low' } );
	} );
}
```

Activate the plugin in the editor:

```js
ClassicEditor
	.create( ..., {
		extraPlugins: [ AddClassToAllLinks ],
	} )
	.then( editor => {
		// ...
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

Add some CSS styles for `.my-green-link` to see the customization in action:

```css
.my-green-link {
	color: #209a25;
	border: 1px solid #209a25;
	border-radius: 2px;
	padding: 0 3px;
	box-shadow: 1px 1px 0 0 #209a25;
}
```

#### Adding an HTML attribute to certain inline elements

In this example all links (`<a href="...">...</a>`) which do not have "ckeditor.com" in their `href="..."` get the `target="_blank"` attribute. That includes all links in the editor output (`editor.getData()`) and all links in the edited content (existing and future ones).

<info-box>
	Note that similar behavior can be obtained with {@link module:link/link~LinkConfig#addTargetToExternalLinks link decorators}:

	```js
	ClassicEditor
		.create( ..., {
			// ...
			link: {
				addTargetToExternalLinks: true
			}
		} )
	```
</info-box>

{@snippet framework/extending-content-add-external-link-target}

**Note:** Edit the URL of the links including "ckeditor.com" and other domains to see them marked as "internal" or "external".

Adding the `target` attribute to all "external" links is made by a custom converter plugged into the downcast pipeline, following the default converters brought by the {@link features/link Link} feature:

```js
// This plugin brings customization to the downcast pipeline of the editor.
function AddTargetToExternalLinks( editor ) {
	// Both data and editing pipelines are affected by this conversion.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		// Links are represented in the model as a "linkHref" attribute.
		// Use the "low" listener priority to apply the changes after the Link feature.
		dispatcher.on( 'attribute:linkHref', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;
			const viewSelection = viewWriter.document.selection;

			// Adding a new CSS class is done by wrapping all link ranges and selection
			// in a new attribute element with the "target" attribute.
			const viewElement = viewWriter.createAttributeElement( 'a', {
					target: '_blank'
				}, {
					priority: 5
				} );

			if ( data.attributeNewValue.match( /ckeditor\.com/ ) ) {
				viewWriter.unwrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
			} else {
				if ( data.item.is( 'selection' ) ) {
					viewWriter.wrap( viewSelection.getFirstRange(), viewElement );
				} else {
					viewWriter.wrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
				}
			}
		}, { priority: 'low' } );
	} );
}
```

Activate the plugin in the editor:

```js
ClassicEditor
	.create( ..., {
		extraPlugins: [ AddTargetToExternalLinks ],
	} )
	.then( editor => {
		// ...
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

Add some CSS styles for links with `target="_blank"` to mark them with with the "&#10697;" symbol:

```css
a[target="_blank"]::after {
	content: '\29C9';
}
```

#### Adding a CSS class to certain inline elements

In this example all links (`<a href="...">...</a>`) which do not have "https://" in their `href="..."` attribute get the `.unsafe-link` CSS class. That includes all links in the editor output (`editor.getData()`) and all links in the edited content (existing and future ones).

<info-box>
	Note that the same behavior can be obtained with {@link features/link#custom-link-attributes-decorators link decorators}:

	```js
	ClassicEditor
		.create( ..., {
			// ...
			link: {
				decorators: {
					markUnsafeLink: {
						mode: 'automatic',
						callback: url => /^(http:)?\/\//.test( url ),
						attributes: {
							class: 'unsafe-link'
						}
					}
				}
			}
		} )
	```
</info-box>

{@snippet framework/extending-content-add-unsafe-link-class}

**Note:** Edit the URL of the links using "http://" or "https://" to see them marked as "safe" or "unsafe".

Adding the `.unsafe-link` CSS class to all "unsafe" links is made by a custom converter plugged into the downcast pipeline, following the default converters brought by the {@link features/link Link} feature:

```js
// This plugin brings customization to the downcast pipeline of the editor.
function AddClassToUnsafeLinks( editor ) {
	// Both data and editing pipelines are affected by this conversion.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		// Links are represented in the model as a "linkHref" attribute.
		// Use the "low" listener priority to apply the changes after the Link feature.
		dispatcher.on( 'attribute:linkHref', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;
			const viewSelection = viewWriter.document.selection;

			// Adding a new CSS class is done by wrapping all link ranges and selection
			// in a new attribute element with the "target" attribute.
			const viewElement = viewWriter.createAttributeElement( 'a', {
					class: 'unsafe-link'
				}, {
					priority: 5
				} );

			if ( data.attributeNewValue.match( /http:\/\// ) ) {
				if ( data.item.is( 'selection' ) ) {
					viewWriter.wrap( viewSelection.getFirstRange(), viewElement );
				} else {
					viewWriter.wrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
				}
			} else {
				viewWriter.unwrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
			}
		}, { priority: 'low' } );
	} );
}
```

Activate the plugin in the editor:

```js
ClassicEditor
	.create( ..., {
		extraPlugins: [ AddClassToUnsafeLinks ],
	} )
	.then( editor => {
		// ...
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

Add some CSS styles for "unsafe" to make them visible:

```css
.unsafe-link {
	padding: 0 2px;
	outline: 2px dashed red;
	background: #ffff00;
}
```

#### Adding a CSS class to block elements

In this example all second–level headings (`<h2>...</h2>`) get the `.my-heading` CSS class. That includes all heading elements in the editor output (`editor.getData()`) and in the edited content (existing and future ones).

{@snippet framework/extending-content-add-heading-class}

Adding a custom CSS class to all `<h2>...</h2>` elements is made by a custom converter plugged into the downcast pipeline, following the default converters brought by the {@link features/headings Headings} feature:

<info-box>
	The `heading1` element in the model corresponds to `<h2>...</h2>` in the output HTML because in the default {@link features/headings#configuring-heading-levels headings feature configuration} `<h1>...</h1>` is reserved for the top–most heading of a webpage.
</info-box>

```js
// This plugin brings customization to the downcast pipeline of the editor.
function AddClassToAllHeading1( editor ) {
	// Both data and editing pipelines are affected by this conversion.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		// Headings are represented in the model as a "heading1" element.
		// Use the "low" listener priority to apply the changes after the Headings feature.
		dispatcher.on( 'insert:heading1', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;

			viewWriter.addClass( 'my-heading', conversionApi.mapper.toViewElement( data.item ) );
		}, { priority: 'low' } );
	} );
}
```

Activate the plugin in the editor:

```js
ClassicEditor
	.create( ..., {
		extraPlugins: [ AddClassToAllHeading1 ],
	} )
	.then( editor => {
		// ...
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

Add some CSS styles for `.my-heading` to see the customization in action:

```css
.my-heading {
	font-family: Georgia, Times, Times New Roman, serif;
	border-left: 6px solid #fd0000;
	padding-left: .8em;
	padding: .1em .8em;
}
```

### Loading custom content into the editor ("downcast" and "upcast")

In the [previous chapter](#extending-editor-output-downcast-only) we focused on post–processing of the editor data output. In this one, we will also extend the editor model so custom data can be loaded into it ({@link framework/guides/architecture/editing-engine#data-pipeline "upcasted"}). This will allow you not only to "correct" the editor output but, for instance, losslessly load data unsupported by editor features.

Eventually, this knowledge will allow you to create your custom features on top of the core features of CKEditor 5.

#### Loading content with a custom attribute

In this example links (`<a href="...">...</a>`) loaded in editor content will preserve their `target` attribute, which is not supported by the {@link features/link Link} feature. The DOM `target` attribute will be stored in the editor model as a `linkTarget` attribute.

Unlike the [downcast–only solution](#adding-an-html-attribute-to-certain-inline-elements), this approach does not change the content loaded into the editor. Links without the `target` attribute will not get one and links with the attribute will preserve its value.

<info-box>
	Note that the same behavior can be obtained with {@link features/link#custom-link-attributes-decorators link decorators}:

	```js
	ClassicEditor
		.create( ..., {
			// ...
			link: {
				decorators: {
					addGreenLink: {
						mode: 'automatic',
						attributes: {
							class: 'my-green-link'
						}
					}
				}
			}
		} )
	```
</info-box>

{@snippet framework/extending-content-allow-link-target}

Allowing the `target` attribute in the editor is made by two custom converters plugged into the downcast and "upcast" pipelines, following the default converters brought by the {@link features/link Link} feature:

```js
function AllowLinkTarget( editor ) {
	// Allow the "linkTarget" attribute in the editor model.
	editor.model.schema.extend( '$text', { allowAttributes: 'linkTarget' } );

	// Tell the editor that the model "linkTarget" attribute converts into <a target="..."></a>
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'linkTarget',
		view: ( attributeValue, writer ) => {
			const linkElement = writer.createAttributeElement( 'a', { target: attributeValue }, { priority: 5 } );
			writer.setCustomProperty( 'link', true, linkElement );

			return linkElement;
		},
		converterPriority: 'low'
	} );

	// Tell the editor that <a target="..."></a> converts into "linkTarget" attribute in the model.
	editor.conversion.for( 'upcast' ).attributeToAttribute( {
		view: {
			name: 'a',
			key: 'target'
		},
		model: 'linkTarget',
		converterPriority: 'low'
	} );
}
```

Activate the plugin in the editor:

```js
ClassicEditor
	.create( ..., {
		extraPlugins: [ AllowLinkTarget ],
	} )
	.then( editor => {
		// ...
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

Add some CSS styles to easily see different link targets:

```css
a[target]::after {
	content: "target=\"" attr(target) "\"";
	font-size: 0.6em;
	position: relative;
	left: 0em;
	top: -1em;
	background: #00ffa6;
	color: #000;
	padding: 1px 3px;
	border-radius: 10px;
}
```

#### Loading content with all attributes

In this example divs (`<div>...</div>`) loaded in editor content will preserve their attributes. All the DOM attributes will be stored in the editor model as corresponding attributes.

{@snippet framework/extending-content-allow-div-attributes}

Allowing all attributes on `div` elements is achieved by custom "upcast" and "downcast" converters that copies each attribute one by one.

Allowing every possible attribute on div in the model is done by adding a {@link module:engine/model/schema~Schema#addAttributeCheck addAttributeCheck()} callback.

<info-box>
	Allowing every attribute on `<div>` elements might introduce security issues - ise XSS attacks. The production code should use only application related attributes and/or properly encode data.
</info-box>

Adding "upcast" and "downcast" converters for the `<div>` element is enough for cases where its attributes does not change. If attributes in the model are modified those `elementToElement()` converters will not be called as `div` is already converted. To overcome this a lower-level API is used.

Instead of using predefined converters the {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event-attribute `attribute`} event listener is registered for "downcast" dispatcher.

```js
function ConvertDivAttributes( editor ) {
	// Allow divs in the model.
	editor.model.schema.register( 'div', {
		allowWhere: '$block',
		allowContentOf: '$root'
	} );

	// Allow divs in the model to have all attributes.
	editor.model.schema.addAttributeCheck( context => {
		if ( context.endsWith( 'div' ) ) {
			return true;
		}
	} );

	// View-to-model converter converting a view div with all its attributes to the model.
	editor.conversion.for( 'upcast' ).elementToElement( {
		view: 'div',
		model: ( viewElement, modelWriter ) => {
			return modelWriter.createElement( 'div', viewElement.getAttributes() );
		}
	} );

	// Model-to-view convert for the div element (attrbiutes are converted separately).
	editor.conversion.for( 'downcast' ).elementToElement( {
		model: 'div',
		view: 'div'
	} );

	// Model-to-view converter for div attributes.
	// Note that we use a lower-level, event-based API here.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
			// Convert div attributes only.
			if ( data.item.name != 'div' ) {
				return;
			}

			const viewWriter = conversionApi.writer;
			const viewDiv = conversionApi.mapper.toViewElement( data.item );

			// In the model-to-view conversion we convert changes.
			// An attribute can be added or removed or changed.
			// The below code handles all 3 cases.
			if ( data.attributeNewValue ) {
				viewWriter.setAttribute( data.attributeKey, data.attributeNewValue, viewDiv );
			} else {
				viewWriter.removeAttribute( data.attributeKey, viewDiv );
			}
		} );
	} );
}
```

Activate the plugin in the editor:

```js
ClassicEditor
	.create( ..., {
		extraPlugins: [ ConvertDivAttributes ],
	} )
	.then( editor => {
		// ...
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

#### Parse attribute values

Some features, like {@link features/font Font}, allows only specific values for inline attributes. In this example we'll add a converter that will parse any `font-size` value into one of defined values.

{@snippet framework/extending-content-arbitrary-attribute-values}

Parsing any font value to model requires writing adding custom "upcast" converter that will override default converter from `FontSize`. Unlike the default one, this converter parses values set in CSS nad sets them into the model.

As the default "downcast" converter only operates on pre-defined values we're also adding a model-to-view converter that simply outputs any model value to font-size using `px` units.

```js
function HandleFontSizeValue( editor ) {
	// Add special catch-all converter for font-size feature.
	editor.conversion.for( 'upcast' ).elementToAttribute( {
		view: {
			name: 'span',
			styles: {
				'font-size': /[\s\S]+/
			}
		},
		model: {
			key: 'fontSize',
			value: viewElement => {
				const value = parseFloat( viewElement.getStyle( 'font-size' ) ).toFixed( 0 );

				// It might be needed to further convert the value to meet business requirements.
				// In the sample the font-size is configured to handle only the sizes:
				// 12, 14, 'default', 18, 20, 22, 24, 26, 28, 30
				// Other sizes will be converted to the model but the UI might not be aware of them.

				// The font-size feature expects numeric values to be Number not String.
				return parseInt( value );
			}
		},
		converterPriority: 'high'
	} );

	// Add special converter for font-size feature to convert all (even not configured)
	// model attribute values.
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: {
			key: 'fontSize'
		},
		view: ( modelValue, viewWriter ) => {
			return viewWriter.createAttributeElement( 'span', {
				style: `font-size:${ modelValue }px`
			} );
		},
		converterPriority: 'high'
	} );
}
```

Activate the plugin in the editor:

```js
ClassicEditor
	.create( ..., {
		items: [ 'heading', '|', 'bold', 'italic', '|', 'fontSize' ],
		fontsize: {
			options: [ 10, 12, 14, 'default', 18, 20, 22 ]
		},
		extraPlugins: [ HandleFontSizeValue ],
	} )
	.then( editor => {
		// ...
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

#### Adding extra attributes to elements contained in a figure

The {@link features/image Image} and {@link features/table Table} features wraps view elements (`<img>` for Image nad `<table>` for Table) in `<figure>`. During the downcast conversion the model element is mapped to `<figure>` not the inner element. In such cases the default `conversion.attributeToAttribute()` conversion helpers could lost information on which element the attribute should be set. To overcome this limitation it is sufficient to write a custom converter that add custom attributes to elements already converted by base features. The key point is to add those converters with lower priority the base converters so they will be called after the base ones.

{@snippet framework/extending-content-custom-figure-attributes}

The sample below is extensible - to add own attributes to preserve just add another `setupCustomAttributeConversion()` call with desired names.

```js
/**
 * Plugin that converts custom attributes for elements that are wrapped in <figure> in the view.
 */
function CustomFigureAttributes( editor ) {
	// Define on which elements the css classes should be preserved:
	setupCustomClassConversion( 'img', 'image', editor );
	setupCustomClassConversion( 'table', 'table', editor );

	editor.conversion.for( 'upcast' ).add( upcastCustomClasses( 'figure' ), { priority: 'low' } );

	// Define custom attributes that should be preserved.
	setupCustomAttributeConversion( 'img', 'image', 'id', editor );
	setupCustomAttributeConversion( 'table', 'table', 'id', editor );
}

/**
 * Setups conversion that preservers classes on img/table elements
 */
function setupCustomClassConversion( viewElementName, modelElementName, editor ) {
	// The 'customClass' attribute will store custom classes from data in the model so schema definitions to allow this attribute.
	editor.model.schema.extend( modelElementName, { allowAttributes: [ 'customClass' ] } );

	// Define upcast converters for <img> and <table> elements with "low" priority so they are run after default converters.
	editor.conversion.for( 'upcast' ).add( upcastCustomClasses( viewElementName ), { priority: 'low' } );

	// Define downcast converters for model element with "low" priority so they are run after default converters.
	editor.conversion.for( 'downcast' ).add( downcastCustomClasses( modelElementName ), { priority: 'low' } );
}

/**
 * Setups conversion for custom attribute on view elements contained inside figure.
 *
 * This method:
 *
 * - adds proper schema rules
 * - adds an upcast converter
 * - adds a downcast converter
 */
function setupCustomAttributeConversion( viewElementName, modelElementName, viewAttribute, editor ) {
	// Extend schema to store attribute in the model.
	const modelAttribute = `custom${ viewAttribute }`;

	editor.model.schema.extend( modelElementName, { allowAttributes: [ modelAttribute ] } );

	editor.conversion.for( 'upcast' ).add( upcastAttribute( viewElementName, viewAttribute, modelAttribute ) );
	editor.conversion.for( 'downcast' ).add( downcastAttribute( modelElementName, viewElementName, viewAttribute, modelAttribute ) );
}

/**
 * Creates upcast converter that will pass all classes from view element to model element.
 */
function upcastCustomClasses( elementName ) {
	return dispatcher => dispatcher.on( `element:${ elementName }`, ( evt, data, conversionApi ) => {
		const viewItem = data.viewItem;
		const modelRange = data.modelRange;

		const modelElement = modelRange && modelRange.start.nodeAfter;

		if ( !modelElement ) {
			return;
		}

		// The upcast conversion pick up classes from base element and from figure element also so it should be extensible.
		const currentAttributeValue = modelElement.getAttribute( 'customClass' ) || [];

		currentAttributeValue.push( ...viewItem.getClassNames() );

		conversionApi.writer.setAttribute( 'customClass', currentAttributeValue, modelElement );
	} );
}

/**
 * Creates downcast converter that add classes defined in `customClass` attribute to given view element.
 *
 * This converter expects that view element is nested in figure element.
 */
function downcastCustomClasses( modelElementName ) {
	return dispatcher => dispatcher.on( `insert:${ modelElementName }`, ( evt, data, conversionApi ) => {
		const modelElement = data.item;

		const viewFigure = conversionApi.mapper.toViewElement( modelElement );

		if ( !viewFigure ) {
			return;
		}

		// The below code assumes that classes are set on <figure> element...
		conversionApi.writer.addClass( modelElement.getAttribute( 'customClass' ), viewFigure );

		// ... but if you preferIf the classes should be passed to the <img> find the view element inside figure:
		//
		// const viewElement = findViewChild( viewFigure, viewElementName, conversionApi );
		//
		// conversionApi.writer.addClass( modelElement.getAttribute( 'customClass' ), viewElement );
	} );
}

/**
 * Helper method that search for given view element in all children of model element.
 *
 * @param {module:engine/view/item~Item} viewElement
 * @param {String} viewElementName
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
 * @return {module:engine/view/item~Item}
 */
function findViewChild( viewElement, viewElementName, conversionApi ) {
	const viewChildren = Array.from( conversionApi.writer.createRangeIn( viewElement ).getItems() );

	return viewChildren.find( item => item.is( viewElementName ) );
}

/**
 * Returns custom attribute upcast converter.
 */
function upcastAttribute( viewElementName, viewAttribute, modelAttribute ) {
	return dispatcher => dispatcher.on( `element:${ viewElementName }`, ( evt, data, conversionApi ) => {
		const viewItem = data.viewItem;
		const modelRange = data.modelRange;

		const modelElement = modelRange && modelRange.start.nodeAfter;

		if ( !modelElement ) {
			return;
		}

		conversionApi.writer.setAttribute( modelAttribute, viewItem.getAttribute( viewAttribute ), modelElement );
	} );
}

/**
 * Returns custom attribute downcast converter.
 */
function downcastAttribute( modelElementName, viewElementName, viewAttribute, modelAttribute ) {
	return dispatcher => dispatcher.on( `insert:${ modelElementName }`, ( evt, data, conversionApi ) => {
		const modelElement = data.item;

		const viewFigure = conversionApi.mapper.toViewElement( modelElement );
		const viewElement = findViewChild( viewFigure, viewElementName, conversionApi );

		if ( !viewElement ) {
			return;
		}

		conversionApi.writer.setAttribute( viewAttribute, modelElement.getAttribute( modelAttribute ), viewElement );
	} );
}
```

Activate the plugin in the editor:

```js
ClassicEditor
	.create( ..., {
		extraPlugins: [ CustomFigureAttributes ],
	} )
	.then( editor => {
		// ...
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```
