/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module undo/undo
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import UndoEditing from './undoediting';
import UndoUI from './undoui';

/**
 * The undo feature.
 *
 * It loads the {@link module:undo/undoediting~UndoEditing undo editing feature}
 * and {@link module:undo/undoui~UndoUI undo UI feature}.
 *
 * Below is the explanation of the undo mechanism working together with {@link module:engine/model/history~History History}:
 *
 * Whenever a {@link module:engine/model/delta/delta~Delta delta} is applied to the
 * {@link module:engine/model/document~Document document}, it is saved to `History` as is.
 * The {@link module:engine/model/batch~Batch batch} that owns that delta is also saved, in
 * {@link module:undo/undocommand~UndoCommand}, together with the selection that was present in the document before the
 * delta was applied. A batch is saved instead of the delta because changes are undone batch-by-batch, not delta-by-delta
 * and a batch is seen as one undo step.
 *
 * After some changes happen to the document, the `History` and `UndoCommand` stack can be represented as follows:
 *
 *		  History                           Undo stack
 *		===========             ==================================
 *		[delta A1]                          [batch A]
 *		[delta B1]                          [batch B]
 *		[delta B2]                          [batch C]
 *		[delta C1]
 *		[delta C2]
 *		[delta B3]
 *		[delta C3]
 *
 * Where deltas starting with the same letter are from same batch.
 *
 * Undoing a batch means that a set of deltas which will reverse the effects of that batch needs to be generated. For example, if a batch
 * added several letters, undoing the batch should remove them. It is important to apply undoing deltas in the reversed order,
 * so if a batch has delta `X`, `Y`, `Z`, reversed deltas `Zr`, `Yr` and `Xr` need to be applied. Otherwise reversed delta
 * `Xr` would operate on a wrong document state, because delta `X` does not know that deltas `Y` and `Z` happened.
 *
 * After deltas from an undone batch got {@link module:engine/model/delta/delta~Delta#getReversed reversed},
 * one needs to make sure if they are ready to be applied. In the scenario above, delta `C3` is the last delta and `C3r`
 * bases on up-to-date document state, so it can be applied to the document.
 *
 *		  History                           Undo stack
 *		=============             ==================================
 *		[ delta A1  ]                      [  batch A  ]
 *		[ delta B1  ]                      [  batch B  ]
 *		[ delta B2  ]             [   processing undoing batch C   ]
 *		[ delta C1  ]
 *		[ delta C2  ]
 *		[ delta B3  ]
 *		[ delta C3  ]
 *		[ delta C3r ]
 *
 * Next is delta `C2`, reversed to `C2r`. `C2r` bases on `C2`, so it bases on the wrong document state. It needs to be
 * transformed by deltas from history that happened after it, so it "knows" about them. Let us assume that `C2' = C2r * B3 * C3 * C3r`,
 * where `*` means "transformed by". Rest of deltas from that batch are processed in the same fashion.
 *
 *		  History                           Undo stack                                     Redo stack
 *		=============             ==================================             ==================================
 *		[ delta A1  ]                      [  batch A  ]                                  [ batch Cr ]
 *		[ delta B1  ]                      [  batch B  ]
 *		[ delta B2  ]
 *		[ delta C1  ]
 *		[ delta C2  ]
 *		[ delta B3  ]
 *		[ delta C3  ]
 *		[ delta C3r ]
 *		[ delta C2' ]
 *		[ delta C1' ]
 *
 * Selective undo works on the same basis, however, instead of undoing the last batch in the undo stack, any batch can be undone.
 * The same algorithm applies: deltas from a batch (i.e. `A1`) are reversed and then transformed by deltas stored in history.
 *
 * Redo also is very similar to undo. It has its own stack that is filled with undoing (reversed batches). Deltas from
 * batch that is re-done are reversed-back, transformed in proper order and applied to the document.
 *
 *		  History                           Undo stack                                     Redo stack
 *		=============             ==================================             ==================================
 *		[ delta A1  ]                      [  batch A  ]
 *		[ delta B1  ]                      [  batch B  ]
 *		[ delta B2  ]                      [ batch Crr ]
 *		[ delta C1  ]
 *		[ delta C2  ]
 *		[ delta B3  ]
 *		[ delta C3  ]
 *		[ delta C3r ]
 *		[ delta C2' ]
 *		[ delta C1' ]
 *		[ delta C1'r]
 *		[ delta C2'r]
 *		[ delta C3rr]
 *
 * @extends module:core/plugin~Plugin
 */
export default class Undo extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ UndoEditing, UndoUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Undo';
	}
}
