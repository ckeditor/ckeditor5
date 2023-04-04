/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imagestyle/imagestylecommand
 */
import type { Element } from 'ckeditor5/src/engine';
import { Command, type Editor } from 'ckeditor5/src/core';
import type { ImageStyleOptionDefinition } from '../imageconfig';
/**
 * The image style command. It is used to apply {@link module:image/imageconfig~ImageStyleConfig#options image style option}
 * to a selected image.
 *
 * **Note**: Executing this command may change the image model element if the desired style requires an image of a different
 * type. See {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute} to learn more.
 */
export default class ImageStyleCommand extends Command {
    /**
     * An object containing names of default style options for the inline and block images.
     * If there is no default style option for the given image type in the configuration,
     * the name will be `false`.
     */
    private _defaultStyles;
    /**
     * The styles handled by this command.
     */
    private _styles;
    /**
     * Creates an instance of the image style command. When executed, the command applies one of
     * {@link module:image/imageconfig~ImageStyleConfig#options style options} to the currently selected image.
     *
     * @param editor The editor instance.
     * @param styles The style options that this command supports.
     */
    constructor(editor: Editor, styles: Array<ImageStyleOptionDefinition>);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command and applies the style to the currently selected image:
     *
     * ```ts
     * editor.execute( 'imageStyle', { value: 'side' } );
     * ```
     *
     * **Note**: Executing this command may change the image model element if the desired style requires an image
     * of a different type. Learn more about {@link module:image/imageconfig~ImageStyleOptionDefinition#modelElements model element}
     * configuration for the style option.
     *
     * @param options.value The name of the style (as configured in {@link module:image/imageconfig~ImageStyleConfig#options}).
     * @fires execute
     */
    execute(options?: {
        value?: string;
    }): void;
    /**
     * Returns `true` if requested style change would trigger the image type change.
     *
     * @param requestedStyle The name of the style (as configured in {@link module:image/imageconfig~ImageStyleConfig#options}).
     * @param imageElement The image model element.
     */
    shouldConvertImageType(requestedStyle: string, imageElement: Element): boolean;
}
