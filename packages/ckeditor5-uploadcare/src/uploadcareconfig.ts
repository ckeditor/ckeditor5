/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcareconfig
 */

/**
 * The configuration of the {@link module:uploadcare/uploadcare~Uploadcare Uploadcare feature}.
 *
 * The minimal configuration for the Uploadcare feature requires providing the
 * {@link module:uploadcare/uploadcareconfig~UploadcareConfig#tokenUrl `config.uploadcare.tokenUrl`}:
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		uploadcare: {
 * 			tokenUrl: 'https://example.com/cs-token-endpoint'
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * Hovewer, you can also adjust the feature to fit your needs:
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		uploadcare: {
 * 			sourceList: [
 * 				'local',
 * 				'link',
 * 				'instagram',
 * 				'gdrive'
 * 			],
 * 			tokenUrl: 'https://example.com/cs-token-endpoint'
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface UploadcareConfig {

	/**
	 * The authentication token URL for Uploadcare feature.
	 */
	tokenUrl?: string;

	/**
	 * The theme for CKBox dialog.
	 */
	sourceList?: UploadcareSourceList;
}

export enum UploadcareSourceList {
	Local = 'local',
	URL = 'url',
	Camera = 'camera',
	Dropbox = 'dropbox',
	GDrive = 'gdrive',
	Facebook = 'facebook',
	GPhotos = 'gphotos',
	Instagram = 'instagram',
	Flickr = 'flickr',
	Evernote = 'evernote',
	Box = 'box',
	OneDrive = 'onedrive'
}
