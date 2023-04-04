/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/image/imageinlineediting
 */
import { Plugin } from 'ckeditor5/src/core';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard';
import ImageEditing from './imageediting';
import ImageUtils from '../imageutils';
/**
 * The image inline plugin.
 *
 * It registers:
 *
 * * `<imageInline>` as an inline element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.
 * * {@link module:image/image/imagetypecommand~ImageTypeCommand `'imageTypeInline'`} command that converts block images into
 * inline images.
 */
export default class ImageInlineEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageEditing, typeof ImageUtils, typeof ClipboardPipeline];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageInlineEditing';
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Configures conversion pipelines to support upcasting and downcasting
     * inline images (inline image widgets) and their attributes.
     */
    private _setupConversion;
    /**
     * Integrates the plugin with the clipboard pipeline.
     *
     * Idea is that the feature should recognize the user's intent when an **block** image is
     * pasted or dropped. If such an image is pasted/dropped into a non-empty block
     * (e.g. a paragraph with some text) it gets converted into an inline image on the fly.
     *
     * We assume this is the user's intent if they decided to put their image there.
     *
     * **Note**: If a block image has a caption, it will not be converted to an inline image
     * to avoid the confusion. Captions are added on purpose and they should never be lost
     * in the clipboard pipeline.
     *
     * See the `ImageBlockEditing` for the similar integration that works in the opposite direction.
     */
    private _setupClipboardIntegration;
}
