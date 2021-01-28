/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptionui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { getCaptionFromImageModelElement } from './utils';

import captionIcon from '../../theme/icons/imagecaption.svg';

/**
 * TODO
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

		editor.ui.componentFactory.add( 'imageCaptionToggle', locale => {
			const command = editor.commands.get( 'imageCaptionToggle' );
			const view = new ButtonView( locale );

			view.set( {
				icon: captionIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.bind( 'label' ).to( command, 'value', value => value ? t( 'Toggle caption off' ) : t( 'Toggle caption on' ) );

			this.listenTo( view, 'execute', () => {
				editor.execute( 'imageCaptionToggle' );

				// TODO: This is a questionable UX decision but maybe we'll like it.
				if ( command.value ) {
					editor.model.change( writer => {
						const selectedElement = this.editor.model.document.selection.getSelectedElement();
						const modelCaption = getCaptionFromImageModelElement( selectedElement );

						writer.setSelection( modelCaption, 'end' );
					} );
				}
			} );

			return view;
		} );
	}
}
