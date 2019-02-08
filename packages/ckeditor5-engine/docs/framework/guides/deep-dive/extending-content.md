---
category: framework-deep-dive
menu-title: Extending editor content
---

{@snippet framework/build-extending-content-source}

# Extending editor content

This article will help you learn how to extend (customize) the content produced by the rich text editor, for instance, with your custom attributes and CSS classes. It requires some basic knowledge about the editor model and editing view layers you can find in the {@link framework/guides/architecture/editing-engine introduction to the editing engine architecture}.

## Basics of editor conversion

TODO (converters, pipelines, block elements, inline attributes)

## Examples

Customisations in the examples are brought by plugins loaded by the editor. For the sake of simplicity, all examples use the same {@link module:editor-classic/classiceditor~ClassicEditor `ClassicEditor`} but keep in mind that code snippets will work with other editors too.

### Extending editor output ("downcast")

In this section, we will focus on customization to the "downcast" pipeline of the editor, which transforms data from the model to the editing view and the output data. The following examples do not customize the model and do not process the (input) data — you can picture them as post–processors (filters) applied to the output only.

<info-box>
	You can create separate converters for data and editing (downcast) pipelines. The former (`dataDowncast`) will customize the data in the editor output (e.g. when {@link module:core/editor/utils/dataapimixin~DataApi#getData `editor.getData()`}) and the later (`editingDowncast`) will only work for the content of the editor when editing.

	If you do not want to complicate you conversion, you can just add a single (`downcast`) converter which will apply both to the data and the editing view. We did that in all examples to keep them simple but keep it mind you have options:

	```js
	// Adds a conversion dispatcher for the editing downcast pipeline only.
	editor.conversion.for( 'editingDowncast' ).add( dispatcher => { ... } );

	// Adds a conversion dispatcher for the data downcast pipeline only.
	editor.conversion.for( 'dataDowncast' ).add( dispatcher => { ... } );

	// Adds a conversion dispatcher for both data and editing downcast pipelines.
	editor.conversion.for( 'downcast' ).add( dispatcher => { ... } );
	```
</info-box>

#### Adding a CSS class to all inline elements (e.g. links)

In this example all links (`<a href="...">...</a>`) get the `.my-link-class` CSS class. That includes all links in the editor output (`editor.getData()`) and all links in the edited content (existing and future ones).

##### Demo

{@snippet framework/extending-content-add-link-class}

##### Code snippets

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
					class: 'my-link-class'
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

Add some CSS styles for `.my-link-class` to see the customization it in action:

```css
.my-link-class {
	color: #209a25;
	border: 1px solid #209a25;
	border-radius: 2px;
	padding: 0 3px;
	box-shadow: 1px 1px 0 0 #209a25;
}
```

#### Adding an HTML attribute to certain inline elements (e.g. links)

In this example all links (`<a href="...">...</a>`) which do not have "ckeditor.com" in their `href="..."` get the `target="_blank"` attribute. That includes all links in the editor output (`editor.getData()`) and all links in the edited content (existing and future ones).

##### Demo

{@snippet framework/extending-content-add-external-link-target}

##### Code snippet

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

### Enabling custom attributes in the editor input ("upcast")
