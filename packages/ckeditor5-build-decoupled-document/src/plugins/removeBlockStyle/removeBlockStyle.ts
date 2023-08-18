import { Plugin } from 'ckeditor5/src/core';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import icon from './icon.svg';
import iconActive from './iconActive.svg';

export default class RemoveBlockStyle extends Plugin {
	public init(): void {
		const editor = this.editor;
		// @ts-ignore
		const open = editor.config._config.removeBlockStyle.onOpen;
		// @ts-ignore
		const close = editor.config._config.removeBlockStyle.onClose;
		// The button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add('removeBlockStyle', () => {
			let isActive = false;
			// The button will be an instance of ButtonView.
			const button = new ButtonView();
			button.set({
				label: 'Remove block style',
				withText: false,
				tooltip: true,
				icon,
			});

			button.on('execute', () => {
				isActive ? close() : open();
				isActive = !isActive;
				button.set({
					label: 'Remove block style',
					withText: false,
					icon: isActive ? iconActive : icon,
				});
			});

			return button;
		});
	}
}
