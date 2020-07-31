---
category: framework-deep-dive-conversion
menu-title: Preserving custom content
order: 30
---

{@snippet framework/build-extending-content-source}

# Preserving custom content

The {@link framework/guides/deep-dive/conversion-extending-output previous guide} focused on post–processing of the CKEditor 5 data output. In this one, you will also extend the editor model so custom data can be loaded into it ({@link framework/guides/architecture/editing-engine#data-pipeline "upcasted"}). This will allow you not only to "correct" the editor output but, for instance, losslessly load data unsupported by the CKEditor 5 features.

Eventually, this knowledge will allow you to create your custom features on top of the core features of CKEditor 5.

## Before starting

### Code architecture

It is recommended for the code that customizes the editor data and editing pipelines to be delivered as {@link framework/guides/architecture/core-editor-architecture#plugins plugins} and all examples in this guide follow this convention.

Also for the sake of simplicity all examples use the same {@link module:editor-classic/classiceditor~ClassicEditor `ClassicEditor`}, but keep in mind that code snippets will work with other editors, too.

Finally, none of the converters covered in this guide requires to import any modules from CKEditor 5 Framework, hence, you can write them without rebuilding the editor. In other words, such converters can easily be added to existing {@link builds/guides/overview CKEditor 5 builds}.

### CKEditor 5 inspector

The {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} is an invaluable help when working with the model and view structures. It allows browsing their structure and checking selection positions like in typical browser developer tools. Make sure to enable the inspector when playing with CKEditor 5.

## Loading content with a custom attribute

In this example the links (`<a href="...">...</a>`) loaded into the editor content will preserve their `target` attribute, which is by default *not* supported by the {@link features/link Link} feature. The DOM `target` attribute will be stored in the editor model as a `linkTarget` attribute.

Unlike the {@link framework/guides/deep-dive/conversion-extending-output#adding-an-html-attribute-to-certain-inline-elements downcast–only solution}, this approach does not change the content loaded into the editor. Any links without the `target` attribute will not get one while all the links with the attribute will preserve its value.

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

{@snippet framework/extending-content-allow-link-target}

The `target` attribute in the editor is allowed thanks to two custom converters plugged into the "downcast" and "upcast" pipelines, following the default converters brought by the {@link features/link Link} feature:

```js
function AllowLinkTarget( editor ) {
	// Allow the "linkTarget" attribute in the editor model.
	editor.model.schema.extend( '$text', { allowAttributes: 'linkTarget' } );

	// Tell the editor that the model "linkTarget" attribute converts into <a target="..."></a>
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'linkTarget',
		view: ( attributeValue, writer ) => {
			const linkElement = writer.createAttributeElement( 'a', { target: attributeValue }, { priority: 5 } );
			writer.setCustomProperty( 'link', true, linkElement );

			return linkElement;
		},
		converterPriority: 'low'
	} );

	// Tell the editor that <a target="..."></a> converts into the "linkTarget" attribute in the model.
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

Add some CSS styles to easily see different link targets:

```css
a[target]::after {
	content: "target=\"" attr(target) "\"";
	font-size: 0.6em;
	position: relative;
	left: 0em;
	top: -1em;
	background: #00ffa6;
	color: #000;
	padding: 1px 3px;
	border-radius: 10px;
}
```

## Loading content with all attributes

In this example the `<div>` elements (`<div>...</div>`) loaded into the editor content will preserve their attributes. All the DOM attributes will be stored in the editor model as corresponding attributes.

{@snippet framework/extending-content-allow-div-attributes}

All attributes are allowed on `<div>` elements thanks to custom "upcast" and "downcast" converters that copy each attribute one by one.

Allowing every possible attribute on a `<div>` element in the model is done by adding an {@link module:engine/model/schema~Schema#addAttributeCheck addAttributeCheck()} callback.

<info-box>
	Allowing every attribute on `<div>` elements might introduce security issues &mdash; including XSS attacks. The production code should use only application-related attributes and/or properly encode the data.
</info-box>

Adding "upcast" and "downcast" converters for the `<div>` element is enough for these cases where its attributes do not change. If the attributes in the model are modified however, these `elementToElement()` converters will not be called as the `<div>` is already converted. To overcome this, a lower-level API is used.

Instead of using predefined converters, the {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event-attribute `attribute`} event listener is registered for the "downcast" dispatcher.

```js
function ConvertDivAttributes( editor ) {
	// Allow <div> elements in the model.
	editor.model.schema.register( 'div', {
		allowWhere: '$block',
		allowContentOf: '$root'
	} );

	// Allow <div> elements in the model to have all attributes.
	editor.model.schema.addAttributeCheck( context => {
		if ( context.endsWith( 'div' ) ) {
			return true;
		}
	} );

	// The view-to-model converter converting a view <div> with all its attributes to the model.
	editor.conversion.for( 'upcast' ).elementToElement( {
		view: 'div',
		model: ( viewElement, modelWriter ) => {
			return modelWriter.createElement( 'div', viewElement.getAttributes() );
		}
	} );

	// The model-to-view converter for the <div> element (attributes are converted separately).
	editor.conversion.for( 'downcast' ).elementToElement( {
		model: 'div',
		view: 'div'
	} );

	// The model-to-view converter for <div> attributes.
	// Note that a lower-level, event-based API is used here.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
			// Convert <div> attributes only.
			if ( data.item.name != 'div' ) {
				return;
			}

			const viewWriter = conversionApi.writer;
			const viewDiv = conversionApi.mapper.toViewElement( data.item );

			// In the model-to-view conversion we convert changes.
			// An attribute can be added or removed or changed.
			// The below code handles all 3 cases.
			if ( data.attributeNewValue ) {
				viewWriter.setAttribute( data.attributeKey, data.attributeNewValue, viewDiv );
			} else {
				viewWriter.removeAttribute( data.attributeKey, viewDiv );
			}
		} );
	} );
}
```

Activate the plugin in the editor:

```js
ClassicEditor
	.create( ..., {
		extraPlugins: [ ConvertDivAttributes ],
	} )
	.then( editor => {
		// ...
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

## Parsing attribute values

Some features, like {@link features/font Font}, allow only specific values for inline attributes. In this example you will add a converter that will parse any `font-size` value into one of the defined values.

{@snippet framework/extending-content-arbitrary-attribute-values}

Parsing any font value to the model requires adding a custom "upcast" converter that will override the default converter from `FontSize`. Unlike the default one, this converter parses values set in CSS nad sets them into the model.

As the default "downcast" converter only operates on pre-defined values, you will also add a model-to-view converter that simply outputs any model value to font size using `px` units.

```js
function HandleFontSizeValue( editor ) {
	// Add a special catch-all converter for the font size feature.
	editor.conversion.for( 'upcast' ).elementToAttribute( {
		view: {
			name: 'span',
			styles: {
				'font-size': /[\s\S]+/
			}
		},
		model: {
			key: 'fontSize',
			value: viewElement => {
				const value = parseFloat( viewElement.getStyle( 'font-size' ) ).toFixed( 0 );

				// It might be necessary to further convert the value to meet business requirements.
				// In the sample the font size is configured to handle only these sizes:
				// 12, 14, 'default', 18, 20, 22, 24, 26, 28, 30
				// Other sizes will be converted to the model but the UI might not be aware of them.

				// The font size feature expects numeric values to be Number, not String.
				return parseInt( value );
			}
		},
		converterPriority: 'high'
	} );

	// Add a special converter for the font size feature to convert all (even the not configured)
	// model attribute values.
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: {
			key: 'fontSize'
		},
		view: ( modelValue, viewWriter ) => {
			return viewWriter.createAttributeElement( 'span', {
				style: `font-size:${ modelValue }px`
			} );
		},
		converterPriority: 'high'
	} );
}
```

Activate the plugin in the editor:

```js
ClassicEditor
	.create( ..., {
		items: [ 'heading', '|', 'bold', 'italic', '|', 'fontSize' ],
		fontSize: {
			options: [ 10, 12, 14, 'default', 18, 20, 22 ]
		},
		extraPlugins: [ HandleFontSizeValue ],
	} )
	.then( editor => {
		// ...
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

## Adding extra attributes to elements contained in a figure

The {@link features/image Image} and {@link features/table Table} features wrap view elements (respectively `<img>` for Image and `<table>` for Table) in a `<figure>` element. During the downcast conversion, the model element is mapped to `<figure>` and not the inner element. In such cases the default `conversion.attributeToAttribute()` conversion helpers could lose information about the element that the attribute should be set on.

To overcome this limitation it is sufficient to write a custom converter that adds custom attributes to elements already converted by base features. The key point is to add these converters with a lower priority than the base converters so they will be called after the base ones.

{@snippet framework/extending-content-custom-figure-attributes}

The sample below is extensible. To add your own attributes to preserve, just add another `setupCustomAttributeConversion()` call with desired names.

```js
/**
 * A plugin that converts custom attributes for elements that are wrapped in <figure> in the view.
 */
class CustomFigureAttributes {
	/**
	 * Plugin's constructor - receives editor instance on creation.
	 */
	constructor( editor ) {
		// Save reference to the editor.
		this.editor = editor;
	}

	/**
	 * Setups conversion and extends table & image features schema.
	 *
	 * Schema extending must be done in the “afterInit()” call because plugins define their schema in “init()“.
	 */
	afterInit() {
		const editor = this.editor;

		// Define on which elements the CSS classes should be preserved:
		setupCustomClassConversion( 'img', 'image', editor );
		setupCustomClassConversion( 'table', 'table', editor );

		editor.conversion.for( 'upcast' ).add( upcastCustomClasses( 'figure' ), { priority: 'low' } );

		// Define custom attributes that should be preserved.
		setupCustomAttributeConversion( 'img', 'image', 'id', editor );
		setupCustomAttributeConversion( 'table', 'table', 'id', editor );
	}
}

/**
 * Sets up a conversion that preservers classes on <img> and <table> elements.
 */
function setupCustomClassConversion( viewElementName, modelElementName, editor ) {
	// The 'customClass' attribute stores custom classes from the data in the model so that schema definitions allow this attribute.
	editor.model.schema.extend( modelElementName, { allowAttributes: [ 'customClass' ] } );

	// Defines upcast converters for the <img> and <table> elements with a "low" priority so they are run after the default converters.
	editor.conversion.for( 'upcast' ).add( upcastCustomClasses( viewElementName ), { priority: 'low' } );

	// Defines downcast converters for a model element with a "low" priority so they are run after the default converters.
	// Use `downcastCustomClassesToFigure` if you want to keep your classes on <figure> element or `downcastCustomClassesToChild` if you'd like to keep your classes on a <figure> child element, i.e. <img>.
	editor.conversion.for( 'downcast' ).add( downcastCustomClassesToFigure( modelElementName ), { priority: 'low' } );
	// editor.conversion.for( 'downcast' ).add( downcastCustomClassesToChild( viewElementName, modelElementName ), { priority: 'low' } );
}

/**
 * Sets up a conversion for a custom attribute on the view elements contained inside a <figure>.
 *
 * This method:
 * - Adds proper schema rules.
 * - Adds an upcast converter.
 * - Adds a downcast converter.
 */
function setupCustomAttributeConversion( viewElementName, modelElementName, viewAttribute, editor ) {
	// Extends the schema to store an attribute in the model.
	const modelAttribute = `custom${ viewAttribute }`;

	editor.model.schema.extend( modelElementName, { allowAttributes: [ modelAttribute ] } );

	editor.conversion.for( 'upcast' ).add( upcastAttribute( viewElementName, viewAttribute, modelAttribute ) );
	editor.conversion.for( 'downcast' ).add( downcastAttribute( modelElementName, viewElementName, viewAttribute, modelAttribute ) );
}

/**
 * Creates an upcast converter that will pass all classes from the view element to the model element.
 */
function upcastCustomClasses( elementName ) {
	return dispatcher => dispatcher.on( `element:${ elementName }`, ( evt, data, conversionApi ) => {
		const viewItem = data.viewItem;
		const modelRange = data.modelRange;

		const modelElement = modelRange && modelRange.start.nodeAfter;

		if ( !modelElement ) {
			return;
		}

		// The upcast conversion picks up classes from the base element and from the <figure> element so it should be extensible.
		const currentAttributeValue = modelElement.getAttribute( 'customClass' ) || [];

		currentAttributeValue.push( ...viewItem.getClassNames() );

		conversionApi.writer.setAttribute( 'customClass', currentAttributeValue, modelElement );
	} );
}

/**
 * Creates a downcast converter that adds classes defined in the `customClass` attribute to a <figure> element.
 *
 * This converter expects that the view element is nested in a <figure> element.
 */
function downcastCustomClassesToFigure( modelElementName ) {
	return dispatcher => dispatcher.on( `insert:${ modelElementName }`, ( evt, data, conversionApi ) => {
		const modelElement = data.item;

		const viewFigure = conversionApi.mapper.toViewElement( modelElement );

		if ( !viewFigure ) {
			return;
		}

		// The code below assumes that classes are set on the <figure> element.
		conversionApi.writer.addClass( modelElement.getAttribute( 'customClass' ), viewFigure );
	} );
}

/**
 * Creates a downcast converter that adds classes defined in the `customClass` attribute to a <figure> child element.
 *
 * This converter expects that the view element is nested in a <figure> element.
 */
function downcastCustomClassesToChild( viewElementName, modelElementName ) {
	return dispatcher => dispatcher.on( `insert:${ modelElementName }`, ( evt, data, conversionApi ) => {
		const modelElement = data.item;

		const viewFigure = conversionApi.mapper.toViewElement( modelElement );

		if ( !viewFigure ) {
			return;
		}

		// The code below assumes that classes are set on the element inside the <figure>.
		const viewElement = findViewChild( viewFigure, viewElementName, conversionApi );

		conversionApi.writer.addClass( modelElement.getAttribute( 'customClass' ), viewElement );
	} );
}

/**
 * Helper method that searches for a given view element in all children of the model element.
 *
 * @param {module:engine/view/item~Item} viewElement
 * @param {String} viewElementName
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
 * @return {module:engine/view/item~Item}
 */
function findViewChild( viewElement, viewElementName, conversionApi ) {
	const viewChildren = Array.from( conversionApi.writer.createRangeIn( viewElement ).getItems() );

	return viewChildren.find( item => item.is( 'element', viewElementName ) );
}

/**
 * Returns the custom attribute upcast converter.
 */
function upcastAttribute( viewElementName, viewAttribute, modelAttribute ) {
	return dispatcher => dispatcher.on( `element:${ viewElementName }`, ( evt, data, conversionApi ) => {
		const viewItem = data.viewItem;
		const modelRange = data.modelRange;

		const modelElement = modelRange && modelRange.start.nodeAfter;

		if ( !modelElement ) {
			return;
		}

		conversionApi.writer.setAttribute( modelAttribute, viewItem.getAttribute( viewAttribute ), modelElement );
	} );
}

/**
 * Returns the custom attribute downcast converter.
 */
function downcastAttribute( modelElementName, viewElementName, viewAttribute, modelAttribute ) {
	return dispatcher => dispatcher.on( `insert:${ modelElementName }`, ( evt, data, conversionApi ) => {
		const modelElement = data.item;

		const viewFigure = conversionApi.mapper.toViewElement( modelElement );
		const viewElement = findViewChild( viewFigure, viewElementName, conversionApi );

		if ( !viewElement ) {
			return;
		}

		conversionApi.writer.setAttribute( viewAttribute, modelElement.getAttribute( modelAttribute ), viewElement );
	} );
}
```

Activate the plugin in the editor:

```js
ClassicEditor
	.create( ..., {
		extraPlugins: [ CustomFigureAttributes ],
	} )
	.then( editor => {
		// ...
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

## What's next?

If you would like to read more about how to extend the output of existing CKEditor 5 features, refer to the {@link framework/guides/deep-dive/conversion-extending-output Extending the editor output} guide.
