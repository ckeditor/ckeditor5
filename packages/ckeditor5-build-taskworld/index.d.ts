import React from 'react';

declare module '@taskworld/ckeditor5' {

	/**
	 * @see https://ckeditor.com/docs/ckeditor5/latest/api/module_editor-classic_classiceditor-ClassicEditor.html
	 */
	export type ClassicEditor = {

		/**
		 * @see https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-editor-isreadonly-has-no-setter
		 */
		readonly isReadOnly: boolean;

		readonly config: {
			get: ( fieldPath: string ) => any;
			set: ( fieldPath: string, fieldValue: any ) => void;
		};

		focus: () => void;
		getData: () => string;
		setData: ( text: string ) => void;
	};

	/**
	 * @see https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/react.html#component-properties
	 */
	export default class CKEditor extends React.Component<{
		data?: string;
		placeholder?: string;
		config: object;
		disabled?: boolean;
		onReady: ( editor: ClassicEditor ) => void;
		onChange?: ( event: any, editor: ClassicEditor ) => void;
		onBlur?: ( event: any, editor: ClassicEditor ) => void;
		onFocus?: ( event: any, editor: ClassicEditor ) => void;
	}> { }
}

declare global {
	interface Window {
		CKEDITOR_TRANSLATIONS: {
			[language: string]: {
				dictionary: Record<string, string>;
			};
		};
	}
}
