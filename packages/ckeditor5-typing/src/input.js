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

/**
 * Handles text input coming from the keyboard or other input methods.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Input extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Input';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const inputCommand = new InputCommand( editor, editor.config.get( 'typing.undoStep' ) || 20 );

		// TODO The above default configuration value should be defined using editor.config.define() once it's fixed.

		editor.commands.add( 'input', inputCommand );

		this.listenTo( editingView, 'keydown', ( evt, data ) => {
			this._handleKeydown( data, inputCommand.buffer );
		}, { priority: 'lowest' } );

		this.listenTo( editingView, 'mutations', ( evt, mutations, viewSelection ) => {
			this._handleMutations( mutations, viewSelection );
		} );
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
	 * @param {module:typing/changebuffer~ChangeBuffer} buffer
	 */
	_handleKeydown( evtData, buffer ) {
		const doc = this.editor.document;

		if ( isSafeKeystroke( evtData ) || doc.selection.isCollapsed ) {
			return;
		}

		buffer.lock();

		doc.enqueueChanges( () => {
			this.editor.data.deleteContent( doc.selection, buffer.batch );
		} );

		buffer.unlock();
	}

	/**
	 * Handles DOM mutations.
	 *
	 * @private
	 * @param {Array.<module:engine/view/observer/mutationobserver~MutatedText|
	 * module:engine/view/observer/mutationobserver~MutatedChildren>} mutations
	 * @param {module:engine/view/selection~Selection|null} viewSelection
	 */
	_handleMutations( mutations, viewSelection ) {
		new MutationHandler( this.editor ).handle( mutations, viewSelection );
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
	 */
	constructor( editor ) {
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
	}

	/**
	 * Handles given mutations.
	 *
	 * @param {Array.<module:engine/view/observer/mutationobserver~MutatedText|
	 * module:engine/view/observer/mutationobserver~MutatedChildren>} mutations
	 * @param {module:engine/view/selection~Selection|null} viewSelection
	 */
	handle( mutations, viewSelection ) {
		for ( const mutation of mutations ) {
			// Fortunately it will never be both.
			this._handleTextMutation( mutation, viewSelection );
			this._handleTextNodeInsertion( mutation );
		}
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

		// Try setting new model selection according to passed view selection.
		let modelSelectionRange = null;

		if ( viewSelection ) {
			modelSelectionRange = this.editing.mapper.toModelRange( viewSelection.getFirstRange() );
		}

		// Get the position in view and model where the changes will happen.
		const viewPos = new ViewPosition( mutation.node, firstChangeAt );
		const modelPos = this.editing.mapper.toModelPosition( viewPos );
		const removeRange = ModelRange.createFromPositionAndShift( modelPos, deletions );
		const insertText = newText.substr( firstChangeAt, insertions );

		this.editor.execute( 'input', {
			text: insertText,
			range: removeRange,
			resultRange: modelSelectionRange
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
			range: new ModelRange( modelPos )
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
	229 // Composition start key
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
