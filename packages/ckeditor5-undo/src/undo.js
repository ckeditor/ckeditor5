/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
 * This is a "glue" plugin which loads the {@link module:undo/undoediting~UndoEditing undo editing feature}
 * and {@link module:undo/undoui~UndoUI undo UI feature}.
 *
 * Below is the explanation of the undo mechanism working together with {@link module:engine/model/history~History History}:
 *
 * Whenever a {@link module:engine/model/operation/operation~Operation operation} is applied to the
 * {@link module:engine/model/document~Document document}, it is saved to `History` as is.
 * The {@link module:engine/model/batch~Batch batch} that owns that operation is also saved, in
 * {@link module:undo/undocommand~UndoCommand}, together with the selection that was present in the document before the
 * operation was applied. A batch is saved instead of the operation because changes are undone batch-by-batch, not operation-by-operation
 * and a batch is seen as one undo step.
 *
 * After some changes happen to the document, the `History` and `UndoCommand` stack can be represented as follows:
 *
 *		    History                            Undo stack
 *		==============             ==================================
 *		[operation A1]                         [batch A]
 *		[operation B1]                         [batch B]
 *		[operation B2]                         [batch C]
 *		[operation C1]
 *		[operation C2]
 *		[operation B3]
 *		[operation C3]
 *
 * Where operations starting with the same letter are from same batch.
 *
 * Undoing a batch means that a set of operations which will reverse the effects of that batch needs to be generated.
 * For example, if a batch added several letters, undoing the batch should remove them. It is important to apply undoing
 * operations in the reversed order, so if a batch has operation `X`, `Y`, `Z`, reversed operations `Zr`, `Yr` and `Xr`
 * need to be applied. Otherwise reversed operation `Xr` would operate on a wrong document state, because operation `X`
 * does not know that operations `Y` and `Z` happened.
 *
 * After operations from an undone batch got {@link module:engine/model/operation/operation~Operation#getReversed reversed},
 * one needs to make sure if they are ready to be applied. In the scenario above, operation `C3` is the last operation and `C3r`
 * bases on up-to-date document state, so it can be applied to the document.
 *
 *		     History                             Undo stack
 *		=================             ==================================
 *		[ operation A1  ]                      [  batch A  ]
 *		[ operation B1  ]                      [  batch B  ]
 *		[ operation B2  ]             [   processing undoing batch C   ]
 *		[ operation C1  ]
 *		[ operation C2  ]
 *		[ operation B3  ]
 *		[ operation C3  ]
 *		[ operation C3r ]
 *
 * Next is operation `C2`, reversed to `C2r`. `C2r` bases on `C2`, so it bases on the wrong document state. It needs to be
 * transformed by operations from history that happened after it, so it "knows" about them. Let us assume that `C2' = C2r * B3 * C3 * C3r`,
 * where `*` means "transformed by". Rest of operations from that batch are processed in the same fashion.
 *
 *		     History                             Undo stack                                      Redo stack
 *		=================             ==================================             ==================================
 *		[ operation A1  ]                      [  batch A  ]                                    [ batch Cr ]
 *		[ operation B1  ]                      [  batch B  ]
 *		[ operation B2  ]
 *		[ operation C1  ]
 *		[ operation C2  ]
 *		[ operation B3  ]
 *		[ operation C3  ]
 *		[ operation C3r ]
 *		[ operation C2' ]
 *		[ operation C1' ]
 *
 * Selective undo works on the same basis, however, instead of undoing the last batch in the undo stack, any batch can be undone.
 * The same algorithm applies: operations from a batch (i.e. `A1`) are reversed and then transformed by operations stored in history.
 *
 * Redo also is very similar to undo. It has its own stack that is filled with undoing (reversed batches). Operations from
 * batch that is re-done are reversed-back, transformed in proper order and applied to the document.
 *
 *		     History                             Undo stack                                      Redo stack
 *		=================             ==================================             ==================================
 *		[ operation A1  ]                      [  batch A  ]
 *		[ operation B1  ]                      [  batch B  ]
 *		[ operation B2  ]                      [ batch Crr ]
 *		[ operation C1  ]
 *		[ operation C2  ]
 *		[ operation B3  ]
 *		[ operation C3  ]
 *		[ operation C3r ]
 *		[ operation C2' ]
 *		[ operation C1' ]
 *		[ operation C1'r]
 *		[ operation C2'r]
 *		[ operation C3rr]
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
