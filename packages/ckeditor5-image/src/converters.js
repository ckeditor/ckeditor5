/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewContainerElement from '../engine/view/containerelement.js';
import ViewEmptyElement from '../engine/view/emptyelement.js';
import ModelElement from '../engine/model/element.js';

const WIDGET_CLASS_NAME = 'ck-widget';
const WIDGET_SELECTED_CLASS_NAME = 'ck-widget_selected';

/**
 * Returns model to view selection converter. If model selection is placed around image widget:
 *
 *		[<image src="..." alt="..."></image>]
 *
 * then it will be converted into fake selection.
 *
 * @returns {Function}
 */
export function modelToViewSelection() {
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
			let fakeSelectionLabel = 'image widget';
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

		// Consume img element.
		if ( !consumable.consume( viewImg, { name: true } ) ) {
			return;
		}

		// Create model element.
		const modelImage = new ModelElement( 'image' );

		// Add src if one is present.
		if ( viewImg.hasAttribute( 'src' ) && consumable.consume( viewImg, { attributes: [ 'src' ] } ) ) {
			modelImage.setAttribute( 'src', viewImg.getAttribute( 'src' ) );
		}

		// Add alt if one is present.
		if ( viewImg.hasAttribute( 'alt' ) && consumable.consume( viewImg, { attributes: [ 'alt' ] } ) ) {
			modelImage.setAttribute( 'alt', viewImg.getAttribute( 'alt' ) );
		}

		data.output = modelImage;
	};
}

/**
 * Returns function that converts model `image` element to view representation.
 * For data pipeline model image will be converted to:
 *
 *		<figure class="image"><img src="..." alt="..."></img></figure>
 *
 * For editing pipeline image will be "widgetized" and it will be converted to:
 *
 *		<figure class="image ck-widget" contenteditable="false"><img src="..." alt="..."></img></figure>
 *
 * @param {Boolean} [isDataPipeline=false] If true, figure element will not be "widgetized" as conversion is taking place
 * in data pipeline.
 * @returns {Function}
 */
export function modelToViewImage( isDataPipeline = false ) {
	return ( data ) => {
		const modelElement = data.item;
		const viewImg = new ViewEmptyElement( 'img' );

		if ( modelElement.hasAttribute( 'src' ) ) {
			viewImg.setAttribute( 'src', modelElement.getAttribute( 'src' ) );
		}

		if ( modelElement.hasAttribute( 'alt' ) ) {
			viewImg.setAttribute( 'alt', modelElement.getAttribute( 'alt' ) );
		}

		return isDataPipeline ?
			new ViewContainerElement( 'figure', { class: 'image' }, viewImg ) :
			widgetize( new ViewContainerElement( 'figure', { class: 'image' }, viewImg ) );
	};
}

/**
 * "Widgetizes" provided {@link engie.view.ContainerElement} by:
 * - changing return value of {@link engine.view.ContainerElement#getFillerOffset} to `null`,
 * - adding `contenteditable="false"` attribute,
 * - adding `ck-widget` class,
 * - setting `element.isWidget` to true.
 *
 * @param {engine.view.ContainerElement} viewContainer
 * @returns {engine.view.ContainerElement}
 */
function widgetize( viewContainer ) {
	viewContainer.getFillerOffset = () => null;
	viewContainer.setAttribute( 'contenteditable', false );
	viewContainer.addClass( WIDGET_CLASS_NAME );
	viewContainer.isWidget = true;

	return viewContainer;
}
