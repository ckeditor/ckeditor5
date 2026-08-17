/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fr': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Annuler',
			// Label for the Clear button.
			'Clear': 'Effacer',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Enlever la couleur',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Restaurer par défaut',
			// Label for the Save button.
			'Save': 'Enregistrer',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Montrer plus d\'éléments',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 sur %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Envoi du fichier échoué :',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Éditeur de texte enrichi. Zone d\'édition : %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Insérer avec le gestionnaire de fichiers',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Remplacer avec le gestionnaire de fichiers',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Insérer une image avec le gestionnaire de fichiers',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Remplacer l\'image avec le gestionnaire de fichiers',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Fichier',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Avec le gestionnaire de fichiers',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Désactiver la légende',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Activer la légende',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Touches d\'édition de contenu',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Ces raccourcis clavier permettent un accès rapide aux fonctionnalités d\'édition de contenu.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Interface utilisateur et frappes de navigation dans le contenu',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Utilisez les touches suivantes pour une navigation plus efficace dans l\'interface utilisateur de CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Fermer les bulles contextuelles, les listes déroulantes et les boîtes de dialogue',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Ouvrir la boîte de dialogue d\'aide sur l\'accessibilité',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Déplacer le focus entre les champs du formulaire (saisies, boutons, etc.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Déplacer le focus sur la barre du menu, naviguer entre les barres de menu',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Déplacez le focus sur la barre d\'outils, naviguez entre les barres d\'outils',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Naviguer sur la barre d\'outils ou la barre de menu',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Exécuter le bouton sur lequel se trouve le focus. L\'exécution de boutons qui interagissent avec le contenu de l\'éditeur ramène le focus sur le contenu.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Accepter',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Source',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Paragraphe',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Pipette à couleurs',
			// Label for the Insert button.
			'Insert': 'Insérer',
			// Label for the Update button.
			'Update': 'Mettre à jour',
			// Label for the Back button.
			'Back': 'Retour',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Veuillez essayer une autre phrase ou vérifier l\'orthographe.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Retour à la ligne',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Saut de ligne',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Personnalisé',
			// The default label for the resize option that resets the size.
			'Original': 'Taille originale',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'La valeur ne doit pas être vide.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'La valeur doit être un nombre simple.'
		},
		getPluralForm: ( n: number ) => (n <= -2 || n >= 2)
	}
};

export default translations;
