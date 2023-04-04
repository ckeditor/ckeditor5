/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { Command } from 'ckeditor5/src/core';
/**
 * The toggle image caption command.
 *
 * This command is registered by {@link module:image/imagecaption/imagecaptionediting~ImageCaptionEditing} as the
 * `'toggleImageCaption'` editor command.
 *
 * Executing this command:
 *
 * * either adds or removes the image caption of a selected image (depending on whether the caption is present or not),
 * * removes the image caption if the selection is anchored in one.
 *
 * ```ts
 * // Toggle the presence of the caption.
 * editor.execute( 'toggleImageCaption' );
 * ```
 *
 * **Note**: Upon executing this command, the selection will be set on the image if previously anchored in the caption element.
 *
 * **Note**: You can move the selection to the caption right away as it shows up upon executing this command by using
 * the `focusCaptionOnShow` option:
 *
 * ```ts
 * editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );
 * ```
 */
export default class ToggleImageCaptionCommand extends Command {
    value: boolean;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * ```ts
     * editor.execute( 'toggleImageCaption' );
     * ```
     *
     * @param options Options for the executed command.
     * @param options.focusCaptionOnShow When true and the caption shows up, the selection will be moved into it straight away.
     * @fires execute
     */
    execute(options?: {
        focusCaptionOnShow?: boolean;
    }): void;
    /**
     * Shows the caption of the `<imageBlock>` or `<imageInline>`. Also:
     *
     * * it converts `<imageInline>` to `<imageBlock>` to show the caption,
     * * it attempts to restore the caption content from the `ImageCaptionEditing` caption registry,
     * * it moves the selection to the caption right away, it the `focusCaptionOnShow` option was set.
     */
    private _showImageCaption;
    /**
     * Hides the caption of a selected image (or an image caption the selection is anchored to).
     *
     * The content of the caption is stored in the `ImageCaptionEditing` caption registry to make this
     * a reversible action.
     */
    private _hideImageCaption;
}
