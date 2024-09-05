/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcareimageedit/uploadcareimageeditui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';

import uploadcareImageEditIcon from '../../theme/icons/uploadcare-image-edit.svg';

import '@uploadcare/file-uploader/web/uc-cloud-image-editor.min.css';
import '../../theme/uploadcare-theme.css';

/**
 * The UI plugin of the Uploadcare image edit feature.
 *
 * It registers the `'uploadcareImageEdit'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * that allows you to open the Uploadcare dialog and edit the image.
 */
export default class UploadcareImageEditUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'UploadcareImageEditUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'uploadcareImageEdit', locale => {
			const command = editor.commands.get( 'uploadcareImageEdit' )!;
			const view = new ButtonView( locale );
			const t = locale.t;

			view.set( {
				icon: uploadcareImageEditIcon,
				tooltip: true,
				label: t( 'Edit image' )
			} );

			view.bind( 'isOn' ).to( command, 'isEnabled' );
			view.bind( 'isEnabled' ).to( command );

			// Execute the command.
			this.listenTo( view, 'execute', () => {
				editor.execute( 'uploadcareImageEdit' );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
