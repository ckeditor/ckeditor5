/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image/converters
 */

import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import ModelDocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment';
import modelWriter from '@ckeditor/ckeditor5-engine/src/model/writer';

/**
 * Returns a function that converts the image view representation:
 *
 *		<figure class="image"><img src="..." alt="..."></img></figure>
 *
 * to the model representation:
 *
 *		<image src="..." alt="..."></image>
 *
 * The entire content of the `<figure>` element except the first `<img>` is being converted as children
 * of the `<image>` model element.
 *
 * @returns {Function}
 */
export function viewFigureToModel() {
	return ( evt, data, consumable, conversionApi ) => {
		// Do not convert if this is not an "image figure".
		if ( !consumable.test( data.input, { name: true, class: 'image' } ) ) {
			return;
		}

		// Do not convert if image cannot be placed in model at this context.
		if ( !conversionApi.schema.check( { name: 'image', inside: data.context, attributes: 'src' } ) ) {
			return;
		}

		// Find an image element inside the figure element.
		const viewImage = Array.from( data.input.getChildren() ).find( viewChild => viewChild.is( 'img' ) );

		// Do not convert if image element is absent, is missing src attribute or was already converted.
		if ( !viewImage || !viewImage.hasAttribute( 'src' ) || !consumable.test( viewImage, { name: true } ) ) {
			return;
		}

		// Convert view image to model image.
		const modelImage = conversionApi.convertItem( viewImage, consumable, data );

		// Convert rest of figure element's children, but in the context of model image, because those converted
		// children will be added as model image children.
		data.context.push( modelImage );

		const modelChildren = conversionApi.convertChildren( data.input, consumable, data );

		data.context.pop();

		// Add converted children to model image.
		modelWriter.insert( ModelPosition.createAt( modelImage ), modelChildren );

		// Set model image as conversion result.
		data.output = modelImage;
	};
}

/**
 * Creates the image attribute converter for provided model conversion dispatchers.
 *
 * @param {Array.<module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher>} dispatchers
 * @param {String} attributeName
 * @param {Function} [converter] Custom converter for the attribute - default one converts attribute from model `image` element
 * to the same attribute in `img` in the view.
 */
export function createImageAttributeConverter( dispatchers, attributeName, converter = modelToViewAttributeConverter ) {
	for ( const dispatcher of dispatchers ) {
		dispatcher.on( `addAttribute:${ attributeName }:image`, converter() );
		dispatcher.on( `changeAttribute:${ attributeName }:image`, converter() );
		dispatcher.on( `removeAttribute:${ attributeName }:image`, converter() );
	}
}

/**
 * Converter used to convert `srcset` model image's attribute to `srcset`, `sizes` and `width` attributes in the view.
 *
 * @return {Function}
 */
export function srcsetAttributeConverter() {
	return ( evt, data, consumable, conversionApi ) => {
		const parts = evt.name.split( ':' );
		const consumableType = parts[ 0 ] + ':' + parts[ 1 ];
		const modelImage = data.item;

		if ( !consumable.consume( modelImage, consumableType ) ) {
			return;
		}

		const figure = conversionApi.mapper.toViewElement( modelImage );
		const img = figure.getChild( 0 );
		const type = parts[ 0 ];

		if ( type == 'removeAttribute' ) {
			const srcset = data.attributeOldValue;

			if ( srcset.data ) {
				img.removeAttribute( 'srcset' );
				img.removeAttribute( 'sizes' );

				if ( srcset.width ) {
					img.removeAttribute( 'width' );
				}
			}
		} else {
			const srcset = data.attributeNewValue;

			if ( srcset.data ) {
				img.setAttribute( 'srcset', srcset.data );
				// Always outputting `100vw`. See https://github.com/ckeditor/ckeditor5-image/issues/2.
				img.setAttribute( 'sizes', '100vw' );

				if ( srcset.width ) {
					img.setAttribute( 'width', srcset.width );
				}
			}
		}
	};
}

// Returns model to view image converter converting given attribute, and adding it to `img` element nested inside `figure` element.
//
// @private
function modelToViewAttributeConverter() {
	return ( evt, data, consumable, conversionApi ) => {
		const parts = evt.name.split( ':' );
		const consumableType = parts[ 0 ] + ':' + parts[ 1 ];
		const modelImage = data.item;

		if ( !consumable.consume( modelImage, consumableType ) ) {
			return;
		}

		const figure = conversionApi.mapper.toViewElement( modelImage );
		const img = figure.getChild( 0 );
		const type = parts[ 0 ];

		if ( type == 'removeAttribute' ) {
			img.removeAttribute( data.attributeKey );
		} else {
			img.setAttribute( data.attributeKey, data.attributeNewValue );
		}
	};
}

// Holds all images that were converted for autohoisting.
const autohoistedImages = new WeakSet();

/**
 * A converter which converts `<img>` {@link module:engine/view/element~Element view elements} that can be hoisted.
 *
 * If an `<img>` view element has not been converted, this converter checks if that element could be converted in any
 * context "above". If it could, the converter converts the `<img>` element even though it is not allowed in the current
 * context and marks it to be autohoisted. Then {@link module:image/image/converters~hoistImageThroughElement another converter}
 * moves the converted element to the correct location.
 */
export function convertHoistableImage( evt, data, consumable, conversionApi ) {
	const img = data.input;

	// If the image has not been consumed (converted)...
	if ( !consumable.test( img, { name: true, attribute: [ 'src' ] } ) ) {
		return;
	}
	// At this point the image has not been converted because it was not allowed by schema. It might be in wrong
	// context or missing an attribute, but above we already checked whether the image has mandatory src attribute.

	// If the image would be allowed if it was in one of its ancestors...
	const allowedContext = _findAllowedContext( { name: 'image', attributes: [ 'src' ] }, data.context, conversionApi.schema );

	if ( !allowedContext ) {
		return;
	}

	// Convert it in that context...
	const newData = Object.assign( {}, data );
	newData.context = allowedContext;

	data.output = conversionApi.convertItem( img, consumable, newData );

	// And mark that image to be hoisted.
	autohoistedImages.add( data.output );
}

// Basing on passed `context`, searches for "closest" context in which model element represented by `modelData`
// would be allowed by `schema`.
//
// @private
// @param {Object} modelData Object describing model element to check. Has two properties: `name` with model element name
// and `attributes` with keys of attributes of that model element.
// @param {Array} context Context in which original conversion was supposed to take place.
// @param {module:engine/model/schema~Schema} schema Schema to check with.
// @returns {Array|null} Context in which described model element would be allowed by `schema` or `null` if such context
// could not been found.
function _findAllowedContext( modelData, context, schema ) {
	// Copy context array so we won't modify original array.
	context = context.slice();

	// Prepare schema query to check with schema.
	// Since `inside` property is passed as reference to `context` variable, we don't need to modify `schemaQuery`.
	const schemaQuery = {
		name: modelData.name,
		attributes: modelData.attributes,
		inside: context
	};

	// Try out all possible contexts.
	while ( context.length && !schema.check( schemaQuery ) ) {
		const parent = context.pop();
		const parentName = typeof parent === 'string' ? parent : parent.name;

		// Do not try to autohoist "above" limiting element.
		if ( schema.limits.has( parentName ) ) {
			return null;
		}
	}

	// If `context` has any items it means that image is allowed in that context. Return that context.
	// If `context` has no items it means that image was not allowed in any of possible contexts. Return `null`.
	return context.length ? context : null;
}

/**
 * A converter which hoists `<image>` {@link module:engine/model/element~Element model elements} to allowed context.
 *
 * It looks through all children of the converted {@link module:engine/view/element~Element view element} if it
 * was converted to a model element. It breaks the model element if an `<image>` to-be-hoisted is found.
 *
 *		<div><paragraph>x<image src="foo.jpg"></image>x</paragraph></div> ->
 *		<div><paragraph>x</paragraph></div><image src="foo.jpg"></image><div><paragraph>x</paragraph></div>
 *
 * This works deeply, as shown in the example. This converter added for the `<paragraph>` element will break the `<paragraph>`
 *  element and pass the {@link module:engine/model/documentfragment~DocumentFragment document fragment} in `data.output`.
 *  Then, the `<div>` will be handled by this converter and will be once again broken to hoist the `<image>` up to the root.
 *
 * **Note:** This converter should be executed only after the view element has already been converted, which means that
 * `data.output` for that view element should be already generated when this converter is fired.
 */
export function hoistImageThroughElement( evt, data ) {
	// If this element has been properly converted...
	if ( !data.output ) {
		return;
	}

	// And it is an element...
	// (If it is document fragment autohoisting does not have to break anything anyway.)
	// (And if it is text there are no children here.)
	if ( !data.output.is( 'element' ) ) {
		return;
	}

	// This will hold newly generated output. At the beginning it is only the original element.
	const newOutput = [];

	// Check if any of its children is to be hoisted...
	// Start from the last child - it is easier to break that way.
	for ( let i = data.output.childCount - 1; i >= 0; i-- ) {
		const child = data.output.getChild( i );

		if ( autohoistedImages.has( child ) ) {
			// Break autohoisted element's parent:
			// <parent>{ left-children... }<authoistedElement />{ right-children... }</parent>   --->
			// <parent>{ left-children... }</parent><autohoistedElement /><parent>{ right-children... }</parent>
			//
			// or
			//
			// <parent>{ left-children... }<autohoistedElement /></parent> --->
			// <parent>{ left-children... }</parent><autohoistedElement />
			//
			// or
			//
			// <parent><autohoistedElement />{ right-children... }</parent> --->
			// <autohoistedElement /><parent>{ right-children... }</parent>
			//
			// or
			//
			// <parent><autohoistedElement /></parent> ---> <autohoistedElement />

			// Check how many right-children there are.
			const rightChildrenCount = data.output.childCount - i - 1;
			let rightParent = null;

			// If there are any right-children, clone the prent element and insert those children there.
			if ( rightChildrenCount > 0 ) {
				rightParent = data.output.clone( false );
				rightParent.appendChildren( data.output.removeChildren( i + 1, rightChildrenCount ) );
			}

			// Remove the autohoisted element from its parent.
			child.remove();

			// Break "leading" `data.output` in `newOutput` into one or more pieces:
			// Remove "leading" `data.output` (note that `data.output` is always first item in `newOutput`).
			newOutput.shift();

			// Add the newly created parent of the right-children at the beginning.
			if ( rightParent ) {
				newOutput.unshift( rightParent );
			}

			// Add autohoisted element at the beginning.
			newOutput.unshift( child );

			// Add `data.output` at the beginning, if there is anything left in it.
			if ( data.output.childCount > 0 ) {
				newOutput.unshift( data.output );
			}
		}
	}

	// If the output has changed pass it further.
	if ( newOutput.length ) {
		data.output = new ModelDocumentFragment( newOutput );
	}
}
