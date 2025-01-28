/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module alignment/alignmentconfig
 */

/**
 * The configuration of the {@link module:alignment/alignment~Alignment alignment feature}.
 *
 * ```ts
 * ClassicEditor
 *   .create( editorElement, {
 *     alignment: {
 *       options: [ 'left', 'right' ]
 *     }
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 */
export interface AlignmentConfig {
	options?: Array<SupportedOption | AlignmentFormat>;
}

/**
 * Available alignment options.
 *
 * The available options are: `'left'`, `'right'`, `'center'` and `'justify'`. Other values are ignored.
 *
 * **Note:** It is recommended to always use `'left'` or `'right'` as these are default values which the user should
 * normally be able to choose depending on the
 * {@glink getting-started/setup/ui-language#setting-the-language-of-the-content language of the editor content}.
 *
 * ```ts
 * ClassicEditor
 *   .create( editorElement, {
 *     alignment: {
 *       options: [ 'left', 'right' ]
 *     }
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * By default the alignment is set inline using the `text-align` CSS property. To further customize the alignment,
 * you can provide names of classes for each alignment option using the `className` property.
 *
 * **Note:** Once you define the `className` property for one option, you need to specify it for all other options.
 *
 * ```ts
 * ClassicEditor
 *   .create( editorElement, {
 *     alignment: {
 *       options: [
 *         { name: 'left', className: 'my-align-left' },
 *         { name: 'right', className: 'my-align-right' }
 *       ]
 *     }
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * See the demo of {@glink features/text-alignment#configuring-alignment-options custom alignment options}.
 */
export type AlignmentFormat = {
	name: SupportedOption;
	className?: string;
};

export type SupportedOption = 'left' | 'right' | 'center' | 'justify';
