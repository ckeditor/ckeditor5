/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'bn': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'বাতিল করুন',
			// Label for the Clear button.
			'Clear': 'পরিষ্কার করুন',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'রং মুছে ফেলুন',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'পূর্বাবস্থায় ফিরিয়ে আনুন',
			// Label for the Save button.
			'Save': 'সংরক্ষণ করুন',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'আরও আইটেম দেখান',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 এর %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'ফাইল আপলোড করা যাবে নাঃ',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'রিচ টেক্সট এডিটর। সম্পাদনার ক্ষেত্র: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'ফাইল ম্যানেজার দিয়ে প্রবেশ করান',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'ফাইল ম্যানেজার দিয়ে প্রতিস্থাপন করুন',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'ফাইল ম্যানেজার দিয়ে ছবি প্রবেশ করান',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'ফাইল ম্যানেজার দিয়ে ছবি প্রতিস্থাপন করুন',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'ফাইল',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'ফাইল ম্যানেজার সহ',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'টগল ক্যাপশন বন্ধ করুন',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'টগল ক্যাপশন চালু করুন',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'কনটেন্ট এডিটিংয়ের কীস্ট্রোকগুলি',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'এই কীবোর্ড শর্টকাটগুলির ফলে কনটেন্ট এডিটিংয়ের বৈশিষ্ট্যগুলির সুবিধা দ্রুত নেওয়া যায়।',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'ইউজার ইন্টারফেস এবং কনটেন্ট নেভিগেশনের কীস্ট্রোকগুলি',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'CKEditor 5 ইউজার ইন্টারফেসে আরও কার্যকর নেভিগেশনের জন্য নিম্নলিখিত কীস্ট্রোকগুলি ব্যবহার করুন।',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'কন্টেক্সচুয়াল বেলুন, ড্রপডাউন এবং ডায়ালগগুলি বন্ধ করুন',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'প্রবেশযোগ্যতার সহায়ক ডায়ালগ খুলুন',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'ফর্ম ফিল্ডের (ইনপুট, বাটন, ইত্যাদি) মধ্যে ফোকাস স্থানান্তর করুন',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'মেনু বারে ফোকাস সরিয়ে নিন, মেনু বারের মধ্যে নেভিগেট করুন',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'টুলবারে ফোকাস স্থানান্তর করুন, টুলবারগুলির মধ্যে নেভিগেট করুন',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'টুলবার বা মেনু বারের মাধ্যমে নেভিগেট করুন',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'বর্তমানে ফোকাস করা বোতামটি কার্যকর করুন। ইডিটর বিষয়বস্তুর সাথে ইন্টারঅ্যাক্ট করা বোতাম কার্যকর করা ফোকাসকে বিষয়বস্তুর দিকে ফিরিয়ে নেয়।',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'গ্রহণ করুন',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'উৎস',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'অনুচ্ছেদ',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'রং বাছাইকারী',
			// Label for the Insert button.
			'Insert': 'ঢোকান',
			// Label for the Update button.
			'Update': 'আপডেট করুন',
			// Label for the Back button.
			'Back': 'ফিরে যান',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'অনুগ্রহ করে একটি ভিন্ন শব্দগুচ্ছ চেষ্টা করুন বা বানানটি পরীক্ষা করুন।',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'টেক্সট মোড়ানো',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'টেক্সট ভেঙ্গে ফেলুন',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'কাস্টম',
			// The default label for the resize option that resets the size.
			'Original': 'মূল',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'মানটি খালি রাখা যাবে না।',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'মানটি একটি সরল সংখ্যা হতে হবে।'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
