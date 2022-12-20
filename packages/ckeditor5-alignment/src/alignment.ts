/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module alignment/alignment
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';

import AlignmentEditing from './alignmentediting';
import AlignmentUI from './alignmentui';

/**
 * The text alignment plugin.
 *
 * For a detailed overview, check the {@glink features/text-alignment Text alignment feature documentation}
 * and the {@glink api/alignment package page}.
 *
 * This is a "glue" plugin which loads the {@link module:alignment/alignmentediting~AlignmentEditing} and
 * {@link module:alignment/alignmentui~AlignmentUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Alignment extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ AlignmentEditing, AlignmentUI ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Alignment' {
		return 'Alignment';
	}
}

/**
 * The configuration of the {@link module:alignment/alignment~Alignment alignment feature}.
 *
 * Read more in {@link module:alignment/alignment~AlignmentConfig}.
 */

/**
 * The configuration of the {@link module:alignment/alignment~Alignment alignment feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				alignment: {
 *					options: [ 'left', 'right' ]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 *
 * @interface AlignmentConfig
 */
export type AlignmentConfig = Array< string | AlignmentFormat >;

/**
 * Available alignment options.
 *
 * The available options are: `'left'`, `'right'`, `'center'` and `'justify'`. Other values are ignored.
 *
 * **Note:** It is recommended to always use `'left'` or `'right'` as these are default values which the user should
 * normally be able to choose depending on the
 * {@glink features/ui-language#setting-the-language-of-the-content language of the editor content}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				alignment: {
 *					options: [ 'left', 'right' ]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * By default the alignment is set inline using the `text-align` CSS property. To further customize the alignment,
 * you can provide names of classes for each alignment option using the `className` property.
 *
 * **Note:** Once you define the `className` property for one option, you need to specify it for all other options.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				alignment: {
 *					options: [
 *						{ name: 'left', className: 'my-align-left' },
 *						{ name: 'right', className: 'my-align-right' }
 *					]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See the demo of {@glink features/text-alignment#configuring-alignment-options custom alignment options}.
 */
export type AlignmentFormat = {
	name: SupportedOptions;
	className?: string;
};

export type SupportedOptions = 'left' | 'right' | 'center' | 'justify';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Alignment.pluginName ]: Alignment;
	}
}
