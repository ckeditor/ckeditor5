/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module undo/undo
 */

import Plugin from 'ckeditor5-core/src/plugin';
import UndoEngine from './undoengine';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';

/**
 * The undo feature. It introduces the Undo and Redo buttons to the editor.
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
 *		[delta A1]              [batch A with selection before A1]
 *		[delta B1]              [batch B with selection before B1]
 *		[delta B2]              [batch C with selection before C1]
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
 * Next is delta `C2`, reversed to `C2r`. `C2r` bases on `C2`, so it bases on the wrong document state. It needs to be
 * transformed by deltas from history that happened after it, so it "knows" about them. Let us assume that `C2' = C2r * B3 * C3 * C3r`,
 * where `*` means "transformed by". As can be seen, `C2r` is transformed by a delta which is undone afterwards anyway.
 * This brings two problems: lower effectiveness (obvious) and incorrect results. Bad results come from the fact that
 * operational transformation algorithms assume there is no connection between two transformed operations when resolving
 * conflicts, which is true for example for collaborative editing, but is not true for the undo algorithm.
 *
 * To prevent both problems, `History` introduces an API to {@link module:engine/model/history~History#removeDelta remove}
 * deltas from history. It is used to remove undone and undoing deltas after they are applied. It feels right &mdash; since when a
 * delta is undone or reversed, it is "removed" and there should be no sign of it in the history (fig. 1).
 *
 * Notes:
 *
 * * `---` symbolizes a removed delta.
 * * `'` symbolizes a reversed delta that was later transformed.
 *
 *		History (fig. 1)            History (fig. 2)            History (fig. 3)
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
 * `C2r` can now be transformed only by `B3` and both `C2'` and `C2` can be removed (fig. 2). Same with `C1` (fig. 3).
 *
 * But what about that selection? For batch `C`, undo feature remembers the selection just before `C1` was applied. It can be
 * visualized between delta `B2` and `B3` (see fig. 3). As can be seen, some operations were applied to the document since the selection
 * state was remembered. Setting the document selection as it was remembered would be incorrect. It feels natural that
 * the selection state should also be transformed by deltas from history. The same pattern applies as with transforming deltas &mdash;
 * ranges should not be transformed by undone and undoing deltas. Thankfully, those deltas are already removed from history.
 *
 * Unfortunately, a problem appears with delta `B3`. It still remembers the context of deltas `C2` and `C1` on which it bases.
 * It is an obvious error &mdash; transforming by that delta would lead to incorrect results or "repeating" history would
 * produce a different document than the actual one.
 *
 * To prevent this situation, `B3` needs to also be {@link module:engine/model/history~History#updateDelta updated} in history.
 * It should be kept in a state that "does not remember" deltas that were removed from history. It is easily
 * achieved while transforming the reversed delta. For example, when `C2r` is transformed by `B3`, at the same time `B3` is
 * transformed by `C2r`. Transforming `B3` that remembers `C2` by a delta reversing `C2` effectively makes `B3` "forget" about `C2`.
 * By doing these transformations you effectively make `B3` base on `B2` which is the correct state of history (fig. 4).
 *
 *		     History (fig. 4)                         History (fig. 5)
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
 * Selective undo works on the same basis, however, instead of undoing the last batch in the undo stack, any batch can be undone.
 * The same algorithm applies: deltas from a batch (i.e. `A1`) are reversed and then transformed by deltas stored in history,
 * simultaneously updating them. Then deltas are applied to the document and removed from history (fig. 5).
 *
 * @extends module:core/plugin~Plugin
 */
export default class Undo extends Plugin {
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

		this._addButton( 'undo', t( 'Undo' ), 'CTRL+Z' );
		this._addButton( 'redo', t( 'Redo' ), 'CTRL+Y' );

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
	 * @param {String} keystroke Command keystroke.
	 */
	_addButton( name, label, keystroke ) {
		const editor = this.editor;
		const command = editor.commands.get( name );

		editor.ui.componentFactory.add( name, ( locale ) => {
			const view = new ButtonView( locale );

			view.set( {
				label: label,
				icon: name,
				keystroke
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			this.listenTo( view, 'execute', () => editor.execute( name ) );

			return view;
		} );
	}
}
