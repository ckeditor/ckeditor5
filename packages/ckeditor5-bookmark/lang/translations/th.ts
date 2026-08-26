/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'th': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'บุ๊กมาร์ก',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'แก้ไขบุ๊กมาร์ก',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'ลบบุ๊กมาร์ก',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'ชื่อบุ๊กมาร์ก',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'ป้อนชื่อบุ๊กมาร์กโดยไม่มีช่องว่าง',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'บุ๊กมาร์กต้องไม่เว้นว่างไว้',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'ชื่อบุ๊กมาร์กต้องไม่มีการเว้นวรรคระหว่างอักขระ',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'มีชื่อบุ๊กมาร์กนี้อยู่เรียบร้อยแล้ว',
			// The label for the bookmark widget.
			'bookmark widget': 'วิดเจ็ตบุ๊กมาร์ก',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'แถบเครื่องมือบุ๊กมาร์ก',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'บุ๊กมาร์ก',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'ไม่มีบุ๊กมาร์กพร้อมใช้งาน',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'เลื่อนไปยังบุ๊กมาร์ก'
		}
	}
};

export default translations;
