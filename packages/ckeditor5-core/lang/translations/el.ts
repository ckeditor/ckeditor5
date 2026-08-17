/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'el': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Ακύρωση',
			// Label for the Clear button.
			'Clear': 'Καθαρισμός',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Απομάκρυνση χρώματος',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Επαναφορά προεπιλογής',
			// Label for the Save button.
			'Save': 'Αποθήκευση',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Προβολή περισσότερων αντικειμένων',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 από %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Αδύνατη η αποστολή του αρχείου:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Πρόγραμμα επεξεργασίας εμπλουτισμένου κειμένου. Περιοχή επεξεργασίας: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Εισαγωγή με τη διαχείριση αρχείων',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Αντικατάσταση με τη διαχείριση αρχείων',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Εισαγωγή εικόνας με τη διαχείριση αρχείων',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Αντικατάσταση εικόνας με τη διαχείριση αρχείων',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Αρχείο',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Με διαχειριστή φακέλων',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Εναλλαγή απόκρυψης λεζάντας',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Εναλλαγής εμφάνισης λεζάντας',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Πλήκτρα επεξεργασίας περιεχομένου',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Αυτές οι συντομεύσεις πληκτρολογίου επιτρέπουν τη γρήγορη πρόσβαση σε λειτουργίες επεξεργασίας περιεχομένου.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Πλήκτρα για πλοήγηση  στο περιβάλλον εργασίας χρήστη και στο περιεχόμενο',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Χρησιμοποιήστε τα ακόλουθα πλήκτρα για πιο αποτελεσματική πλοήγηση στο περιβάλλον εργασίας χρήστη του CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Κλείσιμο παραθύρων σχολίων, αναπτυσσόμενων μενού και παραθύρων διαλόγου',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Άνοιγμα του παραθύρου διαλόγου βοήθειας προσβασιμότητας',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Μετακίνηση της εστίασης μεταξύ των πεδίων φόρμας (εισαγωγές, κουμπιά, κ.λπ.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Μετακίνηση της εστίασης στη γραμμή μενού, πλοήγηση μεταξύ των γραμμών μενού',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Μετακίνηση της εστίασης στη γραμμή εργαλείων, πλοήγηση μεταξύ των γραμμών εργαλείων',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Πλοήγηση μέσω της γραμμής εργαλείων ή της γραμμής μενού',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Εκτέλεση του τρέχοντος εστιασμένου κουμπιού. Η εκτέλεση κουμπιών που αλληλεπιδρούν με το περιεχόμενο του συντάκτη μετακινεί την εστίαση πίσω στο περιεχόμενο.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Αποδοχή',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Πηγή',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Παράγραφος',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Επιλογέας χρώματος',
			// Label for the Insert button.
			'Insert': 'Εισαγωγή',
			// Label for the Update button.
			'Update': 'Ενημέρωση',
			// Label for the Back button.
			'Back': 'Πίσω',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Παρακαλούμε δοκιμάστε μια διαφορετική φράση ή ελέγξτε την ορθογραφία.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Αναδίπλωση κειμένου',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Κατάτμηση κειμένου',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Προσαρμοσμένο',
			// The default label for the resize option that resets the size.
			'Original': 'Αρχικό',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Η τιμή δεν μπορεί να είναι κενή.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Η τιμή θα πρέπει να είναι ένας απλός αριθμός.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
