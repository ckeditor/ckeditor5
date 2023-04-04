/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imageutils
 */
import type { Element, ViewElement, DocumentSelection, ViewDocumentSelection, Selection, ViewSelection, DowncastWriter, Position } from 'ckeditor5/src/engine';
import { Plugin } from 'ckeditor5/src/core';
/**
 * A set of helpers related to images.
 */
export default class ImageUtils extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageUtils';
    /**
     * Checks if the provided model element is an `image` or `imageInline`.
     */
    isImage(modelElement?: Element | null): modelElement is Element & {
        name: 'imageInline' | 'imageBlock';
    };
    /**
     * Checks if the provided view element represents an inline image.
     *
     * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
     */
    isInlineImageView(element?: ViewElement | null): boolean;
    /**
     * Checks if the provided view element represents a block image.
     *
     * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
     */
    isBlockImageView(element?: ViewElement | null): boolean;
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
     * @return The inserted model image element.
     */
    insertImage(attributes?: Record<string, unknown>, selectable?: Selection | Position | null, imageType?: ('imageBlock' | 'imageInline' | null)): Element | null;
    /**
     * Returns an image widget editing view element if one is selected or is among the selection's ancestors.
     */
    getClosestSelectedImageWidget(selection: ViewSelection | ViewDocumentSelection): ViewElement | null;
    /**
     * Returns a image model element if one is selected or is among the selection's ancestors.
     */
    getClosestSelectedImageElement(selection: Selection | DocumentSelection): Element | null;
    /**
     * Converts a given {@link module:engine/view/element~Element} to an image widget:
     * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the image widget
     * element.
     * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
     *
     * @param writer An instance of the view writer.
     * @param label The element's label. It will be concatenated with the image `alt` attribute if one is present.
     */
    toImageWidget(viewElement: ViewElement, writer: DowncastWriter, label: string): ViewElement;
    /**
     * Checks if a given view element is an image widget.
     */
    protected isImageWidget(viewElement: ViewElement): boolean;
    /**
     * Checks if the provided model element is an `image`.
     */
    isBlockImage(modelElement?: Element | null): boolean;
    /**
     * Checks if the provided model element is an `imageInline`.
     */
    isInlineImage(modelElement?: Element | null): boolean;
    /**
     * Get the view `<img>` from another view element, e.g. a widget (`<figure class="image">`), a link (`<a>`).
     *
     * The `<img>` can be located deep in other elements, so this helper performs a deep tree search.
     */
    findViewImgElement(figureView: ViewElement): ViewElement | undefined;
}
