/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imagecaption/imagecaptionediting
 */
import { type Editor, Plugin } from 'ckeditor5/src/core';
import ImageUtils from '../imageutils';
import ImageCaptionUtils from './imagecaptionutils';
/**
 * The image caption engine plugin. It is responsible for:
 *
 * * registering converters for the caption element,
 * * registering converters for the caption model attribute,
 * * registering the {@link module:image/imagecaption/toggleimagecaptioncommand~ToggleImageCaptionCommand `toggleImageCaption`} command.
 */
export default class ImageCaptionEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageUtils, typeof ImageCaptionUtils];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageCaptionEditing';
    /**
     * A map that keeps saved JSONified image captions and image model elements they are
     * associated with.
     *
     * To learn more about this system, see {@link #_saveCaption}.
     */
    private _savedCaptionsMap;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Configures conversion pipelines to support upcasting and downcasting
     * image captions.
     */
    private _setupConversion;
    /**
     * Integrates with {@link module:image/image/imagetypecommand~ImageTypeCommand image type commands}
     * to make sure the caption is preserved when the type of an image changes so it can be restored
     * in the future if the user decides they want their caption back.
     */
    private _setupImageTypeCommandsIntegration;
    /**
     * Reconverts image caption when image alt attribute changes.
     * The change of alt attribute is reflected in caption's aria-label attribute.
     */
    private _registerCaptionReconversion;
}
