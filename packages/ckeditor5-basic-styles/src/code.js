/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/code
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CodeEngine from './codeengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import codeIcon from '../theme/icons/code.svg';

import '../theme/code.scss';

/**
 * The code feature. It introduces the Code button.
 *
 * It uses the {@link module:basic-styles/codeengine~CodeEngine code engine feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Code extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ CodeEngine ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Code';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'code' );

		// Add code button to feature components.
		editor.ui.componentFactory.add( 'code', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Code' ),
				icon: codeIcon,
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => editor.execute( 'code' ) );

			return view;
		} );
	}
}
