/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/utils
 */

import type {
	ViewContainerElement,
	Element,
	Model,
	Selectable,
	Selection,
	DowncastWriter,
	ViewDocumentSelection,
	ViewElement,
	DocumentSelection
} from 'ckeditor5/src/engine.js';
import { isWidget, toWidget } from 'ckeditor5/src/widget.js';
import type MediaRegistry from './mediaregistry.js';

/**
 * Converts a given {@link module:engine/view/element~Element} to a media embed widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the media widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param writer An instance of the view writer.
 * @param label The element's label.
 */
export function toMediaWidget( viewElement: ViewElement, writer: DowncastWriter, label: string ): ViewElement {
	writer.setCustomProperty( 'media', true, viewElement );

	return toWidget( viewElement, writer, { label } );
}

/**
 * Returns a media widget editing view element if one is selected.
 */
export function getSelectedMediaViewWidget( selection: ViewDocumentSelection ): ViewElement | null {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isMediaWidget( viewElement ) ) {
		return viewElement;
	}

	return null;
}

/**
 * Checks if a given view element is a media widget.
 */
export function isMediaWidget( viewElement: ViewElement ): boolean {
	return !!viewElement.getCustomProperty( 'media' ) && isWidget( viewElement );
}

/**
 * Creates a view element representing the media. Either a "semantic" one for the data pipeline:
 *
 * ```html
 * <figure class="media">
 * 	<oembed url="foo"></oembed>
 * </figure>
 * ```
 *
 * or a "non-semantic" (for the editing view pipeline):
 *
 * ```html
 * <figure class="media">
 * 	<div data-oembed-url="foo">[ non-semantic media preview for "foo" ]</div>
 * </figure>
 * ```
 */
export function createMediaFigureElement(
	writer: DowncastWriter,
	registry: MediaRegistry,
	url: string,
	options: MediaOptions
): ViewContainerElement {
	return writer.createContainerElement( 'figure', { class: 'media' }, [
		registry.getMediaViewElement( writer, url, options ),
		writer.createSlot()
	] );
}

/**
 * Returns a selected media element in the model, if any.
 */
export function getSelectedMediaModelWidget( selection: Selection | DocumentSelection ): Element | null {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && selectedElement.is( 'element', 'media' ) ) {
		return selectedElement;
	}

	return null;
}

/**
 * Creates a media element and inserts it into the model.
 *
 * **Note**: This method will use {@link module:engine/model/model~Model#insertContent `model.insertContent()`} logic of inserting content
 * if no `insertPosition` is passed.
 *
 * @param url An URL of an embeddable media.
 * @param findOptimalPosition If true it will try to find optimal position to insert media without breaking content
 * in which a selection is.
 */
export function insertMedia( model: Model, url: string, selectable: Selectable, findOptimalPosition: boolean ): void {
	model.change( writer => {
		const mediaElement = writer.createElement( 'media', { url } );

		model.insertObject( mediaElement, selectable, null, {
			setSelection: 'on',
			findOptimalPosition: findOptimalPosition ? 'auto' : undefined
		} );
	} );
}

/**
 * Type for commonly grouped function parameters across this package.
 */
export type MediaOptions = {
	elementName: string;
	renderMediaPreview?: boolean;
	renderForEditingView?: boolean;
};
