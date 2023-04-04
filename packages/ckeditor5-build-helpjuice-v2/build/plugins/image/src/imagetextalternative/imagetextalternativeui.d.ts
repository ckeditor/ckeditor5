/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imagetextalternative/imagetextalternativeui
 */
import { Plugin } from 'ckeditor5/src/core';
import { ContextualBalloon } from 'ckeditor5/src/ui';
/**
 * The image text alternative UI plugin.
 *
 * The plugin uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 */
export default class ImageTextAlternativeUI extends Plugin {
    /**
     * The contextual balloon plugin instance.
     */
    private _balloon?;
    /**
     * A form containing a textarea and buttons, used to change the `alt` text value.
     */
    private _form?;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ContextualBalloon];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageTextAlternativeUI';
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Creates a button showing the balloon panel for changing the image text alternative and
     * registers it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
     */
    private _createButton;
    /**
     * Creates the {@link module:image/imagetextalternative/ui/textalternativeformview~TextAlternativeFormView}
     * form.
     */
    private _createForm;
    /**
     * Shows the {@link #_form} in the {@link #_balloon}.
     */
    private _showForm;
    /**
     * Removes the {@link #_form} from the {@link #_balloon}.
     *
     * @param focusEditable Controls whether the editing view is focused afterwards.
     */
    private _hideForm;
    /**
     * Returns `true` when the {@link #_form} is the visible view in the {@link #_balloon}.
     */
    private get _isVisible();
    /**
     * Returns `true` when the {@link #_form} is in the {@link #_balloon}.
     */
    private get _isInBalloon();
}
