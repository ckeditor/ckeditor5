/**
 * The TextAlternativeFormView class.
 *
 * @extends module:ui/view~View
 */
export default class TextAlternativeFormView {
    /**
     * @inheritDoc
     */
    constructor(locale: any);
    /**
     * Tracks information about the DOM focus in the form.
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
     * An input with a label.
     *
     * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView} #labeledInput
     */
    labeledInput: any;
    /**
     * A button used to submit the form.
     *
     * @member {module:ui/button/buttonview~ButtonView} #saveButtonView
     */
    saveButtonView: any;
    /**
     * A button used to cancel the form.
     *
     * @member {module:ui/button/buttonview~ButtonView} #cancelButtonView
     */
    cancelButtonView: any;
    /**
     * A collection of views which can be focused in the form.
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
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Creates the button view.
     *
     * @private
     * @param {String} label The button label
     * @param {String} icon The button's icon.
     * @param {String} className The additional button CSS class name.
     * @param {String} [eventName] The event name that the ButtonView#execute event will be delegated to.
     * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
     */
    private _createButton;
    /**
     * Creates an input with a label.
     *
     * @private
     * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} Labeled field view instance.
     */
    private _createLabeledInputView;
}
import { FocusTracker } from "@ckeditor/ckeditor5-utils";
import { KeystrokeHandler } from "@ckeditor/ckeditor5-utils";
import { View } from "@ckeditor/ckeditor5-ui";
import { ViewCollection } from "@ckeditor/ckeditor5-ui";
import { FocusCycler } from "@ckeditor/ckeditor5-ui";
