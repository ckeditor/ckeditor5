/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module block-quote/blockquote
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import BlockQuoteEngine from './blockquoteengine';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import quoteIcon from '@ckeditor/ckeditor5-core/theme/icons/quote.svg';
import '../theme/theme.scss';

/**
 * The block quote plugin.
 *
 * It introduces the `'blockQuote'` button and requires the {@link module:block-quote/blockquoteengine~BlockQuoteEngine}
 * plugin. It also changes <kbd>Enter</kbd> key behavior so it escapes block quotes when pressed in an
 * empty quoted block.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BlockQuote extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ BlockQuoteEngine ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'BlockQuote';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'blockQuote' );

		editor.ui.componentFactory.add( 'blockQuote', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Block quote' ),
				icon: quoteIcon,
				tooltip: true
			} );

			// Bind button model to command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( buttonView, 'execute', () => editor.execute( 'blockQuote' ) );

			return buttonView;
		} );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const command = editor.commands.get( 'blockQuote' );

		// Overwrite default Enter key behavior.
		// If Enter key is pressed with selection collapsed in empty block inside a quote, break the quote.
		// This listener is added in afterInit in order to register it after list's feature listener.
		// We can't use a priority for this, because 'low' is already used by the enter feature, unless
		// we'd use numeric priority in this case.
		this.listenTo( this.editor.editing.view, 'enter', ( evt, data ) => {
			const doc = this.editor.document;
			const positionParent = doc.selection.getLastPosition().parent;

			if ( doc.selection.isCollapsed && positionParent.isEmpty && command.value ) {
				this.editor.execute( 'blockQuote' );
				this.editor.editing.view.scrollToTheSelection();

				data.preventDefault();
				evt.stop();
			}
		} );
	}
}
