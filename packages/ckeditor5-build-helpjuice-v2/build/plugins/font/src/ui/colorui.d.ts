/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module font/ui/colorui
 */
import { Plugin, type Editor } from 'ckeditor5/src/core';
import { type FONT_BACKGROUND_COLOR, type FONT_COLOR } from '../utils';
import type ColorTableView from './colortableview';
/**
 * The color UI plugin which isolates the common logic responsible for displaying dropdowns with color grids.
 *
 * It is used to create the `'fontBackgroundColor'` and `'fontColor'` dropdowns, each hosting
 * a {@link module:font/ui/colortableview~ColorTableView}.
 */
export default class ColorUI extends Plugin {
    /**
     * The name of the command which will be executed when a color tile is clicked.
     */
    commandName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;
    /**
     * The name of this component in the {@link module:ui/componentfactory~ComponentFactory}.
     * Also the configuration scope name in `editor.config`.
     */
    componentName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;
    /**
     * The SVG icon used by the dropdown.
     */
    icon: string;
    /**
     * The label used by the dropdown.
     */
    dropdownLabel: string;
    /**
     * The number of columns in the color grid.
     */
    columns: number;
    /**
     * Keeps a reference to {@link module:font/ui/colortableview~ColorTableView}.
     */
    colorTableView: ColorTableView | undefined;
    /**
     * Creates a plugin which introduces a dropdown with a pre–configured {@link module:font/ui/colortableview~ColorTableView}.
     *
     * @param config The configuration object.
     * @param config.commandName The name of the command which will be executed when a color tile is clicked.
     * @param config.componentName The name of the dropdown in the {@link module:ui/componentfactory~ComponentFactory}
     * and the configuration scope name in `editor.config`.
     * @param config.icon The SVG icon used by the dropdown.
     * @param config.dropdownLabel The label used by the dropdown.
     */
    constructor(editor: Editor, { commandName, componentName, icon, dropdownLabel }: {
        commandName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;
        componentName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;
        icon: string;
        dropdownLabel: string;
    });
    /**
    * @inheritDoc
    */
    init(): void;
}
