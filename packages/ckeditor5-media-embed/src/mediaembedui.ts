/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembedui
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import { createDropdown, CssTransitionDisablerMixin, type DropdownView } from 'ckeditor5/src/ui';

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
	public static get requires(): PluginDependencies {
		return [ MediaEmbedEditing ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'MediaEmbedUI' {
		return 'MediaEmbedUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const command: MediaEmbedCommand = editor.commands.get( 'mediaEmbed' )!;

		editor.ui.componentFactory.add( 'mediaEmbed', locale => {
			const dropdown = createDropdown( locale );

			this._setUpDropdown( dropdown, command );

			return dropdown;
		} );
	}

	private _setUpDropdown( dropdown: DropdownView, command: MediaEmbedCommand ): void {
		const editor = this.editor;
		const t = editor.t;
		const button = dropdown.buttonView;
		const registry = editor.plugins.get( MediaEmbedEditing ).registry;

		dropdown.once( 'change:isOpen', () => {
			const form = new ( CssTransitionDisablerMixin( MediaFormView ) )( getFormValidators( editor.t, registry ), editor.locale );

			dropdown.panelView.children.add( form );

			// Note: Use the low priority to make sure the following listener starts working after the
			// default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
			// invisible form/input cannot be focused/selected.
			button.on( 'open', () => {
				form.disableCssTransitions();

				// Make sure that each time the panel shows up, the URL field remains in sync with the value of
				// the command. If the user typed in the input, then canceled (`urlInputView#fieldView#value` stays
				// unaltered) and re-opened it without changing the value of the media command (e.g. because they
				// didn't change the selection), they would see the old value instead of the actual value of the
				// command.
				form.url = command.value || '';
				form.urlInputView.fieldView.select();
				form.enableCssTransitions();
			}, { priority: 'low' } );

			dropdown.on( 'submit', () => {
				if ( form.isValid() ) {
					editor.execute( 'mediaEmbed', form.url );
					editor.editing.view.focus();
				}
			} );

			dropdown.on( 'change:isOpen', () => form.resetFormStatus() );
			dropdown.on( 'cancel', () => {
				editor.editing.view.focus();
			} );

			form.delegate( 'submit', 'cancel' ).to( dropdown );
			form.urlInputView.fieldView.bind( 'value' ).to( command, 'value' );

			// Form elements should be read-only when corresponding commands are disabled.
			form.urlInputView.bind( 'isEnabled' ).to( command, 'isEnabled' );
		} );

		dropdown.bind( 'isEnabled' ).to( command );

		button.set( {
			label: t( 'Insert media' ),
			icon: mediaIcon,
			tooltip: true
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

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ MediaEmbedUI.pluginName ]: MediaEmbedUI;
	}
}
