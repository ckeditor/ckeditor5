/**
 * The image text alternative UI plugin.
 *
 * The plugin uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageTextAlternativeUI {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ContextualBalloon)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
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
     *
     * @private
     */
    private _createButton;
    /**
     * Creates the {@link module:image/imagetextalternative/ui/textalternativeformview~TextAlternativeFormView}
     * form.
     *
     * @private
     */
    private _createForm;
    /**
     * The contextual balloon plugin instance.
     *
     * @private
     * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
     */
    private _balloon;
    /**
     * A form containing a textarea and buttons, used to change the `alt` text value.
     *
     * @member {module:image/imagetextalternative/ui/textalternativeformview~TextAlternativeFormView}
     */
    _form: TextAlternativeFormView | undefined;
    /**
     * Shows the {@link #_form} in the {@link #_balloon}.
     *
     * @private
     */
    private _showForm;
    /**
     * Removes the {@link #_form} from the {@link #_balloon}.
     *
     * @param {Boolean} [focusEditable=false] Controls whether the editing view is focused afterwards.
     * @private
     */
    private _hideForm;
    /**
     * Returns `true` when the {@link #_form} is the visible view in the {@link #_balloon}.
     *
     * @private
     * @type {Boolean}
     */
    private get _isVisible();
    /**
     * Returns `true` when the {@link #_form} is in the {@link #_balloon}.
     *
     * @private
     * @type {Boolean}
     */
    private get _isInBalloon();
}
import TextAlternativeFormView from "./ui/textalternativeformview";
import { ContextualBalloon } from "@ckeditor/ckeditor5-ui";
