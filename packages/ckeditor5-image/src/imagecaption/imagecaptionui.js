/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptionui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import ImageUtils from '../imageutils';

import { getCaptionFromModelSelection } from './utils';

/**
 * The image caption UI plugin. It introduces the `'toggleImageCaption'` UI button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageUtils ];
	}

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
		const editingView = editor.editing.view;
		const imageUtils = editor.plugins.get( 'ImageUtils' );
		const t = editor.t;

		editor.ui.componentFactory.add( 'toggleImageCaption', locale => {
			const command = editor.commands.get( 'toggleImageCaption' );
			const view = new ButtonView( locale );

			view.set( {
				icon: icons.caption,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.bind( 'label' ).to( command, 'value', value => value ? t( 'Toggle caption off' ) : t( 'Toggle caption on' ) );

			this.listenTo( view, 'execute', () => {
				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				// Scroll to the selection and highlight the caption if the caption showed up.
				const modelCaptionElement = getCaptionFromModelSelection( imageUtils, editor.model.document.selection );

				if ( modelCaptionElement ) {
					const figcaptionElement = editor.editing.mapper.toViewElement( modelCaptionElement );

					editingView.scrollToTheSelection();

					editingView.change( writer => {
						writer.addClass( 'image__caption_highlighted', figcaptionElement );
					} );
				}
			} );

			return view;
		} );
	}
}
