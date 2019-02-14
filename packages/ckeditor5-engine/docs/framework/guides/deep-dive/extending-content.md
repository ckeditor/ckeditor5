---
category: framework-deep-dive
menu-title: Extending editor content
---

{@snippet framework/build-extending-content-source}

# Extending editor content

This article will help you learn how to quickly extend (customize) the content produced by the existing core rich text editor features, for instance, with how to add custom attributes and CSS classes to the editor output or how to load additional data into an editor.

It requires some basic knowledge about the editor model and editing view layers you can find in the {@link framework/guides/architecture/editing-engine introduction to the editing engine architecture}.

## Selected concepts of data conversion

Before we go to the examples, let us take a look at some concepts that drive the structure of the content in the editor:

### Inline vs. block elements in the content

Generally speaking, there are two main {@link framework/guides/architecture/editing-engine#element-types-and-custom-data types of the content} in the editor {@link framework/guides/architecture/editing-engine#view view and data output}: inline and block.

The inline content means elements like `<strong>`, `<a>` or `<span>`. Unlike `<p>`, `<blockquote>` or `<div>`, inline elements do not structure the data. Instead, they mark some text in a specific (visual and semantical) way. These elements are a characteristic of a text, for instance, we could say that some part of a text is bold, or a link, etc.. This concept has its reflection in the {@link framework/guides/architecture/editing-engine#model model} of the editor where `<a>` or `<strong>` are not represented as elements. Instead, they are attributes added to a text.

In the model, we might have a `<paragraph>` element with "Foo bar" text, where "bar" has the `bold` attribute set `true`. A pseudo–code of this model data structure could look as follows:

```
<paragraph>Foo <$text bold="true">bar</$text></paragraph>
```

Note that there is no `<strong>` or any other additional element there, it is just some text with an attribute. Later, in the process we call the {@link framework/guides/architecture/editing-engine#conversion conversion}, that bold attribute will be converted to the `<strong>` element.

<info-box>
	View elements created out of model attributes have their own {@link module:engine/view/attributeelement~AttributeElement `AttributeElement` class} and instead of inline elements they can be called attribute elements.
</info-box>

### Conversion of multiple text attributes

Text may have multiple {@link framework/guides/architecture/editing-engine#element-types-and-custom-data#text-attributes attributes} and all of them are converted to their respective view inline elements. Keep in mind that in the model, attributes do not have any specific order. This is contrary to the editor view or HTML output, where inline elements are nested one in another. The nesting happens during conversion from the model to the view. This makes working in the model simpler, as features do not need to take care of breaking or rearranging elements in the model.

For instance, consider the following model structure:

```
<paragraph>
	<$text bold="true" linkHref="url">Foo </$text>
	<$text linkHref="url">bar</$text>
	<$text bold="true"> baz</$text>
</paragraph>
```

During conversion, it will be converted to:

```html
<p>
	<a href="url"><strong>Foo </strong>bar</a><strong> baz</strong>
</p>
```

Note, that the `<a>` element is converted in such way it becomes the "topmost" element. This is intentional so that no element ever breaks a link, which would otherwise look as follows:

```html
<p>
	<strong><a href="url">Foo </a></strong><a href="url">bar</a><strong> baz</strong>
</p>
```

There are two links with the same `href` next to each other in the generated view (editor output), which is semantically wrong. To make sure it never happens, {@link module:engine/view/attributeelement~AttributeElement} has a priority which controls the nesting. Most elements, like for instance `<strong>` do not care about it and stick to the default priority. On the other hand, the `<a>` element uses the priority to make sure it never gets split by other elements.

### Merging text attributes during conversion

Most of the simple inline elements like `<strong>` or `<em>` do not have any attributes. Some of them have just one, for instance `<a>` has its `href`.

But it is easy to come up with features that style a part of a text in a more complex way. An example would be a {@link features/font Font family} feature. When used, it adds the `fontFamily` attribute to a text in the model, which is later converted to a `<span>` element with a corresponding `style` attribute.

So what would happen if several attributes are set on the same part of a text? Take this model example where `fontSize` is used next to the `fontFamily`:

```
<paragraph>
	<$text fontFamily="Tahoma" fontSize="big">foo</$text>
</paragraph>
```

The above converts as follows:

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

Obviously a single `<span>` makes more sense. And thanks to the conversion merging mechanism in CKEditor 5, this would be the actual result of the conversion.

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

##### Demo

{@snippet framework/extending-content-add-link-class}

##### Code

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

##### Demo

{@snippet framework/extending-content-add-external-link-target}

**Note:** Edit the URL of the links including "ckeditor.com" and other domains to see them marked as "internal" or "external".

##### Code

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

##### Demo

{@snippet framework/extending-content-add-unsafe-link-class}

**Note:** Edit the URL of the links using "http://" or "https://" to see them marked as "safe" or "unsafe".

##### Code

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

##### Demo

{@snippet framework/extending-content-add-heading-class}

##### Code

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

##### Demo

{@snippet framework/extending-content-allow-link-target}

##### Code

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
