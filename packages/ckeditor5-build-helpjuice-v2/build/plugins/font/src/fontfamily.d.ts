/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module font/fontfamily
 */
import { Plugin } from 'ckeditor5/src/core';
import FontFamilyEditing from './fontfamily/fontfamilyediting';
import FontFamilyUI from './fontfamily/fontfamilyui';
/**
 * The font family plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentatiom
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} and
 * {@link module:font/fontfamily/fontfamilyui~FontFamilyUI} features in the editor.
 */
export default class FontFamily extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof FontFamilyEditing, typeof FontFamilyUI];
    /**
     * @inheritDoc
     */
    static get pluginName(): 'FontFamily';
}
