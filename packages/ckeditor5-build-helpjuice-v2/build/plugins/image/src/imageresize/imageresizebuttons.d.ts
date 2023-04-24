/**
 * The image resize buttons plugin.
 *
 * It adds a possibility to resize images using the toolbar dropdown or individual buttons, depending on the plugin configuration.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResizeButtons {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageResizeEditing)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    constructor(editor: any);
    /**
     * The resize unit.
     *
     * @readonly
     * @private
     * @type {module:image/image~ImageConfig#resizeUnit}
     * @default '%'
     */
    private readonly _resizeUnit;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * A helper function that creates a standalone button component for the plugin.
     *
     * @private
     * @param {module:image/imageresize/imageresizebuttons~ImageResizeOption} resizeOption A model of the resize option.
     */
    private _registerImageResizeButton;
    /**
     * A helper function that creates a dropdown component for the plugin containing all the resize options defined in
     * the editor configuration.
     *
     * @private
     * @param {Array.<module:image/imageresize/imageresizebuttons~ImageResizeOption>} options An array of configured options.
     */
    private _registerImageResizeDropdown;
    /**
     * A helper function for creating an option label value string.
     *
     * @private
     * @param {module:image/imageresize/imageresizebuttons~ImageResizeOption} option A resize option object.
     * @param {Boolean} [forTooltip] An optional flag for creating a tooltip label.
     * @returns {String} A user-defined label combined from the numeric value and the resize unit or the default label
     * for reset options (`Original`).
     */
    private _getOptionLabelValue;
    /**
     * A helper function that parses the resize options and returns list item definitions ready for use in the dropdown.
     *
     * @private
     * @param {Array.<module:image/imageresize/imageresizebuttons~ImageResizeOption>} options The resize options.
     * @param {module:image/imageresize/resizeimagecommand~ResizeImageCommand} command The resize image command.
     * @returns {Iterable.<module:ui/dropdown/utils~ListDropdownItemDefinition>} Dropdown item definitions.
     */
    private _getResizeDropdownListItemDefinitions;
}
/**
 * :image/imageresize/imageresizebuttons~ImageResizeOption
 */
export type module = {
    /**
     * The name of the UI component that changes the image size.
     * * If you configure the feature using individual resize buttons, you can refer to this name in the
     * {@link module :image/image~ImageConfig#toolbar image toolbar configuration}.
     * * If you configure the feature using the resize dropdown, this name will be used for a list item in the dropdown.
     */
    name: string;
    /**
     * The value of the resize option without the unit
     * ({@link module :image/image~ImageConfig#resizeUnit configured separately}). `null` resets an image to its original size.
     */
    value: string;
    /**
     * An icon used by an individual resize button (see the `name` property to learn more).
     * Available icons are: `'small'`, `'medium'`, `'large'`, `'original'`.
     */
    icon?: string | undefined;
    /**
     * An option label displayed in the dropdown or, if the feature is configured using
     * individual buttons, a {@link module :ui/button/buttonview~ButtonView#tooltip} and an ARIA attribute of a button.
     * If not specified, the label is generated automatically based on the `value` option and the
     * {@link module :image/image~ImageConfig#resizeUnit `config.image.resizeUnit`}.
     */
    label?: string | undefined;
};
import ImageResizeEditing from "./imageresizeediting";
