/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/utils
 */

import { isWidget, toWidget } from 'ckeditor5/src/widget';

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
	writer.setCustomProperty( 'media', true, viewElement );

	return toWidget( viewElement, writer, { label } );
}

/**
 * Returns a media widget editing view element if one is selected.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {module:engine/view/element~Element|null}
 */
export function getSelectedMediaViewWidget( selection ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isMediaWidget( viewElement ) ) {
		return viewElement;
	}

	return null;
}

/**
 * Checks if a given view element is a media widget.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isMediaWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'media' ) && isWidget( viewElement );
}

/**
 * Creates a view element representing the media. Either a "semantic" one for the data pipeline:
 *
 *		<figure class="media">
 *			<oembed url="foo"></oembed>
 *		</figure>
 *
 * or a "non-semantic" (for the editing view pipeline):
 *
 *		<figure class="media">
 *			<div data-oembed-url="foo">[ non-semantic media preview for "foo" ]</div>
 *		</figure>
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @param {module:media-embed/mediaregistry~MediaRegistry} registry
 * @param {String} url
 * @param {Object} options
 * @param {String} [options.elementName]
 * @param {Boolean} [options.useSemanticWrapper]
 * @param {Boolean} [options.renderForEditingView]
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createMediaFigureElement( writer, registry, url, options ) {
	return writer.createContainerElement( 'figure', { class: 'media' }, [
		registry.getMediaViewElement( writer, url, options ),
		writer.createSlot()
	] );
}

/**
 * Returns a selected media element in the model, if any.
 *
 * @param {module:engine/model/selection~Selection} selection
 * @returns {module:engine/model/element~Element|null}
 */
export function getSelectedMediaModelWidget( selection ) {
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
 * @param {module:engine/model/model~Model} model
 * @param {String} url An URL of an embeddable media.
 * @param {module:engine/model/range~Range} [insertRange] The range to insert the media. If not specified,
 * the default behavior of {@link module:engine/model/model~Model#insertContent `model.insertContent()`} will
 * be applied.
 * @param {Boolean} findOptimalPosition If true it will try to find optimal position to insert media without breaking content
 * in which a selection is.
 */
export function insertMedia( model, url, selectable, findOptimalPosition ) {
	model.change( writer => {
		const mediaElement = writer.createElement( 'media', { url } );

		model.insertObject( mediaElement, selectable, null, {
			setSelection: 'on',
			findOptimalPosition
		} );
	} );
}
