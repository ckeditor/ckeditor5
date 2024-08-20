/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcareconfig
 */

import type * as UC from '@uploadcare/file-uploader';

/**
 * The configuration of the {@link module:uploadcare/uploadcare~Uploadcare Uploadcare feature}.
 *
 * The minimal configuration for the Uploadcare feature requires providing the
 * {@link module:uploadcare/uploadcareconfig~UploadcareConfig#tokenUrl `config.uploadcare.pubKey`}:
 *
 * ```ts
 * ClassicEditor
 *  .create( editorElement, {
 *      uploadcare: {
 *          pubKey: 'YOUR_PUBLIC_KEY'
 *      }
 *  } )
 *  .then( ... )
 *  .catch( ... );
 * ```
 *
 * However, you can also adjust the feature to fit your needs:
 *
 * ```ts
 * ClassicEditor
 *  .create( editorElement, {
 *      uploadcare: {
 *          sourceList: [
 *              'local',
 *              'url',
 *              'instagram',
 *              'gdrive'
 *          ],
 *          pubKey: 'YOUR_PUBLIC_KEY'
 *      }
 *  } )
 *  .then( ... )
 *  .catch( ... );
 * ```
 *
 * You can find detailed information in the [Uploadcare documentation](https://uploadcare.com/docs/file-uploader/options/).
 *
 * Please note that the source list is limited to the following values:
 * * 'local'
 * * 'url'
 * * 'dropbox'
 * * 'gdrive'
 * * 'facebook'
 * * 'gphotos'
 * * 'instagram'
 * * 'onedrive'
 *
 * Additionally, several options are not supported:
 * * `imgOnly` - It's `true` by default.
 * * `removeCopyright` - It's `true` by default.
 * * `localeName` - The editor language is used.
 * * `confirmUpload` - It's `false` by default.
 * * `cameraMirror` - The `camera` source is not supported.
 * * `cameraCapture` - The `camera` source is not supported.
 * * `showEmptyList` - It's `false` by default.
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
*/
export interface UploadcareConfig extends Omit<UC.Config, ExcludedKeys> {

	/**
	 * Comma-separated list of file sources.
	 *
	 * @default [ 'local', 'url' ]
	 */
	sourceList?: Array<UploadcareSource>;
}

/**
 * All not supported config options.
 */
type ExcludedKeys = 'imgOnly' | 'removeCopyright' | 'localeName' | 'confirmUpload' | 'cameraMirror' | 'cameraCapture' | 'showEmptyList';

/**
 * Definition of all available upload sources.
 */
export enum UploadcareSource {
	Local = 'local',
	URL = 'url',
	Dropbox = 'dropbox',
	GDrive = 'gdrive',
	Facebook = 'facebook',
	GPhotos = 'gphotos',
	Instagram = 'instagram',
	OneDrive = 'onedrive'
}

/**
 * Image asset definition.
 *
 * The definition contains the unique `id`, asset `type` and an `url`.
 */
export interface UploadcareAssetImageDefinition {

	/**
	 * An unique asset id.
	 */
	id: string;

	/**
	 * Asset type.
	 */
	type: 'image';

	/**
	 * Asset attributes.
	 */
	url: string;
}
