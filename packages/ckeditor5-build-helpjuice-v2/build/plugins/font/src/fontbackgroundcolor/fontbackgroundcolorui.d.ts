/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module font/fontbackgroundcolor/fontbackgroundcolorui
 */
import ColorUI from '../ui/colorui';
import type { Editor } from 'ckeditor5/src/core';
/**
 * The font background color UI plugin. It introduces the `'fontBackgroundColor'` dropdown.
 */
export default class FontBackgroundColorUI extends ColorUI {
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    static get pluginName(): 'FontBackgroundColorUI';
}
