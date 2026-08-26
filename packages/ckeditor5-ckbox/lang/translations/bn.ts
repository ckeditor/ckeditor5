/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'bn': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': 'ফাইল ম্যানেজার খুলুন',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': 'আপলোড করা ফাইলের জন্য একটি বিভাগ নির্ধারণ করা যাচ্ছে না।',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': 'ডিফল্ট ওয়ার্কস্পেস অ্যাক্সেস করতে পারবেন না।',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': 'আপনার কোনও ইমেজ সম্পাদনার অনুমতি নেই।',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': 'ছবি এডিট করুন',
			// A message stating that image editing is in progress.
			'Processing the edited image.': 'এডিট করা ছবি প্রক্রিয়া করা হচ্ছে।',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': 'সার্ভার ছবিটি প্রক্রিয়া করতে ব্যর্থ হয়েছে।',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': 'এডিট করা ছবির ক্যাটাগরি নির্ধারণ করতে ব্যর্থ হয়েছে।'
		}
	}
};

export default translations;
