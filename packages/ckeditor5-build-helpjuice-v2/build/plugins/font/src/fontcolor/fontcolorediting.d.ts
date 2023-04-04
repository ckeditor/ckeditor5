/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module font/fontcolor/fontcolorediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core';
/**
 * The font color editing feature.
 *
 * It introduces the {@link module:font/fontcolor/fontcolorcommand~FontColorCommand command} and
 * the `fontColor` attribute in the {@link module:engine/model/model~Model model} which renders
 * in the {@link module:engine/view/view view} as a `<span>` element (`<span style="color: ...">`),
 * depending on the {@link module:font/fontconfig~FontColorConfig configuration}.
 */
export default class FontColorEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): 'FontColorEditing';
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
}
