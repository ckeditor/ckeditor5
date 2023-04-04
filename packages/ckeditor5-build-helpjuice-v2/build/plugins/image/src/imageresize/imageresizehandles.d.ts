/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { Plugin } from 'ckeditor5/src/core';
import { WidgetResize } from 'ckeditor5/src/widget';
/**
 * The image resize by handles feature.
 *
 * It adds the ability to resize each image using handles or manually by
 * {@link module:image/imageresize/imageresizebuttons~ImageResizeButtons} buttons.
 */
export default class ImageResizeHandles extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof WidgetResize];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageResizeHandles';
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Attaches the listeners responsible for creating a resizer for each image, except for images inside the HTML embed preview.
     */
    private _setupResizerCreator;
}
