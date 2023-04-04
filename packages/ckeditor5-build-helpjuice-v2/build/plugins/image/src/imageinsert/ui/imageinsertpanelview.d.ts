/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { ButtonView, View, ViewCollection, FocusCycler } from 'ckeditor5/src/ui';
import { Collection, FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils';
import '../../../theme/imageinsert.css';
export type ViewWithName = View & {
    name: string;
};
/**
 * The insert an image via URL view controller class.
 *
 * See {@link module:image/imageinsert/ui/imageinsertpanelview~ImageInsertPanelView}.
 */
export default class ImageInsertPanelView extends View {
    /**
     * The "insert/update" button view.
     */
    insertButtonView: ButtonView;
    /**
     * The "cancel" button view.
     */
    cancelButtonView: ButtonView;
    /**
     * The value of the URL input.
     *
     * @observable
     */
    imageURLInputValue: string;
    /**
     * Tracks information about DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A collection of views that can be focused in the form.
     */
    protected readonly _focusables: ViewCollection;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    protected readonly _focusCycler: FocusCycler;
    /**
     * A collection of the defined integrations for inserting the images.
     *
     * @private
     */
    _integrations: Collection<ViewWithName>;
    /**
     * Creates a view for the dropdown panel of {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
     *
     * @param locale The localization services instance.
     * @param integrations An integrations object that contains components (or tokens for components) to be shown in the panel view.
     */
    constructor(locale: Locale, integrations?: Record<string, View>);
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
     * @param name The name of the integration.
     */
    getIntegration(name: string): View;
    /**
     * Creates the following form controls:
     *
     * * {@link #insertButtonView},
     * * {@link #cancelButtonView}.
     *
     * @param locale The localization services instance.
     */
    private _createActionButtons;
    /**
     * Focuses the first {@link #_focusables focusable} in the form.
     */
    focus(): void;
}
/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * e.g. by a click on {@link ~ImageInsertPanelView#insertButtonView}.
 *
 * @eventName ~ImageInsertPanelView#submit
 */
export type SubmitEvent = {
    name: 'submit';
    args: [];
};
/**
 * Fired when the form view is canceled, e.g. by a click on {@link ~ImageInsertPanelView#cancelButtonView}.
 *
 * @eventName ~ImageInsertPanelView#cancel
 */
export type CancelEvent = {
    name: 'cancel';
    args: [];
};
