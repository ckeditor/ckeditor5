/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imageresize
 */
import { Plugin } from 'ckeditor5/src/core';
import ImageResizeButtons from './imageresize/imageresizebuttons';
import ImageResizeEditing from './imageresize/imageresizeediting';
import ImageResizeHandles from './imageresize/imageresizehandles';
import '../theme/imageresize.css';
/**
 * The image resize plugin.
 *
 * It adds a possibility to resize each image using handles.
 */
export default class ImageResize extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageResizeEditing, typeof ImageResizeHandles, typeof ImageResizeButtons];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageResize';
}
