/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/autolink
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TextWatcher from '@ckeditor/ckeditor5-typing/src/textwatcher';
import getLastTextLine from '@ckeditor/ckeditor5-typing/src/utils/getlasttextline';

const MIN_LINK_LENGTH_WITH_SPACE_AT_END = 4; // Ie: "t.co " (length 5).

// This was tweak from https://gist.github.com/dperini/729294.
const URL_REG_EXP = new RegExp(
	// Group 1: Line start or after a space.
	'(^|\\s)' +
	// Group 2: Detected URL (or e-mail).
	'(' +
		// Protocol identifier or short syntax "//"
		// a. Full form http://user@foo.bar.baz:8080/foo/bar.html#baz?foo=bar
		'(' +
			'(?:(?:(?:https?|ftp):)?\\/\\/)' +
			// BasicAuth using user:pass (optional)
			'(?:\\S+(?::\\S*)?@)?' +
			'(?:' +
				// Host & domain names.
				'(?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+' +
				// TLD identifier name.
				'(?:[a-z\\u00a1-\\uffff]{2,})' +
			')' +
			// port number (optional)
			'(?::\\d{2,5})?' +
			// resource path (optional)
			'(?:[/?#]\\S*)?' +
		')' +
		'|' +
		// b. Short form (either www.example.com or example@example.com)
		'(' +
			'(www.|(\\S+@))' +
			// Host & domain names.
			'((?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.))+' +
	// TLD identifier name.
	'(?:[a-z\\u00a1-\\uffff]{2,})' +
	')' +
	')$', 'i' );

const URL_GROUP_IN_MATCH = 2;

// Simplified email test - should be run over previously found URL.
const EMAIL_REG_EXP = /^[\S]+@((?![-_])(?:[-\w\u00a1-\uffff]{0,63}[^-_]\.))+(?:[a-z\u00a1-\uffff]{2,})$/i;

/**
 * The autolink plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class AutoLink extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'AutoLink';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		selection.on( 'change:range', () => {
			// Disable plugin when selection is inside a code block.
			this.isEnabled = !selection.anchor.parent.is( 'element', 'codeBlock' );
		} );

		this._enableTypingHandling();
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		this._enableEnterHandling();
		this._enableShiftEnterHandling();
	}

	/**
	 * Enables autolinking on typing.
	 *
	 * @private
	 */
	_enableTypingHandling() {
		const editor = this.editor;

		const watcher = new TextWatcher( editor.model, text => {
			// 1. Detect "Space" after a text with a potential link.
			if ( !isSingleSpaceAtTheEnd( text ) ) {
				return;
			}

			// 2. Check text before last typed "Space".
			const url = getUrlAtTextEnd( text.substr( 0, text.length - 1 ) );

			if ( url ) {
				return { url };
			}
		} );

		const input = editor.plugins.get( 'Input' );

		watcher.on( 'matched:data', ( evt, data ) => {
			const { batch, range, url } = data;

			if ( !input.isInput( batch ) ) {
				return;
			}

			const linkEnd = range.end.getShiftedBy( -1 ); // Executed after a space character.
			const linkStart = linkEnd.getShiftedBy( -url.length );

			const linkRange = editor.model.createRange( linkStart, linkEnd );

			this._applyAutoLink( url, linkRange );
		} );

		watcher.bind( 'isEnabled' ).to( this );
	}

	/**
	 * Enables autolinking on the <kbd>Enter</kbd> key.
	 *
	 * @private
	 */
	_enableEnterHandling() {
		const editor = this.editor;
		const model = editor.model;
		const enterCommand = editor.commands.get( 'enter' );

		if ( !enterCommand ) {
			return;
		}

		enterCommand.on( 'execute', () => {
			const position = model.document.selection.getFirstPosition();

			const rangeToCheck = model.createRange(
				model.createPositionAt( position.parent.previousSibling, 0 ),
				model.createPositionAt( position.parent.previousSibling, 'end' )
			);

			this._checkAndApplyAutoLinkOnRange( rangeToCheck );
		} );
	}

	/**
	 * Enables autolink on <kbd>Shift</kbd>+<kbd>Enter</kbd> key.
	 *
	 * @private
	 */
	_enableShiftEnterHandling() {
		const editor = this.editor;
		const model = editor.model;

		const shiftEnterCommand = editor.commands.get( 'shiftEnter' );

		if ( !shiftEnterCommand ) {
			return;
		}

		shiftEnterCommand.on( 'execute', () => {
			const position = model.document.selection.getFirstPosition();

			const rangeToCheck = model.createRange(
				model.createPositionAt( position.parent, 0 ),
				position.getShiftedBy( -1 )
			);

			this._checkAndApplyAutoLinkOnRange( rangeToCheck );
		} );
	}

	/**
	 * Checks passed range if it contains a linkable text.
	 *
	 * @param {module:engine/model/range~Range} rangeToCheck
	 * @private
	 */
	_checkAndApplyAutoLinkOnRange( rangeToCheck ) {
		const model = this.editor.model;
		const { text, range } = getLastTextLine( rangeToCheck, model );

		const url = getUrlAtTextEnd( text );

		if ( url ) {
			const linkRange = model.createRange(
				range.end.getShiftedBy( -url.length ),
				range.end
			);

			this._applyAutoLink( url, linkRange );
		}
	}

	/**
	 * Applies link on a given range.
	 *
	 * @param {String} url The URL to link.
	 * @param {module:engine/model/range~Range} range Text range to apply the link attribute to.
	 * @private
	 */
	_applyAutoLink( url, range ) {
		const model = this.editor.model;

		if ( !this.isEnabled || !isLinkAllowedOnRange( range, model ) ) {
			return;
		}

		// Enqueue change to make undo step.
		model.enqueueChange( writer => {
			const linkHrefValue = isEmail( url ) ? `mailto:${ url }` : url;

			writer.setAttribute( 'linkHref', linkHrefValue, range );
		} );
	}
}

// Check if text should be evaluated by the plugin in order to reduce number of RegExp checks on whole text.
function isSingleSpaceAtTheEnd( text ) {
	return text.length > MIN_LINK_LENGTH_WITH_SPACE_AT_END && text[ text.length - 1 ] === ' ' && text[ text.length - 2 ] !== ' ';
}

function getUrlAtTextEnd( text ) {
	const match = URL_REG_EXP.exec( text );

	return match ? match[ URL_GROUP_IN_MATCH ] : null;
}

function isEmail( linkHref ) {
	return EMAIL_REG_EXP.exec( linkHref );
}

function isLinkAllowedOnRange( range, model ) {
	return model.schema.checkAttributeInSelection( model.createSelection( range ), 'linkHref' );
}
