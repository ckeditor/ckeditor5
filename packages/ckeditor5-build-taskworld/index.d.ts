import React from 'react'

declare module '@taskworld/ckeditor5' {
	/**
	 * @see https://ckeditor.com/docs/ckeditor5/latest/api/module_editor-classic_classiceditor-ClassicEditor.html
	 */
	export type ClassicEditor = {
		isReadOnly: boolean
		focus: () => void
		getData: () => string
		setData: (text: string) => void
	}

	/**
	 * @see https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/react.html#component-properties
	 */
	export default class CKEditor extends React.Component<{
		data?: string
		placeholder?: string
		config: object
		disabled?: boolean
		onReady: (editor: ClassicEditor) => void
		onChange?: (event: any, editor: ClassicEditor) => void
		onBlur?: (event: any, editor: ClassicEditor) => void
		onFocus?: (event: any, editor: ClassicEditor) => void
	}>{ }
}
