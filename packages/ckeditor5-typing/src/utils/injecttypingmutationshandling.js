/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/injecttypingmutationshandling
 */

import diff from '@ckeditor/ckeditor5-utils/src/diff';
import DomConverter from '@ckeditor/ckeditor5-engine/src/view/domconverter';

import { getSingleTextNodeChange, containerChildrenMutated } from './utils';

/**
 * Handles mutations caused by normal typing.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export default function injectTypingMutationsHandling( editor ) {
	editor.editing.view.document.on( 'mutations', ( evt, mutations, viewSelection ) => {
		new MutationHandler( editor ).handle( mutations, viewSelection );
	} );
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
		if ( containerChildrenMutated( mutations ) ) {
			this._handleContainerChildrenMutations( mutations, viewSelection );
		} else {
			for ( const mutation of mutations ) {
				// Fortunately it will never be both.
				this._handleTextMutation( mutation, viewSelection );
				this._handleTextNodeInsertion( mutation );
			}
		}
	}

	/**
	 * Handles situations when container's children mutated during input. This can happen when
	 * the browser is trying to "fix" DOM in certain situations. For example, when the user starts to type
	 * in `<p><a href=""><i>Link{}</i></a></p>`, the browser might change the order of elements
	 * to `<p><i><a href="">Link</a>x{}</i></p>`. A similar situation happens when the spell checker
	 * replaces a word wrapped with `<strong>` with a word wrapped with a `<b>` element.
	 *
	 * To handle such situations, the common DOM ancestor of all mutations is converted to the model representation
	 * and then compared with the current model to calculate the proper text change.
	 *
	 * Note: Single text node insertion is handled in {@link #_handleTextNodeInsertion} and text node mutation is handled
	 * in {@link #_handleTextMutation}).
	 *
	 * @private
	 * @param {Array.<module:engine/view/observer/mutationobserver~MutatedText|
	 * module:engine/view/observer/mutationobserver~MutatedChildren>} mutations
	 * @param {module:engine/view/selection~Selection|null} viewSelection
	 */
	_handleContainerChildrenMutations( mutations, viewSelection ) {
		// Get common ancestor of all mutations.
		const mutationsCommonAncestor = getMutationsContainer( mutations );

		// Quit if there is no common ancestor.
		if ( !mutationsCommonAncestor ) {
			return;
		}

		const domConverter = this.editor.editing.view.domConverter;

		// Get common ancestor in DOM.
		const domMutationCommonAncestor = domConverter.mapViewToDom( mutationsCommonAncestor );

		// Create fresh DomConverter so it will not use existing mapping and convert current DOM to model.
		// This wouldn't be needed if DomConverter would allow to create fresh view without checking any mappings.
		const freshDomConverter = new DomConverter( this.editor.editing.view.document );
		const modelFromCurrentDom = this.editor.data.toModel(
			freshDomConverter.domToView( domMutationCommonAncestor )
		).getChild( 0 );

		// Current model.
		const currentModel = this.editor.editing.mapper.toModelElement( mutationsCommonAncestor );

		// If common ancestor is not mapped, do not do anything. It probably is a parent of another view element.
		// That means that we would need to diff model elements (see `if` below). Better return early instead of
		// trying to get a reasonable model ancestor. It will fell into the `if` below anyway.
		// This situation happens for example for lists. If `<ul>` is a common ancestor, `currentModel` is `undefined`
		// because `<ul>` is not mapped (`<li>`s are).
		// See https://github.com/ckeditor/ckeditor5/issues/718.
		if ( !currentModel ) {
			return;
		}

		// Get children from both ancestors.
		const modelFromDomChildren = Array.from( modelFromCurrentDom.getChildren() );
		const currentModelChildren = Array.from( currentModel.getChildren() );

		// Remove the last `<softBreak>` from the end of `modelFromDomChildren` if there is no `<softBreak>` in current model.
		// If the described scenario happened, it means that this is a bogus `<br />` added by a browser.
		const lastDomChild = modelFromDomChildren[ modelFromDomChildren.length - 1 ];
		const lastCurrentChild = currentModelChildren[ currentModelChildren.length - 1 ];

		const isLastDomChildSoftBreak = lastDomChild && lastDomChild.is( 'element', 'softBreak' );
		const isLastCurrentChildSoftBreak = lastCurrentChild && !lastCurrentChild.is( 'element', 'softBreak' );

		if ( isLastDomChildSoftBreak && isLastCurrentChildSoftBreak ) {
			modelFromDomChildren.pop();
		}

		const schema = this.editor.model.schema;

		// Skip situations when common ancestor has any container elements.
		if ( !isSafeForTextMutation( modelFromDomChildren, schema ) || !isSafeForTextMutation( currentModelChildren, schema ) ) {
			return;
		}

		// Replace &nbsp; inserted by the browser with normal space. See comment in `_handleTextMutation`.
		// Replace non-texts with any character. This is potentially dangerous but passes in manual tests. The thing is
		// that we need to take care of proper indexes so we cannot simply remove non-text elements from the content.
		// By inserting a character we keep all the real texts on their indexes.
		const newText = modelFromDomChildren.map( item => item.is( '$text' ) ? item.data : '@' ).join( '' ).replace( /\u00A0/g, ' ' );
		const oldText = currentModelChildren.map( item => item.is( '$text' ) ? item.data : '@' ).join( '' ).replace( /\u00A0/g, ' ' );

		// Do nothing if mutations created same text.
		if ( oldText === newText ) {
			return;
		}

		const diffResult = diff( oldText, newText );

		const { firstChangeAt, insertions, deletions } = calculateChanges( diffResult );

		// Try setting new model selection according to passed view selection.
		let modelSelectionRange = null;

		if ( viewSelection ) {
			modelSelectionRange = this.editing.mapper.toModelRange( viewSelection.getFirstRange() );
		}

		const insertText = newText.substr( firstChangeAt, insertions );
		const removeRange = this.editor.model.createRange(
			this.editor.model.createPositionAt( currentModel, firstChangeAt ),
			this.editor.model.createPositionAt( currentModel, firstChangeAt + deletions )
		);

		this.editor.execute( 'input', {
			text: insertText,
			range: removeRange,
			resultRange: modelSelectionRange
		} );
	}

	/**
	 * @private
	 */
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

		// Do nothing if mutations created same text.
		if ( oldText === newText ) {
			return;
		}

		const diffResult = diff( oldText, newText );

		const { firstChangeAt, insertions, deletions } = calculateChanges( diffResult );

		// Try setting new model selection according to passed view selection.
		let modelSelectionRange = null;

		if ( viewSelection ) {
			modelSelectionRange = this.editing.mapper.toModelRange( viewSelection.getFirstRange() );
		}

		// Get the position in view and model where the changes will happen.
		const viewPos = this.editing.view.createPositionAt( mutation.node, firstChangeAt );
		const modelPos = this.editing.mapper.toModelPosition( viewPos );
		const removeRange = this.editor.model.createRange( modelPos, modelPos.getShiftedBy( deletions ) );
		const insertText = newText.substr( firstChangeAt, insertions );

		this.editor.execute( 'input', {
			text: insertText,
			range: removeRange,
			resultRange: modelSelectionRange
		} );
	}

	/**
	 * @private
	 */
	_handleTextNodeInsertion( mutation ) {
		if ( mutation.type != 'children' ) {
			return;
		}

		const change = getSingleTextNodeChange( mutation );
		const viewPos = this.editing.view.createPositionAt( mutation.node, change.index );
		const modelPos = this.editing.mapper.toModelPosition( viewPos );
		const insertedText = change.values[ 0 ].data;

		this.editor.execute( 'input', {
			// Replace &nbsp; inserted by the browser with normal space.
			// See comment in `_handleTextMutation`.
			// In this case we don't need to do this before `diff` because we diff whole nodes.
			// Just change &nbsp; in case there are some.
			text: insertedText.replace( /\u00A0/g, ' ' ),
			range: this.editor.model.createRange( modelPos )
		} );
	}
}

// Returns first common ancestor of all mutations that is either {@link module:engine/view/containerelement~ContainerElement}
// or {@link module:engine/view/rootelement~RootElement}.
//
// @private
// @param {Array.<module:engine/view/observer/mutationobserver~MutatedText|
// module:engine/view/observer/mutationobserver~MutatedChildren>} mutations
// @returns {module:engine/view/containerelement~ContainerElement|engine/view/rootelement~RootElement|undefined}
function getMutationsContainer( mutations ) {
	const lca = mutations
		.map( mutation => mutation.node )
		.reduce( ( commonAncestor, node ) => {
			return commonAncestor.getCommonAncestor( node, { includeSelf: true } );
		} );

	if ( !lca ) {
		return;
	}

	// We need to look for container and root elements only, so check all LCA's
	// ancestors (starting from itself).
	return lca.getAncestors( { includeSelf: true, parentFirst: true } )
		.find( element => element.is( 'containerElement' ) || element.is( 'rootElement' ) );
}

// Returns true if provided array contains content that won't be problematic during diffing and text mutation handling.
//
// @param {Array.<module:engine/model/node~Node>} children
// @param {module:engine/model/schema~Schema} schema
// @returns {Boolean}
function isSafeForTextMutation( children, schema ) {
	return children.every( child => schema.isInline( child ) );
}

// Calculates first change index and number of characters that should be inserted and deleted starting from that index.
//
// @private
// @param diffResult
// @returns {{insertions: number, deletions: number, firstChangeAt: *}}
function calculateChanges( diffResult ) {
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
	// How many characters, starting from `firstChangeAt`, should be inserted.
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

	return { insertions, deletions, firstChangeAt };
}
