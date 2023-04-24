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
 *		// Toggle the presence of the caption.
 *		editor.execute( 'toggleImageCaption' );
 *
 * **Note**: Upon executing this command, the selection will be set on the image if previously anchored in the caption element.
 *
 * **Note**: You can move the selection to the caption right away as it shows up upon executing this command by using
 * the `focusCaptionOnShow` option:
 *
 *		editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );
 *
 * @extends module:core/command~Command
 */
export default class ToggleImageCaptionCommand {
    /**
     * @inheritDoc
     */
    refresh(): void;
    isEnabled: any;
    value: boolean | undefined;
    /**
     * Executes the command.
     *
     *		editor.execute( 'toggleImageCaption' );
     *
     * @param {Object} [options] Options for the executed command.
     * @param {String} [options.focusCaptionOnShow] When true and the caption shows up, the selection will be moved into it straight away.
     * @fires execute
     */
    execute(options?: {
        focusCaptionOnShow?: string | undefined;
    } | undefined): void;
    /**
     * Shows the caption of the `<imageBlock>` or `<imageInline>`. Also:
     *
     * * it converts `<imageInline>` to `<imageBlock>` to show the caption,
     * * it attempts to restore the caption content from the `ImageCaptionEditing` caption registry,
     * * it moves the selection to the caption right away, it the `focusCaptionOnShow` option was set.
     *
     * @private
     * @param {module:engine/model/writer~Writer} writer
     */
    private _showImageCaption;
    /**
     * Hides the caption of a selected image (or an image caption the selection is anchored to).
     *
     * The content of the caption is stored in the `ImageCaptionEditing` caption registry to make this
     * a reversible action.
     *
     * @private
     * @param {module:engine/model/writer~Writer} writer
     */
    private _hideImageCaption;
}
