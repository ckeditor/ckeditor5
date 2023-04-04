/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imagecaption/imagecaptionutils
 */
import type { DocumentSelection, Element, Selection, ViewElement, Match } from 'ckeditor5/src/engine';
import { Plugin } from 'ckeditor5/src/core';
import ImageUtils from '../imageutils';
/**
 * The image caption utilities plugin.
 */
export default class ImageCaptionUtils extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageCaptionUtils';
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageUtils];
    /**
     * Returns the caption model element from a given image element. Returns `null` if no caption is found.
     */
    getCaptionFromImageModelElement(imageModelElement: Element): Element | null;
    /**
     * Returns the caption model element for a model selection. Returns `null` if the selection has no caption element ancestor.
     */
    getCaptionFromModelSelection(selection: Selection | DocumentSelection): Element | null;
    /**
     * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a `<figcaption>` element that is placed
     * inside the image `<figure>` element.
     * @returns Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
     * cannot be matched.
     */
    matchImageCaptionViewElement(element: ViewElement): Match | null;
}
