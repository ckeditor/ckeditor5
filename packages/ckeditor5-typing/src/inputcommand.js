/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/inputcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command/command';
import TreeWalker from '@ckeditor/ckeditor5-engine/src/model/treewalker';
import ChangeBuffer from './changebuffer';

/**
 * The input command. Used by the {@link module:typing/input~Input input feature} to handle typing.
 *
 * @extends core.command.Command
 */
export default class InputCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Typing's change buffer used to group subsequent changes into batches.
		 *
		 * @protected
		 * @member {typing.ChangeBuffer} #_buffer
		 */
		this._buffer = new ChangeBuffer( editor.document, editor.config.get( 'typing.undoStep' ) || 20 );

		// TODO The above default configuration value should be defined using editor.config.define() once it's fixed.
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
	 * Returns the current buffer.
	 *
	 * @type {typing.ChangeBuffer}
	 */
	get buffer() {
		return this._buffer;
	}

	/**
	 * Executes the input command. It replaces the content within the given range with given text. Replacing is a two
	 * step process, first content within range is removed and then new text is inserted on the beginning
	 * of the range (which after removal is a collapsed range).
	 *
	 * @param {Object} [options] The command options.
	 * @param {String} [options.text=''] Text to be inserted.
	 * @param {module:engine/model/range~Range} [options.range=null] Range in which the text is inserted. Defaults
	 * to first range in the current selection.
	 */
	_doExecute( options = {} ) {
		const doc = this.editor.document;
		const range = options.range || doc.selection.getFirstRange();
		const text = options.text || '';
		let textLength = 0;

		if ( range ) {
			doc.enqueueChanges( () => {
				if ( !range.isCollapsed ) {
					textLength -= this._getTextWithinRange( range ).length;
					this._buffer.batch.remove( range );
				}

				if ( text ) {
					textLength += text.length;
					this._buffer.batch.weakInsert( range.start, text );
				}

				this._buffer.input( Math.max( textLength, 0 ) );
			} );
		}
	}

	/**
	 * Returns text within given range.
	 *
	 * @protected
	 * @param {module:engine/model/range~Range} range Range from which text will be extracted.
	 * @returns {String} Text within the given range.
	 */
	_getTextWithinRange( range ) {
		let txt = '';
		const treeWalker = new TreeWalker( { boundaries: range } );

		for ( let value of treeWalker ) {
			let node = value.item;
			let nodeText = node.data;

			if ( nodeText ) {
				txt += nodeText;
			}
		}

		return txt;
	}
}
