/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewContainerElement from '../engine/view/containerelement.js';
import ViewEmptyElement from '../engine/view/emptyelement.js';
import ModelElement from '../engine/model/element.js';
import { isImageWidget } from './utils.js';

const WIDGET_SELECTED_CLASS_NAME = 'ck-widget_selected';

/**
 * Returns model to view selection converter. This converter is used after default selection conversion is made.
 * It creates fake view selection when {@link engine.view.Selection#getSelectedElement} returns instance of image widget.
 *
 * @param {Function} t {@link utils.Locale#t Locale#t function} used to translate default fake selection's label.
 * @returns {Function}
 */
export function modelToViewSelection( t ) {
	let previouslySelected;

	return ( evt, data, consumable, conversionApi ) => {
		const viewSelection = conversionApi.viewSelection;
		const selectedElement = viewSelection.getSelectedElement();

		// Remove selected class from previously selected widget.
		if ( previouslySelected && previouslySelected.hasClass( WIDGET_SELECTED_CLASS_NAME ) ) {
			previouslySelected.removeClass( WIDGET_SELECTED_CLASS_NAME );
		}

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
		selectedElement.addClass( WIDGET_SELECTED_CLASS_NAME );
		previouslySelected = selectedElement;
	};
}

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

		// Check if figure element from view can be consumed with `image` class.
		if ( !consumable.consume( viewFigureElement, { name: true, class: 'image' } ) ) {
			return;
		}

		// Check if image can be placed in current context.
		if ( !conversionApi.schema.check( { name: 'image', inside: data.context } ) ) {
			return;
		}

		// Check if figure element have img inside.
		if ( viewFigureElement.childCount != 1 ) {
			return;
		}

		const viewImg = viewFigureElement.getChild( 0 );

		if ( viewImg.name != 'img' ) {
			return;
		}

		// Consume img element with src attribute.
		if ( !consumable.consume( viewImg, { name: true, attribute: 'src' } ) ) {
			return;
		}

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
 * Converts model `image` element to view representation:
 *
 *		<figure class="image"><img src="..." alt="..."></img></figure>
 *
 * @param {engine.model.Element} modelElement
 * @returns {engine.view.ContainerElement}
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
