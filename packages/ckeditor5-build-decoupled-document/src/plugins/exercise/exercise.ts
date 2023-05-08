import { Plugin } from 'ckeditor5/src/core';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class Exercise extends Plugin {
	init() {
		const editor = this.editor;
		const open = editor.config.exercise.onOpen;
		// The button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add('exercise', () => {
			// The button will be an instance of ButtonView.
			const button = new ButtonView();

			button.set({
				label: 'Exercise',
				withText: false,
			});

			button.on('execute', () => {
				open();
			});

			return button;
		});
	}
}
