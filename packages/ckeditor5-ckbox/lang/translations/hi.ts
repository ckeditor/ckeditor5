/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hi': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': 'फाइल मैनेजर खोलें',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': 'अपलोड की गई फ़ाइल के लिए एक केटेगरी डिटर्माइन नहीं कर पा रहें.',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': 'डिफ़ॉल्ट वर्कस्पेस को ऐक्सेस नहीं किया जा सकता.',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': 'आपके पास तस्वीर को एडिट करने की अनुमति नहीं है.',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': 'इमेज एडिट करें',
			// A message stating that image editing is in progress.
			'Processing the edited image.': 'एडिट किए गए इमेज को प्रोसेस किया जा रहा है',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': 'सर्वर इमेज प्रोसेस करने में विफल रहा.',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': 'एडिट किए गए इमेज की श्रेणी निर्धारित करने में विफल.'
		}
	}
};

export default translations;
