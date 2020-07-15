---
category: framework-deep-dive-conversion
menu-title: Custom element conversion
order: 30
---

{@snippet framework/build-custom-element-converter-source}

## Moving from general converters to an event based

Let's assume that content in your application contains info boxes. As for now it was only required to wrap part of a content in a `<div>` element:

<!-- Optional: Image of a simple info box -->

The HTML structure of info box:

```html
<div class="info-box">
	<!-- any editable content -->
</div>
```

This can be easily done with below schema and converters:

```js
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
```

This basic definition allows to nest some part of a content inside a pre-defined "info-box". However, with time, the requirements has changed and there's a need for adding a set of types of info boxes. The new info box will have a structure:

```html
<div class="info-box info-box-warning">
	<div class="info-box-title">Warning</div>
	<div class="info-box-content">
		<!-- any editable content -->
	</div>
</div>
```

Below is a demo of the editor with example info box.

{@snippet framework/extending-content-custom-element-converter}

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

The info box type conversion can be achieved using `attributeToAttribute` converter by converting `info-box-*` css classes to `infoBoxType` attribute. However, adding non-converted layers of the content requries to write an event based converter to have better control over conversion process.

For the proposed HTML structure we need to:

1. Skip conversion of `info-box-title`.
2. Convert children of `info-box-content` as `infoBox` children.

```js
editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:div', ( event, data, conversionApi ) => {
	const viewInfoBox = data.viewItem;
	// Detect that converted div is the one we need to convert.

	// Create model structure.
	const modelElement = conversionApi.writer.createElement( 'infoBox', {
		infoBoxType: getTypeFromViewElement( viewInfoBox )
	} );

	// Try to safely insert element - if it returns false the element can't be safely inserted into
	// the content and the conversion process must stop.
	if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
		return;
	}

	// Mark info-box div as handled by this converter.
	if ( !conversionApi.consumable.consume( viewInfoBox, { name: true } ) ) {
		return; // If already handled by another converter.
	}

	// For the sake of simplicity we assume that HTML structure is always the same.
	// If you can't control the order of view elements a more sophisticated search might be needed.
	const viewInfoBoxTitle = viewInfoBox.getChild( 0 );
	const viewInfoBoxContent = viewInfoBox.getChild( 1 );

	conversionApi.consumable.consume( viewInfoBoxTitle, { name: true } );
	conversionApi.consumable.consume( viewInfoBoxContent, { name: true } );

	// Make editor handle children conversion.
	conversionApi.convertChildren( viewInfoBoxContent, modelElement );

	// Conversion requires updating data structure properly.
	conversionApi.updateConversionResult( modelElement, data );
} ) );

function getTypeFromViewElement( viewElement ) {
	// Should be updated with proper logic.
	return 'info';
}
```

The downcast converter must be written as well.

```js
editor.conversion.for( 'downcast' ).add(
	dispatcher => dispatcher.on( 'insert:infoBox', ( event, data, conversionApi ) => {
		const modelElement = data.item;
		const viewWriter = conversionApi.writer;

		const type = modelElement.getAttribute( 'infoBoxType' );

		const infoBox = toWidget(
			viewWriter.createContainerElement( 'div', { class: `info-box info-box-${ type }` } ),
			viewWriter,
			{ label: 'simple box widget' }
		);

		const infoBoxTitle = viewWriter.createUIElement( 'div', { class: 'info-box-title' }, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );

			domElement.innerText = type;

			return domElement;
		} );

		const infoBoxContent = toWidgetEditable(
			viewWriter.createEditableElement( 'div', { class: 'info-box-content' } ),
			viewWriter
		);

		conversionApi.consumable.consume( modelElement, 'insert' );

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
		viewWriter.insert( viewWriter.createPositionAt( infoBox, 0 ), infoBoxTitle );
		viewWriter.insert( viewWriter.createPositionAt( infoBox, 1 ), infoBoxContent );

		// Bind both...
		conversionApi.mapper.bindElements( modelElement, infoBox );
		conversionApi.mapper.bindElements( modelElement, infoBoxContent );

		conversionApi.writer.insert( viewPosition, infoBox );
	} )
);
```
