/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editorui/accessibilityhelp/accessibilityhelp
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView, Dialog, type EditorUIReadyEvent } from '../../index.js';
import AccessibilityHelpContentView from './accessibilityhelpcontentview.js';
import { CKEditorError, getEnvKeystrokeText } from '@ckeditor/ckeditor5-utils';
import type { AddRootEvent } from '@ckeditor/ckeditor5-editor-multi-root';
import type { DowncastWriter, ViewRootEditableElement } from '@ckeditor/ckeditor5-engine';

import accessibilityIcon from '../../../theme/icons/accessibility.svg';
import '../../../theme/components/editorui/accessibilityhelp.css';

const DEFAULT_CATEGORY_ID = 'contentEditing' as const;
export const DEFAULT_GROUP_ID = 'common' as const;

/**
 * A plugin that brings the accessibility help dialog to the editor available under the <kbd>Alt</kbd>+<kbd>0</kbd>
 * keystroke and via the "Accessibility help" toolbar button. The dialog displays a list of keystrokes that can be used
 * by the user to perform various actions in the editor.
 *
 * Keystroke information is automatically obtained from loaded editor plugins via
 * {@link module:core/plugin~PluginInterface#accessibilityMetadata} getter (recommended).
 *
 * Alternatively, the same information can be registered using the available API
 * ({@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokeCategory},
 * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokeGroup}, and
 * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokes}).
 */
export default class AccessibilityHelp extends Plugin {
	/**
	 * The view that displays the dialog content (list of keystrokes).
	 * Created when the dialog is opened for the first time.
	 */
	public contentView: AccessibilityHelpContentView | null = null;

	/**
	 * Keystroke categories, groups, and descriptions obtained from {@link module:core/plugin~PluginInterface#accessibilityMetadata}
	 * or registered via plugin's API ({@link #registerKeystrokeCategory}, {@link #registerKeystrokeGroup},
	 * and {@link #registerKeystrokes}).
	 *
	 * @internal
	 */
	public keystrokes: Keystrokes = new Map();

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

		editor.ui.componentFactory.add( 'accessibilityHelp', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Accessibility help' ),
				tooltip: true,
				withText: false,
				keystroke: 'Alt+0',
				icon: accessibilityIcon
			} );

			buttonView.on( 'execute', () => this._showDialog() );

			return buttonView;
		} );

		editor.keystrokes.set( 'Alt+0', ( evt, cancel ) => {
			this._showDialog();
			cancel();
		} );

		this.registerKeystrokeCategory( {
			id: DEFAULT_CATEGORY_ID,
			label: t( 'Content editing keystrokes' ),
			description: t( 'These keyboard shortcuts allow for quick access to content editing features.' )
		} );

		this.registerKeystrokeCategory( {
			id: 'navigation',
			label: t( 'User interface and content navigation keystrokes' ),
			description: t( 'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.' ),
			groups: [
				{
					id: 'common',
					keystrokes: [
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
							label: t( 'Navigate through the toolbar' ),
							keystroke: [ [ 'arrowup' ], [ 'arrowright' ], [ 'arrowdown' ], [ 'arrowleft' ] ]
						},
						{
							label: t( 'Execute the currently focused button' ),
							keystroke: [ [ 'Enter' ], [ 'Space' ] ]
						}
					]
				}
			]
		} );

		this._setupRootLabels();
	}

	/**
	 * Registers a top-level category of keystrokes with its label and optional description.
	 *
	 * Categories organize keystrokes and help users to find the right keystroke. Each category can have multiple groups
	 * of keystrokes that narrow down the context in which the keystrokes are available. Every keystroke category comes
	 * with a `'common'` group by default.
	 *
	 * By default, two categories are registered by the `AccessibilityHelp` plugin:
	 * * `'contentEditing'` for keystrokes related to content creation,
	 * * `'navigation'` for keystrokes related to navigation in the UI and the content.
	 *
	 * See {@link #registerKeystrokeGroup} and {@link #registerKeystrokes}.
	 */
	public registerKeystrokeCategory( { id, label, description, groups }: AccessibilityHelpKeystrokeCategory ): void {
		this.keystrokes.set( id, {
			id,
			label,
			description,
			groups: new Map()
		} );

		this.registerKeystrokeGroup( {
			categoryId: id,
			id: DEFAULT_GROUP_ID
		} );

		if ( groups ) {
			groups.forEach( group => {
				this.registerKeystrokeGroup( {
					categoryId: id,
					...group
				} );
			} );
		}
	}

	/**
	 * Registers a group of keystrokes in a specific category. Groups narrow down the context in which the keystrokes are available.
	 *
	 * When `categoryId` is not specified, the group goes to the `'contentEditing'` category (default).
	 *
	 * See {@link #registerKeystrokeCategory} and {@link #registerKeystrokes}.
	 */
	public registerKeystrokeGroup( {
		categoryId = DEFAULT_CATEGORY_ID,
		id,
		label,
		keystrokes
	}: AccessibilityHelpKeystrokeGroup ): void {
		const category = this.keystrokes.get( categoryId );

		if ( !category ) {
			throw new CKEditorError( 'accessibility-help-unknown-category', this.editor, { groupId: id, categoryId } );
		}

		category.groups.set( id, {
			id,
			label,
			keystrokes: keystrokes || []
		} );
	}

	/**
	 * Registers keystrokes that will be displayed in the Accessibility help dialog.
	 *
	 * Keystrokes without specified `groupId` or `categoryId` go to the `'common'` group in the `'contentEditing'` category (default).
	 *
	 * See {@link #registerKeystrokeGroup} and {@link #registerKeystrokeCategory}.
	 */
	public registerKeystrokes( {
		categoryId = DEFAULT_CATEGORY_ID,
		groupId = DEFAULT_GROUP_ID,
		keystrokes
	}: AccessibilityHelpKeystrokes ): void {
		if ( !this.keystrokes.has( categoryId ) ) {
			/**
			 * Cannot register keystrokes in an unknown category. Use
			 * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokeCategory}
			 * to register a new category or make sure the specified category exists.
			 *
			 * @error accessibility-help-unknown-category
			 * @param categoryId The id of the unknown keystroke category.
			 * @param keystrokes Keystroke definitions about to be registered.
			 */
			throw new CKEditorError( 'accessibility-help-unknown-category', this.editor, { categoryId, keystrokes } );
		}

		const category = this.keystrokes.get( categoryId )!;

		if ( !category.groups.has( groupId ) ) {
			/**
			 * Cannot register keystrokes in an unknown group.
			 *
			 * Use {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokeGroup}
			 * to register a new group or make sure the specified group exists.
			 *
			 * @error accessibility-help-unknown-group
			 * @param groupId The id of the unknown keystroke group.
			 * @param categoryId The id of category the unknown group should belong to.
			 * @param keystrokes Keystroke definitions about to be registered.
			 */
			throw new CKEditorError( 'accessibility-help-unknown-group', this.editor, { groupId, categoryId, keystrokes } );
		}

		category.groups.get( groupId )!.keystrokes.push( ...keystrokes );
	}

	/**
	 * Registers keystrokes exposed by editor plugins.
	 */
	private _initializeKeystrokesFromPluginsMetadata() {
		const editor = this.editor;
		const categories = [];
		const groups = [];
		const keystrokes = [];

		// Gather all keystroke categories, groups, and keystrokes from plugins first.
		// This way, the order of plugins in editor#plugins will not matter and the metadata offered by plugins
		// can point to categories and groups that are not yet registered.
		for ( const [ , pluginInterface ] of editor.plugins ) {
			const metadata = pluginInterface.accessibilityMetadata;

			if ( metadata ) {
				if ( metadata.keystrokeCategories ) {
					for ( const data of metadata.keystrokeCategories ) {
						categories.push( data );
					}
				}

				if ( metadata.keystrokeGroups ) {
					for ( const data of metadata.keystrokeGroups ) {
						groups.push( data );
					}
				}

				if ( metadata.keystrokes ) {
					for ( const data of metadata.keystrokes ) {
						keystrokes.push( data );
					}
				}
			}
		}

		categories.forEach( data => this.registerKeystrokeCategory( data ) );
		groups.forEach( data => this.registerKeystrokeGroup( data ) );
		keystrokes.forEach( data => {
			if ( 'keystrokes' in data ) {
				// Keystrokes added to a specific category and/or group (advanced syntax).
				this.registerKeystrokes( data );
			} else {
				// Keystrokes added to the default category and group (simple syntax).
				this.registerKeystrokes( { keystrokes: [ data ] } );
			}
		} );
	}

	/**
	 * Injects a help text into each editing root's `aria-label` attribute allowing assistive technology users
	 * to discover the availability of the Accessibility help dialog.
	 */
	private _setupRootLabels() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const t = editor.t;

		editor.ui.on<EditorUIReadyEvent>( 'ready', () => {
			editingView.change( writer => {
				for ( const root of editingView.document.roots ) {
					addAriaLabelTextToRoot( writer, root );
				}
			} );

			editor.on<AddRootEvent>( 'addRoot', ( evt, modelRoot ) => {
				const viewRoot = editor.editing.view.document.getRoot( modelRoot.rootName )!;

				editingView.change( writer => addAriaLabelTextToRoot( writer, viewRoot ) );
			}, { priority: 'low' } );
		} );

		function addAriaLabelTextToRoot( writer: DowncastWriter, viewRoot: ViewRootEditableElement ) {
			const currentAriaLabel = viewRoot.getAttribute( 'aria-label' );
			const newAriaLabel = `${ currentAriaLabel }. ${ t( 'Press %0 for help.', [ getEnvKeystrokeText( 'Alt+0' ) ] ) }`;

			writer.setAttribute( 'aria-label', newAriaLabel, viewRoot );
		}
	}

	/**
	 * Shows the accessibility help dialog. Also, creates {@link #contentView} on demand.
	 */
	private _showDialog() {
		const editor = this.editor;
		const dialog = editor.plugins.get( 'Dialog' );
		const t = editor.locale.t;

		if ( !this.contentView ) {
			this._initializeKeystrokesFromPluginsMetadata();
			this.contentView = new AccessibilityHelpContentView( editor.locale, this.keystrokes );
		}

		dialog.show( {
			id: 'accessibilityHelp',
			className: 'ck-accessibility-help-dialog',
			title: t( 'Accessibility help' ),
			icon: accessibilityIcon,
			hasCloseButton: true,
			content: this.contentView
		} );
	}
}

/**
 * A category of keystrokes in the Accessibility help dialog. Top-level categories organize keystrokes and help users to find the
 * right keystroke. Each category can have multiple groups of keystrokes that narrow down the context in which the keystrokes are available.
 *
 * See {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokeCategory},
 * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokeGroup}, and
 * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokes}.
 */
export interface AccessibilityHelpKeystrokeCategory {

	/**
	 * The unique id of the category.
	 */
	id: string;

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
	groups?: Array<AccessibilityHelpKeystrokeGroup>;
}

/**
 * A keystroke group in the Accessibility help dialog. Groups narrow down the context in which the keystrokes are available.
 *
 * When `categoryId` is not specified, the group goes to the `'contentEditing'` category (default).
 *
 * See {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokeCategory},
 * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokeGroup}, and
 * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokes}.
 */
export interface AccessibilityHelpKeystrokeGroup {

	/**
	 * The category id the group belongs to.
	 */
	categoryId?: string;

	/**
	 * The unique id of the group.
	 */
	id: string;

	/**
	 * The label of the group (optional). It gets displayed as a header next to the list of keystrokes in the group.
	 */
	label?: string;

	/**
	 * Keystroke definitions within the group.
	 */
	keystrokes?: Array<AccessibilityHelpKeystrokeDefinition>;
}

/**
 * Keystrokes belonging to a specific category or group in the Accessibility help dialog.
 *
 * Keystrokes without specified `groupId` or `categoryId` go to the `'common'` group in the `'contentEditing'` category (default).
 *
 * See {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokeCategory},
 * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokeGroup}, and
 * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokes}.
 */
export interface AccessibilityHelpKeystrokes {

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
	keystrokes: Array<AccessibilityHelpKeystrokeDefinition>;
}

/**
 * A single keystroke definition to be displayed in the Accessibility help dialog. Used, for instance, by
 * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp#registerKeystrokes}.
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
 * Metadata for the {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp Accessibility help} plugin.
 *
 * See the {@link module:core/plugin~PluginInterface#accessibilityMetadata plugin metadata format} to learn more.
 */
export type accessibilityMetadata = {
	keystrokeCategories?: Array<AccessibilityHelpKeystrokeCategory>;
	keystrokeGroups?: Array<AccessibilityHelpKeystrokeGroup>;
	keystrokes?: Array<AccessibilityHelpKeystrokes | AccessibilityHelpKeystrokeDefinition>;
};

export type Keystrokes = Map<string, KeystrokeCategoryDefinition>;

export type KeystrokeGroupDefinition = {
	id: string;
	label?: string;
	keystrokes: Array<AccessibilityHelpKeystrokeDefinition>;
};

export type KeystrokeCategoryDefinition = {
	id: string;
	label: string;
	description?: string;
	groups: Map<string, KeystrokeGroupDefinition>;
};

