/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/utils
 */

/**
 * Converts a given {@link module:engine/view/element~Element} to an image widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the image widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
 * @param {String} label The element's label. It will be concatenated with the image `alt` attribute if one is present.
 * @param {module:widget/widget~Widget} widget
 * @returns {module:engine/view/element~Element}
 */
export function toImageWidget( viewElement, writer, label, widget ) {
	writer.setCustomProperty( 'image', true, viewElement );

	return widget.toWidget( viewElement, writer, { label: labelCreator } );

	function labelCreator() {
		const imgElement = getViewImgFromWidget( viewElement );
		const altText = imgElement.getAttribute( 'alt' );

		return altText ? `${ altText } ${ label }` : label;
	}
}

/**
 * Checks if a given view element is an image widget.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:widget/widget~Widget} widget
 * @returns {Boolean}
 */
export function isImageWidget( viewElement, widget ) {
	return !!viewElement.getCustomProperty( 'image' ) && widget.isWidget( viewElement );
}

/**
 * Returns an image widget editing view element if one is selected.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @param {module:widget/widget~Widget} widget
 * @returns {module:engine/view/element~Element|null}
 */
export function getSelectedImageWidget( selection, widget ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isImageWidget( viewElement, widget ) ) {
		return viewElement;
	}

	return null;
}

/**
 * Checks if the provided model element is an `image`.
 *
 * @param {module:engine/model/element~Element} modelElement
 * @returns {Boolean}
 */
export function isImage( modelElement ) {
	return !!modelElement && modelElement.is( 'element', 'image' );
}

/**
 * Handles inserting single file. This method unifies image insertion using
 * {@link module:widget/widget~Widget#findOptimalInsertionPosition} method.
 *
 *		insertImage( model, widgetPlugin, { src: 'path/to/image.jpg' } );
 *
 * @param {module:engine/model/model~Model} model
 * @param {module:widget/widget~Widget} widget
 * @param {Object} [attributes={}] Attributes of inserted image
 * @param {module:engine/model/position~Position} [insertPosition] Position to insert the image. If not specified,
 * the {@link module:widget/widget~Widget#findOptimalInsertionPosition} logic will be applied.
 */
export function insertImage( model, widget, attributes = {}, insertPosition = null ) {
	model.change( writer => {
		const imageElement = writer.createElement( 'image', attributes );

		const insertAtSelection = insertPosition || widget.findOptimalInsertionPosition( model.document.selection, model );

		model.insertContent( imageElement, insertAtSelection );

		// Inserting an image might've failed due to schema regulations.
		if ( imageElement.parent ) {
			writer.setSelection( imageElement, 'on' );
		}
	} );
}

/**
 * Checks if image can be inserted at current model selection.
 *
 * @param {module:engine/model/model~Model} model
 * @param {module:widget/widget~Widget} widget
 * @returns {Boolean}
 */
export function isImageAllowed( model, widget ) {
	const schema = model.schema;
	const selection = model.document.selection;

	return isImageAllowedInParent( selection, schema, model, widget ) &&
		!widget.checkSelectionOnObject( selection, schema ) &&
		isInOtherImage( selection );
}

/**
 * Get view `<img>` element from the view widget (`<figure>`).
 *
 * Assuming that image is always a first child of a widget (ie. `figureView.getChild( 0 )`) is unsafe as other features might
 * inject their own elements to the widget.
 *
 * The `<img>` can be wrapped to other elements, e.g. `<a>`. Nested check required.
 *
 * @param {module:engine/view/element~Element} figureView
 * @returns {module:engine/view/element~Element}
 */
export function getViewImgFromWidget( figureView ) {
	const figureChildren = [];

	for ( const figureChild of figureView.getChildren() ) {
		figureChildren.push( figureChild );

		if ( figureChild.is( 'element' ) ) {
			figureChildren.push( ...figureChild.getChildren() );
		}
	}

	return figureChildren.find( viewChild => viewChild.is( 'element', 'img' ) );
}

// Checks if image is allowed by schema in optimal insertion parent.
//
// @returns {Boolean}
function isImageAllowedInParent( selection, schema, model, widget ) {
	const parent = getInsertImageParent( selection, model, widget );

	return schema.checkChild( parent, 'image' );
}

// Checks if selection is placed in other image (ie. in caption).
function isInOtherImage( selection ) {
	return [ ...selection.focus.getAncestors() ].every( ancestor => !ancestor.is( 'element', 'image' ) );
}

// Returns a node that will be used to insert image with `model.insertContent` to check if image can be placed there.
function getInsertImageParent( selection, model, widget ) {
	const insertAt = widget.findOptimalInsertionPosition( selection, model );

	const parent = insertAt.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent;
	}

	return parent;
}
