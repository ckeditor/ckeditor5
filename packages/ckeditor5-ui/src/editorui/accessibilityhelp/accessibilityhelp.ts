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
import { getEnvKeystrokeText } from '@ckeditor/ckeditor5-utils';
import type { AddRootEvent } from '@ckeditor/ckeditor5-editor-multi-root';
import type { DowncastWriter, ViewRootEditableElement } from '@ckeditor/ckeditor5-engine';

import accessibilityIcon from '../../../theme/icons/accessibility.svg';
import '../../../theme/components/editorui/accessibilityhelp.css';

/**
 * A plugin that brings the accessibility help dialog to the editor available under the <kbd>Alt</kbd>+<kbd>0</kbd>
 * keystroke and via the "Accessibility help" toolbar button. The dialog displays a list of keystrokes that can be used
 * by the user to perform various actions in the editor.
 *
 * Keystroke information is loaded from {@link module:core/accessibility~Accessibility#keystrokeInfos}. New entries can be
 * added using the API provided by the {@link module:core/accessibility~Accessibility} class.
 */
export default class AccessibilityHelp extends Plugin {
	/**
	 * The view that displays the dialog content (list of keystrokes).
	 * Created when the dialog is opened for the first time.
	 */
	public contentView: AccessibilityHelpContentView | null = null;

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

		this._setupRootLabels();
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
			this.contentView = new AccessibilityHelpContentView( editor.locale, editor.accessibility.keystrokeInfos );
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
