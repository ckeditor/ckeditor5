/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module show-whitespace/showwhitespaceui
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { IconPilcrow } from '@ckeditor/ckeditor5-icons';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

import '../theme/showwhitespace.css';

/**
 * The UI plugin of the show whitespace feature.
 *
 * It registers the `'showWhitespace'` UI button in the editor's
 * {@link module:ui/componentfactory~ComponentFactory component factory}
 * that toggles the visibility of whitespace characters.
 */
export class ShowWhitespaceUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ShowWhitespaceUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'showWhitespace', () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				tooltip: true,
				icon: IconPilcrow
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:showWhitespace', () => {
			return this._createButton( MenuBarMenuListItemButtonView );
		} );
	}

	/**
	 * Creates a button for show whitespace command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command = editor.commands.get( 'showWhitespace' )!;
		const view = new ButtonClass( locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Show whitespace' ),
			isToggleable: true,
			role: 'menuitemcheckbox'
		} );

		view.bind( 'isEnabled' ).to( command );
		view.bind( 'isOn' ).to( command, 'value', command, 'isEnabled', ( value, isEnabled ) => value && isEnabled );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( 'showWhitespace' );
			editor.editing.view.focus();
		} );

		return view;
	}
}
