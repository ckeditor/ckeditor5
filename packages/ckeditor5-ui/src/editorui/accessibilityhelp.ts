/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView, Dialog } from '../../src/index.js';
import AccessibilityHelpContentView from './accessibilityhelpcontentview.js';
import { getEnvKeystrokeText } from '@ckeditor/ckeditor5-utils';

import '../../theme/components/editorui/accessibilityhelp.css';

const DEFAULT_CATEGORY_ID = 'contentEditing' as const;
export const DEFAULT_GROUP_ID = 'common' as const;

// TODO: Maybe just help? This could be more than just a11y shortcuts. For instance, editor version,
// installed plugins, etc.
export default class AccessibilityHelp extends Plugin {
	/**
	 * TODO
	 */
	private _dialogContentView: AccessibilityHelpContentView | null = null;

	/**
	 * TODO
	 */
	private _keystrokeDefinitions: Array<KeystrokeDefinition> = [];

	/**
	 * TODO
	 */
	private _keystrokes = new Map<string, KeystrokesCategory>();

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
	 * @inheritdoc
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
	 * TODO
	 */
	public registerKeystrokeCategory( categoryId: string, definition: { label: string; description?: string } ): void {
		this._keystrokes.set( categoryId, {
			...definition,
			keystrokeGroups: new Map( [ [ DEFAULT_GROUP_ID, { keystrokes: [] } ] ] )
		} );
	}

	/**
	 * TODO
	 */
	public registerKeystrokes( definition: {
		category?: string;
		group?: string;
		groupLabel?: string;
		keystrokes: Array<KeystrokeDefinition>;
	} | Array<KeystrokeDefinition> | KeystrokeDefinition ): void {
		if ( definition instanceof Array ) {
			definition = {
				keystrokes: definition
			};
		} else if ( typeof definition === 'object' && 'keystroke' in definition ) {
			definition = {
				keystrokes: [ definition ]
			};
		}

		const categoryId = definition.category || DEFAULT_CATEGORY_ID;

		if ( !this._keystrokes.has( categoryId ) ) {
			throw new Error( `Cannot register keystrokes for unknown category: "${ categoryId }".` );
		}

		const category = this._keystrokes.get( categoryId )!;
		const groupId = definition.group || DEFAULT_GROUP_ID;

		if ( !category.keystrokeGroups.has( groupId ) && !definition.groupLabel ) {
			throw new Error( `Cannot register keystrokes for unknown group: "${ groupId }".` );
		} else if ( definition.groupLabel ) {
			category.keystrokeGroups.set( groupId, {
				label: definition.groupLabel,
				keystrokes: definition.keystrokes
			} );
		} else {
			category.keystrokeGroups.get( groupId )!.keystrokes.push( ...definition.keystrokes );
		}
	}

	/**
	 * TODO
	 */
	private _setupRootLabels() {
		const editor = this.editor;

		editor.on( 'ready', () => {
			editor.editing.view.change( writer => {
				for ( const rootName of editor.model.document.getRootNames() ) {
					const viewRoot = editor.editing.view.document.getRoot( rootName );
					const currentAriaLabel = viewRoot!.getAttribute( 'aria-label' );

					writer.setAttribute( 'aria-label',
						`${ currentAriaLabel }. Press ${ getEnvKeystrokeText( 'Alt+0' ) } for help.`, viewRoot!
					);
				}
			} );
		} );
	}

	/**
	 * @inheritdoc
	 */
	private _showDialog() {
		const editor = this.editor;
		const dialog = editor.plugins.get( 'Dialog' );
		const t = editor.locale.t;

		if ( !this._dialogContentView ) {
			this._dialogContentView = new AccessibilityHelpContentView( editor.locale, this._keystrokes );
		}

		dialog.show( {
			id: 'accessibilityHelp',
			title: t( 'Accessibility help' ),
			hasCloseButton: true,
			content: this._dialogContentView
		} );
	}
}

export interface KeystrokesCategory {
	label: string;
	description?: string;
	keystrokeGroups: Map<string, KeystrokeGroupDefinition>;
}

export interface KeystrokeGroupDefinition {
	label?: string;
	keystrokes: Array<KeystrokeDefinition>;
}

export interface KeystrokeDefinition {
	label: string;
	keystroke: string | Array<string> | Array<Array<string>>;
	mayRequireFn?: boolean;
}
