---
category: framework-deep-dive-conversion
menu-title: Extending editor output
order: 20
---

{@snippet framework/build-extending-content-source}

# Extending the editor output

This guide focuses on customization of the one–way {@link framework/guides/architecture/editing-engine#editing-pipeline "downcast"} pipeline of CKEditor 5. This pipeline transforms the data from the model to the editing view and the output data. The following examples do not customize the model and do not process the (input) data &mdash; you can picture them as post–processors (filters) applied to the output only.

If you want to learn how to load some extra content (element, attributes, classes) into the rich-text editor, check out the {@link framework/guides/deep-dive/conversion-preserving-custom-content next guide} of this section.

## Before starting

### Code architecture

It is recommended for the code that customizes the editor data and editing pipelines to be delivered as {@link framework/guides/architecture/core-editor-architecture#plugins plugins} and all examples in this guide follow this convention.

Also for the sake of simplicity all examples use the same {@link module:editor-classic/classiceditor~ClassicEditor `ClassicEditor`}, but keep in mind that code snippets will work with other editors, too.

Finally, none of the converters covered in this guide requires to import any modules from CKEditor 5 Framework, hence, you can write them without rebuilding the editor. In other words, such converters can easily be added to existing {@link builds/guides/overview CKEditor 5 builds}.

### Granular converters

You can create separate converters for the data and editing (downcast) pipelines. The former (`dataDowncast`) will customize the data in the editor output (e.g. when {@link builds/guides/integration/saving-data#manually-retrieving-the-data obtaining the editor data}). The latter (`editingDowncast`) will only work for the content of the editor when editing.

If you do not want to complicate your conversion, you can just add a single (`downcast`) converter which will apply both to the data and the editing view. We did that in all the examples to keep them simple but keep in mind you have several options:

```js
// Adds a conversion dispatcher for the editing downcast pipeline only.
editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
	// ...
} );

// Adds a conversion dispatcher for the data downcast pipeline only.
editor.conversion.for( 'dataDowncast' ).add( dispatcher => {
	// ...
} );

// Adds a conversion dispatcher for both the data and the editing downcast pipelines.
editor.conversion.for( 'downcast' ).add( dispatcher => {
	// ...
} );
```

### CKEditor 5 inspector

The {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} is an invaluable help when working with the model and view structures. It allows browsing their structure and checking selection positions like in typical browser developer tools. Make sure to enable the inspector when playing with CKEditor 5.

## Adding a CSS class to inline elements

In this example all links (`<a href="...">...</a>`) get the `.my-green-link` CSS class. This includes all links in the editor output (`editor.getData()`) and all links in the edited content (existing and future ones).

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

A custom CSS class is added to all links by a custom converter plugged into the downcast pipeline, following the default converters brought by the {@link features/link link} feature:

```js
// This plugin brings customization to the downcast pipeline of the editor.
function AddClassToAllLinks( editor ) {
	// Both the data and the editing pipelines are affected by this conversion.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		// Links are represented in the model as a "linkHref" attribute.
		// Use the "low" listener priority to apply the changes after the link feature.
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

## Adding an HTML attribute to certain inline elements

In this example all the links (`<a href="...">...</a>`) that do not have "ckeditor.com" in their `href="..."` get the `target="_blank"` attribute. This includes all links in the editor output (`editor.getData()`) and all links in the edited content (existing and future ones).

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

The `target` attribute is added to all "external" links by a custom converter plugged into the downcast pipeline, following the default converters brought by the {@link features/link link} feature:

```js
// This plugin brings customization to the downcast pipeline of the editor.
function AddTargetToExternalLinks( editor ) {
	// Both the data and the editing pipelines are affected by this conversion.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		// Links are represented in the model as a "linkHref" attribute.
		// Use the "low" listener priority to apply the changes after the link feature.
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

## Adding a CSS class to certain inline elements

In this example all links (`<a href="...">...</a>`) that do not have `https://` in their `href="..."` attribute get the `.unsafe-link` CSS class. This includes all links in the editor output (`editor.getData()`) and all links in the edited content (existing and future ones).

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

<!-- Changed the "red" description in the snippet into a more universal one independant of the CSS class introduced -->

The `.unsafe-link` CSS class is added to all "unsafe" links by a custom converter plugged into the downcast pipeline, following the default converters brought by the {@link features/link link} feature:

```js
// This plugin brings customization to the downcast pipeline of the editor.
function AddClassToUnsafeLinks( editor ) {
	// Both the data and the editing pipelines are affected by this conversion.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		// Links are represented in the model as a "linkHref" attribute.
		// Use the "low" listener priority to apply the changes after the link feature.
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

Add some CSS styles for "unsafe" links to make them visible:

```css
.unsafe-link {
	padding: 0 2px;
	outline: 2px dashed red;
	background: #ffff00;
}
```

## Adding a CSS class to block elements

In this example all second–level headings (`<h2>...</h2>`) get the `.my-heading` CSS class. This includes all the heading elements in the editor output (`editor.getData()`) and in the edited content (existing and future ones).

{@snippet framework/extending-content-add-heading-class}

A custom CSS class is added to all `<h2>...</h2>` elements by a custom converter plugged into the downcast pipeline, following the default converters brought by the {@link features/headings headings} feature:

<info-box>
	The `heading1` element in the model corresponds to `<h2>...</h2>` in the output HTML because in the default {@link features/headings#configuring-heading-levels headings feature configuration} `<h1>...</h1>` is reserved for the top–most heading of the webpage.
</info-box>

<!-- This above is utterly unclear if an end-user would be to read it -->

```js
// This plugin brings customization to the downcast pipeline of the editor.
function AddClassToAllHeading1( editor ) {
	// Both the data and the editing pipelines are affected by this conversion.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		// Headings are represented in the model as a "heading1" element.
		// Use the "low" listener priority to apply the changes after the headings feature.
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

## What's next?

If you would like to read more about how to make CKEditor 5 accept more content, refer to the {@link framework/guides/deep-dive/conversion-preserving-custom-content Preserving custom content} guide.