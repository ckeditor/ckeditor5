/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/input
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewText from '@ckeditor/ckeditor5-engine/src/view/text';
import diff from '@ckeditor/ckeditor5-utils/src/diff';
import diffToChanges from '@ckeditor/ckeditor5-utils/src/difftochanges';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import InputCommand from './inputcommand';
import ChangeBuffer from './changebuffer';

/**
 * Handles text input coming from the keyboard or other input methods.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Input extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		/**
		 * Typing's change buffer used to group subsequent changes into batches.
		 *
		 * @protected
		 * @member {module:typing/changebuffer~ChangeBuffer} #_buffer
		 */
		this._buffer = new ChangeBuffer( editor.document, editor.config.get( 'typing.undoStep' ) || 20 );

		// TODO The above default configuration value should be defined using editor.config.define() once it's fixed.

		editor.commands.set( 'input', new InputCommand( editor ) );

		this.listenTo( editingView, 'keydown', ( evt, data ) => {
			this._handleKeydown( data );
		}, { priority: 'lowest' } );

		this.listenTo( editingView, 'mutations', ( evt, mutations, viewSelection ) => {
			this._handleMutations( mutations, viewSelection );
		} );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this._buffer.destroy();
		this._buffer = null;
	}

	/**
	 * Handles the keydown event. We need to guess whether such keystroke is going to result
	 * in typing. If so, then before character insertion happens, any selected content needs
	 * to be deleted. Otherwise the default browser deletion mechanism would be
	 * triggered, resulting in:
	 *
	 * * Hundreds of mutations which could not be handled.
	 * * But most importantly, loss of control over how the content is being deleted.
	 *
	 * The method is used in a low-priority listener, hence allowing other listeners (e.g. delete or enter features)
	 * to handle the event.
	 *
	 * @private
	 * @param {module:engine/view/observer/keyobserver~KeyEventData} evtData
	 */
	_handleKeydown( evtData ) {
		const doc = this.editor.document;

		if ( isSafeKeystroke( evtData ) || doc.selection.isCollapsed ) {
			return;
		}

		doc.enqueueChanges( () => {
			this.editor.data.deleteContent( doc.selection, this._buffer.batch );
		} );
	}

	/**
	 * Handles DOM mutations.
	 *
	 * @private
	 * @param {Array.<module:engine/view/document~MutatatedText|module:engine/view/document~MutatatedChildren>} mutations
	 * @param {module:engine/view/selection~Selection|null} viewSelection
	 */
	_handleMutations( mutations, viewSelection ) {
		new MutationHandler( this.editor, this._buffer ).handle( mutations, viewSelection );
	}
}

/**
 * Helper class for translating DOM mutations into model changes.
 *
 * @private
 */
class MutationHandler {
	/**
	 * Creates an instance of the mutation handler.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {module:typing/changebuffer~ChangeBuffer} buffer
	 */
	constructor( editor, buffer ) {
		/**
		 * Editor instance for which mutations are handled.
		 *
		 * @readonly
		 * @member {module:core/editor/editor~Editor} #editor
		 */
		this.editor = editor;

		/**
		 * The editing controller.
		 *
		 * @readonly
		 * @member {module:engine/controller/editingcontroller~EditingController} #editing
		 */
		this.editing = this.editor.editing;

		/**
		 * The change buffer;
		 *
		 * @readonly
		 * @member {module:typing/changebuffer~ChangeBuffer} #buffer
		 */
		this.buffer = buffer;
	}

	/**
	 * Handles given mutations.
	 *
	 * @param {Array.<module:engine/view/document~MutatatedText|module:engine/view/document~MutatatedChildren>} mutations
	 * @param {module:engine/view/selection~Selection|null} viewSelection
	 */
	handle( mutations, viewSelection ) {
		for ( let mutation of mutations ) {
			// console.log( 'if', mutation );
			// Fortunately it will never be both.
			this._handleTextMutation( mutation, viewSelection );
			this._handleTextNodeInsertion( mutation );
		}
	}

	// TODO needs proper description
	// Check if mutation is normal typing.
	// There is also composition (mutations will be blocked during composing in future) and spellchecking.
	// There are also cases when spell checking generates one insertion and no deletions (like hous -> house)
	// and the mutation is identical as typing.
	_isTyping( insertions, deletions, firstChangeAt, lastChangeAt, viewSelection ) {
		const viewSelectionAnchorOffset = viewSelection ? viewSelection.anchor.offset : null;

		return deletions === 0 && insertions == 1 &&
			firstChangeAt && lastChangeAt && ( lastChangeAt - firstChangeAt === 0 ) &&
			( viewSelectionAnchorOffset <= firstChangeAt + 1 );
	}

	_handleTextMutation( mutation, viewSelection ) {
		if ( mutation.type != 'text' ) {
			return;
		}

		// Replace &nbsp; inserted by the browser with normal space.
		// We want only normal spaces in the model and in the view. Renderer and DOM Converter will be then responsible
		// for rendering consecutive spaces using &nbsp;, but the model and the view has to be clear.
		// Other feature may introduce inserting non-breakable space on specific key stroke (for example shift + space).
		// However then it will be handled outside of mutations, like enter key is.
		// The replacing is here because it has to be done before `diff` and `diffToChanges` functions, as they
		// take `newText` and compare it to (cleaned up) view.
		// It could also be done in mutation observer too, however if any outside plugin would like to
		// introduce additional events for mutations, they would get already cleaned up version (this may be good or not).
		const newText = mutation.newText.replace( /\u00A0/g, ' ' );
		// To have correct `diffResult`, we also compare view node text data with &nbsp; replaced by space.
		const oldText = mutation.oldText.replace( /\u00A0/g, ' ' );

		const diffResult = diff( oldText, newText );

		// Index where the first change happens. Used to set the position from which nodes will be removed and where will be inserted.
		let firstChangeAt = null;
		// Index where the last change happens. Used to properly count how many characters have to be removed and inserted.
		let lastChangeAt = null;

		// Get `firstChangeAt` and `lastChangeAt`.
		for ( let i = 0; i < diffResult.length; i++ ) {
			const change = diffResult[ i ];

			if ( change != 'equal' ) {
				firstChangeAt = firstChangeAt === null ? i : firstChangeAt;
				lastChangeAt = i;
			}
		}

		// How many characters, starting from `firstChangeAt`, should be removed.
		let deletions = 0;
		// How many characters, starting from `firstChangeAt`, should be inserted (basing on mutation.newText).
		let insertions = 0;

		for ( let i = firstChangeAt; i <= lastChangeAt; i++ ) {
			// If there is no change (equal) or delete, the character is existing in `oldText`. We count it for removing.
			if ( diffResult[ i ] != 'insert' ) {
				deletions++;
			}

			// If there is no change (equal) or insert, the character is existing in `newText`. We count it for inserting.
			if ( diffResult[ i ] != 'delete' ) {
				insertions++;
			}
		}

		// TODO transform into human readable and understandable text.
		// For insertions of the same character in a row, like
		// ab^cde - inserting c
		// and
		// abc^de - inserting c
		// the diff is the same.
		// This causes the problem with using ModelRange.createFromPositionAndShift( modelPos, 0 ); (passing when there is no removeRange)
		// because the last character in the sequence of the same characters is always recognized as an insertion.
		// From the other hand without ModelRange.createFromPositionAndShift( modelPos, 0 ); it works fine, but spellchecking
		// cases which cannot be differentiated from typing ( hous -> house ) is broken because `InputCommand` wll use
		// default selection which is [hous] to do text replacement (results in e[]).

		// Get the position in view and model where the changes will happen.
		let viewPos = new ViewPosition( mutation.node, firstChangeAt );

		// TODO references to previous comment about diff with same character sequence. Needs proper, dteailed description.
		if ( viewSelection && viewSelection.anchor.offset <= firstChangeAt ) {
			viewPos = new ViewPosition( mutation.node, viewSelection.anchor.offset - 1 );
		}

		let modelPos = this.editing.mapper.toModelPosition( viewPos );
		let removeRange = ModelRange.createFromPositionAndShift( modelPos, deletions || 0 );
		let insertText = newText.substr( firstChangeAt, insertions );

		// TODO detailed description what is going on here.
		if ( viewSelection && !this._isTyping( insertions, deletions, firstChangeAt, lastChangeAt, viewSelection ) ) {
			// The beginning of the corrected word is always at the fixed position no matter what was changed
			// by spellchecking mechanism so it may be recognized by getting last space before corrected word.
			let lastSpaceBeforeChangeAt = 0;

			for ( let i = 0; i < newText.length; i++ ) {
				if ( newText[ i ] === ' ' ) {
					if ( i < firstChangeAt ) {
						lastSpaceBeforeChangeAt = i + 1;
					} else {
						break;
					}
				}
			}

			let correctedText = newText.substring( lastSpaceBeforeChangeAt, viewSelection.anchor.offset );

			if ( correctedText.length ) {
				insertText = correctedText;
				viewPos = new ViewPosition( mutation.node, lastSpaceBeforeChangeAt );
				modelPos = this.editing.mapper.toModelPosition( viewPos );
				removeRange = ModelRange.createFromPositionAndShift( modelPos, insertText.length - insertions + deletions );
			}
		}

		this.editor.execute( 'input', {
			text: insertText,
			range: removeRange,
			buffer: this.buffer
		} );
	}

	_handleTextNodeInsertion( mutation ) {
		if ( mutation.type != 'children' ) {
			return;
		}

		// One new node.
		if ( mutation.newChildren.length - mutation.oldChildren.length != 1 ) {
			return;
		}

		// Which is text.
		const diffResult = diff( mutation.oldChildren, mutation.newChildren, compareChildNodes );
		const changes = diffToChanges( diffResult, mutation.newChildren );

		// In case of [ delete, insert, insert ] the previous check will not exit.
		if ( changes.length > 1 ) {
			return;
		}

		const change = changes[ 0 ];

		// Which is text.
		if ( !( change.values[ 0 ] instanceof ViewText ) ) {
			return;
		}

		const viewPos = new ViewPosition( mutation.node, change.index );
		const modelPos = this.editing.mapper.toModelPosition( viewPos );
		const insertedText = change.values[ 0 ].data;

		this.editor.execute( 'input', {
			// Replace &nbsp; inserted by the browser with normal space.
			// See comment in `_handleTextMutation`.
			// In this case we don't need to do this before `diff` because we diff whole nodes.
			// Just change &nbsp; in case there are some.
			text: insertedText.replace( /\u00A0/g, ' ' ),
			range: new ModelRange( modelPos ),
			buffer: this.buffer
		} );
	}
}

const safeKeycodes = [
	getCode( 'arrowUp' ),
	getCode( 'arrowRight' ),
	getCode( 'arrowDown' ),
	getCode( 'arrowLeft' ),
	9,  // Tab
	16, // Shift
	17, // Ctrl
	18, // Alt
	20, // CapsLock
	27, // Escape
	33, // PageUp
	34, // PageDown
	35, // Home
	36, // End
];

// Function keys.
for ( let code = 112; code <= 135; code++ ) {
	safeKeycodes.push( code );
}

// Returns `true` if a keystroke should not cause any content change caused by "typing".
//
// Note: This implementation is very simple and will need to be refined with time.
//
// @param {engine.view.observer.keyObserver.KeyEventData} keyData
// @returns {Boolean}
function isSafeKeystroke( keyData ) {
	// Keystrokes which contain Ctrl don't represent typing.
	if ( keyData.ctrlKey ) {
		return true;
	}

	return safeKeycodes.includes( keyData.keyCode );
}

// Helper function that compares whether two given view nodes are same. It is used in `diff` when it's passed an array
// with child nodes.
function compareChildNodes( oldChild, newChild ) {
	if ( oldChild instanceof ViewText && newChild instanceof ViewText ) {
		return oldChild.data === newChild.data;
	} else {
		return oldChild === newChild;
	}
}
