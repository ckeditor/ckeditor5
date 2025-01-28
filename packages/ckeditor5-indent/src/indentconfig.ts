/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/indentconfig
 */

/**
 * The configuration of the block indentation feature.
 *
 * If no {@link module:indent/indentconfig~IndentBlockConfig#classes} are set, the block indentation feature will use
 * {@link module:indent/indentconfig~IndentBlockConfig#offset} and {@link module:indent/indentconfig~IndentBlockConfig#unit} to
 * create indentation steps.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		indentBlock: {
 * 			offset: 2,
 * 			unit: 'em'
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * Alternatively, the block indentation feature may set one of defined {@link module:indent/indentconfig~IndentBlockConfig#classes} as
 * indentation steps:
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		indentBlock: {
 * 			classes: [
 * 				'indent-a', // The first step - smallest indentation.
 * 				'indent-b',
 * 				'indent-c',
 * 				'indent-d',
 * 				'indent-e' // The last step - biggest indentation.
 * 			]
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * In the example above only 5 indentation steps will be available.
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface IndentBlockConfig {

	/**
	 * The size of indentation {@link module:indent/indentconfig~IndentBlockConfig#unit units} for each indentation step.
	 *
	 * @default 40
	 */
	offset?: number;

	/**
	 * The unit used for indentation {@link module:indent/indentconfig~IndentBlockConfig#offset}.
	 *
	 * @default 'px'
	 */
	unit?: string;

	/**
	 * An optional list of classes to use for indenting the editor content. If not set or set to an empty array, no classes will be used.
	 * The {@link module:indent/indentconfig~IndentBlockConfig#unit `indentBlock.unit`} and
	 * {@link module:indent/indentconfig~IndentBlockConfig#offset `indentBlock.offset`} properties will be used instead.
	 *
	 * @default undefined
	 */
	classes?: Array<string>;
}
