import { Plugin } from 'ckeditor5/src/core.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import icon from './icon.svg';

export default class Exercise extends Plugin {
	public init(): void {
		const editor = this.editor;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if ( editor.config._config.image && editor.config._config.image.onOpen ) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const open = editor.config._config.image.onOpen;
			// The button must be registered among the UI components of the editor
			// to be displayed in the toolbar.
			editor.ui.componentFactory.add( 'ownImagePlugin', () => {
				// The button will be an instance of ButtonView.
				const button = new ButtonView();

				button.set( {
					label: 'Image',
					withText: false,
					tooltip: true,
					icon
				} );

				button.on( 'execute', () => {
					open();
				} );

				return button;
			} );
		}
	}
}
