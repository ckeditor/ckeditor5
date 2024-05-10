/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembedui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, CssTransitionDisablerMixin, MenuBarMenuListItemButtonView, DialogViewPosition } from 'ckeditor5/src/ui.js';

import MediaFormView from './ui/mediaformview.js';
import MediaEmbedEditing from './mediaembedediting.js';
import mediaIcon from '../theme/icons/media.svg';
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
		return [ MediaEmbedEditing ] as const;
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
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'mediaEmbed', () => {
			const button = this._createDialogButton( ButtonView );

			button.set( {
				tooltip: true
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'menuBar:mediaEmbed', () => {
			return this._createDialogButton( MenuBarMenuListItemButtonView );
		} );
	}

	/**
	 * Creates a button for for menu bar that will show find and replace dialog.
	 */
	private _createDialogButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const buttonView = new ButtonClass( editor.locale ) as InstanceType<T>;
		const command = editor.commands.get( 'mediaEmbed' )!;
		const t = locale.t;
		const dialogPlugin = this.editor.plugins.get( 'Dialog' );

		buttonView.set( {
			label: t( 'Insert media' ),
			icon: mediaIcon,
			isToggleable: true
		} );

		buttonView.bind( 'isEnabled' ).to( command, 'isEnabled' );

		buttonView.on( 'execute', () => {
			if ( dialogPlugin.id === 'mediaEmbed' ) {
				dialogPlugin.hide();

				return;
			}

			this._showDialog();
		} );

		return buttonView;
	}

	private _showDialog() {
		const editor = this.editor;
		const dialog = editor.plugins.get( 'Dialog' );
		const command = editor.commands.get( 'mediaEmbed' )!;
		const t = editor.locale.t;

		// if ( !this.formView ) {
		// 	this.formView = this._createFormView();
		// }

		const registry = editor.plugins.get( MediaEmbedEditing ).registry;
		const form = new ( CssTransitionDisablerMixin( MediaFormView ) )( getFormValidators( editor.t, registry ), editor.locale );

		dialog.show( {
			id: 'mediaEmbed',
			title: t( 'Insert media' ),
			content: form,
			position: DialogViewPosition.EDITOR_TOP_SIDE,
			onShow: () => {
				form.url = command.value || '';
				form.urlInputView.fieldView.select();
			},
			actionButtons: [
				{
					label: t( 'Cancel' ),
					withText: true,
					onExecute: () => dialog.hide()
				},
				{
					label: t( 'Accept' ),
					class: 'ck-button-action',
					withText: true,
					onExecute: () => {
						if ( form.isValid() ) {
							editor.execute( 'mediaEmbed', form.url );
							dialog.hide();
							editor.editing.view.focus();
						}
					}
				}
			]
		} );
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
