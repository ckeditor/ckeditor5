/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/accessibility
 */

import { CKEditorError } from '@ckeditor/ckeditor5-utils';
import type Editor from './editor/editor.js';

const DEFAULT_CATEGORY_ID = 'contentEditing' as const;
export const DEFAULT_GROUP_ID = 'common' as const;

/**
 * A common namespace for various accessibility features of the editor.
 *
 * **Information about editor keystrokes**
 *
 * * The information about keystrokes available in the editor is stored in the {@link #keystrokeInfos} property.
 * * New info entries can be added using the {@link #addKeystrokeInfoCategory}, {@link #addKeystrokeInfoGroup},
 * and {@link #addKeystrokeInfos} methods.
 */
export default class Accessibility {
	/**
	 * Stores information about keystrokes brought by editor features for the users to interact with the editor, mainly
	 * keystroke combinations and their accessible labels.
	 *
	 * This information is particularly useful for screen reader and other assistive technology users. It gets displayed
	 * by the {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp Accessibility help} dialog.
	 *
	 * Keystrokes are organized in categories and groups. They can be added using ({@link #addKeystrokeInfoCategory},
	 * {@link #addKeystrokeInfoGroup}, and {@link #addKeystrokeInfos}) methods.
	 *
	 * Please note that:
	 * * two categories are always available:
	 *   * `'contentEditing'` for keystrokes related to content creation,
	 *   * `'navigation'` for keystrokes related to navigation in the UI and the content.
	 * * unless specified otherwise, new keystrokes are added into the `'contentEditing'` category and the `'common'`
	 * keystroke group within that category while using the {@link #addKeystrokeInfos} method.
	 */
	public readonly keystrokeInfos: KeystrokeInfos = new Map();

	/**
	 * The editor instance.
	 */
	private readonly _editor: Editor;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		this._editor = editor;
		const isMenuBarVisible = editor.config.get( 'menuBar.isVisible' );

		const t = editor.locale.t;

		this.addKeystrokeInfoCategory( {
			id: DEFAULT_CATEGORY_ID,
			label: t( 'Content editing keystrokes' ),
			description: t( 'These keyboard shortcuts allow for quick access to content editing features.' )
		} );

		const navigationKeystrokes = [
			{
				label: t( 'Close contextual balloons, dropdowns, and dialogs' ),
				keystroke: 'Esc'
			},
			{
				label: t( 'Open the accessibility help dialog' ),
				keystroke: 'Alt+0'
			},
			{
				label: t( 'Move focus between form fields (inputs, buttons, etc.)' ),
				keystroke: [ [ 'Tab' ], [ 'Shift+Tab' ] ]
			},
			{
				label: t( 'Move focus to the toolbar, navigate between toolbars' ),
				keystroke: 'Alt+F10',
				mayRequireFn: true
			},
			{
				label: t( 'Navigate through the toolbar or menu bar' ),
				keystroke: [ [ 'arrowup' ], [ 'arrowright' ], [ 'arrowdown' ], [ 'arrowleft' ] ]
			},
			{
				// eslint-disable-next-line @stylistic/max-len
				label: t( 'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.' ),
				keystroke: [ [ 'Enter' ], [ 'Space' ] ]
			}
		];

		if ( isMenuBarVisible ) {
			navigationKeystrokes.push(
				{
					label: t( 'Move focus to the menu bar, navigate between menu bars' ),
					keystroke: 'Alt+F9',
					mayRequireFn: true
				}
			);
		}

		this.addKeystrokeInfoCategory( {
			id: 'navigation',
			label: t( 'User interface and content navigation keystrokes' ),
			description: t( 'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.' ),
			groups: [
				{
					id: 'common',
					keystrokes: navigationKeystrokes
				}
			]
		} );
	}

	/**
	 * Adds a top-level category in the {@link #keystrokeInfos keystroke information database} with a label and optional description.
	 *
	 * Categories organize keystrokes and help users to find the right keystroke. Each category can have multiple groups
	 * of keystrokes that narrow down the context in which the keystrokes are available. Every keystroke category comes
	 * with a `'common'` group by default.
	 *
	 * By default, two categories are available:
	 * * `'contentEditing'` for keystrokes related to content creation,
	 * * `'navigation'` for keystrokes related to navigation in the UI and the content.
	 *
	 * To create a new keystroke category with new groups, use the following code:
	 *
	 * ```js
	 * class MyPlugin extends Plugin {
	 * 	// ...
	 * 	init() {
	 * 		const editor = this.editor;
	 * 		const t = editor.t;
	 *
	 * 		// ...
	 *
	 * 		editor.accessibility.addKeystrokeInfoCategory( {
	 * 			id: 'myCategory',
	 * 			label: t( 'My category' ),
	 * 			description: t( 'My category description.' ),
	 * 			groups: [
	 * 				{
	 * 					id: 'myGroup',
	 * 					label: t( 'My keystroke group' ),
	 * 					keystrokes: [
	 * 						{
	 * 							label: t( 'Keystroke label 1' ),
	 * 							keystroke: 'Ctrl+Shift+N'
	 * 						},
	 * 						{
	 * 							label: t( 'Keystroke label 2' ),
	 * 							keystroke: 'Ctrl+Shift+M'
	 * 						}
	 * 					]
	 * 				}
	 * 			]
	 * 		};
	 * 	}
	 * }
	 * ```
	 *
	 * See {@link #keystrokeInfos}, {@link #addKeystrokeInfoGroup}, and {@link #addKeystrokeInfos}.
	 */
	public addKeystrokeInfoCategory( { id, label, description, groups }: AddKeystrokeInfoCategoryData ): void {
		this.keystrokeInfos.set( id, {
			id,
			label,
			description,
			groups: new Map()
		} );

		this.addKeystrokeInfoGroup( {
			categoryId: id,
			id: DEFAULT_GROUP_ID
		} );

		if ( groups ) {
			groups.forEach( group => {
				this.addKeystrokeInfoGroup( {
					categoryId: id,
					...group
				} );
			} );
		}
	}

	/**
	 * Adds a group of keystrokes in a specific category to the {@link #keystrokeInfos keystroke information database}.
	 *
	 * Groups narrow down the context in which the keystrokes are available. When `categoryId` is not specified,
	 * the group goes to the `'contentEditing'` category (default).
	 *
	 * To create a new group within an existing category, use the following code:
	 *
	 * ```js
	 * class MyPlugin extends Plugin {
	 * 	// ...
	 * 	init() {
	 * 		const editor = this.editor;
	 * 		const t = editor.t;
	 *
	 * 		// ...
	 *
	 * 		editor.accessibility.addKeystrokeInfoGroup( {
	 * 			id: 'myGroup',
	 * 			categoryId: 'navigation',
	 * 			label: t( 'My keystroke group' ),
	 * 			keystrokes: [
	 * 				{
	 * 					label: t( 'Keystroke label 1' ),
	 * 					keystroke: 'Ctrl+Shift+N'
	 * 				},
	 * 				{
	 * 					label: t( 'Keystroke label 2' ),
	 * 					keystroke: 'Ctrl+Shift+M'
	 * 				}
	 * 			]
	 * 		} );
	 * 	}
	 * }
	 * ```
	 *
	 * See {@link #keystrokeInfos}, {@link #addKeystrokeInfoCategory}, and {@link #addKeystrokeInfos}.
	 */
	public addKeystrokeInfoGroup( {
		categoryId = DEFAULT_CATEGORY_ID,
		id,
		label,
		keystrokes
	}: AddKeystrokeInfoGroupData ): void {
		const category = this.keystrokeInfos.get( categoryId );

		if ( !category ) {
			throw new CKEditorError( 'accessibility-unknown-keystroke-info-category', this._editor, { groupId: id, categoryId } );
		}

		category.groups.set( id, {
			id,
			label,
			keystrokes: keystrokes || []
		} );
	}

	/**
	 * Adds information about keystrokes to the {@link #keystrokeInfos keystroke information database}.
	 *
	 * Keystrokes without specified `groupId` or `categoryId` go to the `'common'` group in the `'contentEditing'` category (default).
	 *
	 * To add a keystroke brought by your plugin (using default group and category), use the following code:
	 *
	 * ```js
	 * class MyPlugin extends Plugin {
	 * 	// ...
	 * 	init() {
	 * 		const editor = this.editor;
	 * 		const t = editor.t;
	 *
	 * 		// ...
	 *
	 * 		editor.accessibility.addKeystrokeInfos( {
	 * 			keystrokes: [
	 * 				{
	 * 					label: t( 'Keystroke label' ),
	 * 					keystroke: 'CTRL+B'
	 * 				}
	 * 			]
	 * 		} );
	 * 	}
	 * }
	 * ```
	 * To add a keystroke in a specific existing `'widget'` group in the default `'contentEditing'` category:
	 *
	 * ```js
	 * class MyPlugin extends Plugin {
	 * 	// ...
	 * 	init() {
	 * 		const editor = this.editor;
	 * 		const t = editor.t;
	 *
	 * 		// ...
	 *
	 * 		editor.accessibility.addKeystrokeInfos( {
	 * 			// Add a keystroke to the existing "widget" group.
	 * 			groupId: 'widget',
	 * 			keystrokes: [
	 * 				{
	 * 					label: t( 'A an action on a selected widget' ),
	 * 					keystroke: 'Ctrl+D',
	 * 				}
	 * 			]
	 * 		} );
	 * 	}
	 * }
	 * ```
	 *
	 * To add a keystroke to another existing category (using default group):
	 *
	 * ```js
	 * class MyPlugin extends Plugin {
	 * 	// ...
	 * 	init() {
	 * 		const editor = this.editor;
	 * 		const t = editor.t;
	 *
	 * 		// ...
	 *
	 * 		editor.accessibility.addKeystrokeInfos( {
	 * 			// Add keystrokes to the "navigation" category (one of defaults).
	 * 			categoryId: 'navigation',
	 * 			keystrokes: [
	 * 				{
	 * 					label: t( 'Keystroke label' ),
	 * 					keystroke: 'CTRL+B'
	 * 				}
	 * 			]
	 * 		} );
	 * 	}
	 * }
	 * ```
	 *
	 * See {@link #keystrokeInfos}, {@link #addKeystrokeInfoGroup}, and {@link #addKeystrokeInfoCategory}.
	 */
	public addKeystrokeInfos( {
		categoryId = DEFAULT_CATEGORY_ID,
		groupId = DEFAULT_GROUP_ID,
		keystrokes
	}: AddKeystrokeInfosData ): void {
		if ( !this.keystrokeInfos.has( categoryId ) ) {
			/**
			 * Cannot add keystrokes in an unknown category. Use
			 * {@link module:core/accessibility~Accessibility#addKeystrokeInfoCategory}
			 * to add a new category or make sure the specified category exists.
			 *
			 * @error accessibility-unknown-keystroke-info-category
			 * @param {string} categoryId The id of the unknown keystroke category.
			 * @param {module:core/accessibility~AddKeystrokeInfosData#keystrokes} keystrokes Keystroke definitions about to be added.
			 */
			throw new CKEditorError( 'accessibility-unknown-keystroke-info-category', this._editor, { categoryId, keystrokes } );
		}

		const category = this.keystrokeInfos.get( categoryId )!;

		if ( !category.groups.has( groupId ) ) {
			/**
			 * Cannot add keystrokes to an unknown group.
			 *
			 * Use {@link module:core/accessibility~Accessibility#addKeystrokeInfoGroup}
			 * to add a new group or make sure the specified group exists.
			 *
			 * @error accessibility-unknown-keystroke-info-group
			 * @param {string} groupId The id of the unknown keystroke group.
			 * @param {string} categoryId The id of category the unknown group should belong to.
			 * @param {module:core/accessibility~AddKeystrokeInfosData#keystrokes} keystrokes Keystroke definitions about to be added.
			 */
			throw new CKEditorError( 'accessibility-unknown-keystroke-info-group', this._editor, { groupId, categoryId, keystrokes } );
		}

		category.groups.get( groupId )!.keystrokes.push( ...keystrokes );
	}
}

/**
 * A description of category of keystrokes accepted by the {@link module:core/accessibility~Accessibility#addKeystrokeInfoCategory} method.
 *
 * Top-level categories organize keystrokes and help users to find the right keystroke. Each category can have multiple groups of
 * keystrokes that narrow down the context in which the keystrokes are available.
 *
 * See {@link module:core/accessibility~Accessibility#addKeystrokeInfoGroup} and
 * {@link module:core/accessibility~Accessibility#addKeystrokeInfos}.
 */
export interface AddKeystrokeInfoCategoryData {

	/**
	 * The unique id of the category.
	 */
	id: string;

	/**
	 * The label of the category.
	 */
	label: string;

	/**
	 * The description of the category (optional).
	 */
	description?: string;

	/**
	 * Groups of keystrokes within the category.
	 */
	groups?: Array<AddKeystrokeInfoGroupData>;
}

/**
 * A description of keystroke group accepted by the {@link module:core/accessibility~Accessibility#addKeystrokeInfoGroup} method.
 *
 * Groups narrow down the context in which the keystrokes are available. When `categoryId` is not specified, the group goes
 * to the `'contentEditing'` category (default).
 *
 * See {@link module:core/accessibility~Accessibility#addKeystrokeInfoCategory} and
 * {@link module:core/accessibility~Accessibility#addKeystrokeInfos}.
 */
export interface AddKeystrokeInfoGroupData {

	/**
	 * The category id the group belongs to.
	 */
	categoryId?: string;

	/**
	 * The unique id of the group.
	 */
	id: string;

	/**
	 * The label of the group (optional).
	 */
	label?: string;

	/**
	 * Keystroke definitions within the group.
	 */
	keystrokes?: Array<KeystrokeInfoDefinition>;
}

/**
 * Description of keystrokes accepted by the {@link module:core/accessibility~Accessibility#addKeystrokeInfos} method.
 *
 * Keystrokes without specified `groupId` or `categoryId` go to the `'common'` group in the `'contentEditing'` category (default).
 *
 * See {@link module:core/accessibility~Accessibility#addKeystrokeInfoCategory} and
 * {@link module:core/accessibility~Accessibility#addKeystrokeInfoGroup}.
 */
export interface AddKeystrokeInfosData {

	/**
	 * The category id the keystrokes belong to.
	 */
	categoryId?: string;

	/**
	 * The group id the keystrokes belong to.
	 */
	groupId?: string;

	/**
	 * An array of keystroke definitions.
	 */
	keystrokes: Array<KeystrokeInfoDefinition>;
}

export type KeystrokeInfos = Map<string, KeystrokeInfoCategory>;

/**
 * A category of keystrokes in {@link module:core/accessibility~Accessibility#keystrokeInfos}.
 */
export type KeystrokeInfoCategory = {

	/**
	 * The unique id of the category.
	 */
	id: string;

	/**
	 * The label of the category.
	 */
	label: string;

	/**
	 * The description of the category (optional).
	 */
	description?: string;

	/**
	 * Groups of keystrokes within the category.
	 */
	groups: Map<string, KeystrokeInfoGroup>;
};

/**
 * A group of keystrokes in {@link module:core/accessibility~Accessibility#keystrokeInfos}.
 */
export type KeystrokeInfoGroup = {

	/**
	 * The unique id of the group.
	 */
	id: string;

	/**
	 * The label of the group (optional).
	 */
	label?: string;

	/**
	 * Keystroke definitions within the group.
	 */
	keystrokes: Array<KeystrokeInfoDefinition>;
};

/**
 * A keystroke info definition in {@link module:core/accessibility~Accessibility#keystrokeInfos}
 */
export interface KeystrokeInfoDefinition {

	/**
	 * The label of the keystroke. It should briefly describe the action that the keystroke performs. It may contain HTML.
	 */
	label: string;

	/**
	 * The keystroke string. In its basic form, it must be a combination of {@link module:utils/keyboard#keyCodes known key names}
	 * joined by the `+` sign, the same as the keystroke format accepted by the
	 * {@link module:utils/keystrokehandler~KeystrokeHandler#set `KeystrokeHandler#set()`} method used to register most of the
	 * keystroke interactions in the editor.
	 *
	 * * The keystroke string can represent a single keystroke, for instance: `keystroke: 'Ctrl+B'`, `keystroke: 'Shift+Enter'`,
	 * `keystroke: 'Alt+F10'`, etc.
	 * * The keystroke can be activated by successive press of multiple keys. For instance `keystroke: [ [ 'arrowleft', 'arrowleft' ] ]`
	 * will indicate that a specific action will be performed by pressing <kbd>←</kbd> twice in a row.
	 * * Keystrokes can have alternatives. For instance `keystroke: [ [ 'Ctrl+Y' ], [ 'Ctrl+Shift+Z' ] ]` will indicate that
	 * a specific action can be performed by pressing either <kbd>Ctrl</kbd> + <kbd>Y</kbd> or
	 * <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd>.
	 *
	 * Please note that the keystrokes are automatically translated to the environment-specific form. For example, `Ctrl+A`
	 * will be rendered as `⌘A` in the {@link module:utils/env~EnvType#isMac Mac environment}. Always use the IBM PC keyboard
	 * syntax, for instance `Ctrl` instead of `⌘`, `Alt` instead of `⌥`, etc.
	 */
	keystroke: string | Array<string> | Array<Array<string>>;

	/**
	 * This (optional) flag suggests that the keystroke(s) may require a function (<kbd>Fn</kbd>) key to be pressed
	 * in order to work in the {@link module:utils/env~EnvType#isMac Mac environment}. If set `true`, an additional
	 * information will be displayed next to the keystroke.
	 */
	mayRequireFn?: boolean;
}
