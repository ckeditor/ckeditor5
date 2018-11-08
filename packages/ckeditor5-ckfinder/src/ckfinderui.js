/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ckfinder/ckfinderui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import ckfinderIcon from '@ckeditor/ckeditor5-ui/theme/icons/dropdown-arrow.svg';

/**
 * The CKFinder UI plugin. It introduces he `'ckfinder'` toolbar button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CKFinderUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CKFinderUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const componentFactory = editor.ui.componentFactory;
		const t = editor.t;

		componentFactory.add( 'ckfinder', locale => {
			const command = editor.commands.get( 'ckfinder' );

			const view = new ButtonView( locale );

			view.set( {
				label: t( 'CKFinder' ),
				icon: ckfinderIcon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command );

			view.on( 'execute', () => {
				editor.execute( 'ckfinder' );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
