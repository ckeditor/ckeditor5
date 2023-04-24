/**
 * The image style command. It is used to apply {@link module:image/imagestyle~ImageStyleConfig#options image style option}
 * to a selected image.
 *
 * **Note**: Executing this command may change the image model element if the desired style requires an image of a different
 * type. See {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute} to learn more.
 *
 * @extends module:core/command~Command
 */
export default class ImageStyleCommand {
    /**
     * Creates an instance of the image style command. When executed, the command applies one of
     * {@link module:image/imagestyle~ImageStyleConfig#options style options} to the currently selected image.
     *
     * @param {module:core/editor/editor~Editor} editor The editor instance.
     * @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition>} styles
     * The style options that this command supports.
     */
    constructor(editor: any, styles: any);
    /**
     * An object containing names of default style options for the inline and block images.
     * If there is no default style option for the given image type in the configuration,
     * the name will be `false`.
     *
     * @private
     * @type {Object.<String,module:image/imagestyle~ImageStyleOptionDefinition#name>}
     */
    private _defaultStyles;
    /**
     * The styles handled by this command.
     *
     * @private
     * @type {module:image/imagestyle~ImageStyleConfig#options}
     */
    private _styles;
    /**
     * @inheritDoc
     */
    refresh(): void;
    isEnabled: boolean | undefined;
    value: any;
    /**
     * Executes the command and applies the style to the currently selected image:
     *
     *		editor.execute( 'imageStyle', { value: 'side' } );
     *
     * **Note**: Executing this command may change the image model element if the desired style requires an image
     * of a different type. Learn more about {@link module:image/imagestyle~ImageStyleOptionDefinition#modelElements model element}
     * configuration for the style option.
     *
     * @param {Object} options
     * @param {module:image/imagestyle~ImageStyleOptionDefinition#name} options.value The name of the style (as configured in
     * {@link module:image/imagestyle~ImageStyleConfig#options}).
     * @fires execute
     */
    execute(options?: {
        value: any;
    }): void;
    /**
     * Returns `true` if requested style change would trigger the image type change.
     *
     * @param {module:image/imagestyle~ImageStyleOptionDefinition} requestedStyle The name of the style (as configured in
     * {@link module:image/imagestyle~ImageStyleConfig#options}).
     * @param {module:engine/model/element~Element} imageElement The image model element.
     * @returns {Boolean}
     */
    shouldConvertImageType(requestedStyle: any, imageElement: any): boolean;
}
