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

const urlRegExp = new RegExp(
	// Group 1: Line start or after a space.
	'(^|\\s)' + // Match .
	// Group 2: Full detected URL.
	'(' +
		// Group 3 + 4: Protocol + domain.
		'(([a-z]{3,9}:(?:\\/\\/)?)(?:[\\w]+)?[a-z0-9.-]+|(?:www\\.|[\\w]+)[a-z0-9.-]+)' +
		// Group 5: Optional path + query string + location.
		'((?:\\/[+~%/.\\w\\-_]*)?\\??(?:[-+=&;%@.\\w_]*)#?(?:[.!/\\\\\\w]*))?' +
	')$', 'i' );

// Simplified email test - should be run over previously found URL.
const emailRegExp = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

const URL_POSITION_IN_MATCH = 2;

function isEmail( linkHref ) {
	return emailRegExp.exec( linkHref );
}

/**
 * The auto link plugin.
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

		const watcher = new TextWatcher( editor.model, text => {
			// 1. Detect "space" after a text with a potential link.
			if ( !isSingleSpaceAtTheEnd( text ) ) {
				return;
			}

			// 2. Check text before "space" or "enter".
			const match = urlRegExp.exec( text.substr( 0, text.length - 1 ) );

			if ( match ) {
				return { match };
			}
		} );

		const input = editor.plugins.get( 'Input' );

		watcher.on( 'matched:data', ( evt, data ) => {
			const { batch, range, match } = data;

			if ( !input.isInput( batch ) ) {
				return;
			}

			this._applyAutoLink( match[ URL_POSITION_IN_MATCH ], range );
		} );

		// todo: watcher.bind();
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		this._enableEnterHandling();
		this._enableShiftEnterHandling();
	}

	_enableEnterHandling() {
		const editor = this.editor;
		const model = editor.model;
		const enterCommand = editor.commands.get( 'enter' );

		enterCommand.on( 'execute', () => {
			const position = model.document.selection.getFirstPosition();

			const rangeToCheck = model.createRange(
				model.createPositionAt( position.parent.previousSibling, 0 ),
				model.createPositionAt( position.parent.previousSibling, 'end' )
			);

			this._checkAndApplyAutoLinkOnRange( rangeToCheck );
		} );
	}

	_enableShiftEnterHandling() {
		const editor = this.editor;
		const model = editor.model;

		const shiftEnterCommand = editor.commands.get( 'shiftEnter' );

		shiftEnterCommand.on( 'execute', () => {
			const position = model.document.selection.getFirstPosition();

			const rangeToCheck = model.createRange(
				model.createPositionAt( position.parent, 0 ),
				position.getShiftedBy( -1 )
			);

			this._checkAndApplyAutoLinkOnRange( rangeToCheck );
		} );
	}

	_checkAndApplyAutoLinkOnRange( rangeToCheck ) {
		const { text, range } = getLastTextLine( rangeToCheck, this.editor.model );

		const match = urlRegExp.exec( text );

		if ( match ) {
			this._applyAutoLink( match[ URL_POSITION_IN_MATCH ], range, 0 );
		}
	}

	_applyAutoLink( linkHref, range, additionalOffset = 1 ) {
		// Enqueue change to make undo step.
		this.editor.model.enqueueChange( writer => {
			const linkRange = writer.createRange(
				range.end.getShiftedBy( -( additionalOffset + linkHref.length ) ),
				range.end.getShiftedBy( -additionalOffset )
			);

			const linkHrefValue = isEmail( linkHref ) ? `mailto://${ linkHref }` : linkHref;

			writer.setAttribute( 'linkHref', linkHrefValue, linkRange );
		} );
	}
}

function isSingleSpaceAtTheEnd( text ) {
	return text.length > MIN_LINK_LENGTH_WITH_SPACE_AT_END && text[ text.length - 1 ] === ' ' && text[ text.length - 2 ] !== ' ';
}
