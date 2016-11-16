/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewContainerElement from '../engine/view/containerelement.js';
import ViewEmptyElement from '../engine/view/emptyelement.js';
import ModelElement from '../engine/model/element.js';

const WIDGET_SELECTED_CLASS_NAME = 'ck-widget_selected';

/**
 * Returns model to view selection converter. If model selection is placed around image widget:
 *
 *		[<image src="..." alt="..."></image>]
 *
 * then it will be converted into fake selection.
 *
 * @param {Function} t {@link utils.Locale#t Locale#t function} used to translate default fake selection's label.
 * @returns {Function}
 */
export function modelToViewSelection( t ) {
	let selected;

	return ( evt, data, consumable, conversionApi ) => {
		const viewSelection = conversionApi.viewSelection;
		const modelSelection = data.selection;

		const nodeAfter = modelSelection.anchor.nodeAfter;
		const nodeBefore = modelSelection.focus.nodeBefore;

		if ( selected && selected.hasClass( WIDGET_SELECTED_CLASS_NAME ) ) {
			selected.removeClass( WIDGET_SELECTED_CLASS_NAME );
		}

		// Check if model selection is over image and create fake selection in the view.
		if ( !modelSelection.isCollapsed && nodeAfter && nodeAfter.name == 'image' && nodeAfter == nodeBefore ) {
			let fakeSelectionLabel = t( 'image widget' );
			const altText = nodeAfter.getAttribute( 'alt' );

			if ( altText ) {
				fakeSelectionLabel = `${ altText } ${ fakeSelectionLabel }`;
			}

			viewSelection.setFake( true, { label: fakeSelectionLabel } );
			const viewElement = conversionApi.mapper.toViewElement( nodeAfter );
			viewElement.addClass( WIDGET_SELECTED_CLASS_NAME );
			selected = viewElement;
		}
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

		// Check if 'src' attribute can be converted.
		if ( !viewImg.hasAttribute( 'src' ) || !consumable.consume( viewImg, { attributes: [ 'src' ] } ) ) {
			return;
		}

		// Check if 'alt' attribute can be converted.
		if ( !viewImg.hasAttribute( 'alt' ) || !consumable.consume( viewImg, { attributes: [ 'alt' ] } ) ) {
			return;
		}

		// Consume img element.
		if ( !consumable.consume( viewImg, { name: true } ) ) {
			return;
		}

		// Create model element.
		const modelImage = new ModelElement( 'image' );

		modelImage.setAttribute( 'src', viewImg.getAttribute( 'src' ) );
		modelImage.setAttribute( 'alt', viewImg.getAttribute( 'alt' ) );

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
		src: modelElement.getAttribute( 'src' ),
		alt: modelElement.getAttribute( 'alt' )
	} );

	return new ViewContainerElement( 'figure', { class: 'image' }, viewImg );
}
