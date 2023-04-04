/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imagestyle
 */
import { Plugin } from 'ckeditor5/src/core';
import ImageStyleEditing from './imagestyle/imagestyleediting';
import ImageStyleUI from './imagestyle/imagestyleui';
/**
 * The image style plugin.
 *
 * For a detailed overview of the image styles feature, check the {@glink features/images/images-styles documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 * * {@link module:image/imagestyle/imagestyleediting~ImageStyleEditing},
 * * {@link module:image/imagestyle/imagestyleui~ImageStyleUI}
 *
 * It provides a default configuration, which can be extended or overwritten.
 * Read more about the {@link module:image/imageconfig~ImageConfig#styles image styles configuration}.
 */
export default class ImageStyle extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageStyleEditing, typeof ImageStyleUI];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageStyle';
}
