/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ko': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': '사진이나 파일을 삽입',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': '크기가 조절된 사진의 URL을 가져오지 못했습니다.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': '크기가 조절된 이미지 선택 실패',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': '현재 위치에 사진을 삽입할 수 없습니다.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': '사진 삽입 실패'
		}
	}
};

export default translations;
