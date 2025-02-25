/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { IconMedia } from 'ckeditor5/src/icons.js';
import { ButtonView, CssTransitionDisablerMixin, MenuBarMenuListItemButtonView, Dialog } from 'ckeditor5/src/ui.js';

import MediaFormView from './ui/mediaformview.js';
import MediaEmbedEditing from './mediaembedediting.js';
import type { LocaleTranslate } from 'ckeditor5/src/utils.js';
import type MediaRegistry from './mediaregistry.js';

/**
 * The media embed UI plugin.
 */
export default class MediaEmbedUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ MediaEmbedEditing, Dialog ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MediaEmbedUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	private _formView: MediaFormView | undefined;

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'mediaEmbed', () => {
			const t = this.editor.locale.t;
			const button = this._createDialogButton( ButtonView );

			button.tooltip = true;
			button.label = t( 'Insert media' );

			return button;
		} );

		editor.ui.componentFactory.add( 'menuBar:mediaEmbed', () => {
			const t = this.editor.locale.t;
			const button = this._createDialogButton( MenuBarMenuListItemButtonView );

			button.label = t( 'Media' );

			return button;
		} );
	}

	/**
	 * Creates a button for menu bar that will show media embed dialog.
	 */
	private _createDialogButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const buttonView = new ButtonClass( editor.locale ) as InstanceType<T>;
		const command = editor.commands.get( 'mediaEmbed' )!;
		const dialogPlugin = this.editor.plugins.get( 'Dialog' );

		buttonView.icon = IconMedia;

		buttonView.bind( 'isEnabled' ).to( command, 'isEnabled' );

		buttonView.on( 'execute', () => {
			if ( dialogPlugin.id === 'mediaEmbed' ) {
				dialogPlugin.hide();
			} else {
				this._showDialog();
			}
		} );

		return buttonView;
	}

	private _showDialog() {
		const editor = this.editor;
		const dialog = editor.plugins.get( 'Dialog' );
		const command = editor.commands.get( 'mediaEmbed' )!;
		const t = editor.locale.t;

		const isMediaSelected = command.value !== undefined;

		if ( !this._formView ) {
			const registry = editor.plugins.get( MediaEmbedEditing ).registry;

			this._formView = new ( CssTransitionDisablerMixin( MediaFormView ) )( getFormValidators( editor.t, registry ), editor.locale );
			this._formView.on( 'submit', () => this._handleSubmitForm() );
		}

		dialog.show( {
			id: 'mediaEmbed',
			title: t( 'Media embed' ),
			content: this._formView,
			isModal: true,
			onShow: () => {
				this._formView!.url = command.value || '';
				this._formView!.resetFormStatus();
				this._formView!.urlInputView.fieldView.select();
			},
			actionButtons: [
				{
					label: t( 'Cancel' ),
					withText: true,
					onExecute: () => dialog.hide()
				},
				{
					label: isMediaSelected ? t( 'Save' ) : t( 'Insert' ),
					class: 'ck-button-action',
					withText: true,
					onExecute: () => this._handleSubmitForm()
				}
			]
		} );
	}

	private _handleSubmitForm() {
		const editor = this.editor;
		const dialog = editor.plugins.get( 'Dialog' );

		if ( this._formView!.isValid() ) {
			editor.execute( 'mediaEmbed', this._formView!.url );
			dialog.hide();
			editor.editing.view.focus();
		}
	}
}

function getFormValidators( t: LocaleTranslate, registry: MediaRegistry ): Array<( v: MediaFormView ) => string | undefined> {
	return [
		form => {
			if ( !form.url.length ) {
				return t( 'The URL must not be empty.' );
			}
		},
		form => {
			if ( !registry.hasMedia( form.url ) ) {
				return t( 'This media URL is not supported.' );
			}
		}
	];
}
