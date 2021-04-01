/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/utils
 */

import { findOptimalInsertionRange, isWidget, toWidget } from 'ckeditor5/src/widget';
import { first } from 'ckeditor5/src/utils';

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
 * Returns a image widget editing view element if one is among the selection's ancestors.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {module:engine/view/element~Element|null}
 */
export function getImageWidgetAncestor( selection ) {
	let parent = selection.getFirstPosition().parent;

	while ( parent ) {
		if ( parent.is( 'element' ) && isImageWidget( parent ) ) {
			return parent;
		}

		parent = parent.parent;
	}

	return null;
}

/**
 * Checks if the provided model element is an `image`.
 *
 * @protected
 * @param {module:engine/model/element~Element} modelElement
 * @returns {Boolean}
 */
export function isBlockImage( modelElement ) {
	return !!modelElement && modelElement.is( 'element', 'image' );
}

/**
 * Checks if the provided model element is an `imageInline`.
 *
 * @protected
 * @param {module:engine/model/element~Element} modelElement
 * @returns {Boolean}
 */
export function isInlineImage( modelElement ) {
	return !!modelElement && modelElement.is( 'element', 'imageInline' );
}

/**
 * Checks if the provided model element is an `image` or `imageInline`.
 *
 * @protected
 * @param {module:engine/model/element~Element} modelElement
 * @returns {Boolean}
 */
export function isImage( modelElement ) {
	return isInlineImage( modelElement ) || isBlockImage( modelElement );
}

/**
 * Handles inserting single file. This method unifies image insertion using {@link module:widget/utils~findOptimalInsertionRange} method.
 *
 *		insertImage( model, { src: 'path/to/image.jpg' } );
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {Object} [attributes={}] Attributes of the inserted image.
 * This method filters out the attributes which are disallowed by the {@link module:engine/model/schema~Schema}.
 * @param {module:engine/model/selection~Selectable} [selectable] Place to insert the image. If not specified,
 * the {@link module:widget/utils~findOptimalInsertionRange} logic will be applied for the block images
 * and `model.document.selection` for the inline images.
 * @param {'image'|'imageInline'} [imageType] Image type of inserted image. If not specified,
 * it will be determined automatically depending of editor config or place of the insertion.
 */
export function insertImage( editor, attributes = {}, selectable = null, imageType = null ) {
	const model = editor.model;
	const selection = model.document.selection;

	imageType = determineImageTypeForInsertion( editor, selectable || selection, imageType );

	for ( const attributeName in attributes ) {
		if ( !model.schema.checkAttribute( imageType, attributeName ) ) {
			delete attributes[ attributeName ];
		}
	}

	model.change( writer => {
		const imageElement = writer.createElement( imageType, attributes );

		// If we want to insert a block image (for whatever reason) then we don't want to split text blocks.
		// This applies only when we don't have the selectable specified (i.e., we insert multiple block images at once).
		if ( !selectable && imageType != 'imageInline' ) {
			selectable = findOptimalInsertionRange( selection, model );
		}

		model.insertContent( imageElement, selectable );

		// Inserting an image might've failed due to schema regulations.
		if ( imageElement.parent ) {
			writer.setSelection( imageElement, 'on' );
		}
	} );
}

/**
 * Checks if image can be inserted at current model selection.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Boolean}
 */
export function isImageAllowed( editor ) {
	const model = editor.model;
	const schema = model.schema;
	const selection = model.document.selection;

	return isImageAllowedInParent( selection, schema, editor ) && isNotInsideImage( selection );
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

		const imageType = element.findAncestor( ancestor =>
			// Check if element is a figure and if its direct or subsequent child is an img element
			// to exclude a table with an inline image inside.
			ancestor.is( 'element', 'figure' ) && getViewImageFromWidget( ancestor )
		) ? 'image' : 'imageInline';

		if ( imageType !== matchImageType ) {
			return null;
		}

		return { name: true, attributes: [ 'src' ] };
	};
}

// Checks if image is allowed by schema in optimal insertion parent.
//
// @param {module:engine/model/selection~Selection} selection
// @param {module:engine/model/schema~Schema} schema
// @param {module:core/editor/editor~Editor} editor
// @returns {Boolean}
function isImageAllowedInParent( selection, schema, editor ) {
	const imageType = determineImageTypeForInsertion( editor, selection );

	if ( imageType == 'image' ) {
		const parent = getInsertImageParent( selection, editor.model );

		if ( schema.checkChild( parent, 'image' ) ) {
			return true;
		}
	} else if ( schema.checkChild( selection.focus, 'imageInline' ) ) {
		return true;
	}

	return false;
}

// Checks if selection is not placed inside an image (e.g. its caption).
//
// @param {module:engine/model/selection~Selectable} selection
// @returns {Boolean}
function isNotInsideImage( selection ) {
	return [ ...selection.focus.getAncestors() ].every( ancestor => !ancestor.is( 'element', 'image' ) );
}

// Returns a node that will be used to insert image with `model.insertContent`.
//
// @param {module:engine/model/selection~Selectable} selection
// @param {module:engine/model/model~Model} model
// @returns {module:engine/model/element~Element}
function getInsertImageParent( selection, model ) {
	const insertionRange = findOptimalInsertionRange( selection, model );
	const parent = insertionRange.start.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent;
	}

	return parent;
}

// Determine image element type name depending on editor config or place of insertion.
//
// @param {module:core/editor/editor~Editor} editor
// @param {module:engine/model/selection~Selectable} selectable
// @param {'image'|'imageInline'} [imageType] Image element type name. Used to force return of provided element name,
// but only if there is proper plugin enabled.
// @returns {'image'|'imageInline'} imageType
function determineImageTypeForInsertion( editor, selectable, imageType ) {
	const schema = editor.model.schema;
	const configImageInsertType = editor.config.get( 'image.insert.type' );

	if ( !editor.plugins.has( 'ImageBlockEditing' ) ) {
		return 'imageInline';
	}

	if ( !editor.plugins.has( 'ImageInlineEditing' ) ) {
		return 'image';
	}

	if ( imageType ) {
		return imageType;
	}

	if ( configImageInsertType === 'inline' ) {
		return 'imageInline';
	}

	if ( configImageInsertType === 'block' ) {
		return 'image';
	}

	// Try to replace the selected widget (e.g. another image).
	if ( selectable.is( 'selection' ) ) {
		const firstBlock = first( selectable.getSelectedBlocks() );

		return ( !firstBlock || firstBlock.isEmpty || schema.isObject( firstBlock ) ) ? 'image' : 'imageInline';
	}

	return schema.checkChild( selectable, 'imageInline' ) ? 'imageInline' : 'image';
}
