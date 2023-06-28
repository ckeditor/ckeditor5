import { Plugin } from 'ckeditor5/src/core';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import maximizeIcon from './maximize.svg';
import minimizeIcon from './minimize.svg';

export default class FullScreen extends Plugin {
	public init(): void {
		const editor = this.editor;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if ( editor.config._config.fullScreen && editor.config._config.fullScreen.onOpen ) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const open = editor.config._config.fullScreen.onOpen;
			// The button must be registered among the UI components of the editor
			// to be displayed in the toolbar.
			editor.ui.componentFactory.add( 'fullScreen', () => {
				// The button will be an instance of ButtonView.
				const button = new ButtonView();
				let isFullScreen = false;
				button.set( {
					label: 'FullScreen',
					withText: false,
					tooltip: true,
					icon: maximizeIcon
				} );

				button.on( 'execute', () => {
					open();
					isFullScreen = !isFullScreen;

					button.set( {
						label: 'FullScreen',
						withText: false,
						icon: isFullScreen ? minimizeIcon : maximizeIcon
					} );
				} );

				return button;
			} );
		}
	}
}
