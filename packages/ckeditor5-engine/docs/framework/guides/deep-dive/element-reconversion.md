---
category: framework-deep-dive-conversion
order: 50
since: 24.0.0
---

# Element reconversion

{@snippet framework/build-element-reconversion-source}

<info-box warning>
	The element reconversion is in a beta version. The API will be extended to support more cases and will be changing with time.
</info-box>

This guide introduces the concept of _reconversion of model elements_ during the downcast (model to view) {@link framework/guides/architecture/editing-engine#conversion conversion}.

The reconversion allows simplifying downcast converters for model elements by merging multiple separate converters into a single converter that reacts to more types of model changes.

## Prerequisites

To better understand concepts used in this guide we advise that you familiarize yourself with other conversion guides:

* {@link framework/guides/tutorials/implementing-a-block-widget implementing a block widget}
* {@link framework/guides/deep-dive/custom-element-conversion custom element conversion}

## Atomic converters vs element reconversion

In order to convert a model element to its view representation you often write the following converters:

* One `elementToElement()` converter. This converter reacts to the insertion of a model element specified in the `model` field.
* If the model element has attributes and these attributes may change with time, you need to add `attributeToAttribute()` converters for each attribute. These converters react to changes in the model element attributes and update the view accordingly.

This granular approach to conversion is used by many editor features as it ensures extensibility of the base features and provides a separation of concerns. E.g. the base image feature provides conversion for a simple `<image src="...">` model element, while the image resize feature adds support for `width` and `height` attributes, image caption for the `<figcaption>` HTML element, and so on.

Apart from the extensibility aspect, the above approach ensures that a change of a model attribute or structure, requires minimal changes in the view.

However, in some cases where granularity is not necessary this approach may be an overkill. Consider a case in which you need to create a multi-layer view structure for one model element, or a case in which the view structure depends on a value of a model attribute. In such cases, writing a separate converter for a model element and separate converters for each attribute becomes cumbersome.

Thankfully, element reconversion allows merging these converters into one converter that reacts to multiple type of model changes (element insertion, its attribute changes and changes in its direct children). This approach can be considered more "functional" as the `view` callback executed on any of these changes should produce the entire view structure (down to a certain level) without taking into account what state changes just happened.

An additional perk of using element reconversion is that the parts of the model tree that has not been changed, like paragraphs and text insides your feature element, will not be reconverted. In other words, their view elements are memoized and re-used inside changed parent.

To sum up, an element reconversion comes handy for cases where you need to:

* Convert a relatively simple model to a complex view structure.
* Writing a one, functional converter is easier to grasp in your project.

## Enabling element reconversion

Element reconversion is enabled by setting reconversion trigger configuration (`triggerBy`) for the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`} downcast helper.

The model element can be reconverted when:

* one or many attributes changes (using `triggerBy.attributes`) or
* a child is inserted or removed (using `triggerBy.children`)

<info-box>
Note that, when using `children` configuration option the current implementation assumes that downcast converter will either:
* handle element and its children conversion at once
* will have a "flat" structure
</info-box>

A simple example of element reconversion configuration demonstrated below:

```js
editor.conversion.for( 'downcast' ).elementToElement( {
	model: 'myElement',
	view: ( modelElement, { writer } ) => {
		return writer.createContainerElement( 'div', {
			'data-owner-id': modelElement.getAttribute( 'ownerId' ),
			class: `my-element my-element-${ modelElement.getAttribute( 'type' ) }`
		} );
	},
	triggerBy: {
		attributes: [ 'ownerId', 'type' ]
	}
} )
```

* The downcast converter for `myElement` creates a `<div>` with `data-owner-id` attribute and set of CSS classes.
* The value of `data-owner-id` is set from `ownerId` model element's attribute.
* The second CSS class is constructed off the `type` model element's attribute.
* The `triggerBy.attributes` defines that element will be converted upon changes of `onwerId` or `type` attributes.

Before CKEditor version `23.1.0` you would have to define a set of atomic converters for the element and for each attribute:

```js
editor.conversion.for( 'downcast' )
		.elementToElement( {
			model: 'myElement',
			view: 'div'
		} )
		.attributeToAttribute( {
			model: 'owner-id',
			view: 'data-owner-id'
		} )
		.attributeToAttribute( {
			model: 'type',
			view: modelAttributeValue => ( {
				key: 'class',
				value: `my-element my-element-${ modelAttributeValue }`
			} )
		} );
```

## Example implementation

In the example implementation we will implement a "card" box which is displayed aside to the main article content. A card will contain a text-only title, one to four content sections and an optional URL. Additionally, user can choose a type of the card.

### Demo

{@snippet framework/element-reconversion-demo}

### Model and view structure

A simplified model markup for the side card looks as follows:

```html
<sideCardSection cardType="info" cardURL="http://cksource.com">
	<sideCardTitle>A title</sideCardTitle>
	<sideCardSection>
		<paragrahp>A content</paragrahp>
	</sideCardSection>
</sideCard>
```

This will be converted to the below view structure:

```html
<aside class="side-card side-card-info">
	<div class="side-card-title">Hey! Did you know?</div>
	<div class="side-card-section">
		<p>Editable content of the <strong>side card</strong>.</p>
	</div>
	<div class="side-card-section">
		<p>Another content box.</p>
	</div>
	<div class="side-card-actions">
		<!-- simple form elements for the editing view -->
	</div>
</aside>
```

In the above example you can observe that model attribute `'cardURL'` is converted as view element inside the main view container while the type attributes is translated to a CSS class. Additionally, UI controls are injected to the view after all other child views of the main container. Describing it using atomic converters would introduce convoluted complexity.

### Schema

The side card model structure is represented in the editor's {@link framework/guides/deep-dive/schema schema} as follows:

```js
// The main element with attributes for type and URL:
editor.model.schema.register( 'sideCard', {
	allowWhere: '$block',
	isObject: true,
	allowAttributes: [ 'cardType', 'cardURL' ]
} );

// A text-only title.
editor.model.schema.register( 'sideCardTitle', {
	isLimit: true,
	allowIn: 'sideCard'
} );
// Allow text in title...
editor.model.schema.extend( '$text', { allowIn: 'sideCardTitle' } );
// ...but disallow any text attribute inside.
editor.model.schema.addAttributeCheck( context => {
	if ( context.endsWith( 'sideCardTitle $text' ) ) {
		return false;
	}
} );

// A content block which can have any content allowed in $root.
editor.model.schema.register( 'sideCardSection', {
	isLimit: true,
	allowIn: 'sideCard',
	allowContentOf: '$root'
} );
```

### Reconversion definition

To enable element reconversion define for which attributes and children modification the main element will be converted:

```js
editor.conversion.for( 'downcast' ).elementToElement( {
	model: 'sideCard',
	view: ( modelElement, conversionApi ) => downcastSideCard( modelElement, conversionApi ),
	triggerBy: {
		attributes: [ 'cardType', 'cardURL' ],
		children: [ 'sideCardSection' ]
	}
} );
```

The above definition will use `downcastSideCard()` function to re-create view when:

* The `complexInfoBOx` element is inserted into the model.
* One of `cardType` or `cardURL` has changed.
* A child `sideCardSection` is added or removed from the parent `sideCard`.

### Downcast converter details

The function that creates a complete view for the model element:

```js
const downcastSideCard = ( modelElement, { writer, consumable, mapper } ) => {
	const type = modelElement.getAttribute( 'cardType' ) || 'info';

	const sideCardView = writer.createContainerElement( 'aside', {
		class: `side-card side-card-${ type }`
	} );

	// Create inner views from side card children.
	for ( const child of modelElement.getChildren() ) {
		const childView = writer.createEditableElement( 'div' );

		// Child is either a "title" or "section".
		if ( child.is( 'element', 'sideCardTitle' ) ) {
			writer.addClass( 'side-card-title', childView );
		} else {
			writer.addClass( 'side-card-section', childView );
		}

		// It is important to consume & bind converted elements.
		consumable.consume( child, 'insert' );
		mapper.bindElements( child, childView );

		// Make it an editable part of the widget.
		toWidgetEditable( childView, writer );

		writer.insert( writer.createPositionAt( sideCardView, 'end' ), childView );
	}

	const urlAttribute = modelElement.getAttribute( 'cardURL' );

	// Do not render empty URL field
	if ( urlAttribute ) {
		const urlBox = writer.createRawElement( 'div', {
			class: 'side-card-url'
		}, function( domElement ) {
			domElement.innerText = `URL: "${ urlAttribute }"`;
		} );

		writer.insert( writer.createPositionAt( sideCardView, 'end' ), urlBox );
	}

	// Inner element used to render simple UI that allows to change side card's attributes.
	const actionsView = writer.createRawElement( 'div', {
		class: 'side-card-actions',
		contenteditable: 'false', 			// Prevent editing of the element:
		'data-cke-ignore-events': 'true'	// Allows using custom UI elements inside editing view.
	}, renderActionsView( editor, modelElement ) ); // See the full code for details.

	writer.insert( writer.createPositionAt( sideCardView, 'end' ), actionsView );

	return toWidget( sideCardView, writer, { widgetLabel: 'Side card' } );
};
```

By using `mapper.bindElements( child, childView )` for `<sideCardTitle>` and `<sideCardSection>` you define which view elements corresponds to which model elements. This allows the editor's conversion to re-use existing view elements for title and section children, so they will not be re-converted without a need.

### Upcast conversion

The upcast conversion uses standard element-to-element converters for box & title, and a custom converter for the side card to extract metadata from the data.

```js
editor.conversion.for( 'upcast' )
	.elementToElement( {
		view: { name: 'aside', classes: [ 'side-card' ] },
		model: upcastInfoBox
	} )
	.elementToElement( {
		view: { name: 'div', classes: [ 'side-card-title' ] },
		model: 'sideCardTitle'
	} )
	.elementToElement( {
		view: { name: 'div', classes: [ 'side-card-section' ] },
		model: 'sideCardSection'
	} );
```

You can see the details of the upcast converter function (`upcastInfoBox()`) in the full source code at the end of this guide.

### Full source code

TODO
