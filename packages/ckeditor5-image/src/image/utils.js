/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/utils
 */

import { findOptimalInsertionPosition, checkSelectionOnObject, isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * Converts a given {@link module:engine/view/element~Element} to an image widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the image widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
 * @param {String} label The element's label. It will be concatenated with the image `alt` attribute if one is present.
 * @returns {module:engine/view/element~Element}
 */
export function toImageWidget( viewElement, writer, label ) {
	writer.setCustomProperty( 'image', true, viewElement );

	return toWidget( viewElement, writer, { label: labelCreator } );

	function labelCreator() {
		const imgElement = getViewImageFromWidget( viewElement );
		const altText = imgElement.getAttribute( 'alt' );

		return altText ? `${ altText } ${ label }` : label;
	}
}

/**
 * Checks if a given view element is an image widget.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isImageWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'image' ) && isWidget( viewElement );
}

/**
 * Returns an image widget editing view element if one is selected.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {module:engine/view/element~Element|null}
 */
export function getSelectedImageWidget( selection ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isImageWidget( viewElement ) ) {
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
 * Checks if the provided model element is an `imageInline`.
 *
 * @param {module:engine/model/element~Element} modelElement
 * @returns {Boolean}
 */
export function isImageInline( modelElement ) {
	return !!modelElement && modelElement.is( 'element', 'imageInline' );
}

/**
 * Handles inserting single file. This method unifies image insertion using {@link module:widget/utils~findOptimalInsertionPosition} method.
 *
 *		insertImage( model, { src: 'path/to/image.jpg' } );
 *
 * @param {module:engine/model/model~Model} model
 * @param {Object} [attributes={}] Attributes of inserted image
 * @param {module:engine/model/position~Position} [insertPosition] Position to insert the image. If not specified,
 * the {@link module:widget/utils~findOptimalInsertionPosition} logic will be applied.
 */
export function insertImage( model, attributes = {}, insertPosition = null ) {
	model.change( writer => {
		const imageElement = writer.createElement( 'image', attributes );

		const insertAtSelection = insertPosition || findOptimalInsertionPosition( model.document.selection, model );

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
 * @returns {Boolean}
 */
export function isImageAllowed( model ) {
	const schema = model.schema;
	const selection = model.document.selection;

	return isImageAllowedInParent( selection, schema, model ) &&
		!checkSelectionOnObject( selection, schema ) &&
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
export function getViewImageFromWidget( figureView ) {
	if ( figureView.is( 'element', 'img' ) ) {
		return figureView;
	}

	const figureChildren = [];

	for ( const figureChild of figureView.getChildren() ) {
		figureChildren.push( figureChild );

		if ( figureChild.is( 'element' ) ) {
			figureChildren.push( ...figureChild.getChildren() );
		}
	}

	return figureChildren.find( viewChild => viewChild.is( 'element', 'img' ) );
}

/**
 * Creates a view element representing the image of provided image type.
 *
 * An 'image' type (block image):
 *
 * 		<figure class="image"><img></img></figure>
 *
 * An 'imageInline' type (inline image):
 *
 * 		<span class="image-inline"><img></img></span>
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @param {'image'|'imageInline'} imageType The type of created image.
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createImageViewElement( writer, imageType ) {
	const emptyElement = writer.createEmptyElement( 'img' );

	const container = imageType === 'image' ?
		writer.createContainerElement( 'figure', { class: 'image' } ) :
		writer.createContainerElement( 'span', { class: 'image-inline' } );

	writer.insert( writer.createPositionAt( container, 0 ), emptyElement );

	return container;
}

/**
 * A function returning a `MatcherPattern` for a particular type of View images.
 *
 * @param {'image'|'imageInline'} matchImageType The type of created image.
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {module:engine/view/matcher~MatcherPattern}
 */
export function getImageTypeMatcher( matchImageType, editor ) {
	if ( editor.plugins.has( 'ImageInlineEditing' ) !== editor.plugins.has( 'ImageBlockEditing' ) ) {
		return {
			name: 'img',
			attributes: {
				src: true
			}
		};
	}

	return element => {
		// Convert only images with src attribute.
		if ( !element.is( 'element', 'img' ) || !element.hasAttribute( 'src' ) ) {
			return null;
		}

		const imageType = element.findAncestor( 'figure' ) ? 'image' : 'imageInline';

		if ( imageType !== matchImageType ) {
			return null;
		}

		return { name: true, attributes: [ 'src' ] };
	};
}

// Checks if image is allowed by schema in optimal insertion parent.
//
// @returns {Boolean}
function isImageAllowedInParent( selection, schema, model ) {
	const parent = getInsertImageParent( selection, model );

	return schema.checkChild( parent, 'image' );
}

// Checks if selection is placed in other image (ie. in caption).
function isInOtherImage( selection ) {
	return [ ...selection.focus.getAncestors() ].every( ancestor => !ancestor.is( 'element', 'image' ) );
}

// Returns a node that will be used to insert image with `model.insertContent` to check if image can be placed there.
function getInsertImageParent( selection, model ) {
	const insertAt = findOptimalInsertionPosition( selection, model );

	const parent = insertAt.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent;
	}

	return parent;
}
