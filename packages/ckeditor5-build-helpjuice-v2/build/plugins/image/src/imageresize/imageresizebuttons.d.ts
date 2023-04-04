/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imageresize/imageresizebuttons
 */
import { Plugin, type Editor } from 'ckeditor5/src/core';
import ImageResizeEditing from './imageresizeediting';
/**
 * The image resize buttons plugin.
 *
 * It adds a possibility to resize images using the toolbar dropdown or individual buttons, depending on the plugin configuration.
 */
export default class ImageResizeButtons extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageResizeEditing];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'ImageResizeButtons';
    /**
     * The resize unit.
     * @default '%'
     */
    private readonly _resizeUnit;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * A helper function that creates a standalone button component for the plugin.
     *
     * @param resizeOption A model of the resize option.
     */
    private _registerImageResizeButton;
    /**
     * A helper function that creates a dropdown component for the plugin containing all the resize options defined in
     * the editor configuration.
     *
     * @param options An array of configured options.
     */
    private _registerImageResizeDropdown;
    /**
     * A helper function for creating an option label value string.
     *
     * @param option A resize option object.
     * @param forTooltip An optional flag for creating a tooltip label.
     * @returns A user-defined label combined from the numeric value and the resize unit or the default label
     * for reset options (`Original`).
     */
    private _getOptionLabelValue;
    /**
     * A helper function that parses the resize options and returns list item definitions ready for use in the dropdown.
     *
     * @param options The resize options.
     * @param command The resize image command.
     * @returns Dropdown item definitions.
     */
    private _getResizeDropdownListItemDefinitions;
}
