import { Plugin } from 'ckeditor5/src/core';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import icon from './icon.svg';

export default class StyledLink extends Plugin {
	public static get pluginName(): 'StyledLink' {
		return 'StyledLink';
	}

	public init(): void {
		const editor = this.editor;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if ( editor.config._config.source && editor.config._config.source.onOpen ) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const open = editor.config._config.styledLink.onOpen;
			// The button must be registered among the UI components of the editor
			// to be displayed in the toolbar.
			editor.ui.componentFactory.add( 'styledLink', () => {
				// The button will be an instance of ButtonView.
				const button = new ButtonView();

				button.set( {
					label: 'Styled Link',
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
