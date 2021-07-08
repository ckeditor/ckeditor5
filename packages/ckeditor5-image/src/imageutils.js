/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageutils
 */

import { Plugin } from 'ckeditor5/src/core';
import { findOptimalInsertionRange, isWidget, toWidget } from 'ckeditor5/src/widget';
import { determineImageTypeForInsertionAtSelection } from './image/utils';

/**
 * A set of helpers related to images.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageUtils';
	}

	/**
	 * Checks if the provided model element is an `image` or `imageInline`.
	 *
	 * @param {module:engine/model/element~Element} modelElement
	 * @returns {Boolean}
	 */
	isImage( modelElement ) {
		return this.isInlineImage( modelElement ) || this.isBlockImage( modelElement );
	}

	/**
	 * Checks if the provided view element represents an inline image.
	 *
	 * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
	 *
	 * @param {module:engine/view/element~Element} element
	 * @returns {Boolean}
	 */
	isInlineImageView( element ) {
		return !!element && element.is( 'element', 'img' );
	}

	/**
	 * Checks if the provided view element represents a block image.
	 *
	 * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
	 *
	 * @param {module:engine/view/element~Element} element
	 * @returns {Boolean}
	 */
	isBlockImageView( element ) {
		return !!element && element.is( 'element', 'figure' ) && element.hasClass( 'image' );
	}

	/**
	 * Handles inserting single file. This method unifies image insertion using {@link module:widget/utils~findOptimalInsertionRange}
	 * method.
	 *
	 *		const imageUtils = editor.plugins.get( 'ImageUtils' );
	 *
	 *		imageUtils.insertImage( { src: 'path/to/image.jpg' } );
	 *
	 * @param {Object} [attributes={}] Attributes of the inserted image.
	 * This method filters out the attributes which are disallowed by the {@link module:engine/model/schema~Schema}.
	 * @param {module:engine/model/selection~Selectable} [selectable] Place to insert the image. If not specified,
	 * the {@link module:widget/utils~findOptimalInsertionRange} logic will be applied for the block images
	 * and `model.document.selection` for the inline images.
	 *
	 * **Note**: If `selectable` is passed, this helper will not be able to set selection attributes (such as `linkHref`)
	 * and apply them to the new image. In this case, make sure all selection attributes are passed in `attributes`.
	 *
	 * @param {'imageBlock'|'imageInline'} [imageType] Image type of inserted image. If not specified,
	 * it will be determined automatically depending of editor config or place of the insertion.
	 * @return {module:engine/view/element~Element|null} The inserted model image element.
	 */
	insertImage( attributes = {}, selectable = null, imageType = null ) {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		imageType = determineImageTypeForInsertion( editor, selectable || selection, imageType );

		// Mix declarative attributes with selection attributes because the new image should "inherit"
		// the latter for best UX. For instance, inline images inserted into existing links
		// should not split them. To do that, they need to have "linkHref" inherited from the selection.
		attributes = {
			...Object.fromEntries( selection.getAttributes() ),
			...attributes
		};

		for ( const attributeName in attributes ) {
			if ( !model.schema.checkAttribute( imageType, attributeName ) ) {
				delete attributes[ attributeName ];
			}
		}

		return model.change( writer => {
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

				return imageElement;
			}

			return null;
		} );
	}

	/**
	 * Returns an image widget editing view element if one is selected or is among the selection's ancestors.
	 *
	 * @protected
	 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
	 * @returns {module:engine/view/element~Element|null}
	 */
	getClosestSelectedImageWidget( selection ) {
		const viewElement = selection.getSelectedElement();

		if ( viewElement && this.isImageWidget( viewElement ) ) {
			return viewElement;
		}

		let parent = selection.getFirstPosition().parent;

		while ( parent ) {
			if ( parent.is( 'element' ) && this.isImageWidget( parent ) ) {
				return parent;
			}

			parent = parent.parent;
		}

		return null;
	}

	/**
	 * Returns a image model element if one is selected or is among the selection's ancestors.
	 *
	 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
	 * @returns {module:engine/model/element~Element|null}
	 */
	getClosestSelectedImageElement( selection ) {
		const selectedElement = selection.getSelectedElement();

		return this.isImage( selectedElement ) ? selectedElement : selection.getFirstPosition().findAncestor( 'imageBlock' );
	}

	/**
	 * Checks if image can be inserted at current model selection.
	 *
	 * @protected
	 * @returns {Boolean}
	 */
	isImageAllowed() {
		const model = this.editor.model;
		const selection = model.document.selection;

		return isImageAllowedInParent( this.editor, selection ) && isNotInsideImage( selection );
	}

	/**
	 * Converts a given {@link module:engine/view/element~Element} to an image widget:
	 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the image widget
	 * element.
	 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
	 *
	 * @protected
	 * @param {module:engine/view/element~Element} viewElement
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
	 * @param {String} label The element's label. It will be concatenated with the image `alt` attribute if one is present.
	 * @returns {module:engine/view/element~Element}
	 */
	toImageWidget( viewElement, writer, label ) {
		writer.setCustomProperty( 'image', true, viewElement );

		const labelCreator = () => {
			const imgElement = this.findViewImgElement( viewElement );
			const altText = imgElement.getAttribute( 'alt' );

			return altText ? `${ altText } ${ label }` : label;
		};

		return toWidget( viewElement, writer, { label: labelCreator } );
	}

	/**
	 * Checks if a given view element is an image widget.
	 *
	 * @protected
	 * @param {module:engine/view/element~Element} viewElement
	 * @returns {Boolean}
	 */
	isImageWidget( viewElement ) {
		return !!viewElement.getCustomProperty( 'image' ) && isWidget( viewElement );
	}

	/**
	 * Checks if the provided model element is an `image`.
	 *
	 * @param {module:engine/model/element~Element} modelElement
	 * @returns {Boolean}
	 */
	isBlockImage( modelElement ) {
		return !!modelElement && modelElement.is( 'element', 'imageBlock' );
	}

	/**
	 * Checks if the provided model element is an `imageInline`.
	 *
	 * @param {module:engine/model/element~Element} modelElement
	 * @returns {Boolean}
	 */
	isInlineImage( modelElement ) {
		return !!modelElement && modelElement.is( 'element', 'imageInline' );
	}

	/**
	 * Get the view `<img>` from another view element, e.g. a widget (`<figure class="image">`), a link (`<a>`).
	 *
	 * The `<img>` can be located deep in other elements, so this helper performs a deep tree search.
	 *
	 * @param {module:engine/view/element~Element} figureView
	 * @returns {module:engine/view/element~Element}
	 */
	findViewImgElement( figureView ) {
		if ( this.isInlineImageView( figureView ) ) {
			return figureView;
		}

		const editingView = this.editor.editing.view;

		for ( const { item } of editingView.createRangeIn( figureView ) ) {
			if ( this.isInlineImageView( item ) ) {
				return item;
			}
		}
	}
}

// Checks if image is allowed by schema in optimal insertion parent.
//
// @private
// @param {module:core/editor/editor~Editor} editor
// @param {module:engine/model/selection~Selection} selection
// @returns {Boolean}
function isImageAllowedInParent( editor, selection ) {
	const imageType = determineImageTypeForInsertion( editor, selection );

	if ( imageType == 'imageBlock' ) {
		const parent = getInsertImageParent( selection, editor.model );

		if ( editor.model.schema.checkChild( parent, 'imageBlock' ) ) {
			return true;
		}
	} else if ( editor.model.schema.checkChild( selection.focus, 'imageInline' ) ) {
		return true;
	}

	return false;
}

// Checks if selection is not placed inside an image (e.g. its caption).
//
// @private
// @param {module:engine/model/selection~Selectable} selection
// @returns {Boolean}
function isNotInsideImage( selection ) {
	return [ ...selection.focus.getAncestors() ].every( ancestor => !ancestor.is( 'element', 'imageBlock' ) );
}

// Returns a node that will be used to insert image with `model.insertContent`.
//
// @private
// @param {module:engine/model/selection~Selection} selection
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
// @private
// @param {module:core/editor/editor~Editor} editor
// @param {module:engine/model/selection~Selectable} selectable
// @param {'imageBlock'|'imageInline'} [imageType] Image element type name. Used to force return of provided element name,
// but only if there is proper plugin enabled.
// @returns {'imageBlock'|'imageInline'} imageType
function determineImageTypeForInsertion( editor, selectable, imageType ) {
	const schema = editor.model.schema;
	const configImageInsertType = editor.config.get( 'image.insert.type' );

	if ( !editor.plugins.has( 'ImageBlockEditing' ) ) {
		return 'imageInline';
	}

	if ( !editor.plugins.has( 'ImageInlineEditing' ) ) {
		return 'imageBlock';
	}

	if ( imageType ) {
		return imageType;
	}

	if ( configImageInsertType === 'inline' ) {
		return 'imageInline';
	}

	if ( configImageInsertType === 'block' ) {
		return 'imageBlock';
	}

	// Try to replace the selected widget (e.g. another image).
	if ( selectable.is( 'selection' ) ) {
		return determineImageTypeForInsertionAtSelection( schema, selectable );
	}

	return schema.checkChild( selectable, 'imageInline' ) ? 'imageInline' : 'imageBlock';
}
