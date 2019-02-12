---
category: framework-deep-dive
menu-title: Extending editor content
---

{@snippet framework/build-extending-content-source}

# Extending editor content

This article will help you learn how to quickly extend (customize) the content produced by the core rich text editor features, for instance, with how to add your custom attributes and CSS classes to the output data. It requires some basic knowledge about the editor model and editing view layers you can find in the {@link framework/guides/architecture/editing-engine introduction to the editing engine architecture}.

## Basics of editor conversion

TODO (converters, pipelines, block elements, inline attributes).

## Examples

Customisations in the examples are brought by plugins loaded by the editor. For the sake of simplicity, all examples use the same {@link module:editor-classic/classiceditor~ClassicEditor `ClassicEditor`} but keep in mind that code snippets will work with other editors too.

### Extending editor output ("downcast" only)

In this section, we will focus on customization to the "downcast" pipeline of the editor, which transforms data from the model to the editing view and the output data. The following examples do not customize the model and do not process the (input) data — you can picture them as post–processors (filters) applied to the output only.

If you want to learn how to load some extra content (element, attributes, classes) into the editor, check out the [next chapter](#enabling-custom-attributes-in-the-editor-input-upcast) of this guide.

<info-box>
	You can create separate converters for data and editing (downcast) pipelines. The former (`dataDowncast`) will customize the data in the editor output (e.g. when {@link module:core/editor/utils/dataapimixin~DataApi#getData `editor.getData()`}) and the later (`editingDowncast`) will only work for the content of the editor when editing.

	If you do not want to complicate you conversion, you can just add a single (`downcast`) converter which will apply both to the data and the editing view. We did that in all examples to keep them simple but keep it mind you have options:

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
// This plugin brings a customization to the downcast pipeline of the editor.
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
// This plugin brings a customization to the downcast pipeline of the editor.
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

**Note:** Edit the URL of the links using "http://" or "https://" to see see them marked as "safe" or "unsafe".

##### Code

Adding the `.unsafe-link` CSS class to all "unsafe" links is made by a custom converter plugged into the downcast pipeline, following the default converters brought by the {@link features/link Link} feature:

```js
// This plugin brings a customization to the downcast pipeline of the editor.
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
// This plugin brings a customization to the downcast pipeline of the editor.
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

### Loading custom content into the editor ("upcast")

TODO.

#### Loading a content with a custom attribute

In this example links (`<a href="...">...</a>`) loaded in editor content will preserve their `target` attribute, which is not supported by the {@link features/link Link} feature. The DOM `target` attribute will be stored in the editor model as a `linkTarget` attribute.

Unlike the [downcast–only solution](#adding-an-html-attribute-to-certain-inline-elements), this approach does not change the content loaded into the editor. Links without the `target` attribute will not get one and links with the attribute will preserve its value.

##### Demo

{@snippet framework/extending-content-allow-link-target}

##### Code

Allowing the `target` attribute in the editor is made by two custom converters plugged into the downcast and upcast pipelines, following the default converters brought by the {@link features/link Link} feature:

```js
function AllowLinkTarget( editor ) {
	// Allow the "linkTarget" attribute in the editor model.
	editor.model.schema.extend( '$text', { allowAttributes: 'linkTarget' } );

	// Tell the editor that the model "linkTarget" attribute converts into <a target="..."></a>
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'linkTarget',
		view: ( attributeValue, writer ) => {
			return writer.createAttributeElement( 'a', { target: attributeValue }, { priority: 5 } );
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

Add some CSS styles for links with `target="_blank"` to mark them with with the "&#10697;" symbol:

```css
a[target="_blank"]::after {
	content: '\29C9';
}
```
