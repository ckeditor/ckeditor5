/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcareui
 * @publicApi
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
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
	public afterInit(): void {
		const { editor } = this;
		const uploadcareCommand = editor.commands.get( 'uploadcare' );

		if ( !uploadcareCommand ) {
			return;
		}

		const uploadSources = this._normalizeConfigSourceList( editor.config.get( 'uploadcare.sourceList' ) as Array<UploadcareSource> );

		const groupedSources: Record<string, Array<SourceDefinition>> = uploadSources.reduce( ( acc, source ) => {
			const key = this._getIntegrationKey( source.type );

			if ( !acc[ key ] ) {
				acc[ key ] = [];
			}

			acc[ key ].push( source );

			return acc;
		}, {} );

		if ( editor.plugins.has( 'ImageInsertUI' ) ) {
			Object.entries( groupedSources ).forEach( ( [ type, sources ] ) => {
				editor.plugins.get( 'ImageInsertUI' ).registerIntegration( {
					name: type,
					observable: () => uploadcareCommand,
					buttonViewCreator: () => this._createToolbarButton( sources ),
					formViewCreator: () => this._createDropdownButtons( sources ),
					menuBarButtonViewCreator: isOnly => this._createMenuBarButtons( sources ),
					override: type !== 'assetManager'
				} );
			} );
		}
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
	 * Returns a key that is used to register integration.
	 */
	private _getIntegrationKey( type: UploadcareSource ): string {
		switch ( type ) {
			case UploadcareSource.Local:
				return 'upload';
			case UploadcareSource.URL:
				return 'url';
			default:
				return 'assetManager';
		}
	}

	/**
	 * Creates the base for various kinds of the button component provided by this feature.
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>(
		ButtonClass: T,
		type: string
	): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const view = new ButtonClass( locale ) as InstanceType<T>;
		const command = editor.commands.get( 'uploadcare' )!;

		view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

		view.on( 'execute', () => {
			command.execute( type );
		} );

		return view;
	}

	/**
	 * Creates a simple toolbar button for images management, with an icon and a tooltip.
	 */
	private _createToolbarButton( btnSources: Array<SourceDefinition> ): ButtonView {
		const source = btnSources[ 0 ];
		const button = this._createButton( ButtonView, source.type );

		button.icon = source.icon;
		button.label = source.text;
		button.tooltip = true;

		return button;
	}

	/**
	 * Creates buttons for the dropdown view, with an icon, text and no tooltip.
	 */
	private _createDropdownButtons( btnSources: Array<SourceDefinition> ): Array<ButtonView> {
		return btnSources.map( source => {
			const button = this._createButton( ButtonView, source.type );

			button.withText = true;
			button.icon = source.icon;
			button.label = source.text;

			return button;
		} );
	}

	/**
	 * Creates buttons for the menu bar.
	 */
	private _createMenuBarButtons( btnSources: Array<SourceDefinition> ): Array<MenuBarMenuListItemButtonView> {
		return btnSources.map( source => {
			const button = this._createButton( MenuBarMenuListItemButtonView, source.type );

			button.withText = true;
			button.icon = source.icon;
			button.label = source.text;

			return button;
		} );
	}
}
