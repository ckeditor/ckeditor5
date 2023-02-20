/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembedui
 */

import { Plugin } from 'ckeditor5/src/core';
import { createDropdown } from 'ckeditor5/src/ui';

import MediaFormView from './ui/mediaformview';
import MediaEmbedEditing from './mediaembedediting';
import mediaIcon from '../theme/icons/media.svg';

/**
 * The media embed UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MediaEmbedUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ MediaEmbedEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MediaEmbedUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const command = editor.commands.get( 'mediaEmbed' );

		editor.ui.componentFactory.add( 'mediaEmbed', locale => {
			const dropdown = createDropdown( locale );

			this._setUpDropdown( dropdown, command );

			return dropdown;
		} );
	}

	/**
	 * @private
	 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdown
	 * @param {module:media-embed/mediaembedcommand~MediaEmbedCommand} command
	 */
	_setUpDropdown( dropdown, command ) {
		const editor = this.editor;
		const t = editor.t;
		const button = dropdown.buttonView;
		const registry = editor.plugins.get( MediaEmbedEditing ).registry;

		dropdown.once( 'change:isOpen', () => {
			const form = new MediaFormView( getFormValidators( editor.t, registry ), editor.locale );

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
			form.urlInputView.bind( 'value' ).to( command, 'value' );

			// Form elements should be read-only when corresponding commands are disabled.
			form.urlInputView.bind( 'isReadOnly' ).to( command, 'isEnabled', value => !value );
		} );

		dropdown.bind( 'isEnabled' ).to( command );

		button.set( {
			label: t( 'Insert media' ),
			icon: mediaIcon,
			tooltip: true
		} );
	}
}

function getFormValidators( t, registry ) {
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
