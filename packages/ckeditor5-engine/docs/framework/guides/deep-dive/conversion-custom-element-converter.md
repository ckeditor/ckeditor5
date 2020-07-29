---
category: framework-deep-dive-conversion
menu-title: Custom element conversion
order: 30
---

{@snippet framework/build-custom-element-converter-source}

## Intro

Let's assume that content in your application contains "info boxes". As for now it was only required to wrap part of a content in a `<div>` element:

<!-- Optional: Image of a simple info box -->

The HTML structure of info box:

```html
<div class="info-box">
	<!-- any editable content -->
	<p>This is<strong>important!</strong></p>
</div>
```

This will be stored in the model as:

```html
<infoBox>
	<!-- any $block, like: -->
	<paragraph><$text>This is</$text><$text bold="true">important!</$text></paragraph>
</infoBox>
```

This can be easily done with below schema and converters in a simple `InfoBox` plugin:

```js
class InfoBox {
	constructor( editor ) {
		// 1. Define infoBox as a object that can be contain any other content.
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

## Moving from general converters to an event based

### Updated data & model structure

This basic definition allows to nest some part of a content inside a pre-defined "info-box". However, with time, the requirements has changed and there's a need for adding a set of types of info boxes. The new info box will have a structure:

```html
<div class="info-box info-box-warning">
	<div class="info-box-title">Warning</div>
	<div class="info-box-content">
		<!-- any editable content -->
		<p>This is<strong>important!</strong></p>
	</div>
</div>
```

As the "Warning" shouldn't be editable and defines a type of the info box we can store this as an attribute of a `<infoBox>` element:

```html
<infoBox infoBoxType="warning">
	<!-- any $block, like: -->
	<paragraph><$text>This is</$text><$text bold="true">important!</$text></paragraph>
</infoBox>
```

### Demo

Below is a demo of the editor with example info box.

{@snippet framework/extending-content-custom-element-converter}

### Updated model schema

The type of the box is defined by the additional class to the `"info-box"` on main `<div>` but it is also visible as text in `<div class="info-box-title">`. All the info box content must be placed in `<div class="info-box-content">`.

For the above requirements we can see that the model structure of the `infoBox` doesn't need to change much. The only addition to the model is an attribute that will hold information of the info box type:

```js
editor.model.schema.register( 'infoBox', {
	allowWhere: '$block',
	allowContentOf: '$root',
	isObject: true,
	allowedAttributes: [ 'infoBoxType' ] // Added
} );
```

### Event based element to element upcast converter

The info box type conversion can be achieved using `attributeToAttribute` converter by converting `info-box-*` css classes to `infoBoxType` attribute. However, adding non-converted layers of the content requires to write an event based converter to have better control over conversion process.

For the proposed HTML structure we need to:

1. Create model's `<infoBox>` element with `infoBoxType` attribute.
1. Skip conversion of `<div class="info-box-title">` as the information about type can be obtained from the main info-box CSS classes.
1. Convert children of `<div class="info-box-content">` and insert them into model's `<infoBox>`.

```js
function upcastConverter( event, data, conversionApi ) {
	const viewInfoBox = data.viewItem;

	// Detect that view element is an info-box div. Otherwise, it should be handled by another converter.
	if ( !viewInfoBox.hasClass( 'info-box' ) ) {
		return;
	}

	// Create a model structure.
	const modelElement = conversionApi.writer.createElement( 'infoBox', {
		infoBoxType: getTypeFromViewElement( viewInfoBox )
	} );

	// Try to safely insert element - if it returns false the element can't be safely inserted into the content,
	// and the conversion process must stop.
	if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
		return;
	}

	// Mark info-box div as handled by this converter.
	conversionApi.consumable.consume( viewInfoBox, { name: true } );

	// Let's assume that the HTML structure is always the same.
	// If you don't control the order of view elements a more sophisticated search might be needed.
	const viewInfoBoxTitle = viewInfoBox.getChild( 0 );
	const viewInfoBoxContent = viewInfoBox.getChild( 1 );

	// Mark info-box inner elements as handled by this converter.
	conversionApi.consumable.consume( viewInfoBoxTitle, { name: true } );
	conversionApi.consumable.consume( viewInfoBoxContent, { name: true } );

	// Let the editor handle children of the info-box content conversion.
	conversionApi.convertChildren( viewInfoBoxContent, modelElement );

	// Conversion requires updating result data structure properly.
	conversionApi.updateConversionResult( modelElement, data );
}

// Helper funciton to read type form the view classes.
function getTypeFromViewElement( viewElement ) {
	const classNames = [ ...viewElement.getClassNames() ];

	if ( classNames.includes( 'info-box-info' ) ) {
		return 'Info';
	}

	if ( classNames.includes( 'info-box-warning' ) ) {
		return 'Warning';
	}

	return 'None';
}
```

### Accompanying downcast conversion & updated plugin code

<info-box>
	See the {@link framework/guides/tutorials/implementing-a-block-widget Implementing a block widget} to learn about widget system concepts.
</info-box>

```js
function editingDowncastConverter( event, data, conversionApi ) {
	let { infoBox, infoBoxContent, infoBoxTitle } = createViewElements( data, conversionApi );

	// Decorate view items as widgets.
	infoBox = toWidget( infoBox, conversionApi.writer, { label: 'simple box widget' } );
	infoBoxContent = toWidgetEditable( infoBoxContent, conversionApi.writer );

	insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent );
}

function dataDowncastConverter( event, data, conversionApi ) {
	const { infoBox, infoBoxContent, infoBoxTitle } = createViewElements( data, conversionApi );

	insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent );
}

function createViewElements( data, conversionApi ) {
	const type = data.item.getAttribute( 'infoBoxType' );

	const infoBox = conversionApi.writer.createContainerElement( 'div', { class: `info-box info-box-${ type.toLowerCase() }` } );
	const infoBoxContent = conversionApi.writer.createEditableElement( 'div', { class: 'info-box-content' } );

	const infoBoxTitle = conversionApi.writer.createUIElement( 'div', { class: 'info-box-title' }, function( domDocument ) {
		const domElement = this.toDomElement( domDocument );

		domElement.innerText = type;

		return domElement;
	} );

	return { infoBox, infoBoxContent, infoBoxTitle };
}

function insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent ) {
	conversionApi.consumable.consume( data.item, 'insert' );

	conversionApi.writer.insert( conversionApi.writer.createPositionAt( infoBox, 0 ), infoBoxTitle );
	conversionApi.writer.insert( conversionApi.writer.createPositionAt( infoBox, 1 ), infoBoxContent );

	conversionApi.mapper.bindElements( data.item, infoBox );
	conversionApi.mapper.bindElements( data.item, infoBoxContent );

	conversionApi.writer.insert( conversionApi.mapper.toViewPosition( data.range.start ), infoBox );
}
```

The updated `InfoBox` plugin:

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
		editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:div', upcastConverter ) );

		// The downcast conversion must be split as we need a widget in the editing pipeline.
		editor.conversion.for( 'editingDowncast' ).add( dispatcher => dispatcher.on( 'insert:infoBox', editingDowncastConverter ) );
		editor.conversion.for( 'dataDowncast' ).add( dispatcher => dispatcher.on( 'insert:infoBox', dataDowncastConverter ) );
	}
}
```
