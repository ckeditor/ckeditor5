/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/utils
 */

import { isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * Converts a given {@link module:engine/view/element~Element} to a html widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the html widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 *  @param {module:engine/view/element~Element} viewElement
 *  @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
 *  @param {String} label The element's label.
 *  @returns {module:engine/view/element~Element}
 */
export function toRawHtmlWidget( viewElement, writer, label ) {
	writer.setCustomProperty( 'rawHtml', true, viewElement );

	return toWidget( viewElement, writer, { label } );
}

/**
 * Returns a raw html widget editing view element if one is selected.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {module:engine/view/element~Element|null}
 */
export function getSelectedRawHtmlViewWidget( selection ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isRawHtmlWidget( viewElement ) ) {
		return viewElement;
	}

	return null;
}

/**
 * Checks if a given view element is a raw html widget.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isRawHtmlWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'rawHtml' ) && isWidget( viewElement );
}

/**
 * Returns a selected raw html element in the model, if any.
 *
 * @param {module:engine/model/selection~Selection} selection
 * @returns {module:engine/model/element~Element|null}
 */
export function getSelectedRawHtmlModelWidget( selection ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && selectedElement.is( 'element', 'rawHtml' ) ) {
		return selectedElement;
	}

	return null;
}

/**
 * Creates a raw html element and inserts it into the model.
 *
 * **Note**: This method will use {@link module:engine/model/model~Model#insertContent `model.insertContent()`} logic of inserting content
 * if no `insertPosition` is passed.
 *
 * @param {module:engine/model/model~Model} model
 * @param {String} [rawHtml='']
 */
export function insertRawHtml( model, rawHtml = null ) {
	model.change( writer => {
		const rawHtmlElement = writer.createElement( 'rawHtml' );

		model.insertContent( rawHtmlElement );

		writer.setSelection( rawHtmlElement, 'on' );
		writer.setAttribute( 'value', rawHtml, rawHtmlElement );
	} );
}
