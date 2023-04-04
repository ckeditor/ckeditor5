/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imagecaption
 */
import { Plugin } from 'ckeditor5/src/core';
import ImageCaptionEditing from './imagecaption/imagecaptionediting';
import ImageCaptionUI from './imagecaption/imagecaptionui';
import '../theme/imagecaption.css';
/**
 * The image caption plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-captions image caption} documentation.
 */
export default class ImageCaption extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageCaptionEditing, typeof ImageCaptionUI];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageCaption';
}
