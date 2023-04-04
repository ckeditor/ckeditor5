/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module font/fontcolor/fontcolorui
 */
import ColorUI from '../ui/colorui';
import type { Editor } from 'ckeditor5/src/core';
/**
 * The font color UI plugin. It introduces the `'fontColor'` dropdown.
 */
export default class FontColorUI extends ColorUI {
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    static get pluginName(): 'FontColorUI';
}
