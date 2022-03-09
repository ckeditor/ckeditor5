HelpjuiceEditor.create( document.querySelector('#helpjuice-editor'))
	.then(editor => {
		window.editor = editor;
		CKEditorInspector.attach(editor);
	})
	.catch(error => {
		console.error( 'There was a problem initializing the editor.', error );
	});
