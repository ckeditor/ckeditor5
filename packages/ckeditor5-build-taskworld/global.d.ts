declare module '@taskworld/ckeditor5' {
	/**
	 * @see https://ckeditor.com/docs/ckeditor5/latest/api/module_editor-classic_classiceditor-ClassicEditor.html
	 */
	type ClassicEditor = {
		isReadOnly: boolean
		focus: () => void
		getData: () => string
		setData: (text: string) => void
	}
}