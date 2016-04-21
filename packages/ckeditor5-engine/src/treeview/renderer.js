/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import diff from '../../utils/diff.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * Renderer updates DOM tree, to make it a reflection of the view tree. Changed nodes need to be
 * {@link engine.treeView.Renderer#markToSync marked} to be rendered. Then, on {@link engine.treeView.Renderer#render render}, renderer
 * ensure they need to be refreshed and creates DOM nodes from view nodes,
 * {@link engine.treeView.DomConverter#bindElements bind} them and insert into DOM tree. Renderer use {@link engine.treeView.DomConverter}
 * to transform and bind nodes.
 *
 * @memberOf engine.treeView
 */
export default class Renderer {
	/**
	 * Creates a renderer instance.
	 *
	 * @param {engine.treeView.DomConverter} domConverter Converter instance.
	 */
	constructor( domConverter ) {
		/**
		 * Converter instance.
		 *
		 * @readonly
		 * @member {engine.treeView.DomConverter} engine.treeView.Renderer#domConverter
		 */
		this.domConverter = domConverter;

		/**
		 * Set of nodes which attributes changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<engine.treeView.Node>} engine.treeView.Renderer#markedAttributes
		 */
		this.markedAttributes = new Set();

		/**
		 * Set of elements which child lists changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<engine.treeView.Node>} engine.treeView.Renderer#markedChildren
		 */
		this.markedChildren = new Set();

		/**
		 * Set of text nodes which text data changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<engine.treeView.Node>} engine.treeView.Renderer#markedTexts
		 */
		this.markedTexts = new Set();
	}

	/**
	 * Mark node to be synchronized.
	 *
	 * Note that only view nodes which parents have corresponding DOM elements need to be marked to be synchronized.
	 *
	 * @see engine.treeView.Renderer#markedAttributes
	 * @see engine.treeView.Renderer#markedChildren
	 * @see engine.treeView.Renderer#markedTexts
	 *
	 * @param {engine.treeView.ChangeType} type Type of the change.
	 * @param {engine.treeView.Node} node Node to be marked.
	 */
	markToSync( type, node ) {
		if ( type === 'TEXT' ) {
			if ( this.domConverter.getCorrespondingDom( node.parent ) ) {
				this.markedTexts.add( node );
			}
		} else {
			// If the node has no DOM element it is not rendered yet,
			// its children/attributes do not need to be marked to be sync.
			if ( !this.domConverter.getCorrespondingDom( node ) ) {
				return;
			}

			if ( type === 'ATTRIBUTES' ) {
				this.markedAttributes.add( node );
			} else if ( type === 'CHILDREN' ) {
				this.markedChildren.add( node );
			} else {
				/**
				 * Unknown type passed to Renderer.markToSync.
				 *
				 * @error renderer-unknown-type
				 */
				throw new CKEditorError( 'renderer-unknown-type: Unknown type passed to Renderer.markToSync.' );
			}
		}
	}

	/**
	 * Render method check {@link engine.treeView.Renderer#markedAttributes}, {@link engine.treeView.Renderer#markedChildren} and
	 * {@link engine.treeView.Renderer#markedTexts} and updated all nodes which needs to be updated. Then it clear all three
	 * sets.
	 *
	 * Renderer try not to break IME, so it do as little as it is possible to update DOM.
	 *
	 * For attributes it adds new attributes to DOM elements, update attributes with different values and remove
	 * attributes which does not exists in the view element.
	 *
	 * For text nodes it update the text string if it is different. Note that if parent element is marked as an element
	 * which changed child list, text node update will not be done, because it may not be possible do find a
	 * {@link engine.treeView.DomConverter#getCorrespondingDomText corresponding DOM text}. The change will be handled in the
	 * parent element.
	 *
	 * For nodes which changed child list it calculates a {@link diff} using {@link engine.treeView.DomConverter#compareNodes}
	 * and add or removed nodes which changed.
	 */
	render() {
		const domConverter = this.domConverter;

		for ( let node of this.markedTexts ) {
			if ( !this.markedChildren.has( node.parent ) && domConverter.getCorrespondingDom( node.parent ) ) {
				updateText( node );
			}
		}

		for ( let element of this.markedAttributes ) {
			updateAttrs( element );
		}

		for ( let element of this.markedChildren ) {
			updateChildren( element );
		}

		this.markedTexts.clear();
		this.markedAttributes.clear();
		this.markedChildren.clear();

		function updateText( viewText ) {
			const domText = domConverter.getCorrespondingDom( viewText );

			if ( domText.data != viewText.data ) {
				domText.data = viewText.data;
			}
		}

		function updateAttrs( viewElement ) {
			const domElement = domConverter.getCorrespondingDom( viewElement );
			const domAttrKeys = Array.from( domElement.attributes ).map( attr => attr.name );
			const viewAttrKeys = viewElement.getAttributeKeys();

			// Add or overwrite attributes.
			for ( let key of viewAttrKeys ) {
				domElement.setAttribute( key, viewElement.getAttribute( key ) );
			}

			// Remove from DOM attributes which do not exists in the view.
			for ( let key of domAttrKeys ) {
				if ( !viewElement.hasAttribute( key ) ) {
					domElement.removeAttribute( key );
				}
			}
		}

		function updateChildren( viewElement ) {
			const domElement = domConverter.getCorrespondingDom( viewElement );
			const domChildren = domElement.childNodes;
			const viewChildren = Array.from( viewElement.getChildren() );
			const domDocument = domElement.ownerDocument;

			const actions = diff( domChildren, viewChildren,
				( domNode, viewNode ) => domConverter.compareNodes( domNode, viewNode ) );

			let i = 0;

			for ( let action of actions ) {
				if ( action === 'INSERT' ) {
					let domChildToInsert = domConverter.viewToDom( viewChildren[ i ], domDocument, { bind: true } );
					domElement.insertBefore( domChildToInsert, domChildren[ i ] || null );
					i++;
				} else if ( action === 'DELETE' ) {
					domElement.removeChild( domChildren[ i ] );
				} else { // 'EQUAL'
					i++;
				}
			}
		}
	}
}
