/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptionui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import ImageCaptionUtils from './imagecaptionutils';
import type ToggleImageCaptionCommand from './toggleimagecaptioncommand';

/**
 * The image caption UI plugin. It introduces the `'toggleImageCaption'` UI button.
 */
export default class ImageCaptionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageCaptionUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageCaptionUI' {
		return 'ImageCaptionUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const imageCaptionUtils: ImageCaptionUtils = editor.plugins.get( 'ImageCaptionUtils' );
		const t = editor.t;

		editor.ui.componentFactory.add( 'toggleImageCaption', locale => {
			const command: ToggleImageCaptionCommand = editor.commands.get( 'toggleImageCaption' )!;
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
				const modelCaptionElement = imageCaptionUtils.getCaptionFromModelSelection( editor.model.document.selection );

				if ( modelCaptionElement ) {
					const figcaptionElement = editor.editing.mapper.toViewElement( modelCaptionElement );

					editingView.scrollToTheSelection();

					editingView.change( writer => {
						writer.addClass( 'image__caption_highlighted', figcaptionElement! );
					} );
				}

				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
