/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/converters
 */

import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewEmptyElement from '@ckeditor/ckeditor5-engine/src/view/emptyelement';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import { isImageWidget } from './utils';

/**
 * Returns function that converts image view representation:
 *
 *		<figure class="image"><img src="..." alt="..."></img></figure>
 *
 * to model representation:
 *
 *		<image src="..." alt="..."></image>
 *
 * @returns {Function}
 */
export function viewToModelImage() {
	return ( evt, data, consumable, conversionApi ) => {
		const viewFigureElement = data.input;

		// *** Step 1: Validate conversion.
		// Check if figure element can be consumed.
		if ( !consumable.test( viewFigureElement, { name: true, class: 'image' } ) ) {
			return;
		}

		// Check if image element can be converted in current context.
		if ( !conversionApi.schema.check( { name: 'image', inside: data.context, attributes: 'src' } ) ) {
			return;
		}

		// Check if img element is placed inside figure element and can be consumed with `src` attribute.
		const viewImg = viewFigureElement.getChild( 0 );

		if ( !viewImg || viewImg.name != 'img' || !consumable.test( viewImg, { name: true, attribute: 'src' } ) ) {
			return;
		}

		// *** Step2: Convert to model.
		consumable.consume( viewFigureElement, { name: true, class: 'image' } );
		consumable.consume( viewImg, { name: true, attribute: 'src' } );

		// Create model element.
		const modelImage = new ModelElement( 'image', {
			src: viewImg.getAttribute( 'src' )
		} );

		// Convert `alt` attribute if present.
		if ( consumable.consume( viewImg, { attribute: [ 'alt' ] } ) ) {
			modelImage.setAttribute( 'alt', viewImg.getAttribute( 'alt' ) );
		}

		data.output = modelImage;
	};
}

/**
 * Returns model to view selection converter. This converter is applied after default selection conversion is made.
 * It creates fake view selection when {@link module:engine/view/selection~Selection#getSelectedElement} returns instance
 * of image widget.
 *
 * @param {Function} t {@link module:utils/locale~Locale#t Locale#t function} used to translate default fake selection's label.
 * @returns {Function}
 */
export function modelToViewSelection( t ) {
	return ( evt, data, consumable, conversionApi ) => {
		const viewSelection = conversionApi.viewSelection;
		const selectedElement = viewSelection.getSelectedElement();

		if ( !selectedElement || !isImageWidget( selectedElement ) ) {
			return;
		}

		let fakeSelectionLabel = t( 'image widget' );
		const imgElement = selectedElement.getChild( 0 );
		const altText = imgElement.getAttribute( 'alt' );

		if ( altText ) {
			fakeSelectionLabel = `${ altText } ${ fakeSelectionLabel }`;
		}

		viewSelection.setFake( true, { label: fakeSelectionLabel } );
	};
}

/**
 * Converts model `image` element to view representation:
 *
 *		<figure class="image"><img src="..." alt="..."></img></figure>
 *
 * @param {module:engine/model/element~Element} modelElement
 * @return {module:engine/view/containerelement~ContainerElement}
 */
export function modelToViewImage( modelElement ) {
	const viewImg = new ViewEmptyElement( 'img', {
		src: modelElement.getAttribute( 'src' )
	} );

	if ( modelElement.hasAttribute( 'alt' ) ) {
		viewImg.setAttribute( 'alt', modelElement.getAttribute( 'alt' ) );
	}

	return new ViewContainerElement( 'figure', { class: 'image' }, viewImg );
}
