/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { uploadFile as uploadFileUploadcare, type UploadcareFile, type ProgressCallback } from '@uploadcare/upload-client';

export async function uploadFile( { file, publicKey, signal, onProgress }: UploadFileOptions ): Promise<UploadcareFile> {
	return uploadFileUploadcare( file, {
		publicKey,
		store: 'auto',
		signal,
		onProgress
	} );
}

type UploadFileOptions = {
	publicKey: string;
	signal: AbortSignal;
	file: File | string;
	onProgress?: ProgressCallback;
};
