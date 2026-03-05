/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

declare module '@ckeditor/ckeditor5-core' {
	interface RootConfig {

		/**
		 * Configuration of the model root element.
		 *
		 * **Note: This configuration option is supported only by the
		 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor multi-root} editor type.**
		 */
		modelElement?: {

			/**
			 * The model root element name.
			 */
			name?: string;

			/**
			 * Initial attributes for the root model element.
			 */
			attributes?: Record<string, unknown>;
		};

		/**
		 * Whether the root should be lazily loaded.
		 *
		 * **This property has been deprecated and may be removed in the future versions of CKEditor.**
		 */
		lazyLoad?: boolean;
	}
}
