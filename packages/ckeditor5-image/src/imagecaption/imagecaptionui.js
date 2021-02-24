/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptionui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import captionIcon from '../../theme/icons/imagecaption.svg';

/**
 * The image caption UI plugin. It introduces the `'toggleImageCaption'` UI button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageCaptionUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'toggleImageCaption', locale => {
			const command = editor.commands.get( 'toggleImageCaption' );
			const view = new ButtonView( locale );

			view.set( {
				icon: captionIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.bind( 'label' ).to( command, 'value', value => value ? t( 'Toggle caption off' ) : t( 'Toggle caption on' ) );

			this.listenTo( view, 'execute', () => {
				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				// Scroll to the selection if the caption showed up.
				if ( command.value ) {
					editor.editing.view.scrollToTheSelection();
				}
			} );

			return view;
		} );
	}
}
