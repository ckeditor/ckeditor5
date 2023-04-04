/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imagecaption/imagecaptionui
 */
import { Plugin } from 'ckeditor5/src/core';
import ImageCaptionUtils from './imagecaptionutils';
/**
 * The image caption UI plugin. It introduces the `'toggleImageCaption'` UI button.
 */
export default class ImageCaptionUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageCaptionUtils];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageCaptionUI';
    /**
     * @inheritDoc
     */
    init(): void;
}
