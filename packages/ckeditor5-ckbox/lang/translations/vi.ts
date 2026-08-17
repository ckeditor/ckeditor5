/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'vi': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': 'Mở trình quản lý tệp',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': 'Không thể xác định danh mục cho tệp được tải lên.',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': 'Không thể truy cập vào không gian làm việc mặc định.',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': 'Bạn không có quyền chỉnh sửa ảnh.',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': 'Chỉnh sửa hình ảnh',
			// A message stating that image editing is in progress.
			'Processing the edited image.': 'Xử lý hình ảnh đã chỉnh sửa.',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': 'Máy chủ không thể xử lý hình ảnh.',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': 'Không thể xác định danh mục hình ảnh đã chỉnh sửa.'
		}
	}
};

export default translations;
