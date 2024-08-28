/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ai/utils/common-translations
 */

import type { Locale } from 'ckeditor5/src/utils.js';
import { UploadcareSource } from '../uploadcareconfig.js';

/**
 * @internal
 */
export function getTranslation( locale: Locale, id: UploadcareSource ): { text: string; shortText: string } {
	const t = locale.t;

	switch ( id ) {
		case UploadcareSource.Local:
			return {
				text: t( 'Upload from computer' ),
				shortText: t( 'From computer' )
			};

		case UploadcareSource.URL:
			return {
				text: t( 'Insert via URL' ),
				shortText: t( 'Via URL' )
			};

		case UploadcareSource.Dropbox:
			return {
				text: t( 'Insert with Dropbox' ),
				shortText: t( 'With Dropbox' )
			};

		case UploadcareSource.Facebook:
			return {
				text: t( 'Insert with Facebook' ),
				shortText: t( 'With Facebook' )
			};

		case UploadcareSource.GDrive:
			return {
				text: t( 'Insert with Google Drive' ),
				shortText: t( 'With Google Drive' )
			};

		case UploadcareSource.GPhotos:
			return {
				text: t( 'Insert with Google Photos' ),
				shortText: t( 'With Google Photos' )
			};

		case UploadcareSource.Instagram:
			return {
				text: t( 'Insert with Instagram' ),
				shortText: t( 'With Instagram' )
			};

		case UploadcareSource.OneDrive:
			return {
				text: t( 'Insert with OneDrive' ),
				shortText: t( 'With OneDrive' )
			};

		default:
			return id;
	}
}
