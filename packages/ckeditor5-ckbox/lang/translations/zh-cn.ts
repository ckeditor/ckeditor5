/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh-cn': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': '打开文件管理器',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': '无法确定上传文件的类别。',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': '无法访问默认工作区',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': '您没有编辑图片的权限。',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': '编辑图片',
			// A message stating that image editing is in progress.
			'Processing the edited image.': '正在处理已编辑的图片。',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': '服务器未能处理图片。',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': '未能确定已编辑图片的类别。'
		}
	}
};

export default translations;
