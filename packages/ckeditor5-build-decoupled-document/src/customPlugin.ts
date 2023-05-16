import { Plugin } from 'ckeditor5/src/core';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class CustomPlugin extends Plugin {
	label: string;
	icon: any;
	onOpen: () => {};

	constructor(props: any) {
		const { label, icon, onOpen, ...rest } = props;
		super(rest);
		this.label = label;
		this.icon = icon;
		this.onOpen = onOpen;
	}
	init() {
		const editor = this.editor;
		// @ts-ignore
		const open = editor.config._config.exercise.onOpen;
		// The button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add(this.label, () => {
			// The button will be an instance of ButtonView.
			const button = new ButtonView();

			button.set({
				label: this.label,
				withText: false,
				icon: this.icon,
			});

			button.on('execute', () => {
				open();
			});

			return button;
		});
	}
}
