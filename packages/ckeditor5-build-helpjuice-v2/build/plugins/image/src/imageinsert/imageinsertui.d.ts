/**
 * The image insert dropdown plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature}
 * and {@glink features/images/image-upload/images-inserting#inserting-images-via-source-url Insert images via source URL} documentation.
 *
 * Adds the `'insertImage'` dropdown to the {@link module:ui/componentfactory~ComponentFactory UI component factory}
 * and also the `imageInsert` dropdown as an alias for backward compatibility.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageInsertUI {
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates the dropdown view.
     *
     * @param {module:utils/locale~Locale} locale The localization services instance.
     *
     * @private
     * @returns {module:ui/dropdown/dropdownview~DropdownView}
     */
    private _createDropdownView;
    /**
     * Sets up the dropdown view.
     *
     * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView A dropdownView.
     * @param {module:image/imageinsert/ui/imageinsertpanelview~ImageInsertPanelView} imageInsertView An imageInsertView.
     * @param {module:core/command~Command} command An insertImage command
     *
     * @private
     * @returns {module:ui/dropdown/dropdownview~DropdownView}
     */
    private _setUpDropdown;
}
