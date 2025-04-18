/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/autolink
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { ClipboardInputTransformationData } from 'ckeditor5/src/clipboard.js';
import type { DocumentSelectionChangeEvent, Model, Position, Range, Writer } from 'ckeditor5/src/engine.js';
import { Delete, TextWatcher, getLastTextLine, findAttributeRange, type TextWatcherMatchedDataEvent } from 'ckeditor5/src/typing.js';
import type { EnterCommand, ShiftEnterCommand } from 'ckeditor5/src/enter.js';

import { addLinkProtocolIfApplicable, linkHasProtocol } from './utils.js';
import LinkEditing from './linkediting.js';

const MIN_LINK_LENGTH_WITH_SPACE_AT_END = 4; // Ie: "t.co " (length 5).

// This was a tweak from https://gist.github.com/dperini/729294.
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
				// IP address dotted notation octets
				// excludes loopback network 0.0.0.0
				// excludes reserved space >= 224.0.0.0
				// excludes network & broadcast addresses
				// (first & last IP address of each class)
				'(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
				'(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
				'(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
				'|' +
				'(' +
					// Do not allow `www.foo` - see https://github.com/ckeditor/ckeditor5/issues/8050.
					'((?!www\\.)|(www\\.))' +
					// Host & domain names.
					'(?![-_])(?:[-_a-z0-9\\u00a1-\\uffff]{1,63}\\.)+' +
					// TLD identifier name.
					'(?:[a-z\\u00a1-\\uffff]{2,63})' +
				')' +
				'|' +
				// Allow localhost as a valid hostname
				'localhost' +
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
			'((?![-_])(?:[-_a-z0-9\\u00a1-\\uffff]{1,63}\\.))+' +
			// TLD identifier name.
			'(?:[a-z\\u00a1-\\uffff]{2,63})' +
		')' +
	')$', 'i' );

const URL_GROUP_IN_MATCH = 2;

/**
 * The autolink plugin.
 */
export default class AutoLink extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Delete, LinkEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'AutoLink' as const;
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
		const selection = editor.model.document.selection;

		selection.on<DocumentSelectionChangeEvent>( 'change:range', () => {
			// Disable plugin when selection is inside a code block.
			this.isEnabled = !selection.anchor!.parent.is( 'element', 'codeBlock' );
		} );

		this._enableTypingHandling();
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		this._enableEnterHandling();
		this._enableShiftEnterHandling();
		this._enablePasteLinking();
	}

	/**
	 * For given position, returns a range that includes the whole link that contains the position.
	 *
	 * If position is not inside a link, returns `null`.
	 */
	private _expandLinkRange( model: Model, position: Position ): Range | null {
		if ( position.textNode && position.textNode.hasAttribute( 'linkHref' ) ) {
			return findAttributeRange( position, 'linkHref', position.textNode.getAttribute( 'linkHref' ), model );
		} else {
			return null;
		}
	}

	/**
	 * Extends the document selection to includes all links that intersects with given `selectedRange`.
	 */
	private _selectEntireLinks( writer: Writer, selectedRange: Range ): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		const selStart = selection.getFirstPosition()!;
		const selEnd = selection.getLastPosition()!;

		let updatedSelection = selectedRange.getJoined( this._expandLinkRange( model, selStart ) || selectedRange );
		if ( updatedSelection ) {
			updatedSelection = updatedSelection.getJoined( this._expandLinkRange( model, selEnd ) || selectedRange );
		}

		if ( updatedSelection && ( updatedSelection.start.isBefore( selStart ) || updatedSelection.end.isAfter( selEnd ) ) ) {
			// Only update the selection if it changed.
			writer.setSelection( updatedSelection );
		}
	}

	/**
	 * Enables autolinking on pasting a URL when some content is selected.
	 */
	private _enablePasteLinking(): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		const clipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );
		const linkCommand = editor.commands.get( 'link' )!;

		clipboardPipeline.on( 'inputTransformation', ( evt, data: ClipboardInputTransformationData ) => {
			if ( !this.isEnabled || !linkCommand.isEnabled || selection.isCollapsed || data.method !== 'paste' ) {
				// Abort if we are disabled or the selection is collapsed.
				return;
			}

			if ( selection.rangeCount > 1 ) {
				// Abort if there are multiple selection ranges.
				return;
			}

			const selectedRange = selection.getFirstRange()!;

			const newLink = data.dataTransfer.getData( 'text/plain' );

			if ( !newLink ) {
				// Abort if there is no plain text on the clipboard.
				return;
			}

			const matches = newLink.match( URL_REG_EXP );

			// If the text in the clipboard has a URL, and that URL is the whole clipboard.
			if ( matches && matches[ 2 ] === newLink ) {
				model.change( writer => {
					this._selectEntireLinks( writer, selectedRange );
					linkCommand.execute( newLink );
				} );

				evt.stop();
			}
		}, { priority: 'high' } );
	}

	/**
	 * Enables autolinking on typing.
	 */
	private _enableTypingHandling(): void {
		const editor = this.editor;

		const watcher = new TextWatcher( editor.model, text => {
			let mappedText = text;

			// 1. Detect <kbd>Space</kbd> after a text with a potential link.
			if ( !isSingleSpaceAtTheEnd( mappedText ) ) {
				return;
			}

			// 2. Remove the last space character.
			mappedText = mappedText.slice( 0, -1 );

			// 3. Remove punctuation at the end of the URL if it exists.
			if ( '!.:,;?'.includes( mappedText[ mappedText.length - 1 ] ) ) {
				mappedText = mappedText.slice( 0, -1 );
			}

			// 4. Check text before last typed <kbd>Space</kbd> or punctuation.
			const url = getUrlAtTextEnd( mappedText );

			if ( url ) {
				return {
					url,
					removedTrailingCharacters: text.length - mappedText.length
				};
			}
		} );

		watcher.on<TextWatcherMatchedDataEvent<{ url: string; removedTrailingCharacters: number }>>( 'matched:data', ( evt, data ) => {
			const { batch, range, url, removedTrailingCharacters } = data;

			if ( !batch.isTyping ) {
				return;
			}

			const linkEnd = range.end.getShiftedBy( -removedTrailingCharacters ); // Executed after a space character or punctuation.
			const linkStart = linkEnd.getShiftedBy( -url.length );

			const linkRange = editor.model.createRange( linkStart, linkEnd );

			this._applyAutoLink( url, linkRange );
		} );

		watcher.bind( 'isEnabled' ).to( this );
	}

	/**
	 * Enables autolinking on the <kbd>Enter</kbd> key.
	 */
	private _enableEnterHandling(): void {
		const editor = this.editor;
		const model = editor.model;
		const enterCommand: EnterCommand | undefined = editor.commands.get( 'enter' );

		if ( !enterCommand ) {
			return;
		}

		enterCommand.on( 'execute', () => {
			const position = model.document.selection.getFirstPosition()!;

			let rangeToCheck: Range;

			// Previous sibling might not be an element if enter was blocked due to be triggered in a limit element.
			if ( position.parent.previousSibling?.is( 'element' ) ) {
				rangeToCheck = model.createRangeIn( position.parent.previousSibling );
			} else {
				rangeToCheck = model.createRange( model.createPositionAt( position.parent, 0 ), position );
			}

			this._checkAndApplyAutoLinkOnRange( rangeToCheck );
		} );
	}

	/**
	 * Enables autolinking on the <kbd>Shift</kbd>+<kbd>Enter</kbd> keyboard shortcut.
	 */
	private _enableShiftEnterHandling(): void {
		const editor = this.editor;
		const model = editor.model;

		const shiftEnterCommand: ShiftEnterCommand | undefined = editor.commands.get( 'shiftEnter' );

		if ( !shiftEnterCommand ) {
			return;
		}

		shiftEnterCommand.on( 'execute', () => {
			const position = model.document.selection.getFirstPosition()!;

			const rangeToCheck = model.createRange(
				model.createPositionAt( position.parent, 0 ),
				position.getShiftedBy( -1 )
			);

			this._checkAndApplyAutoLinkOnRange( rangeToCheck );
		} );
	}

	/**
	 * Checks if the passed range contains a linkable text.
	 */
	private _checkAndApplyAutoLinkOnRange( rangeToCheck: Range ): void {
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
	 * Applies a link on a given range if the link should be applied.
	 *
	 * @param url The URL to link.
	 * @param range The text range to apply the link attribute to.
	 */
	private _applyAutoLink( url: string, range: Range ): void {
		const model = this.editor.model;

		const defaultProtocol = this.editor.config.get( 'link.defaultProtocol' );
		const fullUrl = addLinkProtocolIfApplicable( url, defaultProtocol );

		if ( !this.isEnabled || !isLinkAllowedOnRange( range, model ) || !linkHasProtocol( fullUrl ) || linkIsAlreadySet( range ) ) {
			return;
		}

		this._persistAutoLink( fullUrl, range );
	}

	/**
	 * Enqueues autolink changes in the model.
	 *
	 * @param url The URL to link.
	 * @param range The text range to apply the link attribute to.
	 */
	private _persistAutoLink( url: string, range: Range ): void {
		const model = this.editor.model;
		const deletePlugin = this.editor.plugins.get( 'Delete' );

		// Enqueue change to make undo step.
		model.enqueueChange( writer => {
			writer.setAttribute( 'linkHref', url, range );

			model.enqueueChange( () => {
				deletePlugin.requestUndoOnBackspace();
			} );
		} );
	}
}

// Check if text should be evaluated by the plugin in order to reduce number of RegExp checks on whole text.
function isSingleSpaceAtTheEnd( text: string ): boolean {
	return text.length > MIN_LINK_LENGTH_WITH_SPACE_AT_END && text[ text.length - 1 ] === ' ' && text[ text.length - 2 ] !== ' ';
}

function getUrlAtTextEnd( text: string ): string | null {
	const match = URL_REG_EXP.exec( text );

	return match ? match[ URL_GROUP_IN_MATCH ] : null;
}

function isLinkAllowedOnRange( range: Range, model: Model ): boolean {
	return model.schema.checkAttributeInSelection( model.createSelection( range ), 'linkHref' );
}

function linkIsAlreadySet( range: Range ): boolean {
	const item = range.start.nodeAfter;
	return !!item && item.hasAttribute( 'linkHref' );
}
