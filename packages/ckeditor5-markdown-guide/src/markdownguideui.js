import { Plugin } from 'ckeditor5/src/core';
import { LinkView } from '../../ckeditor5-ui/src';

import icon from '../theme/icons/markdown.svg';

const NAME = 'markdownGuide';

/**
 * @extends module:core/plugin~Plugin
 */
export default class MarkdownGuideUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MarkdownGuideUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( NAME, locale => {
			const view = new LinkView( locale );

			view.set( {
				label: t( 'Markdown Guide' ),
				icon,
				withText: true,
				href: editor.config.get( 'markdownGuideURL' )
			} );

			return view;
		} );
	}
}
