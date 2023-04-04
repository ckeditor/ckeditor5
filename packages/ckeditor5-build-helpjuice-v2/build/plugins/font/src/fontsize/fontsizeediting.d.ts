/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module font/fontsize/fontsizeediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core';
/**
 * The font size editing feature.
 *
 * It introduces the {@link module:font/fontsize/fontsizecommand~FontSizeCommand command} and the `fontSize`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<span>` element with either:
 * * a style attribute (`<span style="font-size:12px">...</span>`),
 * * or a class attribute (`<span class="text-small">...</span>`)
 *
 * depending on the {@link module:font/fontconfig~FontSizeConfig configuration}.
 */
export default class FontSizeEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): 'FontSizeEditing';
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * These converters enable keeping any value found as `style="font-size: *"` as a value of an attribute on a text even
     * if it is not defined in the plugin configuration.
     *
     * @param definition Converter definition out of input data.
     */
    private _prepareAnyValueConverters;
    /**
     * Adds support for legacy `<font size="..">` formatting.
     */
    private _prepareCompatibilityConverter;
}
