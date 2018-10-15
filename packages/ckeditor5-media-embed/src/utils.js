/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/utils
 */

import { isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

const mediaSymbol = Symbol( 'isMedia' );

/**
 * Converts a given {@link module:engine/view/element~Element} to a media embed widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the media widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
 * @param {String} label The element's label.
 * @returns {module:engine/view/element~Element}
 */
export function toMediaWidget( viewElement, writer, label ) {
	writer.setCustomProperty( mediaSymbol, true, viewElement );

	return toWidget( viewElement, writer, { label } );
}

export function isMediaWidgetSelected( viewSelection ) {
	const viewElement = viewSelection.getSelectedElement();

	return !!( viewElement && isMediaWidget( viewElement ) );
}

export function isMediaWidget( viewElement ) {
	return !!viewElement.getCustomProperty( mediaSymbol ) && isWidget( viewElement );
}

/**
 * Creates a view element representing the media. Either "semantic" one for the data pipeline:
 *
 *		<figure class="media">
 *			<oembed url="foo"></oembed>
 *		</figure>
 *
 * or "non-semantic" (for the editing view pipeline):
 *
 *		<figure class="media">
 *			<div data-oembed-url="foo">[ non-semantic media preview for "foo" ]</div>
 *		</figure>
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @param {module:media-embed/mediaregistry~MediaRegistry} registry
 * @param {String} url
 * @param {Object} options
 * @param {String} [options.useSemanticWrapper]
 * @param {String} [options.renderForEditingView]
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createMediaFigureElement( writer, registry, url, options ) {
	const figure = writer.createContainerElement( 'figure', { class: 'media' } );

	// TODO: This is a hack. Without it, the figure in the data pipeline will contain &nbsp; because
	// its only child is the UIElement (wrapper).
	//
	// Note: The hack is a copy&paste from widget utils; it makes the figure act like it's a widget.
	figure.getFillerOffset = getFillerOffset;

	writer.insert( writer.createPositionAt( figure, 0 ), registry.getMediaViewElement( writer, url, options ) );

	return figure;
}

/**
 * Returns a selected media element in the model, if any.
 *
 * @param {module:engine/model/selection~Selection} selection
 * @returns {module:engine/model/element~Element|null}
 */
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
