---
category: framework-deep-dive-conversion
order: 50
since: 24.0.0
---

# Element reconversion

{@snippet framework/build-element-reconversion-source}

<info-box warning>
	Element reconversion is currently in beta version. The API will be extended to support more cases and will be changing with time.
</info-box>

This guide introduces the concept of the _reconversion of model elements_ during the downcast (model-to-view) {@link framework/guides/architecture/editing-engine#conversion conversion}.

Reconversion allows simplifying downcast converters for model elements by merging multiple separate converters into a single converter that reacts to more types of model changes.

## Prerequisites

To better understand the concepts used in this guide, it is recommended to familiarize yourself with other conversion guides, too:

* {@link framework/guides/tutorials/implementing-a-block-widget Implementing a block widget}
* {@link framework/guides/deep-dive/custom-element-conversion Custom element conversion}

## Atomic converters vs element reconversion

In order to convert a model element to its view representation, you often write the following converters:

* An `elementToElement()` converter. This converter reacts to the insertion of a model element specified in the `model` field.
* If the model element has attributes and these attributes may change with time, you need to add the `attributeToAttribute()` converters for each attribute. These converters react to changes in the model element attributes and update the view accordingly.

This granular approach to conversion is used by many editor features as it ensures extensibility of the base features and provides a separation of concerns. For example, the {@link features/images-overview base image feature} provides conversion for a simple `<imageBlock src="...">` model element, while the {@link features/images-resizing image resize feature} adds support for the `width` and `height` attributes, the {@link features/images-captions image caption feature} for the `<figcaption>` HTML element, and so on.

Apart from the extensibility aspect, the above approach ensures that a change of a model attribute or structure requires minimal changes in the view.

However, in some cases where granularity is not necessary this approach may be an overkill. Consider a case in which you need to create a multi-layer view structure for one model element, or a case in which the view structure depends on a value of a model attribute. In such cases, writing a separate converter for a model element and separate converters for each attribute becomes cumbersome.

Thankfully, element reconversion allows merging these converters into a single converter that reacts to multiple types of model changes (element insertion, its attribute changes and changes in its direct children). This approach can be considered more "functional" as the `view` callback executed on any of these changes should produce the entire view structure (down to a certain level) without taking into account what state changes have just happened.

An additional perk of using element reconversion is that the parts of the model tree that have not been changed, like paragraphs and text inside your feature element, will not be reconverted. In other words, their view elements are kept in memory and re-used inside the changed parent.

To sum up, element reconversion comes in handy for cases where you need to convert a relatively simple model to a complex view structure. And also, writing a single functional converter is easier to grasp in your project.

## Enabling element reconversion

Element reconversion is enabled by setting the reconversion trigger configuration (`triggerBy`) for the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`} downcast helper.

The model element can be reconverted when:

* one or many attributes change (using `triggerBy.attributes`) or
* a child is inserted or removed (using `triggerBy.children`)

<info-box>
	Note that when using the `children` configuration option, the current implementation assumes that the downcast converter will either:
	* handle an element and its children conversion at once,
	* have a "flat" structure.
</info-box>

A simple example of an element reconversion configuration is demonstrated below:

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

In this example:

* The downcast converter for `myElement` creates a `<div>` with a `data-owner-id` attribute and a set of CSS classes.
* The value of `data-owner-id` is set from the `ownerId` model element's attribute.
* The second CSS class is constructed off the `type` model element's attribute.
* The `triggerBy.attributes` configuration defines that the element will be converted upon changes of the `onwerId` or `type` attributes.

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

In this example implementation you will implement a "card" box which is displayed beside the main article content. The card will contain a text-only title, one to four content sections and an optional URL. Additionally, the user can choose the type of the card.

### Demo

{@snippet framework/element-reconversion-demo}

### Model and view structure

A simplified model markup for the side card looks as follows:

```html
<sideCard cardType="info" cardURL="https://ckeditor.com/">
	<sideCardTitle>The title</sideCardTitle>
	<sideCardSection>
		<paragraph>The content</paragraph>
	</sideCardSection>
</sideCard>
```

This will be converted to the below view structure:

```html
<aside class="side-card side-card-default">
	<div class="side-card-title">Hey! Did you know?</div>
	<div class="side-card-section">
		<p>Editable content of the <strong>side card</strong>.</p>
	</div>
	<div class="side-card-section">
		<p>Another content box.</p>
	</div>
	<div class="side-card-actions">
		<!-- Simple form elements for the editing view. -->
	</div>
</aside>
```

In the above example you can observe that the `'cardURL'` model attribute is converted as a view element inside the main view container while the type attribute is translated to a CSS class. Additionally, the UI controls are injected to the view after all other child views of the main container. Describing it using atomic converters would introduce a convoluted complexity.

### Schema

The side card model structure is represented in the editor's {@link framework/guides/deep-dive/schema schema} as follows:

```js
// The main element with attributes for type and URL:
schema.register( 'sideCard', {
	allowWhere: '$block',
	isObject: true,
	allowAttributes: [ 'cardType', 'cardURL' ]
} );
// Disallow side card nesting.
schema.addChildCheck( ( context, childDefinition ) => {
	if ( [ ...context.getNames() ].includes( 'sideCard' ) && childDefinition.name === 'sideCard' ) {
		return false;
	}
} );

// A text-only title.
schema.register( 'sideCardTitle', {
	isLimit: true,
	allowIn: 'sideCard'
} );
// Allow text in title...
schema.extend( '$text', { allowIn: 'sideCardTitle' } );
// ...but disallow any text attribute inside.
schema.addAttributeCheck( context => {
	if ( context.endsWith( 'sideCardTitle $text' ) ) {
		return false;
	}
} );

// A content block which can have any content allowed in $root.
schema.register( 'sideCardSection', {
	isLimit: true,
	allowIn: 'sideCard',
	allowContentOf: '$root'
} );
```

### Reconversion definition

To enable element reconversion, define for which attribute and children modifications the main element will be converted:

```js
conversion.for( 'editingDowncast' ).elementToElement( {
	model: 'sideCard',
	view: downcastSideCard( editor, { asWidget: true } ),
	triggerBy: {
		attributes: [ 'cardType', 'cardURL' ],
		children: [ 'sideCardSection' ]
	}
} );
```

The above definition will use the `downcastSideCard()` function to re-create the view when:

* The `sideCard` element is inserted into the model.
* One of `cardType` or `cardURL` has changed.
* A child `sideCardSection` is added or removed from the parent `sideCard`.

### Downcast converter details

The function that creates a complete view for the model element:

```js
const downcastSideCard = ( editor, { asWidget } ) => {
	return ( modelElement, { writer, consumable, mapper } ) => {
		const type = modelElement.getAttribute( 'cardType' ) || 'default';

		// The main view element for the side card.
		const sideCardView = writer.createContainerElement( 'aside', {
			class: `side-card side-card-${ type }`
		} );

		// Create inner views from the side card children.
		for ( const child of modelElement.getChildren() ) {
			const childView = writer.createEditableElement( 'div' );

			// Child is either a "title" or "section".
			if ( child.is( 'element', 'sideCardTitle' ) ) {
				writer.addClass( 'side-card-title', childView );
			} else {
				writer.addClass( 'side-card-section', childView );
			}

			// It is important to consume and bind converted elements.
			consumable.consume( child, 'insert' );
			mapper.bindElements( child, childView );

			// Make it an editable part of the widget.
			if ( asWidget ) {
				toWidgetEditable( childView, writer );
			}

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), childView );
		}

		const urlAttribute = modelElement.getAttribute( 'cardURL' );

		// Do not render an empty URL field
		if ( urlAttribute ) {
			const urlBox = writer.createRawElement( 'div', {
				class: 'side-card-url'
			}, function( domElement ) {
				domElement.innerText = `URL: "${ urlAttribute }"`;
			} );

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), urlBox );
		}

		// Inner element used to render a simple UI that allows to change the side card's attributes.
		// It will only be needed in the editing view inside the widgetized element.
		// The data output should not contain this section.
		if ( asWidget ) {
			const actionsView = writer.createRawElement( 'div', {
				class: 'side-card-actions',
				contenteditable: 'false', 			// Prevents editing of the element.
				'data-cke-ignore-events': 'true'	// Allows using custom UI elements inside the editing view.
			}, createActionsView( editor, modelElement ) ); // See the full code for details.

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), actionsView );

			toWidget( sideCardView, writer, { widgetLabel: 'Side card', hasSelectionHandle: true  } );
		}

		return sideCardView;
	};
};
```

By using `mapper.bindElements( child, childView )` for `<sideCardTitle>` and `<sideCardSection>` you define which view elements correspond to which model elements. This allows the editor's conversion to re-use the existing view elements for the title and section children, so they will not be re-converted without a need.

### Upcast conversion

The upcast conversion uses standard element-to-element converters for the box and title, and a custom converter for the side card to extract metadata from the data.

```js
editor.conversion.for( 'upcast' )
	.elementToElement( {
		view: { name: 'aside', classes: [ 'side-card' ] },
		model: upcastCard // Details in the full source code.
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

You can see the details of the upcast converter function (`upcastCard()`) in the full source code at the end of this guide.

### Full source code

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { toWidget, toWidgetEditable, findOptimalInsertionRange } from '@ckeditor/ckeditor5-widget/src/utils';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

/**
 * Helper for extracting the side card type from a view element based on its CSS class.
 */
const getTypeFromViewElement = viewElement => {
	for ( const type of [ 'default', 'alternate' ] ) {
		if ( viewElement.hasClass( `side-card-${ type }` ) ) {
			return type;
		}
	}

	return 'default';
};

/**
 * Single upcast converter to the <sideCard/> element with all its attributes.
 */
const upcastCard = ( viewElement, { writer } ) => {
	const sideCard = writer.createElement( 'sideCard' );

	const type = getTypeFromViewElement( viewElement );
	writer.setAttribute( 'cardType', type, sideCard );

	const urlWrapper = [ ...viewElement.getChildren() ].find( child => {
		return child.is( 'element', 'div' ) && child.hasClass( 'side-card-url' );
	} );

	if ( urlWrapper ) {
		writer.setAttribute( 'cardURL', urlWrapper.getChild( 0 ).data, sideCard );
	}

	return sideCard;
};

/**
 * Helper for creating a DOM button with an editor callback.
 */
const addActionButton = ( text, callback, domElement, editor ) => {
	const domDocument = domElement.ownerDocument;

	const button = createElement( domDocument, 'button', {}, [ text ] );

	button.addEventListener( 'click', () => {
		editor.model.change( callback );
	} );

	domElement.appendChild( button );

	return button;
};

/**
 * Helper function that creates the card editing UI inside the card.
 */
const createActionsView = ( editor, modelElement ) => function( domElement ) {
	//
	// Set the URL action button.
	//
	addActionButton( 'Set URL', writer => {
		// eslint-disable-next-line no-alert
		const newURL = prompt( 'Set URL', modelElement.getAttribute( 'cardURL' ) || '' );

		writer.setAttribute( 'cardURL', newURL, modelElement );
	}, domElement, editor );

	const currentType = modelElement.getAttribute( 'cardType' );
	const newType = currentType === 'default' ? 'alternate' : 'default';

	//
	// Change the card action button.
	//
	addActionButton( 'Change type', writer => {
		writer.setAttribute( 'cardType', newType, modelElement );
	}, domElement, editor );

	const childCount = modelElement.childCount;

	//
	// Add the content section to the card action button.
	//
	const addButton = addActionButton( 'Add section', writer => {
		writer.insertElement( 'sideCardSection', modelElement, 'end' );
	}, domElement, editor );

	// Disable the button so only 1-3 content boxes are in the card (there will always be a title).
	if ( childCount > 4 ) {
		addButton.setAttribute( 'disabled', 'disabled' );
	}

	//
	// Remove the content section from the card action button.
	//
	const removeButton = addActionButton( 'Remove section', writer => {
		writer.remove( modelElement.getChild( childCount - 1 ) );
	}, domElement, editor );

	// Disable the button so only 1-3 content boxes are in the card (there will always be a title).
	if ( childCount < 3 ) {
		removeButton.setAttribute( 'disabled', 'disabled' );
	}
};

/**
 * The downcast converter for the <sideCard/> element.
 *
 * It returns the full view structure based on the current state of the model element.
 */
const downcastSideCard = ( editor, { asWidget } ) => {
	return ( modelElement, { writer, consumable, mapper } ) => {
		const type = modelElement.getAttribute( 'cardType' ) || 'default';

		// The main view element for the side card.
		const sideCardView = writer.createContainerElement( 'aside', {
			class: `side-card side-card-${ type }`
		} );

		// Create inner views from the side card children.
		for ( const child of modelElement.getChildren() ) {
			const childView = writer.createEditableElement( 'div' );

			// Child is either a "title" or "section".
			if ( child.is( 'element', 'sideCardTitle' ) ) {
				writer.addClass( 'side-card-title', childView );
			} else {
				writer.addClass( 'side-card-section', childView );
			}

			// It is important to consume and bind converted elements.
			consumable.consume( child, 'insert' );
			mapper.bindElements( child, childView );

			// Make it an editable part of the widget.
			if ( asWidget ) {
				toWidgetEditable( childView, writer );
			}

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), childView );
		}

		const urlAttribute = modelElement.getAttribute( 'cardURL' );

		// Do not render an empty URL field.
		if ( urlAttribute ) {
			const urlBox = writer.createRawElement( 'div', {
				class: 'side-card-url'
			}, function( domElement ) {
				domElement.innerText = `URL: "${ urlAttribute }"`;
			} );

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), urlBox );
		}

		// Inner element used to render a simple UI that allows to change the side card's attributes.
		// It will only be needed in the editing view inside the widgetized element.
		// The data output should not contain this section.
		if ( asWidget ) {
			const actionsView = writer.createRawElement( 'div', {
				class: 'side-card-actions',
				contenteditable: 'false', 			// Prevents editing of the element.
				'data-cke-ignore-events': 'true'	// Allows using custom UI elements inside the editing view.
			}, createActionsView( editor, modelElement ) ); // See the full code for details.

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), actionsView );

			toWidget( sideCardView, writer, { widgetLabel: 'Side card' } );
		}

		return sideCardView;
	};
};

class InsertCardCommand extends Command {
	/**
	 * Refresh used schema definition to check if a side card can be inserted in the current selection.
	 */
	refresh() {
		const model = this.editor.model;
		const range = findOptimalInsertionRange( model.document.selection, model );

		this.isEnabled = model.schema.checkChild( validParent, 'sideCard' );
	}

	/**
	 * Creates a full side card element with all required children and attributes.
	 */
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const insertionRange = findOptimalInsertionRange( selection, model );

		model.change( writer => {
			const sideCard = writer.createElement( 'sideCard', { cardType: 'default' } );
			const title = writer.createElement( 'sideCardTitle' );
			const section = writer.createElement( 'sideCardSection' );
			const paragraph = writer.createElement( 'paragraph' );

			writer.insert( title, sideCard, 0 );
			writer.insert( section, sideCard, 1 );
			writer.insert( paragraph, section, 0 );

			model.insertContent( sideCard, insertionRange );

			writer.setSelection( writer.createPositionAt( title, 0 ) );
		} );
	}
}

class ComplexBox extends Plugin {
	constructor( editor ) {
		super( editor );

		this._defineSchema();
		this._defineConversion();

		editor.commands.add( 'insertCard', new InsertCardCommand( editor ) );

		this._defineUI();
	}

	_defineConversion() {
		const editor = this.editor;
		const conversion = editor.conversion;

		conversion.for( 'upcast' )
			.elementToElement( {
				view: { name: 'aside', classes: [ 'side-card' ] },
				model: upcastCard
			} )
			.elementToElement( {
				view: { name: 'div', classes: [ 'side-card-title' ] },
				model: 'sideCardTitle'
			} )
			.elementToElement( {
				view: { name: 'div', classes: [ 'side-card-section' ] },
				model: 'sideCardSection'
			} );

		// The downcast conversion must be split as you need a widget in the editing pipeline.
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'sideCard',
			view: downcastSideCard( editor, { asWidget: true } ),
			triggerBy: {
				attributes: [ 'cardType', 'cardURL' ],
				children: [ 'sideCardSection' ]
			}
		} );
		// The data downcast is always executed from the current model stat, so `triggerBy` will take no effect.
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'sideCard',
			view: downcastSideCard( editor, { asWidget: false } )
		} );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		// The main element with attributes for type and URL:
		schema.register( 'sideCard', {
			allowWhere: '$block',
			isObject: true,
			allowAttributes: [ 'cardType', 'cardURL' ]
		} );
		// Disallow side card nesting.
		schema.addChildCheck( ( context, childDefinition ) => {
			if ( [ ...context.getNames() ].includes( 'sideCard' ) && childDefinition.name === 'sideCard' ) {
				return false;
			}
		} );

		// A text-only title.
		schema.register( 'sideCardTitle', {
			isLimit: true,
			allowIn: 'sideCard'
		} );
		// Allow text in title...
		schema.extend( '$text', { allowIn: 'sideCardTitle' } );
		// ...but disallow any text attribute inside.
		schema.addAttributeCheck( context => {
			if ( context.endsWith( 'sideCardTitle $text' ) ) {
				return false;
			}
		} );

		// A content block which can have any content allowed in $root.
		schema.register( 'sideCardSection', {
			isLimit: true,
			allowIn: 'sideCard',
			allowContentOf: '$root'
		} );
	}

	_defineUI() {
		const editor = this.editor;

		// Defines a simple text button.
		editor.ui.componentFactory.add( 'complexBox', locale => {
			const button = new ButtonView( locale );

			const command = editor.commands.get( 'insertComplexBox' );

			button.set( {
				withText: true,
				icon: false,
				label: 'Complex Box'
			} );

			button.bind( 'isEnabled' ).to( command );

			button.on( 'execute', () => {
				editor.execute( 'insertComplexBox' );
				editor.editing.view.focus();
			} );

			return button;
		} );
	}
}
```
