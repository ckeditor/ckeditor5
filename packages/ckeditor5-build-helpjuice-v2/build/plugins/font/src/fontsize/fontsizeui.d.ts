/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module font/fontsize/fontsizeui
 */
import { Plugin } from 'ckeditor5/src/core';
import '../../theme/fontsize.css';
/**
 * The font size UI plugin. It introduces the `'fontSize'` dropdown.
 */
export default class FontSizeUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): 'FontSizeUI';
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Returns options as defined in `config.fontSize.options` but processed to account for
     * editor localization, i.e. to display {@link module:font/fontconfig~FontSizeOption}
     * in the correct language.
     *
     * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
     * when the user configuration is defined because the editor does not exist yet.
     */
    private _getLocalizedOptions;
}
