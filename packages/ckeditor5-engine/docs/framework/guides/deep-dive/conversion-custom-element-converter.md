---
category: framework-deep-dive-conversion
menu-title: Custom element conversion
order: 40
---

{@snippet framework/build-custom-element-converter-source}

There are three levels on which elements can be converted:

* By using the two-way converter: {@link module:engine/conversion/conversion~Conversion#elementToElement `conversion.elementToElement()`}. It is a fully declarative API. It is the least powerful option but it is the easiest one to use.
* By using one-way converters: for example {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `conversion.for( 'downcast' ).elementToElement()`} and {@link module:engine/conversion/upcasthelpers~UpcastHelpers#elementToElement `conversion.for( 'upcast' ).elementToElement()`}. In this case, you need to define at least two converters (for upcast and downcast), but the "how" part becomes a callback, and hence you gain more control over it.
* Finally, by using event-based converters. In this case, you need to listen to events fired by {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} and {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher}. This method has the full access to every bit of logic that a converter needs to implement and therefore it can be used to write the most complex conversion methods.

In this guide, we will show you how to migrate from a simple two-way converter to an event-based converters as the requirements regarding the feature get more complex.

## Introduction

Let's assume that content in your application contains "info boxes". As for now, it was only required to wrap part of a content in a `<div>` element that would look in the data and editing views like this:

```html
<div class="info-box">
	<!-- any editable content -->
	<p>This is <strong>important!</strong></p>
</div>
```

This data is represented in the model as the following structure:

```html
<infoBox>
	<!-- any $block content: -->
	<paragraph><$text>This is </$text><$text bold="true">important!</$text></paragraph>
</infoBox>
```

This can be easily done with the below schema and converters in a simple `InfoBox` plugin:

```js
class InfoBox {
	constructor( editor ) {
		// 1. Define infoBox as an object that can be contained any other content.
		editor.model.schema.register( 'infoBox', {
			allowWhere: '$block',
			allowContentOf: '$root',
			isObject: true
		} );

		// 2. Conversion is straight forward:
		editor.conversion.elementToElement( {
			model: 'infoBox',
			view: {
				name: 'div',
				classes: 'info-box'
			}
		} );
	}
}
```

## Migrating to an event-based converter

Let's now assume that the requirements have changed and there is a need for adding an additional element in the data and editing views that will display the type of the info box (warning, error, info, etc.).

The new info box structure:

```html
<div class="info-box info-box-warning">
	<div class="info-box-title">Warning</div>
	<div class="info-box-content">
		<!-- any editable content -->
		<p>This is <strong>important!</strong></p>
	</div>
</div>
```

The "Warning" part should not be editable. It defines a type of the info box so we can store this  bit of information as an attribute of the `<infoBox>` element:

```html
<infoBox infoBoxType="warning">
	<!-- any $block content: -->
	<paragraph><$text>This is </$text><$text bold="true">important!</$text></paragraph>
</infoBox>
```

Let's see how to update our basic implementation to cover these requirements.

### Demo

Below is a demo of the editor with the example info box.

{@snippet framework/extending-content-custom-element-converter}

### Schema

The type of the box is defined by the additional class on the main `<div>` but it is also represented as text in `<div class="info-box-title">`. All the info box content must be now placed inside `<div class="info-box-content">` instead of the main wrapper.

For the above requirements we can see that the model structure of the `infoBox` does not need to change much. We can still use a single element in the model. The only addition to the model is an attribute that will hold information about the info box type:

```js
editor.model.schema.register( 'infoBox', {
	allowWhere: '$block',
	allowContentOf: '$root',
	isObject: true,
	allowAttributes: [ 'infoBoxType' ] // Added
} );
```

### Event-based upcast converter

The conversion of the type of the box itself could be achieved by using {@link module:engine/conversion/conversion~Conversion#attributeToAttribute `attributeToAttribute()`} (`info-box-*` CSS classes to the `infoBoxType` model attribute). However, two more changes were made to the data format that we need to handle:

* There is the new `<div class="info-box-title">` element that should be ignored during upcast conversion as it duplicates the information conveyed by the main element's CSS class.
* The content of the info box is now located inside another element (previously it was located directly in the main wrapper).

Neither two-way nor one-way converters can handle such conversion. Therefore, we need to use an event-based converter with the following behavior:

1. Create model `<infoBox>` element with `infoBoxType` attribute.
1. Skip conversion of `<div class="info-box-title">` as the information about type can be obtained from the wrapper's CSS classes.
1. Convert children of `<div class="info-box-content">` and insert them directly into `<infoBox>`.

```js
function upcastConverter( event, data, conversionApi ) {
	const viewInfoBox = data.viewItem;

	// Check whether the view element is an info box <div>.
	// Otherwise, it should be handled by another converter.
	if ( !viewInfoBox.hasClass( 'info-box' ) ) {
		return;
	}

	// Create a model structure.
	const modelElement = conversionApi.writer.createElement( 'infoBox', {
		infoBoxType: getTypeFromViewElement( viewInfoBox )
	} );

	// Try to safely insert the element into the model structure.
	// If `safeInsert()` returns `false` the element cannot be safely inserted
	// into the content, and the conversion process must stop.
	// This may happen if the data that we are converting has incorrect structure
	// (e.g. was copied from an external website).
	if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
		return;
	}

	// Mark the info box <div> as handled by this converter.
	conversionApi.consumable.consume( viewInfoBox, { name: true } );

	// Let's assume that the HTML structure is always the same.
	// Note: for full bulletproofing this converter we should also check
	// whether these elements are the right ones.
	const viewInfoBoxTitle = viewInfoBox.getChild( 0 );
	const viewInfoBoxContent = viewInfoBox.getChild( 1 );

	// Mark info box inner elements (title and content <div>s) as handled by this converter.
	conversionApi.consumable.consume( viewInfoBoxTitle, { name: true } );
	conversionApi.consumable.consume( viewInfoBoxContent, { name: true } );

	// Let the editor handle children of <div class="info-box-content">.
	conversionApi.convertChildren( viewInfoBoxContent, modelElement );

	// Finally, update the conversion's modelRange and modelCursor.
	conversionApi.updateConversionResult( modelElement, data );
}

// Helper function to read the type from the view classes.
function getTypeFromViewElement( viewElement ) {
	if ( viewElement.hasClass( 'info-box-info' ) ) {
		return 'Info';
	}

	if ( viewElement.hasClass( 'info-box-warning' ) ) {
		return 'Warning';
	}

	return 'None';
}
```

This upcast converter callback can now be plugged by adding a listener to the {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#element `UpcastDispatcher#element` event}. We will listen to `element:div` to ensure that the callback is called only for `<div>` elements.

```js
editor.conversion.for( 'upcast' )
	.add( dispatcher => dispatcher.on( 'element:div', upcastConverter ) );
```

### Event-based downcast converter

The missing bit are the downcast converters for the editing and data pipelines. We want to use the widget system to make the info box behave like an "object". The other aspect that we need to take care of is the fact that the view structure has more elements than the model structure. In this case, we could actually use one-way converters. However, we will showcase how an event-based converter would look.

<info-box>
	See the {@link framework/guides/tutorials/implementing-a-block-widget Implementing a block widget} to learn about the widget system.
</info-box>

The remaining downcast converters:

```js
function editingDowncastConverter( event, data, conversionApi ) {
	let { infoBox, infoBoxContent, infoBoxTitle } = createViewElements( data, conversionApi );

	// Decorate view items as a widget and widget editable area.
	infoBox = toWidget( infoBox, conversionApi.writer, { label: 'info box widget' } );
	infoBoxContent = toWidgetEditable( infoBoxContent, conversionApi.writer );

	insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent );
}

function dataDowncastConverter( event, data, conversionApi ) {
	const { infoBox, infoBoxContent, infoBoxTitle } = createViewElements( data, conversionApi );

	insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent );
}

function createViewElements( data, conversionApi ) {
	const type = data.item.getAttribute( 'infoBoxType' );

	const infoBox = conversionApi.writer.createContainerElement( 'div', {
		class: `info-box info-box-${ type.toLowerCase() }`
	} );
	const infoBoxContent = conversionApi.writer.createEditableElement( 'div', {
		class: 'info-box-content'
	} );

	const infoBoxTitle = conversionApi.writer.createUIElement( 'div',
		{ class: 'info-box-title' },
		function( domDocument ) {
			const domElement = this.toDomElement( domDocument );

			domElement.innerText = type;

			return domElement;
		} );

	return { infoBox, infoBoxContent, infoBoxTitle };
}

function insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent ) {
	conversionApi.consumable.consume( data.item, 'insert' );

	conversionApi.writer.insert(
		conversionApi.writer.createPositionAt( infoBox, 0 ),
		infoBoxTitle
	);
	conversionApi.writer.insert(
		conversionApi.writer.createPositionAt( infoBox, 1 ),
		infoBoxContent
	);

	// The default mapping between the model <infoBox> and its view representation.
	conversionApi.mapper.bindElements( data.item, infoBox );
	// However, since the model <infoBox> content need to end up in the inner
	// <div class="info-box-content"> we need to bind one with another overriding
	// part of the default binding.
	conversionApi.mapper.bindElements( data.item, infoBoxContent );

	conversionApi.writer.insert(
		conversionApi.mapper.toViewPosition( data.range.start ),
		infoBox
	);
}
```

These two converters need to be plugged as listeners to the {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#insert `DowncastDispatcher#insert` event}:

```js
editor.conversion.for( 'editingDowncast' )
	.add( dispatcher => dispatcher.on( 'insert:infoBox', editingDowncastConverter ) );
editor.conversion.for( 'dataDowncast' )
	.add( dispatcher => dispatcher.on( 'insert:infoBox', dataDowncastConverter ) );
```

### Updated plugin code

The updated `InfoBox` plugin that glues all this together:

```js
class InfoBox {
	constructor( editor ) {
		// Schema definition
		editor.model.schema.register( 'infoBox', {
			allowWhere: '$block',
			allowContentOf: '$root',
			isObject: true,
			allowAttributes: [ 'infoBoxType' ]
		} );

		// Upcast converter.
		editor.conversion.for( 'upcast' )
			.add( dispatcher => dispatcher.on( 'element:div', upcastConverter ) );

		// The downcast conversion must be split as we need a widget in the editing pipeline.
		editor.conversion.for( 'editingDowncast' )
			.add( dispatcher => dispatcher.on( 'insert:infoBox', editingDowncastConverter ) );
		editor.conversion.for( 'dataDowncast' )
			.add( dispatcher => dispatcher.on( 'insert:infoBox', dataDowncastConverter ) );
	}
}

function upcastConverter() {
	// ...
}

function editingDowncastConverter() {
	// ...
}

function dataDowncastConverter() {
	// ...
}
```
