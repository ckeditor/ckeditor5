/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/utils
 */

import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

const mediaSymbol = Symbol( 'isMedia' );

/**
 * Converts a given {@link module:engine/view/element~Element} to a media embed widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the media widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/view/writer~Writer} writer An instance of the view writer.
 * @param {String} label The element's label.
 * @returns {module:engine/view/element~Element}
 */
export function toMediaWidget( viewElement, writer, label ) {
	writer.setCustomProperty( mediaSymbol, true, viewElement );

	return toWidget( viewElement, writer, { label } );
}

// Creates a view element representing the media.
//
//		<figure class="media"></figure>
//
// @private
// @param {module:engine/view/writer~Writer} writer
// @returns {module:engine/view/containerelement~ContainerElement}
export function createMediaFigureElement( writer, options = {} ) {
	const figure = writer.createContainerElement( 'figure', { class: 'media' } );

	// TODO: This is a hack. Without it, the figure in the data pipeline will contain &nbsp; because
	// its only child is the UIElement (wrapper).
	//
	// Note: The hack comes from widget utils; it makes the figure act like it's a widget.
	figure.getFillerOffset = getFillerOffset;

	addMediaWrapperElementToFigure( writer, figure, options );

	return figure;
}

export function addMediaWrapperElementToFigure( writer, figure, options ) {
	let renderFunction;

	if ( options.mediaHtml ) {
		renderFunction = function( domDocument ) {
			const domElement = this.toDomElement( domDocument );

			domElement.innerHTML = options.mediaHtml;

			return domElement;
		};
	}

	let wrapper;

	if ( options.useSemanticWrapper ) {
		wrapper = writer.createEmptyElement( 'oembed', options.attributes, renderFunction );
	} else {
		wrapper = writer.createUIElement( 'div', options.attributes, renderFunction );
	}

	writer.insert( ViewPosition.createAt( figure ), wrapper );
}

export function getSelectedMediaElement( selection ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && selectedElement.is( 'media' ) ) {
		return selectedElement;
	}

	return null;
}

function getFillerOffset() {
	return null;
}
