/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/removeformatui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import eraseIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';

const REMOVE_FORMAT = 'removeformat';

/**
 * The default remove format UI plugin.
 *
 * See the {@link module:removeformat/removeformat~RemoveFormatConfig#options configuration} to learn more
 * about the defaults.
 *
 * @extends module:core/plugin~Plugin
 */
export default class RemoveFormatUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RemoveFormatUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( REMOVE_FORMAT, locale => {
			// const command = editor.commands.get( BOLD );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Remove format' ),
				icon: eraseIcon,
				tooltip: true
			} );

			return view;
		} );
	}
}
