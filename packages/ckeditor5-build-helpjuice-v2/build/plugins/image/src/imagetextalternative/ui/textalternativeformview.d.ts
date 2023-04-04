/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imagetextalternative/ui/textalternativeformview
 */
import { ButtonView, FocusCycler, LabeledFieldView, View, ViewCollection, type InputView } from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils';
import '../../../theme/textalternativeform.css';
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
/**
 * The TextAlternativeFormView class.
 */
export default class TextAlternativeFormView extends View {
    /**
     * Tracks information about the DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * An input with a label.
     */
    labeledInput: LabeledFieldView<InputView>;
    /**
     * A button used to submit the form.
     */
    saveButtonView: ButtonView;
    /**
     * A button used to cancel the form.
     */
    cancelButtonView: ButtonView;
    /**
     * A collection of views which can be focused in the form.
     */
    protected readonly _focusables: ViewCollection;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    protected readonly _focusCycler: FocusCycler;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale);
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
     * @param label The button label
     * @param icon The button's icon.
     * @param className The additional button CSS class name.
     * @param eventName The event name that the ButtonView#execute event will be delegated to.
     * @returns The button view instance.
     */
    private _createButton;
    /**
     * Creates an input with a label.
     *
     * @returns Labeled field view instance.
     */
    private _createLabeledInputView;
}
