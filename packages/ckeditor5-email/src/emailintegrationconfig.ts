/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/emailintegrationconfig
 */

/**
 * The configuration of the email integration features.
 *
 * ```ts
 *	ClassicEditor
 *		.create( editorElement, {
 *			email: ... // Email integration feature options.
 *		} )
 *		.then( ... )
 *		.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 */
export interface EmailIntegrationConfig {

	/**
	 * Configuration for warning messages about email client compatibility.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		email: {
	 * 			warnings: {
	 * 				suppressAll: false,
	 * 				suppress: ['image-width', 'table-styles']
	 * 			}
	 * 		}
	 * 	} )
	 * ```
	 */
	warnings?: {

		/**
		 * Whether to suppress all compatibility warnings.
		 *
		 * @default false
		 */
		suppressAll?: boolean;

		/**
		 * Array of specific warning codes to suppress.
		 *
		 * @default []
		 */
		suppress?: Array<string> | ( ( warningCode: string, data?: object ) => boolean );
	};
}
