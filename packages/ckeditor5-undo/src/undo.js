/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import UndoEngine from './undoengine.js';
import Model from '../ui/model.js';
import Button from '../ui/button/button.js';
import ButtonView from '../ui/button/buttonview.js';

/**
 * Undo feature. Introduces the "Undo" and "Redo" buttons to the editor.
 *
 * Below is the explanation of undo mechanism working together with {@link engine.model.CompressedHistory CompressedHistory}:
 *
 * Whenever a {@link engine.model.Delta delta} is applied to the {@link engine.model.Document document}, it is saved to
 * `CompressedHistory` as is. The {@link engine.model.Batch batch} that owns that delta is also saved, in {@link undo.UndoCommand},
 * together with selection that was on the document before the delta was applied. Batch is saved instead of delta because
 * changes are undone batch-by-batch, not delta-by-delta and batch is seen as one undo step.
 *
 * After some changes happen to the document, we can represent `CompressedHistory` and `UndoCommand` stack as follows:
 *
 *		  history                           undo stack
 *		===========             ==================================
 *		[delta A1]              [batch A with selection before A1]
 *		[delta B1]              [batch B with selection before B1]
 *		[delta B2]              [batch C with selection before C1]
 *		[delta C1]
 *		[delta C2]
 *		[delta B3]
 *		[delta C3]
 *
 * Where deltas starting by the same letter are from same batch.
 *
 * Undoing a batch means that we need to generate set of deltas which will reverse effects of that batch. I.e. if batch
 * added several letters, undoing batch should remove them. It is important to apply undoing deltas in reversed order,
 * so if batch has delta `X`, `Y`, `Z` we should apply reversed deltas `Zr`, `Yr` and `Xr`. In other case, reversed delta
 * `Xr` would operate on wrong document state, because delta `X` does not know that delta `Y` and `Z` happened.
 *
 * After deltas from undone batch got {@link engine.model.Delta#getReversed reversed} we need to make sure if they are
 * ready to be applied. In our scenario, delta `C3` is the last delta so `C3r` bases on up-to-date document state so
 * it can be applied to the document.
 *
 *		  history                           undo stack
 *		===========             ==================================
 *		[delta A1 ]             [batch A with selection before A1]
 *		[delta B1 ]             [batch B with selection before B1]
 *		[delta B2 ]             [   processing undoing batch C   ]
 *		[delta C1 ]
 *		[delta C2 ]
 *		[delta B3 ]
 *		[delta C3 ]
 *		[delta C3r]
 *
 * Next is delta `C2`, reversed to `C2r`. `C2r` bases on `C2`, so it bases on wrong document state. It needs to be
 * transformed by deltas from history that happened after it, so it "knows" about them. Let `C2' = C2r * B3 * C3 * C3r`,
 * where `*` means "transformed by". As can be seen, `C2r` is transformed by a delta which is undone afterwards anyway.
 * This brings two problems: lower effectiveness (obvious) and incorrect results. Bad results come from the fact that
 * operational transformation algorithms assume there is no connection between two transformed operations when resolving
 * conflicts, which is true for, i.e. collaborative editing, but is not true for undo algorithm.
 *
 * To prevent both problems, `CompressedHistory` introduces an API to {@link engine.model.CompressedDelta#removeDelta remove}
 * deltas from history. It is used to remove undone and undoing deltas after they are applied. It feels right - delta is
 * undone/reversed = "removed", there should be no sign of it in history (fig. 1). `---` symbolizes removed delta.
 *
 *		history (fig. 1)            history (fig. 2)            history (fig. 3)
 *		================            ================            ================
 *		   [delta A1]                  [delta A1]                  [delta A1]
 *		   [delta B1]                  [delta B1]                  [delta B1]
 *		   [delta B2]                  [delta B2]                  [delta B2]
 *		   [delta C1]                  [delta C1]                  [---C1---]
 *		   [delta C2]                  [---C2---]                  [---C2---]
 *		   [delta B3]                  [delta B3]                  [delta B3]
 *		   [---C3---]                  [---C3---]                  [---C3---]
 *		   [---C3r--]                  [---C3r--]                  [---C3r--]
 *		                               [---C2'--]                  [---C2'--]
 *		                                                           [---C1'--]
 *
 * Now we can transform `C2r` only by `B3` and remove both it and `C2` (fig. 2). Same with `C1` (fig. 3). `'` symbolizes
 * reversed delta that was later transformed.
 *
 * But what about that selection? For batch `C`, undo feature remembers selection just before `C1` was applied. It can be
 * visualized between delta `B2` and `B3` (see fig. 3). As can be seen, some operations were applied to the document since the selection
 * state was remembered. Setting document selection as it was remembered would be incorrect. It feels natural that
 * selection state should also be transformed by deltas from history. Same pattern applies as with transforming deltas - ranges
 * should not be transformed by undone and undoing deltas. Thankfully, those deltas are already removed from history.
 *
 * Unfortunately, a problem appears with delta `B3`. It still remembers context of deltas `C2` and `C1` on which it bases.
 * It is an obvious error: i.e. transforming by that delta would lead to wrong results or "repeating" history would
 * produce different document than actual.
 *
 * To prevent this situation, we have to also {@link engine.model.CompressedHistory#updateDelta update} `B3` in history.
 * It should be kept in a state that "does not remember" deltas that has been removed from the history. It is easily
 * achieved while transforming reversed delta. I.e., when `C2r` is transformed by `B3`, at the same time we transform
 * `B3` by `C2r`. Transforming `B3` that remembers `C2` by delta reversing `C2` effectively makes `B3` "forget" about `C2`.
 * By doing those transformation we effectively make `B3` base on `B2` which is a correct state of history (fig. 4).
 *
 *		     history (fig. 4)                         history (fig. 5)
 *		===========================            ===============================
 *		        [delta A1]                               [---A1---]
 *		        [delta B1]                         [delta B1 "without A1"]
 *		        [delta B2]                         [delta B2 "without A1"]
 *		        [---C1---]                               [---C1---]
 *		        [---C2---]                               [---C2---]
 *		[delta B3 "without C2, C1"]            [delta B3 "without C2, C1, A1"]
 *		        [---C3---]                               [---C3---]
 *		        [---C3r--]                               [---C3r--]
 *		        [---C2'--]                               [---C2'--]
 *		        [---C1'--]                               [---C1'--]
 *		                                                 [---A1'--]
 *
 * Selective undo works on the same basis, however instead of undoing the last batch in undo stack, any batch can be undone.
 * Same algorithm applies: deltas from batch (i.e. `A1`) are reversed and then transformed by deltas stored in history,
 * simultaneously updating them. Then deltas are applied to the document and removed from history (fig. 5).
 *
 * @memberOf undo
 * @extends ckeditor5.Feature
 */
export default class Undo extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ UndoEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		this._addButton( 'undo', t( 'Undo' ) );
		this._addButton( 'redo', t( 'Redo' ) );

		editor.keystrokes.set( 'CTRL+Z', 'undo' );
		editor.keystrokes.set( 'CTRL+Y', 'redo' );
		editor.keystrokes.set( 'CTRL+SHIFT+Z', 'redo' );
	}

	/**
	 * Creates a button for the specified command.
	 *
	 * @private
	 * @param {String} name Command name.
	 * @param {String} label Button label.
	 */
	_addButton( name, label ) {
		const editor = this.editor;

		const command = editor.commands.get( name );

		const model = new Model( {
			isOn: false,
			label: label,
			noText: true,
			icon: name,
			iconAlign: 'LEFT'
		} );

		model.bind( 'isEnabled' ).to( command, 'isEnabled' );

		this.listenTo( model, 'execute', () => editor.execute( name ) );

		editor.ui.featureComponents.add( name, Button, ButtonView, model );
	}
}
