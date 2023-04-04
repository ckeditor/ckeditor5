/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imagestyle/imagestyleui
 */
import { Plugin } from 'ckeditor5/src/core';
import ImageStyleEditing from './imagestyleediting';
import '../../theme/imagestyle.css';
/**
 * The image style UI plugin.
 *
 * It registers buttons corresponding to the {@link module:image/imageconfig~ImageConfig#styles} configuration.
 * It also registers the {@link module:image/imagestyle/utils#DEFAULT_DROPDOWN_DEFINITIONS default drop-downs} and the
 * custom drop-downs defined by the developer in the {@link module:image/imageconfig~ImageConfig#toolbar} configuration.
 */
export default class ImageStyleUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageStyleEditing];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageStyleUI';
    /**
     * Returns the default localized style titles provided by the plugin.
     *
     * The following localized titles corresponding with
     * {@link module:image/imagestyle/utils#DEFAULT_OPTIONS} are available:
     *
     * * `'Wrap text'`,
     * * `'Break text'`,
     * * `'In line'`,
     * * `'Full size image'`,
     * * `'Side image'`,
     * * `'Left aligned image'`,
     * * `'Centered image'`,
     * * `'Right aligned image'`
     */
    get localizedDefaultStylesTitles(): Record<string, string>;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a dropdown and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
     */
    private _createDropdown;
    /**
     * Creates a button and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
     */
    private _createButton;
    private _executeCommand;
}
