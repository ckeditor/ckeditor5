/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ko': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': '파일 관리자 열기',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': '업로드된 파일의 카테고리를 확인할 수 없습니다.',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': '기본 작업 공간에 액세스할 수 없습니다.',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': '이미지를 편집할 수 있는 권한이 없습니다.',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': '이미지 편집',
			// A message stating that image editing is in progress.
			'Processing the edited image.': '편집한 이미지를 처리 중입니다.',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': '서버가 이미지를 처리하지 못했습니다.',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': '편집한 이미지의 카테고리를 결정하지 못했습니다.'
		}
	}
};

export default translations;
