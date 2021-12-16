---
category: framework-deep-dive-conversion
menu-title: Custom element conversion
order: 40
---

{@snippet framework/build-custom-element-converter-source}

There are three levels on which elements can be converted:

* By using the two-way converter: {@link module:engine/conversion/conversion~Conversion#elementToElement `conversion.elementToElement()`}.
  This is a fully declarative API. It is the least powerful option but it is the easiest one to use.
* By using one-way converters: for example {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `conversion.for( 'downcast' ).elementToElement()`} and {@link module:engine/conversion/upcasthelpers~UpcastHelpers#elementToElement `conversion.for( 'upcast' ).elementToElement()`}.
  In this case, you need to define at least two converters (for upcast and downcast), but the "how" part becomes a callback, and hence you gain more control over it.
* Finally, by using event-based converters.
  In this case, you need to listen to events fired by {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} and {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher}. This method has full access to every bit of logic that a converter needs to implement and therefore it can be used to write the most complex conversion methods.

This guide explains how to migrate from a simple two-way converter to an event-based converter as the requirements regarding the feature get more complex.

## Introduction

Let us assume that the content in your application contains "info boxes". As for now, it was only required to wrap a part of the content in a `<div>` element that would look like this in the data and editing views:

```html
<div class="info-box">
	<!-- Any editable content. -->
	<p>This is <strong>important!</strong></p>
</div>
```

The data is represented in the model as the following structure:

```html
<infoBox>
	<!-- Any $block content. -->
	<paragraph><$text>This is </$text><$text bold="true">important!</$text></paragraph>
</infoBox>
```

This can be easily done with the below schema and converters in a simple `InfoBox` plugin:

```js
class InfoBox {
	constructor( editor ) {
		// 1. Define infoBox as an object that can contain any other content.
		editor.model.schema.register( 'infoBox', {
			allowWhere: '$block',
			allowContentOf: '$root',
			isObject: true
		} );

		// 2. The conversion is straightforward:
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

Let us now assume that the requirements have changed and there is a need for adding an additional element in the data and editing views that will display the type of the info box (warning, error, info, etc.).

The new info box structure:

```html
<div class="info-box info-box-warning">
	<div class="info-box-title">Warning</div>
	<div class="info-box-content">
		<!-- Any editable content. -->
		<p>This is <strong>important!</strong></p>
	</div>
</div>
```

The "Warning" part should not be editable. It defines the type of the info box so you can store this bit of information as an attribute of the `<infoBox>` element:

```html
<infoBox infoBoxType="warning">
	<!-- Any $block content. -->
	<paragraph><$text>This is </$text><$text bold="true">important!</$text></paragraph>
</infoBox>
```

Let us see how to update the basic implementation to cover these requirements.

### Demo

Below is a demo of the editor with a sample info box.

{@snippet framework/extending-content-custom-element-converter}

### Schema

The type of the box is defined by an additional class on the main `<div>` but it is also represented as text in `<div class="info-box-title">`. All the info box content must now be placed inside `<div class="info-box-content">` instead of the main wrapper.

For the above requirements you can see that the model structure of the `infoBox` does not need to change much. You can still use a single element in the model. The only addition to the model is an attribute that will store information about the info box type:

```js
editor.model.schema.register( 'infoBox', {
	allowWhere: '$block',
	allowContentOf: '$root',
	isObject: true,
	allowAttributes: [ 'infoBoxType' ] // Added.
} );
```

### Event-based upcast converter

The conversion of the type of the box itself can be achieved by using {@link module:engine/conversion/conversion~Conversion#attributeToAttribute `attributeToAttribute()`} (`info-box-*` CSS classes to the `infoBoxType` model attribute). However, two more changes were made to the data format that you need to handle:

* There is a new `<div class="info-box-title">` element that should be ignored during the upcast conversion as it duplicates the information conveyed by the main element's CSS class.
* The content of the info box is now located inside another element. Previously it was located directly in the main wrapper.

Neither two-way nor one-way converters can handle such conversion. Therefore, you need to use an event-based converter with the following behavior:

1. Create a model `<infoBox>` element with the `infoBoxType` attribute.
1. Skip the conversion of `<div class="info-box-title">` as the information about type can be obtained from the wrapper's CSS classes.
1. Convert the children of `<div class="info-box-content">` and insert them directly into `<infoBox>`.

```js
function upcastConverter( event, data, conversionApi ) {
	const viewInfoBox = data.viewItem;

	// Check whether the view element is an info box <div>.
	// Otherwise, it should be handled by another converter.
	if ( !viewInfoBox.hasClass( 'info-box' ) ) {
		return;
	}

	// Create the model structure.
	const modelElement = conversionApi.writer.createElement( 'infoBox', {
		infoBoxType: getTypeFromViewElement( viewInfoBox )
	} );

	// Try to safely insert the element into the model structure.
	// If `safeInsert()` returns `false`, the element cannot be safely inserted
	// into the content and the conversion process must stop.
	// This may happen if the data that you are converting has an incorrect structure
	// (e.g. it was copied from an external website).
	if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
		return;
	}

	// Mark the info box <div> as handled by this converter.
	conversionApi.consumable.consume( viewInfoBox, { name: true } );

	// Let us assume that the HTML structure is always the same.
	// Note: For full bulletproofing this converter, you should also check
	// whether these elements are the right ones.
	const viewInfoBoxTitle = viewInfoBox.getChild( 0 );
	const viewInfoBoxContent = viewInfoBox.getChild( 1 );

	// Mark info box inner elements (title and content <div>s) as handled by this converter.
	conversionApi.consumable.consume( viewInfoBoxTitle, { name: true } );
	conversionApi.consumable.consume( viewInfoBoxContent, { name: true } );

	// Let the editor handle the children of <div class="info-box-content">.
	conversionApi.convertChildren( viewInfoBoxContent, modelElement );

	// Finally, update the conversion's modelRange and modelCursor.
	conversionApi.updateConversionResult( modelElement, data );
}

// A helper function to read the type from the view classes.
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

This upcast converter callback can now be plugged by adding a listener to the {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#element `UpcastDispatcher#element` event}. You will listen to `element:div` to ensure that the callback is called only for `<div>` elements.

```js
editor.conversion.for( 'upcast' )
	.add( dispatcher => dispatcher.on( 'element:div', upcastConverter ) );
```

### Event-based downcast converter

The missing bits are the downcast converters for the editing and data pipelines.

You will want to use the widget system to make the info box behave like an "object". Another aspect that you need to take care of is the fact that the view structure has more elements than the model structure. In this case, you could actually use one-way converters. However, this tutorial will showcase how an event-based converter would look.

<info-box>
	See the {@link framework/guides/tutorials/implementing-a-block-widget Implementing a block widget guide} to learn about the widget system.
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

	// The mapping between the model <infoBox> and its view representation.
	conversionApi.mapper.bindElements( data.item, infoBox );

	conversionApi.writer.insert(
		conversionApi.mapper.toViewPosition( data.range.start ),
		infoBox
	);
}
```

These two converters need to be plugged as listeners into the {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#insert `DowncastDispatcher#insert` event}:

```js
editor.conversion.for( 'editingDowncast' )
	.add( dispatcher => dispatcher.on( 'insert:infoBox', editingDowncastConverter ) );
editor.conversion.for( 'dataDowncast' )
	.add( dispatcher => dispatcher.on( 'insert:infoBox', dataDowncastConverter ) );
```

Due to the fact that the info box's view structure is more complex than its model structure, you need to take care of one additional aspect to make the converters work &mdash; position mapping.

### The model-to-view position mapping

The downcast converters shown in the previous section will not work correctly yet. This is what the given model would look like, after being downcasted:

```
<infoBox infoBoxType="Info">    ->    <div class="info-box info-box-info">
	<paragraph>                 ->        <p>
		Foobar                  ->            Foobar
	</paragraph>                ->        </p>
										  <div class="info-box-title">Info</div>
										  <div class="info-box-content"></div>
</infoBox>                      ->    </div>
```

This is not a correct view structure. The content of the model's `<infoBox>` element ended up directly inside the outer `<div>`. The `<infoBox>`'s content should be inside the `<div class="info-box-content">`.

You defined downcast conversion for `<infoBox>` itself, but you need to specify where its content should land in its view structure. By default, it is converted as direct children of `<div class="info-box">` (as shown in the above snippet) but it should go into `<div class="info-box-content">`. To achieve this, you need to register a callback for the {@link module:engine/conversion/mapper~Mapper#event:modelToViewPosition `Mapper#modelToViewPosition`} event, so the positions inside the model `<infoBox>` element would map to the positions inside the `<div class="info-box-content">` view element.

```
<infoBox infoBoxType="Info">    ->    <div class="info-box info-box-info">
										  <div class="info-box-title">Info</div>
										  <div class="info-box-content">
	<paragraph>                 ->            <p>
		Foobar                  ->                Foobar
	</paragraph>                ->            </p>
										  </div>
</infoBox>                      ->    </div>
```

Such a mapping can be achieved by registering this callback to the {@link module:engine/conversion/mapper~Mapper#event:modelToViewPosition `Mapper#modelToViewPosition`} event:

```js
function createModelToViewPositionMapper( view ) {
	return ( evt, data ) => {
		const modelPosition = data.modelPosition;
		const parent = modelPosition.parent;

		// Only the mapping of positions that are directly in
		// the <infoBox> model element should be modified.
		if ( !parent.is( 'element', 'infoBox' ) ) {
			return;
		}

		// Get the mapped view element <div class="info-box">.
		const viewElement = data.mapper.toViewElement( parent );

		// Find the <div class="info-box-content"> in it.
		const viewContentElement = findContentViewElement( view, viewElement );

		// Translate the model position offset to the view position offset.
		data.viewPosition = data.mapper.findPositionIn( viewContentElement, modelPosition.offset );
	};
}

// Returns the <div class="info-box-content"> nested in the info box view structure.
function findContentViewElement( editingView, viewElement ) {
	for ( const value of editingView.createRangeIn( viewElement ) ) {
		if ( value.item.is( 'element', 'div' ) && value.item.hasClass( 'info-box-content' ) ) {
			return value.item;
		}
	}
}
```

It needs to be plugged into the {@link module:engine/conversion/mapper~Mapper#event:modelToViewPosition `Mapper#modelToViewPosition`} event for both downcast pipelines:

```js
editor.editing.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );
editor.data.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );
```

<info-box>
	**Note**: You do not need the reverse position mapping ({@link module:engine/conversion/mapper~Mapper#event:viewToModelPosition from the view to the model}) because the default view-to-model position mapping looks for the {@link module:engine/conversion/mapper~Mapper#findMappedViewAncestor mapped view ancestor} and maps the offset in respect to the model element.
</info-box>

### Updated plugin code

The updated `InfoBox` plugin that glues the event-based converters together:

```js
class InfoBox {
	constructor( editor ) {
		// Schema definition.
		editor.model.schema.register( 'infoBox', {
			allowWhere: '$block',
			allowContentOf: '$root',
			isObject: true,
			allowAttributes: [ 'infoBoxType' ]
		} );

		// Upcast converter.
		editor.conversion.for( 'upcast' )
			.add( dispatcher => dispatcher.on( 'element:div', upcastConverter ) );

		// The downcast conversion must be split as you need a widget in the editing pipeline.
		editor.conversion.for( 'editingDowncast' )
			.add( dispatcher => dispatcher.on( 'insert:infoBox', editingDowncastConverter ) );
		editor.conversion.for( 'dataDowncast' )
			.add( dispatcher => dispatcher.on( 'insert:infoBox', dataDowncastConverter ) );

		// The model-to-view position mapper is needed since the model <infoBox> content needs to end up in the inner
		// <div class="info-box-content">.
		editor.editing.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );
		editor.data.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );
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

function createModelToViewPositionMapper() {
	// ...
}
```
