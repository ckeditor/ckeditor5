/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import ChangeBuffer from './changebuffer.js';
import ModelPosition from '../engine/model/position.js';
import ModelRange from '../engine/model/range.js';
import ViewPosition from '../engine/view/position.js';
import ViewText from '../engine/view/text.js';
import ViewContainerElement from '../engine/view/containerelement.js';
import diff from '../utils/diff.js';
import diffToChanges from '../utils/difftochanges.js';
import { getCode } from '../utils/keyboard.js';

/**
 * The typing feature. Handles... typing.
 *
 * @memberOf typing
 * @extends ckeditor5.Feature
 */
export default class Typing extends Feature {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		/**
		 * Typing's change buffer used to group subsequent changes into batches.
		 *
		 * @private
		 * @member {typing.ChangeBuffer} typing.Typing#_buffer
		 */
		this._buffer = new ChangeBuffer( editor.document, editor.config.get( 'typing.undoLimit' ) || 20 );

		// TODO The above default config value should be defines using editor.config.define() once it's fixed.

		this.listenTo( editingView, 'keydown', ( evt, data ) => {
			this._handleKeydown( data );
		}, null, 9999 ); // LOWEST

		this.listenTo( editingView, 'mutations', ( evt, mutations ) => {
			this._handleMutations( mutations );
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
	 * Handles keydown event. We need to guess whether such a keystroke is going to result
	 * in typing. If so, then before character insertion happens, we need to delete
	 * any selected content. Otherwise, a default browser deletion mechanism would be
	 * triggered, resulting in:
	 *
	 * * hundreds of mutations which couldn't be handled,
	 * * but most importantly, loss of a control over how content is being deleted.
	 *
	 * The method is used in a low-prior listener, hence allowing other listeners (e.g. delete or enter features)
	 * to handle the event.
	 *
	 * @private
	 * @param {engine.view.observer.keyObserver.KeyEventData} evtData
	 */
	_handleKeydown( evtData ) {
		const doc = this.editor.document;

		if ( isSafeKeystroke( evtData ) || doc.selection.isCollapsed ) {
			return;
		}

		doc.enqueueChanges( () => {
			doc.composer.deleteContents( this._buffer.batch, doc.selection );
		} );

		// No 'preventDefalt', not to prevent mutations.
	}

	/**
	 * Handles DOM mutations.
	 *
	 * @param {Array.<engine.view.Document~MutatatedText|engine.view.Document~MutatatedChildren>} mutations
	 */
	_handleMutations( mutations ) {
		const doc = this.editor.document;
		const handler = new MutationHandler( this.editor.editing, this._buffer );

		doc.enqueueChanges( () => handler.handle( mutations ) );
	}
}

/**
 * Helper class for translating DOM mutations into model changes.
 *
 * @private
 * @member typing.typing
 */
class MutationHandler {
	/**
	 * Creates instance of the mutation handler.
	 *
	 * @param {engine.EditingController} editing
	 * @param {typing.ChangeBuffer} buffer
	 */
	constructor( editing, buffer ) {
		/**
		 * The editing controller.
		 *
		 * @member {engine.EditingController} typing.typing.MutationHandler#editing
		 */
		this.editing = editing;

		/**
		 * The change buffer.
		 *
		 * @member {engine.EditingController} typing.typing.MutationHandler#buffer
		 */
		this.buffer = buffer;

		/**
		 * Number of inserted characters which need to be feed to the {@link #buffer change buffer}
		 * on {@link #commit}.
		 *
		 * @member {Number} typing.typing.MutationHandler#insertedCharacterCount
		 */
		this.insertedCharacterCount = 0;

		/**
		 * Position to which the selection should be moved on {@link #commit}.
		 *
		 * Note: Currently, the mutation handler will move selection to the position set by the
		 * last consumer. Placing the selection right after the last change will work for many cases, but not
		 * for ones like autocorrection or spellchecking. The caret should be placed after the whole piece
		 * which was corrected (e.g. a word), not after the letter that was replaced.
		 *
		 * @member {engine.model.Position} typing.typing.MutationHandler#selectionPosition
		 */
	}

	/**
	 * Handle given mutations.
	 *
	 * @param {Array.<engine.view.Document~MutatatedText|engine.view.Document~MutatatedChildren>} mutations
	 */
	handle( mutations ) {
		// The below code indicates how multi-mutations consumers can be implemented.
		// In the future we may need those to handle more advanced case, like spellchecking across text with attributes.
		//
		// // Clone the array, because consumers will modify it.
		// mutations = mutations.slice( 0 );

		// for ( let consumer of MutationHandler.consumers.multi ) {
		// 	consumer( mutations, this );

		// 	if ( !mutations.length ) {
		// 		return;
		// 	}
		// }

		mutations.forEach( mutation => {
			for ( let consumer of MutationHandler.consumers.single ) {
				if ( consumer.check( mutation ) ) {
					consumer.consume( mutation, this );

					return;
				}
			}
		} );

		this._commit();
	}

	insert( { position, text, selectionPosition } ) {
		this.buffer.batch.weakInsert( position, text );

		this.insertedCharacterCount += text.length;
		this.selectionPosition = selectionPosition;
	}

	remove( { range, selectionPosition } ) {
		this.buffer.batch.remove( range );

		this.selectionPosition = selectionPosition;
	}

	/**
	 * Commits all changes. While specific consumers will modify the document,
	 * also the change buffer and selection needs to be updated. This should be done
	 * once, at the end.
	 *
	 * @private
	 */
	_commit() {
		this.buffer.input( this.insertedCharacterCount );

		if ( this.selectionPosition ) {
			this.editing.model.selection.collapse( this.selectionPosition );
		}
	}
}

/**
 * @static
 * @member {Object} typing.typing.MutationHandler.consumers
 */
MutationHandler.consumers = {
	/**
	 * @member {Array} typing.typing.MutationHandler.consumers.single
	 */
	single: [
		// Simple text nodes change.
		{
			check( mutation ) {
				return ( mutation.type == 'text' );
			},

			consume( mutation, handler ) {
				const changes = diffToChanges( diff( mutation.oldText, mutation.newText ), mutation.newText );

				console.log( 'Text node change handler', JSON.stringify( changes ) ); // jshint ignore:line
				console.log( mutation ); // jshint ignore:line

				changes.forEach( change => {
					const viewPos = new ViewPosition( mutation.node, change.index );
					const modelPos = handler.editing.mapper.toModelPosition( viewPos );

					if ( change.type == 'INSERT' ) {
						const insertedText = change.values.join( '' );

						handler.insert( {
							position: modelPos,
							text: insertedText,
							selectionPosition: ModelPosition.createAt( modelPos.parent, modelPos.offset + insertedText.length )
						} );
					} else /* if ( change.type == 'DELETE' ) */ {
						handler.remove( {
							range: new ModelRange( modelPos, modelPos.getShiftedBy( change.howMany ) ),
							selectionPosition: modelPos
						} );
					}
				} );
			}
		},

		// Insertion into empty container.
		{
			check( mutation ) {
				return (
					mutation.oldChildren.length === 0 &&
					mutation.newChildren.length === 1 &&
					( mutation.newChildren[ 0 ] instanceof ViewText ) &&
					( mutation.node instanceof ViewContainerElement )
				);
			},

			consume( mutation, handler ) {
				console.log( 'Insertion into empty container handler', mutation ); // jshint ignore:line

				const viewPos = new ViewPosition( mutation.node, 0 );
				const modelPos = handler.editing.mapper.toModelPosition( viewPos );
				const insertedText = mutation.newChildren[ 0 ].data;

				handler.insert( {
					position: modelPos,
					text: insertedText,
					selectionPosition: ModelPosition.createAt( modelPos.parent, 'END' )
				} );
			}
		}
	]
};

// This is absolutely lame, but it's enough for now.

const safeKeystrokes = [
	getCode( 'ctrl' ),
	getCode( 'cmd' ),
	getCode( 'shift' ),
	getCode( 'alt' ),
	getCode( 'arrowUp' ),
	getCode( 'arrowRight' ),
	getCode( 'arrowDown' ),
	getCode( 'arrowLeft' )
];

function isSafeKeystroke( keyData ) {
	return safeKeystrokes.indexOf( keyData.keyCode ) > -1;
}
