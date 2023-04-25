export function createRegExp(marker: any, minimumCharacters: any): RegExp;
/**
 * The mention UI feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MentionUI {
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ContextualBalloon)[];
    /**
     * @inheritDoc
     */
    constructor(editor: any);
    /**
     * The mention view.
     *
     * @type {module:mention/ui/mentionsview~MentionsView}
     * @private
     */
    private _mentionsView;
    /**
     * Stores mention feeds configurations.
     *
     * @type {Map<String, Object>}
     * @private
     */
    private _mentionsConfigurations;
    /**
     * Debounced feed requester. It uses `lodash#debounce` method to delay function call.
     *
     * @private
     * @param {String} marker
     * @param {String} feedText
     * @method
     */
    private _requestFeedDebounced;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * The contextual balloon plugin instance.
     *
     * @private
     * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
     */
    private _balloon;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Returns true when {@link #_mentionsView} is in the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon} and it is
     * currently visible.
     *
     * @readonly
     * @protected
     * @type {Boolean}
     */
    protected readonly get _isUIVisible(): boolean;
    /**
     * Creates the {@link #_mentionsView}.
     *
     * @private
     * @returns {module:mention/ui/mentionsview~MentionsView}
     */
    private _createMentionView;
    _items: Collection<Record<string, any>> | undefined;
    /**
     * Returns item renderer for the marker.
     *
     * @private
     * @param {String} marker
     * @returns {Function|null}
     */
    private _getItemRenderer;
    /**
     * Requests a feed from a configured callbacks.
     *
     * @private
     * @fires module:mention/mentionui~MentionUI#event:requestFeed:response
     * @fires module:mention/mentionui~MentionUI#event:requestFeed:discarded
     * @fires module:mention/mentionui~MentionUI#event:requestFeed:error
     * @param {String} marker
     * @param {String} feedText
     */
    private _requestFeed;
    _lastRequested: string | undefined;
    /**
     * Registers a text watcher for the marker.
     *
     * @private
     * @param {Array.<Object>} feeds Feeds of mention plugin configured in editor
     * @returns {module:typing/textwatcher~TextWatcher}
     */
    private _setupTextWatcher;
    /**
     * Handles the feed response event data.
     *
     * @param data
     * @private
     */
    private _handleFeedResponse;
    /**
     * Shows the mentions balloon. If the panel is already visible, it will reposition it.
     *
     * @private
     */
    private _showOrUpdateUI;
    /**
     * Hides the mentions balloon and removes the 'mention' marker from the markers collection.
     *
     * @private
     */
    private _hideUIAndRemoveMarker;
    /**
     * Renders a single item in the autocomplete list.
     *
     * @private
     * @param {module:mention/mention~MentionFeedItem} item
     * @param {String} marker
     * @returns {module:ui/button/buttonview~ButtonView|module:mention/ui/domwrapperview~DomWrapperView}
     */
    private _renderItem;
    /**
     * Creates a position options object used to position the balloon panel.
     *
     * @param {module:engine/model/markercollection~Marker} mentionMarker
     * @param {String|undefined} preferredPosition The name of the last matched position name.
     * @returns {module:utils/dom/position~Options}
     * @private
     */
    private _getBalloonPanelPositionData;
}
import { Collection } from "@ckeditor/ckeditor5-utils";
import { ContextualBalloon } from "@ckeditor/ckeditor5-ui";
