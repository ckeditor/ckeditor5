/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView, Dialog } from '../../src/index.js';
import AccessibilityHelpContentView from './accessibilityhelpcontentview.js';
import { getEnvKeystrokeText } from '@ckeditor/ckeditor5-utils';

import '../../theme/components/editorui/accessibilityhelp.css';

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
	public registerKeystroke( definition: KeystrokeDefinition ): void {
		this._keystrokeDefinitions.push( definition );
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
			this._dialogContentView = new AccessibilityHelpContentView(
				editor.locale,
				this._keystrokeDefinitions,
				// TODO: This is private API.
				Array.from( editor.plugins._availablePlugins.keys() ),
				JSON.stringify(
					Object.fromEntries( Array.from( editor.config.names() ).map( name => [ name, editor.config.get( name ) ] ) ),
					( key, value ) => {
						if ( typeof value === 'function' ) {
							return 'Function';
						}

						if ( value instanceof RegExp ) {
							return value.toString();
						}

						return value;
					},
					'\t'
				)
			);
		}

		dialog.show( {
			title: t( 'Accessibility help' ),
			hasCloseButton: true,
			content: this._dialogContentView
		} );
	}
}

export interface KeystrokeDefinition {
	label: string;
	keystroke: string | Array<string>;
}
