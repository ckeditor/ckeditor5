/**
 * The insert an image via URL view controller class.
 *
 * See {@link module:image/imageinsert/ui/imageinsertpanelview~ImageInsertPanelView}.
 *
 * @extends module:ui/view~View
 */
export default class ImageInsertPanelView {
    /**
     * Creates a view for the dropdown panel of {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
     *
     * @param {module:utils/locale~Locale} [locale] The localization services instance.
     * @param {Object} [integrations] An integrations object that contains
     * components (or tokens for components) to be shown in the panel view.
     */
    constructor(locale?: any, integrations?: Object | undefined);
    /**
     * The "insert/update" button view.
     *
     * @member {module:ui/button/buttonview~ButtonView}
     */
    insertButtonView: any;
    /**
     * The "cancel" button view.
     *
     * @member {module:ui/button/buttonview~ButtonView}
     */
    cancelButtonView: any;
    /**
     * The dropdown view.
     *
     * @member {module:ui/dropdown/dropdownview~DropdownView}
     */
    dropdownView: any;
    /**
     * Tracks information about DOM focus in the form.
     *
     * @readonly
     * @member {module:utils/focustracker~FocusTracker}
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     *
     * @readonly
     * @member {module:utils/keystrokehandler~KeystrokeHandler}
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A collection of views that can be focused in the form.
     *
     * @readonly
     * @protected
     * @member {module:ui/viewcollection~ViewCollection}
     */
    protected readonly _focusables: ViewCollection<View<HTMLElement>>;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     *
     * @readonly
     * @protected
     * @member {module:ui/focuscycler~FocusCycler}
     */
    protected readonly _focusCycler: FocusCycler;
    imageURLInputValue: any;
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Returns a view of the integration.
     *
     * @param {String} name The name of the integration.
     * @returns {module:ui/view~View}
     */
    getIntegration(name: string): any;
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
     * Creates the following form controls:
     *
     * * {@link #insertButtonView},
     * * {@link #cancelButtonView}.
     *
     * @param {module:utils/locale~Locale} locale The localization services instance.
     *
     * @private
     * @returns {Object.<String,module:ui/view~View>}
     */
    private _createActionButtons;
    /**
     * Focuses the first {@link #_focusables focusable} in the form.
     */
    focus(): void;
}
import { FocusTracker } from "@ckeditor/ckeditor5-utils";
import { KeystrokeHandler } from "@ckeditor/ckeditor5-utils";
import { View } from "@ckeditor/ckeditor5-ui";
import { ViewCollection } from "@ckeditor/ckeditor5-ui";
import { FocusCycler } from "@ckeditor/ckeditor5-ui";
