/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module link/ui/linkformview
 */
import { ButtonView, LabeledFieldView, View, ViewCollection, type InputTextView } from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils';
import type LinkCommand from '../linkcommand';
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/linkform.css';
/**
 * The link form view controller class.
 *
 * See {@link module:link/ui/linkformview~LinkFormView}.
 */
export default class LinkFormView extends View {
    /**
     * Tracks information about DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * The URL input view.
     */
    urlInputView: LabeledFieldView<InputTextView>;
    /**
     * The Save button view.
     */
    saveButtonView: ButtonView;
    /**
     * The Cancel button view.
     */
    cancelButtonView: ButtonView;
    /**
     * A collection of {@link module:ui/button/switchbuttonview~SwitchButtonView},
     * which corresponds to {@link module:link/linkcommand~LinkCommand#manualDecorators manual decorators}
     * configured in the editor.
     */
    private readonly _manualDecoratorSwitches;
    /**
     * A collection of child views in the form.
     */
    readonly children: ViewCollection;
    /**
     * A collection of views that can be focused in the form.
     */
    private readonly _focusables;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    private readonly _focusCycler;
    /**
     * Creates an instance of the {@link module:link/ui/linkformview~LinkFormView} class.
     *
     * Also see {@link #render}.
     *
     * @param locale The localization services instance.
     * @param linkCommand Reference to {@link module:link/linkcommand~LinkCommand}.
     */
    constructor(locale: Locale, linkCommand: LinkCommand);
    /**
     * Obtains the state of the {@link module:ui/button/switchbuttonview~SwitchButtonView switch buttons} representing
     * {@link module:link/linkcommand~LinkCommand#manualDecorators manual link decorators}
     * in the {@link module:link/ui/linkformview~LinkFormView}.
     *
     * @returns Key-value pairs, where the key is the name of the decorator and the value is its state.
     */
    getDecoratorSwitchesState(): Record<string, boolean>;
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the fist {@link #_focusables} in the form.
     */
    focus(): void;
    /**
     * Creates a labeled input view.
     *
     * @returns Labeled field view instance.
     */
    private _createUrlInput;
    /**
     * Creates a button view.
     *
     * @param label The button label.
     * @param icon The button icon.
     * @param className The additional button CSS class name.
     * @param eventName An event name that the `ButtonView#execute` event will be delegated to.
     * @returns The button view instance.
     */
    private _createButton;
    /**
     * Populates {@link module:ui/viewcollection~ViewCollection} of {@link module:ui/button/switchbuttonview~SwitchButtonView}
     * made based on {@link module:link/linkcommand~LinkCommand#manualDecorators}.
     *
     * @param linkCommand A reference to the link command.
     * @returns ViewCollection of switch buttons.
     */
    private _createManualDecoratorSwitches;
    /**
     * Populates the {@link #children} collection of the form.
     *
     * If {@link module:link/linkcommand~LinkCommand#manualDecorators manual decorators} are configured in the editor, it creates an
     * additional `View` wrapping all {@link #_manualDecoratorSwitches} switch buttons corresponding
     * to these decorators.
     *
     * @param manualDecorators A reference to
     * the collection of manual decorators stored in the link command.
     * @returns The children of link form view.
     */
    private _createFormChildren;
}
/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * for example with a click on {@link ~LinkFormView#saveButtonView}.
 *
 * @eventName ~LinkFormView#submit
 */
export type SubmitEvent = {
    name: 'submit';
    args: [];
};
/**
 * Fired when the form view is canceled, for example with a click on {@link ~LinkFormView#cancelButtonView}.
 *
 * @eventName ~LinkFormView#cancel
 */
export type CancelEvent = {
    name: 'cancel';
    args: [];
};
