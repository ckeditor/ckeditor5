/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageutils
 */

import type {
	Element,
	ViewElement,
	ViewNode,
	DocumentSelection,
	ViewDocumentSelection,
	Selection,
	ViewSelection,
	DocumentFragment,
	ViewDocumentFragment,
	DowncastWriter,
	Model,
	Position,
	ViewContainerElement
} from 'ckeditor5/src/engine.js';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { findOptimalInsertionRange, isWidget, toWidget } from 'ckeditor5/src/widget.js';
import { determineImageTypeForInsertionAtSelection } from './image/utils.js';
import { DomEmitterMixin, type DomEmitter, global } from 'ckeditor5/src/utils.js';

const IMAGE_WIDGETS_CLASSES_MATCH_REGEXP = /^(image|image-inline)$/;

/**
 * A set of helpers related to images.
 */
export default class ImageUtils extends Plugin {
	/**
	 * DOM Emitter.
	 */
	private _domEmitter: DomEmitter = new ( DomEmitterMixin() )();

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageUtils' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * Checks if the provided model element is an `image` or `imageInline`.
	 */
	public isImage( modelElement?: Element | null ): modelElement is Element & { name: 'imageInline' | 'imageBlock' } {
		return this.isInlineImage( modelElement ) || this.isBlockImage( modelElement );
	}

	/**
	 * Checks if the provided view element represents an inline image.
	 *
	 * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
	 */
	public isInlineImageView( element?: ViewElement | null ): boolean {
		return !!element && element.is( 'element', 'img' );
	}

	/**
	 * Checks if the provided view element represents a block image.
	 *
	 * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
	 */
	public isBlockImageView( element?: ViewElement | null ): boolean {
		return !!element && element.is( 'element', 'figure' ) && element.hasClass( 'image' );
	}

	/**
	 * Handles inserting single file. This method unifies image insertion using {@link module:widget/utils~findOptimalInsertionRange}
	 * method.
	 *
	 * ```ts
	 * const imageUtils = editor.plugins.get( 'ImageUtils' );
	 *
	 * imageUtils.insertImage( { src: 'path/to/image.jpg' } );
	 * ```
	 *
	 * @param attributes Attributes of the inserted image.
	 * This method filters out the attributes which are disallowed by the {@link module:engine/model/schema~Schema}.
	 * @param selectable Place to insert the image. If not specified,
	 * the {@link module:widget/utils~findOptimalInsertionRange} logic will be applied for the block images
	 * and `model.document.selection` for the inline images.
	 *
	 * **Note**: If `selectable` is passed, this helper will not be able to set selection attributes (such as `linkHref`)
	 * and apply them to the new image. In this case, make sure all selection attributes are passed in `attributes`.
	 *
	 * @param imageType Image type of inserted image. If not specified,
	 * it will be determined automatically depending of editor config or place of the insertion.
	 * @param options.setImageSizes Specifies whether the image `width` and `height` attributes should be set automatically.
	 * The default is `true`.
	 * @return The inserted model image element.
	 */
	public insertImage(
		attributes: Record<string, unknown> = {},
		selectable: Selection | Position | null = null,
		imageType: ( 'imageBlock' | 'imageInline' | null ) = null,
		options: { setImageSizes?: boolean } = {}
	): Element | null {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		const determinedImageType = determineImageTypeForInsertion( editor, selectable || selection, imageType );

		// Mix declarative attributes with selection attributes because the new image should "inherit"
		// the latter for best UX. For instance, inline images inserted into existing links
		// should not split them. To do that, they need to have "linkHref" inherited from the selection.
		attributes = {
			...Object.fromEntries( selection.getAttributes() ),
			...attributes
		};

		for ( const attributeName in attributes ) {
			if ( !model.schema.checkAttribute( determinedImageType, attributeName ) ) {
				delete attributes[ attributeName ];
			}
		}

		return model.change( writer => {
			const { setImageSizes = true } = options;
			const imageElement = writer.createElement( determinedImageType, attributes );

			model.insertObject( imageElement, selectable, null, {
				setSelection: 'on',
				// If we want to insert a block image (for whatever reason) then we don't want to split text blocks.
				// This applies only when we don't have the selectable specified (i.e., we insert multiple block images at once).
				findOptimalPosition: !selectable && determinedImageType != 'imageInline' ? 'auto' : undefined
			} );

			// Inserting an image might've failed due to schema regulations.
			if ( imageElement.parent ) {
				if ( setImageSizes ) {
					this.setImageNaturalSizeAttributes( imageElement );
				}

				return imageElement;
			}

			return null;
		} );
	}

	/**
	 * Reads original image sizes and sets them as `width` and `height`.
	 *
	 * The `src` attribute may not be available if the user is using an upload adapter. In such a case,
	 * this method is called again after the upload process is complete and the `src` attribute is available.
	 */
	public setImageNaturalSizeAttributes( imageElement: Element ): void {
		const src = imageElement.getAttribute( 'src' ) as string;

		if ( !src ) {
			return;
		}

		if ( imageElement.getAttribute( 'width' ) || imageElement.getAttribute( 'height' ) ) {
			return;
		}

		this.editor.model.change( writer => {
			const img = new global.window.Image();

			this._domEmitter.listenTo( img, 'load', () => {
				if ( !imageElement.getAttribute( 'width' ) && !imageElement.getAttribute( 'height' ) ) {
					// We use writer.batch to be able to undo (in a single step) width and height setting
					// along with any change that triggered this action (e.g. image resize or image style change).
					this.editor.model.enqueueChange( writer.batch, writer => {
						writer.setAttribute( 'width', img.naturalWidth, imageElement );
						writer.setAttribute( 'height', img.naturalHeight, imageElement );
					} );
				}

				this._domEmitter.stopListening( img, 'load' );
			} );

			img.src = src;
		} );
	}

	/**
	 * Returns an image widget editing view element if one is selected or is among the selection's ancestors.
	 */
	public getClosestSelectedImageWidget( selection: ViewSelection | ViewDocumentSelection ): ViewElement | null {
		const selectionPosition = selection.getFirstPosition();

		if ( !selectionPosition ) {
			return null;
		}

		const viewElement = selection.getSelectedElement();

		if ( viewElement && this.isImageWidget( viewElement ) ) {
			return viewElement;
		}

		let parent: ViewNode | ViewDocumentFragment | null = selectionPosition.parent;

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
	 */
	public getClosestSelectedImageElement( selection: Selection | DocumentSelection ): Element | null {
		const selectedElement = selection.getSelectedElement();

		return this.isImage( selectedElement ) ? selectedElement : selection.getFirstPosition()!.findAncestor( 'imageBlock' );
	}

	/**
	 * Returns an image widget editing view based on the passed image view.
	 */
	public getImageWidgetFromImageView( imageView: ViewElement ): ViewContainerElement | null {
		return imageView.findAncestor( { classes: IMAGE_WIDGETS_CLASSES_MATCH_REGEXP } ) as ( ViewContainerElement | null );
	}

	/**
	 * Checks if image can be inserted at current model selection.
	 *
	 * @internal
	 */
	public isImageAllowed(): boolean {
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
	 * @param writer An instance of the view writer.
	 * @param label The element's label. It will be concatenated with the image `alt` attribute if one is present.
	 */
	public toImageWidget( viewElement: ViewElement, writer: DowncastWriter, label: string ): ViewElement {
		writer.setCustomProperty( 'image', true, viewElement );

		const labelCreator = () => {
			const imgElement = this.findViewImgElement( viewElement )!;
			const altText = imgElement.getAttribute( 'alt' );

			return altText ? `${ altText } ${ label }` : label;
		};

		return toWidget( viewElement, writer, { label: labelCreator } );
	}

	/**
	 * Checks if a given view element is an image widget.
	 */
	protected isImageWidget( viewElement: ViewElement ): boolean {
		return !!viewElement.getCustomProperty( 'image' ) && isWidget( viewElement );
	}

	/**
	 * Checks if the provided model element is an `image`.
	 */
	public isBlockImage( modelElement?: Element | null ): boolean {
		return !!modelElement && modelElement.is( 'element', 'imageBlock' );
	}

	/**
	 * Checks if the provided model element is an `imageInline`.
	 */
	public isInlineImage( modelElement?: Element | null ): boolean {
		return !!modelElement && modelElement.is( 'element', 'imageInline' );
	}

	/**
	 * Get the view `<img>` from another view element, e.g. a widget (`<figure class="image">`), a link (`<a>`).
	 *
	 * The `<img>` can be located deep in other elements, so this helper performs a deep tree search.
	 */
	public findViewImgElement( figureView: ViewElement ): ViewElement | undefined {
		if ( this.isInlineImageView( figureView ) ) {
			return figureView;
		}

		const editingView = this.editor.editing.view;

		for ( const { item } of editingView.createRangeIn( figureView ) ) {
			if ( this.isInlineImageView( item as ViewElement ) ) {
				return item as ViewElement;
			}
		}
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._domEmitter.stopListening();

		return super.destroy();
	}
}

/**
 * Checks if image is allowed by schema in optimal insertion parent.
 */
function isImageAllowedInParent( editor: Editor, selection: Selection | DocumentSelection ): boolean {
	const imageType = determineImageTypeForInsertion( editor, selection, null );

	if ( imageType == 'imageBlock' ) {
		const parent = getInsertImageParent( selection, editor.model );

		if ( editor.model.schema.checkChild( parent as Element, 'imageBlock' ) ) {
			return true;
		}
	} else if ( editor.model.schema.checkChild( selection.focus!, 'imageInline' ) ) {
		return true;
	}

	return false;
}

/**
 * Checks if selection is not placed inside an image (e.g. its caption).
 */
function isNotInsideImage( selection: DocumentSelection ): boolean {
	return [ ...selection.focus!.getAncestors() ].every( ancestor => !ancestor.is( 'element', 'imageBlock' ) );
}

/**
 * Returns a node that will be used to insert image with `model.insertContent`.
 */
function getInsertImageParent( selection: Selection | DocumentSelection, model: Model ): Element | DocumentFragment {
	const insertionRange = findOptimalInsertionRange( selection, model );
	const parent = insertionRange.start.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent!;
	}

	return parent;
}

/**
 * Determine image element type name depending on editor config or place of insertion.
 *
 * @param imageType Image element type name. Used to force return of provided element name,
 * but only if there is proper plugin enabled.
 */
function determineImageTypeForInsertion(
	editor: Editor,
	selectable: Position | Selection | DocumentSelection,
	imageType: 'imageBlock' | 'imageInline' | null
): 'imageBlock' | 'imageInline' {
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

	if ( configImageInsertType !== 'auto' ) {
		return 'imageBlock';
	}

	// Try to replace the selected widget (e.g. another image).
	if ( selectable.is( 'selection' ) ) {
		return determineImageTypeForInsertionAtSelection( schema, selectable );
	}

	return schema.checkChild( selectable, 'imageInline' ) ? 'imageInline' : 'imageBlock';
}
