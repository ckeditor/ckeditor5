/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module mention/mentionui
 */
import { Plugin, type Editor } from 'ckeditor5/src/core';
import { ContextualBalloon } from 'ckeditor5/src/ui';
/**
 * The mention UI feature.
 */
export default class MentionUI extends Plugin {
    /**
     * The mention view.
     */
    private readonly _mentionsView;
    /**
     * Stores mention feeds configurations.
     */
    private _mentionsConfigurations;
    /**
     * The contextual balloon plugin instance.
     */
    private _balloon;
    private _items;
    private _lastRequested?;
    /**
     * Debounced feed requester. It uses `lodash#debounce` method to delay function call.
     */
    private _requestFeedDebounced;
    /**
     * @inheritDoc
     */
    static get pluginName(): 'MentionUI';
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ContextualBalloon];
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Returns true when {@link #_mentionsView} is in the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon} and it is
     * currently visible.
     */
    private get _isUIVisible();
    /**
     * Creates the {@link #_mentionsView}.
     */
    private _createMentionView;
    /**
     * Returns item renderer for the marker.
     */
    private _getItemRenderer;
    /**
     * Requests a feed from a configured callbacks.
     */
    private _requestFeed;
    /**
     * Registers a text watcher for the marker.
     */
    private _setupTextWatcher;
    /**
     * Handles the feed response event data.
     */
    private _handleFeedResponse;
    /**
     * Shows the mentions balloon. If the panel is already visible, it will reposition it.
     */
    private _showOrUpdateUI;
    /**
     * Hides the mentions balloon and removes the 'mention' marker from the markers collection.
     */
    private _hideUIAndRemoveMarker;
    /**
     * Renders a single item in the autocomplete list.
     */
    private _renderItem;
    /**
     * Creates a position options object used to position the balloon panel.
     *
     * @param mentionMarker
     * @param preferredPosition The name of the last matched position name.
     */
    private _getBalloonPanelPositionData;
}
/**
 * Creates a RegExp pattern for the marker.
 *
 * Function has to be exported to achieve 100% code coverage.
 */
export declare function createRegExp(marker: string, minimumCharacters: number): RegExp;
