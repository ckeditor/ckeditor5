/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module link/autolink
 */
import { Plugin } from 'ckeditor5/src/core';
import { Delete } from 'ckeditor5/src/typing';
/**
 * The autolink plugin.
 */
export default class AutoLink extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof Delete];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'AutoLink';
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Enables autolinking on typing.
     */
    private _enableTypingHandling;
    /**
     * Enables autolinking on the <kbd>Enter</kbd> key.
     */
    private _enableEnterHandling;
    /**
     * Enables autolinking on the <kbd>Shift</kbd>+<kbd>Enter</kbd> keyboard shortcut.
     */
    private _enableShiftEnterHandling;
    /**
     * Checks if the passed range contains a linkable text.
     */
    private _checkAndApplyAutoLinkOnRange;
    /**
     * Applies a link on a given range if the link should be applied.
     *
     * @param url The URL to link.
     * @param range The text range to apply the link attribute to.
     */
    private _applyAutoLink;
    /**
     * Enqueues autolink changes in the model.
     *
     * @param url The URL to link.
     * @param range The text range to apply the link attribute to.
     */
    private _persistAutoLink;
}
