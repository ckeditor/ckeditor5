/**
 * The resize image command. Currently, it only supports the width attribute.
 *
 * @extends module:core/command~Command
 */
export default class ResizeImageCommand {
    /**
     * @inheritDoc
     */
    refresh(): void;
    isEnabled: boolean | undefined;
    value: {
        width: any;
        height: null;
    } | {
        width: string | null;
        height: null;
    } | null | undefined;
    /**
     * Executes the command.
     *
     *		// Sets the width to 50%:
     *		editor.execute( 'resizeImage', { width: '50%' } );
     *
     *		// Removes the width attribute:
     *		editor.execute( 'resizeImage', { width: null } );
     *
     * @param {Object} options
     * @param {String|null} options.width The new width of the image.
     * @fires execute
     */
    execute(options: {
        width: string | null;
    }): void;
}
