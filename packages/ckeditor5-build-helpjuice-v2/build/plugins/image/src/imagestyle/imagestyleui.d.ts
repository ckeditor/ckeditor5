/**
 * The image style UI plugin.
 *
 * It registers buttons corresponding to the {@link module:image/image~ImageConfig#styles} configuration.
 * It also registers the {@link module:image/imagestyle/utils~DEFAULT_DROPDOWN_DEFINITIONS default drop-downs} and the
 * custom drop-downs defined by the developer in the {@link module:image/image~ImageConfig#toolbar} configuration.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageStyleUI {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageStyleEditing)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * Returns the default localized style titles provided by the plugin.
     *
     * The following localized titles corresponding with
     * {@link module:image/imagestyle/utils~DEFAULT_OPTIONS} are available:
     *
     * * `'Wrap text'`,
     * * `'Break text'`,
     * * `'In line'`,
     * * `'Full size image'`,
     * * `'Side image'`,
     * * `'Left aligned image'`,
     * * `'Centered image'`,
     * * `'Right aligned image'`
     *
     * @returns {Object.<String,String>}
     */
    get localizedDefaultStylesTitles(): any;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a dropdown and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
     *
     * @private
     * @param {module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition} dropdownConfig
     * @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition>} definedStyles
     */
    private _createDropdown;
    /**
     * Creates a button and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
     *
     * @private
     * @param {module:image/imagestyle~ImageStyleOptionDefinition} buttonConfig
     */
    private _createButton;
    _executeCommand(name: any): void;
}
/**
 * :image/imagestyle/imagestyleui~ImageStyleDropdownDefinition
 */
export type module = Object;
import ImageStyleEditing from "./imagestyleediting";
