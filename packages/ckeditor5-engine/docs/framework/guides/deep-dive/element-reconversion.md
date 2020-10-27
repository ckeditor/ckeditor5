---
category: framework-deep-dive-conversion
order: 50
since: 24.0.0
---

# Element reconversion

{@snippet framework/build-element-reconversion-source}

<info-box warning>
	The reconversion API is a preliminary feature and may not be production ready.
</info-box>

This guide introduces _reconversion_ concepts for downcast (model-to-view) {@link framework/guides/architecture/editing-engine#conversion
conversion} for elements.

To better understand concepts used in this guide we advise that you are familiar with other conversion guides, especially:

- {@link framework/guides/deep-dive/custom-element-conversion custom element conversion}
- {@link framework/guides/tutorials/implementing-a-block-widget implementing a block widget}

## Atomic converters vs element reconversion

Most editor features are written using atomic converters for every element or attribute. This approach allows great level of customization
and separation of concerns. For example, table features can be added or removed without the need to change the main table converter.
However, this approach in many cases is overly complicated, especially if the feature you work doesn't need to be extensible.

An element reconversion comes handy for cases where you need to:

* convert a relatively simple model to a complex view structure
* writing a one, functional converter is easier to grasp in your project

An additional perk of using an element reconversion is that the parts of model tree that hasn't been changed, like paragraph and text inside
your feature element, will not be reconverted. In other words, their view elements are memoized and re-used inside changed parent.

### Enabling element reconversion

Element reconversion is enabled by setting reconversion triggers in {@link module:engine/conversion/downcasthelpers~
DowncastHelpers#elementToElement `elementToElement()`} downcast helper.

The model element can be reconverted when:

* one or many attributes changes (using `triggerBy.attributes`) or
* a child is inserted or removed (using `triggerBy.children`)

<info-box>
Note that, when using `children` configuration option the current implementation assumes that downcast converter will either:
* handle element and its children conversion at once
* will have a "flat" structure
</info-box>

# Example implementation

An example feature that benefits from using reconversion is one that requires representing a different view structure for various element
states.

## Demo

Let's take a look at the below enhanced info box might behave:

{@snippet framework/element-reconversion-demo}

The above demo assumes that each box:

* Always have a title (text attributes are disallowed).
* Have 1 to 4 content-boxes that holds any {@link framework/guides/deep-dive/conversion-introduction#inline-and-block-content block
  content}.
* Is an "info" or "warning" type.
* Have an optional URL field.

A simplified model markup for the info box looks as follows:

```html

<complexInfoBox infoBoxType="info" infoBoxURL="http://cksource.com">
	<infoBoxTitle>A title</infoBoxTitle>
	<infoBoxContent>
		<paragrahp>A content</paragrahp>
	</infoBoxContent>
</complexInfoBox>
```

This will be converted to the below view structure:

```html

<div class="info-box info-box-info">
	<div class="info-box-title">A title</div>
	<div class="info-box-content">
		<p>A content</p>
	</div>
	<div class="info-box-url">http://example.com</div>
	<div class="info-box-actions">
		<!-- simple form elements for the editing view -->
	</div>
</div>
```

In the above example you can observe that model attribute `'infoBoxURL'` is converted as view element inside the main view container while
the type attributes is translated to a CSS class. Additionally, UI controls are injected to the view after all other child views of the main
container. Describing it using atomic converters would introduce convoluted complexity.

## Schema

The info box model structure is represented in the editor's {@link framework/guides/deep-dive/schema schema} as follows:

```js
// The main element with attributes for type and URL:
editor.model.schema.register( 'complexInfoBox', {
	allowWhere: '$block',
	isObject: true,
	allowAttributes: [ 'infoBoxType', 'infoBoxURL' ]
} );

// A text-only title.
editor.model.schema.register( 'complexInfoBoxTitle', {
	isLimit: true,
	allowIn: 'complexInfoBox'
} );
// Allow text in title...
editor.model.schema.extend( '$text', { allowIn: 'complexInfoBoxTitle' } );
// ...but disallow any text attribute inside.
editor.model.schema.addAttributeCheck( context => {
	if ( context.endsWith( 'complexInfoBoxTitle $text' ) ) {
		return false;
	}
} );

// A content block which can have any content allowed in $root.
editor.model.schema.register( 'complexInfoBoxContent', {
	isLimit: true,
	allowIn: 'complexInfoBox',
	allowContentOf: '$root'
} );
```

## Reconversion definition

To enable element reconversion define for which attributes and children modification the main element will be converted:

```js
editor.conversion.for( 'downcast' ).elementToElement( {
	model: 'complexInfoBox',
	view: ( modelElement, conversionApi ) => downcastInfoBox( modelElement, conversionApi ),
	triggerBy: {
		attributes: [ 'infoBoxType', 'infoBoxURL' ],
		children: [ 'complexInfoBoxContent' ]
	}
} );
```

The above definition will use `downcastInfoBox()` function to re-create view when:

* The `complexInfoBOx` element is inserted into the model.
* One of `infoBoxType` or `infoBoxURL` has changed.
* A child `complexInfoBoxContent` is added or removed from the parent `complexInfoBox`.

## Downcast converter details

The function that creates a complete view for the model element:

```js
const downcastInfoBox = ( modelElement, { writer, consumable, mapper } ) => {
	const type = modelElement.getAttribute( 'infoBoxType' ) || 'info';

	const complexInfoBoxView = writer.createContainerElement( 'div', {
		class: `info-box info-box-${ type }`
	} );

	// Inner element used to render simple UI that allows to change info box's attributes.
	const actionsView = writer.createRawElement( 'div', {
		class: 'info-box-actions',
		contenteditable: 'false', 			// Prevent editing of the element:
		'data-cke-ignore-events': 'true'	// Allows using custom UI elements inside editing view.
	}, renderActionsView( editor, modelElement ) ); // See the full code for details.

	writer.insert( writer.createPositionAt( complexInfoBoxView, 'end' ), actionsView );

	// Create inner views from info box children.
	for ( const child of modelElement.getChildren() ) {
		const childView = writer.createContainerElement( 'div' );

		// Child is either a "title" or "content".
		if ( child.is( 'element', 'complexInfoBoxTitle' ) ) {
			writer.addClass( 'info-box-title', childView );
		} else {
			writer.addClass( 'info-box-content', childView );
		}

		// It is important to consume & bind converted elements.
		consumable.consume( child, 'insert' );
		mapper.bindElements( child, childView );

		// Append converted view to parent.
		writer.insert( writer.createPositionAt( complexInfoBoxView, 'end' ), childView );
	}

	return complexInfoBoxView;
};
```

As you can observe in the above code this converter takes model element and its direct children and return a complex view structure:

```html
<div class="info-box info-box-info">
	<div class="info-box-actions" contenteditable="false" data-cke-ignore-events="true">
		<!-- simple form elements -->
	</div>
	<div class="info-box-title"></div>
	<div class="info-box-content"></div>
</div>
```

By using `mapper.bindElements( child, childView )` for `<infoBoxTitle>` and `<infoBoxContent>` you define which view elements corresponds to which model elements. This allows the editor's conversion to re-use existing view elements for title and content children, so they will not be re-converted without a need.

I think that an image here might be useful. To not loose the idea - it might be something like exchanging layers from current view to result view.

	Example of changing a type:

	From:

	```html
	<div class="info-box info-box-info">
		<div class="info-box-actions" contenteditable="false" data-cke-ignore-events="true">
			<!-- simple form elements -->
		</div>
		<div class="info-box-title">A title</div>
		<div class="info-box-content">
			<p>A content</p>
		</div>
	</div>
	```
	During rendering
	```html
	<!-- OLD VIEW -->
	<div class="info-box info-box-info">
		<div class="info-box-actions" contenteditable="false" data-cke-ignore-events="true">
			<!-- simple form elements -->
		</div>
		<div class="info-box-title">A title</div>
		<div class="info-box-content">
			<p>A content</p>
		</div>
	</div>
	<!-- RECONVERTED VIEW -->
	<div class="info-box info-box-waring"> <!-- CHANGED -->
		<div class="info-box-actions" contenteditable="false" data-cke-ignore-events="true">
			<!-- simple form elements -->
		</div>
		<div class="info-box-title"></div>
		<div class="info-box-content"></div>
	</div>
	```

	Result:

	```html
	<div class="info-box info-box-warning">
		<div class="info-box-actions" contenteditable="false" data-cke-ignore-events="true">
			<!-- simple form elements -->
		</div>
		<div class="info-box-title">A title</div>
		<div class="info-box-content">
			<p>A content</p>
		</div>
	</div>
	```

## Upcast conversion

The upcast conversion uses standard element-to-element converters for box & title and a custom converter for the info box to extract
metadata from the data.

```js
editor.conversion.for( 'upcast' )
	.elementToElement( {
		view: { name: 'div', classes: [ 'info-box' ] },
		model: upcastInfoBox
	} )
	.elementToElement( {
		view: { name: 'div', classes: [ 'info-box-title' ] },
		model: 'complexInfoBoxTitle'
	} )
	.elementToElement( {
		view: { name: 'div', classes: [ 'info-box-content' ] },
		model: 'complexInfoBoxContent'
	} );
```

You can see the details of the upcast converter function (`upcastInfoBox()`) in the full source code at the end of this guide.
