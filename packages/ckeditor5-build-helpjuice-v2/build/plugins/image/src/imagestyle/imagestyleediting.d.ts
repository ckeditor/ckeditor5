/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imagestyle/imagestyleediting
 */
import { Plugin } from 'ckeditor5/src/core';
import ImageUtils from '../imageutils';
/**
 * The image style engine plugin. It sets the default configuration, creates converters and registers
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand ImageStyleCommand}.
 */
export default class ImageStyleEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageStyleEditing';
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageUtils];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Sets the editor conversion taking the presence of
     * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`}
     * and {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugins into consideration.
     */
    private _setupConversion;
    /**
     * Registers a post-fixer that will make sure that the style attribute value is correct for a specific image type (block vs inline).
     */
    private _setupPostFixer;
}
