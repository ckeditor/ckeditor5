/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editorui/accessibilityhelp
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView, Dialog } from '../../src/index.js';
import AccessibilityHelpContentView from './accessibilityhelpcontentview.js';
import { CKEditorError, getEnvKeystrokeText } from '@ckeditor/ckeditor5-utils';

import '../../theme/components/editorui/accessibilityhelp.css';

const DEFAULT_CATEGORY_ID = 'contentEditing' as const;
export const DEFAULT_GROUP_ID = 'common' as const;

/**
 * A plugin that brings the accessibility help dialog to the editor available under the <kbd>Alt</kbd>+<kbd>0</kbd>
 * keystroke and via the "Accessibility help" toolbar button.
 */
export default class AccessibilityHelp extends Plugin {
	/**
	 * The view that displays the dialog content (list of keystrokes).
	 * Created when the dialog is opened for the first time.
	 */
	public contentView: AccessibilityHelpContentView | null = null;

	/**
	 * Keystroke categories, groups and descriptions registered via ({@link #registerKeystrokeCategory}) and
	 * {@link #registerKeystrokes}.
	 */
	private _keystrokes = new Map<string, AccessibilityHelpKeystrokesCategory>();

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Dialog ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'AccessibilityHelp' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.locale.t;

		this.registerKeystrokeCategory( DEFAULT_CATEGORY_ID, {
			label: t( 'Content editing keystrokes' ),
			description: t( 'These keyboard shortcuts allow for quick access to content editing features.' )
		} );

		this.registerKeystrokeCategory( 'navigation', {
			label: t( 'User interface and content navigation keystrokes' ),
			description: t( 'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.' )
		} );

		this.registerKeystrokes( {
			category: 'navigation',
			keystrokes: [
				{
					label: t( 'Close contextual balloons, dropdowns, and dialogs' ),
					keystroke: 'Esc'
				},
				{
					label: t( 'Move focus to the visible contextual balloon' ),
					keystroke: 'Tab'
				},
				{
					label: t( 'Open the accessibility help dialog' ),
					keystroke: 'Alt+0'
				},
				{
					label: t( 'Move focus between fields (inputs and buttons) in balloons and dialogs' ),
					keystroke: 'Tab'
				},
				{
					label: t( 'Move focus to the toolbar, also navigate between toolbars' ),
					keystroke: 'Alt+F10',
					mayRequireFn: true
				},
				{
					label: t( 'Navigate through the toolbar' ),
					keystroke: [ [ 'arrowup' ], [ 'arrowright' ], [ 'arrowdown' ], [ 'arrowleft' ] ]
				},
				{
					label: t( 'Execute the currently focused button' ),
					keystroke: [ [ 'Enter' ], [ 'Space' ] ]
				}
			]
		} );

		editor.ui.componentFactory.add( 'accessibilityHelp', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Accessibility help' ),
				tooltip: true,
				withText: true,
				keystroke: 'Alt+0'
				// TODO: Hide text, add icon.
			} );

			buttonView.on( 'execute', () => this._showDialog() );

			return buttonView;
		} );

		editor.keystrokes.set( 'Alt+0', () => this._showDialog() );

		this._setupRootLabels();
	}

	/**
	 * Registers a top-level category of keystrokes with its label and optional description. Categories organize
	 * keystrokes and help users to find the right keystroke. Each category can have multiple groups of keystrokes
	 * that narrow down the context in which the keystrokes are available. Every keystroke category comes with a
	 * `'common'` group by default.
	 *
	 * By default, two categories are registered by the `AccessibilityHelp` plugin: `'contentEditing'` and `'navigation'`.
	 *
	 * You can add keystrokes to categories using {@link #registerKeystrokes} method.
	 */
	public registerKeystrokeCategory( categoryId: string, definition: { label: string; description?: string } ): void {
		this._keystrokes.set( categoryId, {
			...definition,
			groups: new Map( [ [ DEFAULT_GROUP_ID, { keystrokes: [] } ] ] )
		} );
	}

	/**
	 * Registers keystrokes that will be displayed in the Accessibility help dialog.
	 *
	 * To simply register a single keystroke:
	 *
	 * ```js
	 * const t = editor.t;
	 * editor.plugins.get( 'AccessibilityHelp' ).registerKeystrokes( {
	 * 	label: t( 'Bold text' ),
	 * 	keystroke: 'CTRL+B'
	 * } );
	 * ```
	 *
	 * Please note that by default:
	 * * two categories are registered by the `AccessibilityHelp` plugin: `'contentEditing'` and `'navigation'`,
	 * * keystrokes are registered into the `'contentEditing'` category and the `'common'` keystroke group within that category.
	 *
	 * To register a keystroke in a specific group in the `'contentEditing'` category:
	 *
	 * ```js
	 * const t = editor.t;
	 *
	 * editor.plugins.get( 'AccessibilityHelp' ).registerKeystrokes( {
	 * 	// Add keystrokes to the "widget" group. If the group does not exist, it will be created.
	 * 	group: 'widget',
	 * 	// When creating a new group, you can provide its label.
	 * 	label: t( 'Keystrokes that can be used when a widget is selected' ),
	 * 	groupLabel: t( 'Keystrokes that can be used when a widget is selected' ),
	 * 	keystrokes: [
	 * 		{
	 * 			label: t( 'Insert a new paragraph directly after a widget' ),
	 * 			keystroke: 'Enter'
	 * 		},
	 * 		{
	 * 			label: t( 'Insert a new paragraph directly before a widget' ),
	 * 			keystroke: 'Shift+Enter'
	 * 		}
	 * 	]
	 * } );
	 *```
	 *
	 * You can add more keystroke categories using {@link #registerKeystrokeCategory} method. To add the keystrokes to the
	 * `'navigation'` category:
	 *
	 * ```js
	 * this.registerKeystrokes( {
	 * 	category: 'navigation',
	 * 	keystrokes: [
	 * 		{
	 * 			label: t( 'Close contextual balloons, dropdowns, and dialogs' ),
	 * 			keystroke: 'Esc'
	 * 		},
	 * 		{
	 * 			label: t( 'Move focus to the visible contextual balloon' ),
	 * 			keystroke: 'Tab'
	 * 		}
	 * 	]
	 * } );
	 * ```
	 */
	public registerKeystrokes( optionsOrDefinitions:
		AccessibilityHelpRegisterKeystrokesOptions |
		AccessibilityHelpKeystrokeDefinition |
		Array<AccessibilityHelpKeystrokeDefinition>
	): void {
		if ( Array.isArray( optionsOrDefinitions ) ) {
			optionsOrDefinitions = {
				keystrokes: optionsOrDefinitions
			};
		} else if ( 'keystroke' in optionsOrDefinitions ) {
			optionsOrDefinitions = {
				keystrokes: [ optionsOrDefinitions ]
			};
		}

		const categoryId = optionsOrDefinitions.category || DEFAULT_CATEGORY_ID;

		if ( !this._keystrokes.has( categoryId ) ) {
			/**
			 * Cannot register keystrokes in an unknown category. Use
			 * {@link module:ui/editorui/accessibilityhelp~AccessibilityHelp#registerKeystrokeCategory}
			 * to register a new category or make sure the specified category exists.
			 *
			 * @error accessibility-help-unknown-category
			 * @param categoryId The id of the unknown keystroke category.
			 */
			throw new CKEditorError( 'accessibility-help-unknown-category', { categoryId } );
		}

		const category = this._keystrokes.get( categoryId )!;
		const groupId = optionsOrDefinitions.group || DEFAULT_GROUP_ID;

		if ( !category.groups.has( groupId ) && !optionsOrDefinitions.groupLabel ) {
			/**
			 * Cannot register keystrokes in an unknown group.
			 *
			 * * If you want to create a new group, make sure you pass the `groupLabel` option to the
			 * {@link module:ui/editorui/accessibilityhelp~AccessibilityHelp#registerKeystrokes} method.
			 * * If you want to add keystrokes to an existing group, make sure it exists.
			 *
			 * @error accessibility-help-unknown-group
			 * @param groupId The id of the unknown keystroke group.
			 * @param categoryId The id of category the unknown group should belong to.
			 */
			throw new CKEditorError( 'accessibility-help-unknown-group', { groupId, categoryId } );
		} else if ( optionsOrDefinitions.groupLabel ) {
			category.groups.set( groupId, {
				label: optionsOrDefinitions.groupLabel,
				keystrokes: optionsOrDefinitions.keystrokes
			} );
		} else {
			category.groups.get( groupId )!.keystrokes.push( ...optionsOrDefinitions.keystrokes );
		}
	}

	/**
	 * Injects a help text into each editing root's `aria-label` attribute allowing assistive technology users
	 * to discover the availability of the Accessibility help dialog.
	 */
	private _setupRootLabels() {
		const editor = this.editor;
		const t = editor.t;

		editor.on( 'ready', () => {
			editor.editing.view.change( writer => {
				for ( const rootName of editor.model.document.getRootNames() ) {
					const viewRoot = editor.editing.view.document.getRoot( rootName );
					const currentAriaLabel = viewRoot!.getAttribute( 'aria-label' );

					writer.setAttribute(
						'aria-label',
						`${ currentAriaLabel }. ${ t( 'Press %0 for help.', [ getEnvKeystrokeText( 'Alt+0' ) ] ) }`,
						viewRoot!
					);
				}
			} );
		} );
	}

	/**
	 * Shows the accessibility help dialog. Also, creates {@link #contentView} on demand.
	 */
	private _showDialog() {
		const editor = this.editor;
		const dialog = editor.plugins.get( 'Dialog' );
		const t = editor.locale.t;

		if ( !this.contentView ) {
			this.contentView = new AccessibilityHelpContentView( editor.locale, this._keystrokes );
		}

		dialog.show( {
			id: 'accessibilityHelp',
			className: 'ck-accessibility-help-dialog',
			title: t( 'Accessibility help' ),
			hasCloseButton: true,
			content: this.contentView
		} );
	}
}

/**
 * A category of keystrokes. Top-level categories organize keystrokes and help users to find the right keystroke.
 * Each category can have multiple groups of keystrokes that narrow down the context in which the keystrokes are available.
 *
 * @internal
 */
export interface AccessibilityHelpKeystrokesCategory {

	/**
	 * The label of the category. It gets displayed as a header in the Accessibility help dialog.
	 */
	label: string;

	/**
	 * The description of the category (optional). It gets displayed as a paragraph of text next to the category keystrokes
	 * in the Accessibility help dialog.
	 */
	description?: string;

	/**
	 * Groups of keystrokes within the category.
	 */
	groups: Map<string, AccessibilityHelpKeystrokeGroupDefinition>;
}

/**
 * A sub-category of keystrokes. Groups narrow down the context in which the keystrokes are available.
 *
 * @internal
 */
export interface AccessibilityHelpKeystrokeGroupDefinition {

	/**
	 * The label of the group (optional). It gets displayed as a header next to the list of keystrokes in the group.
	 */
	label?: string;

	/**
	 * Keystrokes within the group.
	 */
	keystrokes: Array<AccessibilityHelpKeystrokeDefinition>;
}

/**
 * A single keystroke definition to be displayed in the Accessibility help dialog. Used by
 * {@link module:ui/editorui/accessibilityhelp~AccessibilityHelp#registerKeystrokes}.
 */
export interface AccessibilityHelpKeystrokeDefinition {

	/**
	 * The label of the keystroke. It should briefly describe the action that the keystroke performs. It may contain HTML.
	 */
	label: string;

	/**
	 * The keystroke string. In its basic form, it must be a combination of {@link module:utils/keyboard#keyCodes known key names}
	 * joined by the `+` sign, just like in the keystroke format accepted by the
	 * {@link module:utils/keystrokehandler~KeystrokeHandler#set `KeystrokeHandler#set()`} method used to register most of the
	 * keystrokes in the editor.
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
	 * information will be displayed next to the keystroke in the Accessibility help dialog.
	 */
	mayRequireFn?: boolean;
}

/**
 * Options of the {@link module:ui/editorui/accessibilityhelp~AccessibilityHelp#registerKeystrokes} method.
 */
export interface AccessibilityHelpRegisterKeystrokesOptions {
	category?: string;
	group?: string;
	groupLabel?: string;
	keystrokes: Array<AccessibilityHelpKeystrokeDefinition>;
}
