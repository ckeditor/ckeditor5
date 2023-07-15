/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module link/linkimageediting
 */
import { Plugin } from 'ckeditor5/src/core';
import LinkEditing from './linkediting';
/**
 * The link image engine feature.
 *
 * It accepts the `linkHref="url"` attribute in the model for the {@link module:image/image~Image `<imageBlock>`} element
 * which allows linking images.
 */
export default class LinkImageEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly ["ImageEditing", "ImageUtils", typeof LinkEditing];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'LinkImageEditing';
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Processes {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition automatic decorators} definitions and
     * attaches proper converters that will work when linking an image.`
     */
    private _enableAutomaticDecorators;
    /**
     * Processes transformed {@link module:link/utils/manualdecorator~ManualDecorator} instances and attaches proper converters
     * that will work when linking an image.
     */
    private _enableManualDecorators;
}
