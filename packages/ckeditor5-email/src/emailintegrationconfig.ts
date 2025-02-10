/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/emailintegrationconfig
 */

/**
 * The configuration of the email integration feature.
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
	 * Configuration for warning or log messages about email client compatibility.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		email: {
	 * 			logs: {
	 * 				suppressAll: false,
	 * 				suppress: [ ... ]
	 * 			}
	 * 		}
	 * 	} )
	 * ```
	 */
	logs?: {

		/**
		 * Setting this to `true` will silence all compatibility warnings,
		 * including any that might be added in future releases. This is not recommended
		 * as it may hide important information about the editor's behavior in email clients.
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
