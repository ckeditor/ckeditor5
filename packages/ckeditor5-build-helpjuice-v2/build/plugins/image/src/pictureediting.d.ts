/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/pictureediting
 */
import { Plugin } from 'ckeditor5/src/core';
import ImageEditing from './image/imageediting';
import ImageUtils from './imageutils';
/**
 * This plugin enables the [`<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture) element support in the editor.
 *
 * * It enables the `sources` model attribute on `imageBlock` and `imageInline` model elements
 * (brought by {@link module:image/imageblock~ImageBlock} and {@link module:image/imageinline~ImageInline}, respectively).
 * * It translates the `sources` model element to the view (also: data) structure that may look as follows:
 *
 * ```html
 * <p>Inline image using picture:
 * 	<picture>
 * 		<source media="(min-width: 800px)" srcset="image-large.webp" type="image/webp">
 * 		<source media="(max-width: 800px)" srcset="image-small.webp" type="image/webp">
 * 		<!-- Other sources as specified in the "sources" model attribute... -->
 * 		<img src="image.png" alt="An image using picture" />
 * 	</picture>
 * </p>
 *
 * <p>Block image using picture:</p>
 * <figure class="image">
 * 	<picture>
 * 		<source media="(min-width: 800px)" srcset="image-large.webp" type="image/webp">
 * 		<source media="(max-width: 800px)" srcset="image-small.webp" type="image/webp">
 * 		<!-- Other sources as specified in the "sources" model attribute... -->
 * 		<img src="image.png" alt="An image using picture" />
 * 	</picture>
 * 	<figcaption>Caption of the image</figcaption>
 * </figure>
 * ```
 *
 * **Note:** The value of the `sources` {@glink framework/architecture/editing-engine#changing-the-model model attribute}
 * in both examples equals:
 *
 * ```css
 * [
 * 	{
 * 		media: '(min-width: 800px)',
 * 		srcset: 'image-large.webp',
 * 		type: 'image/webp'
 * 	},
 * 	{
 * 		media: '(max-width: 800px)',
 * 		srcset: 'image-small.webp',
 * 		type: 'image/webp'
 * 	}
 * ]
 * ```
 *
 * * It integrates with the {@link module:image/imageupload~ImageUpload} plugin so images uploaded in the editor
 * automatically render using `<picture>` if the {@glink features/images/image-upload/image-upload upload adapter}
 * supports image sources and provides neccessary data.
 *
 * @private
 */
export default class PictureEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageEditing, typeof ImageUtils];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'PictureEditing';
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Configures conversion pipelines to support upcasting and downcasting images using the `<picture>` view element
     * and the model `sources` attribute.
     */
    private _setupConversion;
    /**
     * Makes it possible for uploaded images to get the `sources` model attribute and the `<picture>...</picture>`
     * view structure out-of-the-box if relevant data is provided along the
     * {@link module:image/imageupload/imageuploadediting~ImageUploadEditing#event:uploadComplete} event.
     */
    private _setupImageUploadEditingIntegration;
}
