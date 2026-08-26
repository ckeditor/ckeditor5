/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': '開啟檔案管理程式',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': '無法確定上傳檔案的分類。',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': '無法存取預設工作區。',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': '您沒有圖片編輯權限。',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': '編輯圖片',
			// A message stating that image editing is in progress.
			'Processing the edited image.': '正在處理已編輯的圖片。',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': '伺服器無法處理該圖片。',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': '無法判斷已編輯圖片的類別。'
		}
	}
};

export default translations;
