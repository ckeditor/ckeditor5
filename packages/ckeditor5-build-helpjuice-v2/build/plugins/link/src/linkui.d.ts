/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module link/linkui
 */
import { Plugin } from 'ckeditor5/src/core';
import { ContextualBalloon, type ViewWithCssTransitionDisabler } from 'ckeditor5/src/ui';
import LinkFormView from './ui/linkformview';
import LinkActionsView from './ui/linkactionsview';
/**
 * The link UI plugin. It introduces the `'link'` and `'unlink'` buttons and support for the <kbd>Ctrl+K</kbd> keystroke.
 *
 * It uses the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */
export default class LinkUI extends Plugin {
    /**
     * The actions view displayed inside of the balloon.
     */
    actionsView: LinkActionsView | null;
    /**
     * The form view displayed inside the balloon.
     */
    formView: LinkFormView & ViewWithCssTransitionDisabler | null;
    /**
     * The contextual balloon plugin instance.
     */
    private _balloon;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ContextualBalloon];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'LinkUI';
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Creates views.
     */
    private _createViews;
    /**
     * Creates the {@link module:link/ui/linkactionsview~LinkActionsView} instance.
     */
    private _createActionsView;
    /**
     * Creates the {@link module:link/ui/linkformview~LinkFormView} instance.
     */
    private _createFormView;
    /**
     * Creates a toolbar Link button. Clicking this button will show
     * a {@link #_balloon} attached to the selection.
     */
    private _createToolbarLinkButton;
    /**
     * Attaches actions that control whether the balloon panel containing the
     * {@link #formView} should be displayed.
     */
    private _enableBalloonActivators;
    /**
     * Attaches actions that control whether the balloon panel containing the
     * {@link #formView} is visible or not.
     */
    private _enableUserBalloonInteractions;
    /**
     * Adds the {@link #formView} to the {@link #_balloon}.
     */
    private _addFormView;
    /**
     * Closes the form view. Decides whether the balloon should be hidden completely or if the action view should be shown. This is
     * decided upon the link command value (which has a value if the document selection is in the link).
     *
     * Additionally, if any {@link module:link/linkconfig~LinkConfig#decorators} are defined in the editor configuration, the state of
     * switch buttons responsible for manual decorator handling is restored.
     */
    private _closeFormView;
    /**
     * Removes the {@link #formView} from the {@link #_balloon}.
     */
    private _removeFormView;
    /**
     * Removes the {@link #formView} from the {@link #_balloon}.
     *
     * See {@link #_addFormView}, {@link #_addActionsView}.
     */
    private _hideUI;
    /**
     * Makes the UI react to the {@link module:ui/editorui/editorui~EditorUI#event:update} event to
     * reposition itself when the editor UI should be refreshed.
     *
     * See: {@link #_hideUI} to learn when the UI stops reacting to the `update` event.
     */
    private _startUpdatingUI;
    /**
     * Returns `true` when {@link #formView} is in the {@link #_balloon}.
     */
    private get _isFormInPanel();
    /**
     * Returns `true` when {@link #actionsView} is in the {@link #_balloon}.
     */
    private get _areActionsInPanel();
    /**
     * Returns `true` when {@link #actionsView} is in the {@link #_balloon} and it is
     * currently visible.
     */
    private get _areActionsVisible();
    /**
     * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon}.
     */
    private get _isUIInPanel();
    /**
     * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon} and it is
     * currently visible.
     */
    private get _isUIVisible();
    /**
     * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
     * to the target element or selection.
     *
     * If the selection is collapsed and inside a link element, the panel will be attached to the
     * entire link element. Otherwise, it will be attached to the selection.
     */
    private _getBalloonPositionData;
    /**
     * Returns the link {@link module:engine/view/attributeelement~AttributeElement} under
     * the {@link module:engine/view/document~Document editing view's} selection or `null`
     * if there is none.
     *
     * **Note**: For a non–collapsed selection, the link element is returned when **fully**
     * selected and the **only** element within the selection boundaries, or when
     * a linked widget is selected.
     */
    private _getSelectedLinkElement;
    /**
     * Displays a fake visual selection when the contextual balloon is displayed.
     *
     * This adds a 'link-ui' marker into the document that is rendered as a highlight on selected text fragment.
     */
    private _showFakeVisualSelection;
    /**
     * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
     */
    private _hideFakeVisualSelection;
}
