/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontfamily
 */

import type { MatcherPattern, ViewElementDefinition } from 'ckeditor5/src/engine';
import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
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
	public static get requires(): PluginDependencies {
		return [ FontFamilyEditing, FontFamilyUI ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'FontFamily' {
		return 'FontFamily';
	}
}

 declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ FontFamily.pluginName ]: FontFamily;
	}
}
