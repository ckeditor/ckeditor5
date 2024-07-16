/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcareui
 * @publicApi
 */

import { Plugin } from 'ckeditor5/src/core.js';
import {
	addListToDropdown,
	type ButtonExecuteEvent,
	createDropdown,
	Dialog,
	type ListDropdownItemDefinition,
	ViewModel
} from 'ckeditor5/src/ui.js';

import imageUploadIcon from '../theme/icons/image-upload.svg';
import boxIcon from '../theme/icons/box.svg';
import cameraIcon from '../theme/icons/camera.svg';
import dropboxIcon from '../theme/icons/dropbox.svg';
import evernoteIcon from '../theme/icons/evernote.svg';
import facebookIcon from '../theme/icons/facebook.svg';
import flickrIcon from '../theme/icons/flickr.svg';
import googleDriveIcon from '../theme/icons/google-drive.svg';
import googlePhotosIcon from '../theme/icons/google-photos.svg';
import instagramIcon from '../theme/icons/instagram.svg';
import linkIcon from '../theme/icons/link.svg';
import localIcon from '../theme/icons/local.svg';
import oneDriveIcon from '../theme/icons/onedrive.svg';

import { Collection } from 'ckeditor5/src/utils.js';

import { UploadcareSource } from './uploadcareconfig.js';

type SourceDefinition = {
	icon: any;
	type: UploadcareSource;
	text: string;
};

/**
 * The UI plugin of the AI assistant.
 */
export default class UploadcareUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'UploadcareUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const { editor } = this;
		const { t } = editor;
		const uploadcareCommand = editor.commands.get( 'uploadcare' );

		if ( !uploadcareCommand ) {
			return;
		}

		const uploadSources = this._normalizeConfigSourceList( editor.config.get( 'uploadcare.sourceList' ) as Array<UploadcareSource> );

		editor.ui.componentFactory.add( 'uploadcare', locale => {
			const dropdown = createDropdown( locale );
			const listItems = new Collection<ListDropdownItemDefinition>(
				uploadSources.map( definition => this._getButtonDefinition( definition.type, definition.text, definition.icon ) )
			);

			addListToDropdown( dropdown, listItems, {
				role: 'menu'
			} );

			this.listenTo<ButtonExecuteEvent>( dropdown, 'execute', evt => {
				const { _type } = evt.source;

				uploadcareCommand.execute( _type );
			} );

			dropdown.buttonView.set( {
				label: t( 'Uploadcare' ),
				icon: imageUploadIcon,
				tooltip: true
			} );

			dropdown.on( 'change:isOpen', ( evt, name, isOpen ) => {
				console.log( isOpen );
			} );

			return dropdown;
		} );
	}

	/**
	 * Returns a definitions of the upload source containing icons and translations.
	 */
	private _normalizeConfigSourceList( sourceList: Array<UploadcareSource> ): Array<SourceDefinition> {
		return sourceList.map( el => {
			switch ( el ) {
				case UploadcareSource.Local:
					return { icon: localIcon, type: UploadcareSource.Local, text: 'Insert from device' };
				case UploadcareSource.URL:
					return 	{ icon: linkIcon, type: UploadcareSource.URL, text: 'Insert using URL' };
				case UploadcareSource.Camera:
					return 	{ icon: cameraIcon, type: UploadcareSource.Camera, text: 'Insert using camera' };
				case UploadcareSource.Box:
					return 	{ icon: boxIcon, type: UploadcareSource.Box, text: 'Insert using Box' };
				case UploadcareSource.Dropbox:
					return 	{ icon: dropboxIcon, type: UploadcareSource.Dropbox, text: 'Insert using Dropbox' };
				case UploadcareSource.Evernote:
					return 	{ icon: evernoteIcon, type: UploadcareSource.Evernote, text: 'Insert using Evernote' };
				case UploadcareSource.Facebook:
					return 	{ icon: facebookIcon, type: UploadcareSource.Facebook, text: 'Insert using Facebook' };
				case UploadcareSource.Flickr:
					return 	{ icon: flickrIcon, type: UploadcareSource.Flickr, text: 'Insert using Flickr' };
				case UploadcareSource.GDrive:
					return 	{ icon: googleDriveIcon, type: UploadcareSource.GDrive, text: 'Insert using Google Drive' };
				case UploadcareSource.GPhotos:
					return 	{ icon: googlePhotosIcon, type: UploadcareSource.GPhotos, text: 'Insert using Google Photos' };
				case UploadcareSource.Instagram:
					return { icon: instagramIcon, type: UploadcareSource.Instagram, text: 'Insert using Instagram' };
				case UploadcareSource.OneDrive:
					return { icon: oneDriveIcon, type: UploadcareSource.OneDrive, text: 'Insert using OneDrive' };
			}
		} );
	}

	/**
	 * Returns a definition of the upload button to be used in the dropdown.
	 */
	private _getButtonDefinition( type: string, label: string, icon: string ): ListDropdownItemDefinition {
		return {
			type: 'button' as const,
			model: new ViewModel( {
				label,
				icon,
				withText: true,
				withKeystroke: true,
				role: 'menuitem',
				_type: type
			} )
		};
	}
}
