import { Plugin } from 'ckeditor5/src/core';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import maximizeIcon from './maximize.svg';
import minimizeIcon from './minimize.svg';

export default class FullScreen extends Plugin {
	init() {
		const editor = this.editor;
		// @ts-ignore
		const open = editor.config._config.fullScreen.onOpen;
		// The button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add('fullScreen', () => {
			// The button will be an instance of ButtonView.
			const button = new ButtonView();
			let isFullScreen = false;
			button.set({
				label: 'FullScreen',
				withText: false,
				icon: maximizeIcon,
			});

			button.on('execute', () => {
				open();
				isFullScreen = !isFullScreen;

				button.set({
					label: 'FullScreen',
					withText: false,
					icon: isFullScreen ? minimizeIcon : maximizeIcon,
				});
			});

			return button;
		});
	}
}
