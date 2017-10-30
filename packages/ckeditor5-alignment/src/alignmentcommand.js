/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/alignmentcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import first from '../../ckeditor5-utils/src/first';

/**
 * The alignment command plugin.
 *
 * @extends module:core/command~Command
 */
export default class AlignmentCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {'left'|'right'|'center'|'justify'} type Alignment type to be handled by this command.
	 */
	constructor( editor, type ) {
		super( editor );

		/**
		 * The type of the list created by the command.
		 *
		 * @readonly
		 * @member {'left'|'right'|'center'|'justify'}
		 */
		this.type = type;

		/**
		 * A flag indicating whether the command is active, which means that the selection starts in a list of the same type.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #value
		 */
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const block = first( this.editor.document.selection.getSelectedBlocks() );

		if ( !block ) {
			return;
		}

		const alignment = block.getAttribute( 'alignment' );

		this.value = !!block && ( alignment === this.type || isDefaultAlignment( alignment, this.type ) );

		this.isEnabled = true;
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps.
	 * A new batch will be created if this option is not set.
	 */
	execute( options = {} ) {
		const editor = this.editor;
		const document = editor.document;

		document.enqueueChanges( () => {
			const batch = options.batch || document.batch();
			const blocks = Array.from( document.selection.getSelectedBlocks() );

			for ( const block of blocks ) {
				batch.setAttribute( block, 'alignment', this.type );
			}
		} );
	}
}

function isDefaultAlignment( alignment, type ) {
	// LTR only:
	const defaultAlignment = 'left';

	if ( type !== defaultAlignment ) {
		return false;
	}

	return !alignment || alignment === type;
}
