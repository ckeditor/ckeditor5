/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembedui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, CssTransitionDisablerMixin, type ViewWithCssTransitionDisabler } from 'ckeditor5/src/ui';

import MediaFormView from './ui/mediaformview';
import MediaEmbedEditing from './mediaembedediting';
import mediaIcon from '../theme/icons/media.svg';
import type MediaEmbedCommand from './mediaembedcommand';
import type { LocaleTranslate } from 'ckeditor5/src/utils';
import type MediaRegistry from './mediaregistry';

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
		const command: MediaEmbedCommand = editor.commands.get( 'mediaEmbed' )!;

		editor.ui.componentFactory.add( 'mediaEmbed', locale => {
			const buttonView = new ButtonView( locale );
			const registry = editor.plugins.get( MediaEmbedEditing ).registry;
			const mediaForm = new ( CssTransitionDisablerMixin( MediaFormView ) )( getFormValidators( editor.t, registry ), editor.locale );

			this._setUpForm( mediaForm, command );
			this._setUpButton( buttonView, mediaForm, command );

			return buttonView;
		} );
	}

	/**
	 * TODO
	 *
	 * @private
	 * @param {module:ui/button/buttonview~ButtonView} buttonView
	 * @param {module:media-embed/mediaembedcommand~MediaEmbedCommand} command
	 */
	private _setUpButton(
		buttonView: ButtonView,
		mediaForm: MediaFormView & ViewWithCssTransitionDisabler,
		command: MediaEmbedCommand
	) {
		const editor = this.editor;
		const modal = editor.plugins.get( 'Modal' );
		const t = editor.t;

		buttonView.bind( 'isEnabled' ).to( command );

		buttonView.set( {
			label: t( 'Insert media' ),
			icon: mediaIcon,
			tooltip: true
		} );

		buttonView.on( 'execute', () => {
			modal.show( {
				isDraggable: true,

				onShow: modal => {
					mediaForm.disableCssTransitions();

					modal.view.children.add( mediaForm );
					modal.view.showHeader( t( 'Insert media' ) );
					modal.view.setActionButtons( [
						{
							label: t( 'Cancel' ),
							withText: true,
							onExecute: () => modal.hide()
						},
						{
							label: t( 'Save' ),
							class: 'ck-button-action',
							withText: true,
							onExecute: () => mediaForm.fire( 'submit' )
						}
					] );

					// Make sure that each time the panel shows up, the URL field remains in sync with the value of
					// the command. If the user typed in the input, then canceled (`urlInputView#fieldView#value` stays
					// unaltered) and re-opened it without changing the value of the media command (e.g. because they
					// didn't change the selection), they would see the old value instead of the actual value of the
					// command.
					mediaForm.url = command.value || '';

					mediaForm.urlInputView.fieldView.select();
					mediaForm.urlInputView.focus();

					mediaForm.enableCssTransitions();
				},

				onHide() {
					mediaForm.resetFormStatus();
				}
			} );
		} );
	}

	/**
	 * TODO
	 *
	 * @private
	 * @param {module:ui/view~View} form
	 * @param {module:media-embed/mediaembedcommand~MediaEmbedCommand} command
	 */
	private _setUpForm( form: MediaFormView, command: MediaEmbedCommand ) {
		const modal = this.editor.plugins.get( 'Modal' );

		form.on( 'submit', () => {
			if ( form.isValid() ) {
				this.editor.execute( 'mediaEmbed', form.url );
				modal.hide();
			}
		} );

		form.urlInputView.fieldView.bind( 'value' ).to( command );

		// Form elements should be read-only when corresponding commands are disabled.
		form.urlInputView.bind( 'isEnabled' ).to( command, 'isEnabled' );
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
