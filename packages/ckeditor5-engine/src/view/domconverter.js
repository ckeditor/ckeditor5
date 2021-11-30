/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/domconverter
 */

/* globals document, Node, NodeFilter, DOMParser, Text */

import ViewText from './text';
import ViewElement from './element';
import ViewUIElement from './uielement';
import ViewPosition from './position';
import ViewRange from './range';
import ViewSelection from './selection';
import ViewDocumentFragment from './documentfragment';
import ViewTreeWalker from './treewalker';
import Matcher from './matcher';
import {
	BR_FILLER, INLINE_FILLER_LENGTH, NBSP_FILLER, MARKED_NBSP_FILLER,
	getDataWithoutFiller, isInlineFiller, startsWithFiller
} from './filler';

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { logWarning } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import indexOf from '@ckeditor/ckeditor5-utils/src/dom/indexof';
import getAncestors from '@ckeditor/ckeditor5-utils/src/dom/getancestors';
import isText from '@ckeditor/ckeditor5-utils/src/dom/istext';

const BR_FILLER_REF = BR_FILLER( document ); // eslint-disable-line new-cap
const NBSP_FILLER_REF = NBSP_FILLER( document ); // eslint-disable-line new-cap
const MARKED_NBSP_FILLER_REF = MARKED_NBSP_FILLER( document ); // eslint-disable-line new-cap
const UNSAFE_ATTRIBUTE_NAME_PREFIX = 'data-ck-unsafe-attribute-';
const UNSAFE_ELEMENT_REPLACEMENT_ATTRIBUTE = 'data-ck-unsafe-element';

/**
 * `DomConverter` is a set of tools to do transformations between DOM nodes and view nodes. It also handles
 * {@link module:engine/view/domconverter~DomConverter#bindElements bindings} between these nodes.
 *
 * An instance of the DOM converter is available under
 * {@link module:engine/view/view~View#domConverter `editor.editing.view.domConverter`}.
 *
 * The DOM converter does not check which nodes should be rendered (use {@link module:engine/view/renderer~Renderer}), does not keep the
 * state of a tree nor keeps the synchronization between the tree view and the DOM tree (use {@link module:engine/view/document~Document}).
 *
 * The DOM converter keeps DOM elements to view element bindings, so when the converter gets destroyed, the bindings are lost.
 * Two converters will keep separate binding maps, so one tree view can be bound with two DOM trees.
 */
export default class DomConverter {
	/**
	 * Creates a DOM converter.
	 *
	 * @param {module:engine/view/document~Document} document The view document instance.
	 * @param {Object} options An object with configuration options.
	 * @param {module:engine/view/filler~BlockFillerMode} [options.blockFillerMode] The type of the block filler to use.
	 * Default value depends on the options.renderingMode:
	 *  'nbsp' when options.renderingMode == 'data',
	 *  'br' when options.renderingMode == 'editing'.
	 * @param {'data'|'editing'} [options.renderingMode='editing'] Whether to leave the View-to-DOM conversion result unchanged
	 * or improve editing experience by filtering out interactive data.
	 */
	constructor( document, options = {} ) {
		/**
		 * @readonly
		 * @type {module:engine/view/document~Document}
		 */
		this.document = document;

		/**
		 * Whether to leave the View-to-DOM conversion result unchanged or improve editing experience by filtering out interactive data.
		 *
		 * @member {'data'|'editing'} module:engine/view/domconverter~DomConverter#renderingMode
		 */
		this.renderingMode = options.renderingMode || 'editing';

		/**
		 * The mode of a block filler used by the DOM converter.
		 *
		 * @member {'br'|'nbsp'|'markedNbsp'} module:engine/view/domconverter~DomConverter#blockFillerMode
		 */
		this.blockFillerMode = options.blockFillerMode || ( this.renderingMode === 'editing' ? 'br' : 'nbsp' );

		/**
		 * Elements which are considered pre-formatted elements.
		 *
		 * @readonly
		 * @member {Array.<String>} module:engine/view/domconverter~DomConverter#preElements
		 */
		this.preElements = [ 'pre' ];

		/**
		 * Elements which are considered block elements (and hence should be filled with a
		 * {@link #isBlockFiller block filler}).
		 *
		 * Whether an element is considered a block element also affects handling of trailing whitespaces.
		 *
		 * You can extend this array if you introduce support for block elements which are not yet recognized here.
		 *
		 * @readonly
		 * @member {Array.<String>} module:engine/view/domconverter~DomConverter#blockElements
		 */
		this.blockElements = [
			'address', 'article', 'aside', 'blockquote', 'caption', 'center', 'dd', 'details', 'dir', 'div',
			'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header',
			'hgroup', 'legend', 'li', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'tbody',
			'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
		];

		/**
		 * A list of elements that exist inline (in text) but their inner structure cannot be edited because
		 * of the way they are rendered by the browser. They are mostly HTML form elements but there are other
		 * elements such as `<img>` or `<iframe>` that also have non-editable children or no children whatsoever.
		 *
		 * Whether an element is considered an inline object has an impact on white space rendering (trimming)
		 * around (and inside of it). In short, white spaces in text nodes next to inline objects are not trimmed.
		 *
		 * You can extend this array if you introduce support for inline object elements which are not yet recognized here.
		 *
		 * @readonly
		 * @member {Array.<String>} module:engine/view/domconverter~DomConverter#inlineObjectElements
		 */
		this.inlineObjectElements = [
			'object', 'iframe', 'input', 'button', 'textarea', 'select', 'option', 'video', 'embed', 'audio', 'img', 'canvas'
		];

		/**
		 * The DOM-to-view mapping.
		 *
		 * @private
		 * @member {WeakMap} module:engine/view/domconverter~DomConverter#_domToViewMapping
		 */
		this._domToViewMapping = new WeakMap();

		/**
		 * The view-to-DOM mapping.
		 *
		 * @private
		 * @member {WeakMap} module:engine/view/domconverter~DomConverter#_viewToDomMapping
		 */
		this._viewToDomMapping = new WeakMap();

		/**
		 * Holds the mapping between fake selection containers and corresponding view selections.
		 *
		 * @private
		 * @member {WeakMap} module:engine/view/domconverter~DomConverter#_fakeSelectionMapping
		 */
		this._fakeSelectionMapping = new WeakMap();

		/**
		 * Matcher for view elements whose content should be treated as raw data
		 * and not processed during the conversion from DOM nodes to view elements.
		 *
		 * @private
		 * @type {module:engine/view/matcher~Matcher}
		 */
		this._rawContentElementMatcher = new Matcher();

		/**
		 * A set of encountered raw content DOM nodes. It is used for preventing left trimming of the following text node.
		 *
		 * @private
		 * @type {WeakSet.<Node>}
		 */
		this._encounteredRawContentDomNodes = new WeakSet();
	}

	/**
	 * Binds a given DOM element that represents fake selection to a **position** of a
	 * {@link module:engine/view/documentselection~DocumentSelection document selection}.
	 * Document selection copy is stored and can be retrieved by the
	 * {@link module:engine/view/domconverter~DomConverter#fakeSelectionToView} method.
	 *
	 * @param {HTMLElement} domElement
	 * @param {module:engine/view/documentselection~DocumentSelection} viewDocumentSelection
	 */
	bindFakeSelection( domElement, viewDocumentSelection ) {
		this._fakeSelectionMapping.set( domElement, new ViewSelection( viewDocumentSelection ) );
	}

	/**
	 * Returns a {@link module:engine/view/selection~Selection view selection} instance corresponding to a given
	 * DOM element that represents fake selection. Returns `undefined` if binding to the given DOM element does not exist.
	 *
	 * @param {HTMLElement} domElement
	 * @returns {module:engine/view/selection~Selection|undefined}
	 */
	fakeSelectionToView( domElement ) {
		return this._fakeSelectionMapping.get( domElement );
	}

	/**
	 * Binds DOM and view elements, so it will be possible to get corresponding elements using
	 * {@link module:engine/view/domconverter~DomConverter#mapDomToView} and
	 * {@link module:engine/view/domconverter~DomConverter#mapViewToDom}.
	 *
	 * @param {HTMLElement} domElement The DOM element to bind.
	 * @param {module:engine/view/element~Element} viewElement The view element to bind.
	 */
	bindElements( domElement, viewElement ) {
		this._domToViewMapping.set( domElement, viewElement );
		this._viewToDomMapping.set( viewElement, domElement );
	}

	/**
	 * Unbinds a given DOM element from the view element it was bound to. Unbinding is deep, meaning that all children of
	 * the DOM element will be unbound too.
	 *
	 * @param {HTMLElement} domElement The DOM element to unbind.
	 */
	unbindDomElement( domElement ) {
		const viewElement = this._domToViewMapping.get( domElement );

		if ( viewElement ) {
			this._domToViewMapping.delete( domElement );
			this._viewToDomMapping.delete( viewElement );

			for ( const child of domElement.childNodes ) {
				this.unbindDomElement( child );
			}
		}
	}

	/**
	 * Binds DOM and view document fragments, so it will be possible to get corresponding document fragments using
	 * {@link module:engine/view/domconverter~DomConverter#mapDomToView} and
	 * {@link module:engine/view/domconverter~DomConverter#mapViewToDom}.
	 *
	 * @param {DocumentFragment} domFragment The DOM document fragment to bind.
	 * @param {module:engine/view/documentfragment~DocumentFragment} viewFragment The view document fragment to bind.
	 */
	bindDocumentFragments( domFragment, viewFragment ) {
		this._domToViewMapping.set( domFragment, viewFragment );
		this._viewToDomMapping.set( viewFragment, domFragment );
	}

	/**
	 * Decides whether a given pair of attribute key and value should be passed further down the pipeline.
	 *
	 * @param {String} attributeKey
	 * @param {String} attributeValue
	 * @param {String} elementName Element name in lower case.
	 * @returns {Boolean}
	 */
	shouldRenderAttribute( attributeKey, attributeValue, elementName ) {
		if ( this.renderingMode === 'data' ) {
			return true;
		}

		attributeKey = attributeKey.toLowerCase();

		if ( attributeKey.startsWith( 'on' ) ) {
			return false;
		}

		if (
			attributeKey === 'srcdoc' &&
			attributeValue.match( /\bon\S+\s*=|javascript:|<\s*\/*script/i )
		) {
			return false;
		}

		if (
			elementName === 'img' &&
			( attributeKey === 'src' || attributeKey === 'srcset' )
		) {
			return true;
		}

		if ( elementName === 'source' && attributeKey === 'srcset' ) {
			return true;
		}

		if ( attributeValue.match( /^\s*(javascript:|data:(image\/svg|text\/x?html))/i ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Set `domElement`'s content using provided `html` argument. Apply necessary filtering for the editing pipeline.
	 *
	 * @param {Element} domElement DOM element that should have `html` set as its content.
	 * @param {String} html Textual representation of the HTML that will be set on `domElement`.
	 */
	setContentOf( domElement, html ) {
		// For data pipeline we pass the HTML as-is.
		if ( this.renderingMode === 'data' ) {
			domElement.innerHTML = html;

			return;
		}

		const document = new DOMParser().parseFromString( html, 'text/html' );
		const fragment = document.createDocumentFragment();
		const bodyChildNodes = document.body.childNodes;

		while ( bodyChildNodes.length > 0 ) {
			fragment.appendChild( bodyChildNodes[ 0 ] );
		}

		const treeWalker = document.createTreeWalker( fragment, NodeFilter.SHOW_ELEMENT );
		const nodes = [];

		let currentNode;

		// eslint-disable-next-line no-cond-assign
		while ( currentNode = treeWalker.nextNode() ) {
			nodes.push( currentNode );
		}

		for ( const currentNode of nodes ) {
			// Go through nodes to remove those that are prohibited in editing pipeline.
			for ( const attributeName of currentNode.getAttributeNames() ) {
				this.setDomElementAttribute( currentNode, attributeName, currentNode.getAttribute( attributeName ) );
			}

			const elementName = currentNode.tagName.toLowerCase();

			// There are certain nodes, that should be renamed to <span> in editing pipeline.
			if ( this._shouldRenameElement( elementName ) ) {
				logWarning( 'domconverter-unsafe-element-detected', { unsafeElement: currentNode } );

				currentNode.replaceWith( this._createReplacementDomElement( elementName, currentNode ) );
			}
		}

		// Empty the target element.
		while ( domElement.firstChild ) {
			domElement.firstChild.remove();
		}

		domElement.append( fragment );
	}

	/**
	 * Converts the view to the DOM. For all text nodes, not bound elements and document fragments new items will
	 * be created. For bound elements and document fragments the method will return corresponding items.
	 *
	 * @param {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment} viewNode
	 * View node or document fragment to transform.
	 * @param {Document} domDocument Document which will be used to create DOM nodes.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
	 * @param {Boolean} [options.withChildren=true] If `true`, node's and document fragment's children will be converted too.
	 * @returns {Node|DocumentFragment} Converted node or DocumentFragment.
	 */
	viewToDom( viewNode, domDocument, options = {} ) {
		if ( viewNode.is( '$text' ) ) {
			const textData = this._processDataFromViewText( viewNode );

			return domDocument.createTextNode( textData );
		} else {
			if ( this.mapViewToDom( viewNode ) ) {
				return this.mapViewToDom( viewNode );
			}

			let domElement;

			if ( viewNode.is( 'documentFragment' ) ) {
				// Create DOM document fragment.
				domElement = domDocument.createDocumentFragment();

				if ( options.bind ) {
					this.bindDocumentFragments( domElement, viewNode );
				}
			} else if ( viewNode.is( 'uiElement' ) ) {
				if ( viewNode.name === '$comment' ) {
					domElement = domDocument.createComment( viewNode.getCustomProperty( '$rawContent' ) );
				} else {
					// UIElement has its own render() method (see #799).
					domElement = viewNode.render( domDocument, this );
				}

				if ( options.bind ) {
					this.bindElements( domElement, viewNode );
				}

				return domElement;
			} else {
				// Create DOM element.
				if ( this._shouldRenameElement( viewNode.name ) ) {
					logWarning( 'domconverter-unsafe-element-detected', { unsafeElement: viewNode } );

					domElement = this._createReplacementDomElement( viewNode.name );
				} else if ( viewNode.hasAttribute( 'xmlns' ) ) {
					domElement = domDocument.createElementNS( viewNode.getAttribute( 'xmlns' ), viewNode.name );
				} else {
					domElement = domDocument.createElement( viewNode.name );
				}

				// RawElement take care of their children in RawElement#render() method which can be customized
				// (see https://github.com/ckeditor/ckeditor5/issues/4469).
				if ( viewNode.is( 'rawElement' ) ) {
					viewNode.render( domElement, this );
				}

				if ( options.bind ) {
					this.bindElements( domElement, viewNode );
				}

				// Copy element's attributes.
				for ( const key of viewNode.getAttributeKeys() ) {
					this.setDomElementAttribute( domElement, key, viewNode.getAttribute( key ), viewNode );
				}
			}

			if ( options.withChildren !== false ) {
				for ( const child of this.viewChildrenToDom( viewNode, domDocument, options ) ) {
					domElement.appendChild( child );
				}
			}

			return domElement;
		}
	}

	/**
	 * Sets the attribute on a DOM element.
	 *
	 * **Note**: To remove the attribute, use {@link #removeDomElementAttribute}.
	 *
	 * @param {HTMLElement} domElement The DOM element the attribute should be set on.
	 * @param {String} key The name of the attribute
	 * @param {String} value The value of the attribute
	 * @param {module:engine/view/element~Element} [relatedViewElement] The view element related to the `domElement` (if there is any).
	 * It helps decide whether the attribute set is unsafe. For instance, view elements created via
	 * {@link module:engine/view/downcastwriter~DowncastWriter} methods can allow certain attributes that would normally be filtered out.
	 */
	setDomElementAttribute( domElement, key, value, relatedViewElement = null ) {
		const shouldRenderAttribute = this.shouldRenderAttribute( key, value, domElement.tagName.toLowerCase() ) ||
			relatedViewElement && relatedViewElement.shouldRenderUnsafeAttribute( key );

		if ( !shouldRenderAttribute ) {
			logWarning( 'domconverter-unsafe-attribute-detected', { domElement, key, value } );
		}

		// The old value was safe but the new value is unsafe.
		if ( domElement.hasAttribute( key ) && !shouldRenderAttribute ) {
			domElement.removeAttribute( key );
		}
		// The old value was unsafe (but prefixed) but the new value will be safe (will be unprefixed).
		else if ( domElement.hasAttribute( UNSAFE_ATTRIBUTE_NAME_PREFIX + key ) && shouldRenderAttribute ) {
			domElement.removeAttribute( UNSAFE_ATTRIBUTE_NAME_PREFIX + key );
		}

		// If the attribute should not be rendered, rename it (instead of removing) to give developers some idea of what
		// is going on (https://github.com/ckeditor/ckeditor5/issues/10801).
		domElement.setAttribute( shouldRenderAttribute ? key : UNSAFE_ATTRIBUTE_NAME_PREFIX + key, value );
	}

	/**
	 * Removes an attribute from a DOM element.
	 *
	 * **Note**: To set the attribute, use {@link #setDomElementAttribute}.
	 *
	 * @param {HTMLElement} domElement The DOM element the attribute should be removed from.
	 * @param {String} key The name of the attribute.
	 */
	removeDomElementAttribute( domElement, key ) {
		// See #_createReplacementDomElement() to learn what this is.
		if ( key == UNSAFE_ELEMENT_REPLACEMENT_ATTRIBUTE ) {
			return;
		}

		domElement.removeAttribute( key );

		// See setDomElementAttribute() to learn what this is.
		domElement.removeAttribute( UNSAFE_ATTRIBUTE_NAME_PREFIX + key );
	}

	/**
	 * Converts children of the view element to DOM using the
	 * {@link module:engine/view/domconverter~DomConverter#viewToDom} method.
	 * Additionally, this method adds block {@link module:engine/view/filler filler} to the list of children, if needed.
	 *
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} viewElement Parent view element.
	 * @param {Document} domDocument Document which will be used to create DOM nodes.
	 * @param {Object} options See {@link module:engine/view/domconverter~DomConverter#viewToDom} options parameter.
	 * @returns {Iterable.<Node>} DOM nodes.
	 */
	* viewChildrenToDom( viewElement, domDocument, options = {} ) {
		const fillerPositionOffset = viewElement.getFillerOffset && viewElement.getFillerOffset();
		let offset = 0;

		for ( const childView of viewElement.getChildren() ) {
			if ( fillerPositionOffset === offset ) {
				yield this._getBlockFiller( domDocument );
			}

			yield this.viewToDom( childView, domDocument, options );

			offset++;
		}

		if ( fillerPositionOffset === offset ) {
			yield this._getBlockFiller( domDocument );
		}
	}

	/**
	 * Converts view {@link module:engine/view/range~Range} to DOM range.
	 * Inline and block {@link module:engine/view/filler fillers} are handled during the conversion.
	 *
	 * @param {module:engine/view/range~Range} viewRange View range.
	 * @returns {Range} DOM range.
	 */
	viewRangeToDom( viewRange ) {
		const domStart = this.viewPositionToDom( viewRange.start );
		const domEnd = this.viewPositionToDom( viewRange.end );

		const domRange = document.createRange();
		domRange.setStart( domStart.parent, domStart.offset );
		domRange.setEnd( domEnd.parent, domEnd.offset );

		return domRange;
	}

	/**
	 * Converts view {@link module:engine/view/position~Position} to DOM parent and offset.
	 *
	 * Inline and block {@link module:engine/view/filler fillers} are handled during the conversion.
	 * If the converted position is directly before inline filler it is moved inside the filler.
	 *
	 * @param {module:engine/view/position~Position} viewPosition View position.
	 * @returns {Object|null} position DOM position or `null` if view position could not be converted to DOM.
	 * @returns {Node} position.parent DOM position parent.
	 * @returns {Number} position.offset DOM position offset.
	 */
	viewPositionToDom( viewPosition ) {
		const viewParent = viewPosition.parent;

		if ( viewParent.is( '$text' ) ) {
			const domParent = this.findCorrespondingDomText( viewParent );

			if ( !domParent ) {
				// Position is in a view text node that has not been rendered to DOM yet.
				return null;
			}

			let offset = viewPosition.offset;

			if ( startsWithFiller( domParent ) ) {
				offset += INLINE_FILLER_LENGTH;
			}

			return { parent: domParent, offset };
		} else {
			// viewParent is instance of ViewElement.
			let domParent, domBefore, domAfter;

			if ( viewPosition.offset === 0 ) {
				domParent = this.mapViewToDom( viewParent );

				if ( !domParent ) {
					// Position is in a view element that has not been rendered to DOM yet.
					return null;
				}

				domAfter = domParent.childNodes[ 0 ];
			} else {
				const nodeBefore = viewPosition.nodeBefore;

				domBefore = nodeBefore.is( '$text' ) ?
					this.findCorrespondingDomText( nodeBefore ) :
					this.mapViewToDom( viewPosition.nodeBefore );

				if ( !domBefore ) {
					// Position is after a view element that has not been rendered to DOM yet.
					return null;
				}

				domParent = domBefore.parentNode;
				domAfter = domBefore.nextSibling;
			}

			// If there is an inline filler at position return position inside the filler. We should never return
			// the position before the inline filler.
			if ( isText( domAfter ) && startsWithFiller( domAfter ) ) {
				return { parent: domAfter, offset: INLINE_FILLER_LENGTH };
			}

			const offset = domBefore ? indexOf( domBefore ) + 1 : 0;

			return { parent: domParent, offset };
		}
	}

	/**
	 * Converts DOM to view. For all text nodes, not bound elements and document fragments new items will
	 * be created. For bound elements and document fragments function will return corresponding items. For
	 * {@link module:engine/view/filler fillers} `null` will be returned.
	 * For all DOM elements rendered by {@link module:engine/view/uielement~UIElement} that UIElement will be returned.
	 *
	 * @param {Node|DocumentFragment} domNode DOM node or document fragment to transform.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
	 * @param {Boolean} [options.withChildren=true] If `true`, node's and document fragment's children will be converted too.
	 * @param {Boolean} [options.keepOriginalCase=false] If `false`, node's tag name will be converted to lower case.
	 * @param {Boolean} [options.skipComments=false] If `false`, comment nodes will be converted to `$comment`
	 * {@link module:engine/view/uielement~UIElement view UI elements}.
	 * @returns {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment|null} Converted node or document fragment
	 * or `null` if DOM node is a {@link module:engine/view/filler filler} or the given node is an empty text node.
	 */
	domToView( domNode, options = {} ) {
		if ( this.isBlockFiller( domNode ) ) {
			return null;
		}

		// When node is inside a UIElement or a RawElement return that parent as it's view representation.
		const hostElement = this.getHostViewElement( domNode );

		if ( hostElement ) {
			return hostElement;
		}

		if ( this.isComment( domNode ) && options.skipComments ) {
			return null;
		}

		if ( isText( domNode ) ) {
			if ( isInlineFiller( domNode ) ) {
				return null;
			} else {
				const textData = this._processDataFromDomText( domNode );

				return textData === '' ? null : new ViewText( this.document, textData );
			}
		} else {
			if ( this.mapDomToView( domNode ) ) {
				return this.mapDomToView( domNode );
			}

			let viewElement;

			if ( this.isDocumentFragment( domNode ) ) {
				// Create view document fragment.
				viewElement = new ViewDocumentFragment( this.document );

				if ( options.bind ) {
					this.bindDocumentFragments( domNode, viewElement );
				}
			} else {
				// Create view element.
				viewElement = this._createViewElement( domNode, options );

				if ( options.bind ) {
					this.bindElements( domNode, viewElement );
				}

				// Copy element's attributes.
				const attrs = domNode.attributes;

				if ( attrs ) {
					for ( let i = attrs.length - 1; i >= 0; i-- ) {
						viewElement._setAttribute( attrs[ i ].name, attrs[ i ].value );
					}
				}

				// Treat this element's content as a raw data if it was registered as such.
				// Comment node is also treated as an element with raw data.
				if ( this._isViewElementWithRawContent( viewElement, options ) || this.isComment( domNode ) ) {
					const rawContent = this.isComment( domNode ) ? domNode.data : domNode.innerHTML;

					viewElement._setCustomProperty( '$rawContent', rawContent );

					// Store a DOM node to prevent left trimming of the following text node.
					this._encounteredRawContentDomNodes.add( domNode );

					return viewElement;
				}
			}

			if ( options.withChildren !== false ) {
				for ( const child of this.domChildrenToView( domNode, options ) ) {
					viewElement._appendChild( child );
				}
			}

			return viewElement;
		}
	}

	/**
	 * Converts children of the DOM element to view nodes using
	 * the {@link module:engine/view/domconverter~DomConverter#domToView} method.
	 * Additionally this method omits block {@link module:engine/view/filler filler}, if it exists in the DOM parent.
	 *
	 * @param {HTMLElement} domElement Parent DOM element.
	 * @param {Object} options See {@link module:engine/view/domconverter~DomConverter#domToView} options parameter.
	 * @returns {Iterable.<module:engine/view/node~Node>} View nodes.
	 */
	* domChildrenToView( domElement, options = {} ) {
		for ( let i = 0; i < domElement.childNodes.length; i++ ) {
			const domChild = domElement.childNodes[ i ];
			const viewChild = this.domToView( domChild, options );

			if ( viewChild !== null ) {
				yield viewChild;
			}
		}
	}

	/**
	 * Converts DOM selection to view {@link module:engine/view/selection~Selection}.
	 * Ranges which cannot be converted will be omitted.
	 *
	 * @param {Selection} domSelection DOM selection.
	 * @returns {module:engine/view/selection~Selection} View selection.
	 */
	domSelectionToView( domSelection ) {
		// DOM selection might be placed in fake selection container.
		// If container contains fake selection - return corresponding view selection.
		if ( domSelection.rangeCount === 1 ) {
			let container = domSelection.getRangeAt( 0 ).startContainer;

			// The DOM selection might be moved to the text node inside the fake selection container.
			if ( isText( container ) ) {
				container = container.parentNode;
			}

			const viewSelection = this.fakeSelectionToView( container );

			if ( viewSelection ) {
				return viewSelection;
			}
		}

		const isBackward = this.isDomSelectionBackward( domSelection );

		const viewRanges = [];

		for ( let i = 0; i < domSelection.rangeCount; i++ ) {
			// DOM Range have correct start and end, no matter what is the DOM Selection direction. So we don't have to fix anything.
			const domRange = domSelection.getRangeAt( i );
			const viewRange = this.domRangeToView( domRange );

			if ( viewRange ) {
				viewRanges.push( viewRange );
			}
		}

		return new ViewSelection( viewRanges, { backward: isBackward } );
	}

	/**
	 * Converts DOM Range to view {@link module:engine/view/range~Range}.
	 * If the start or end position can not be converted `null` is returned.
	 *
	 * @param {Range} domRange DOM range.
	 * @returns {module:engine/view/range~Range|null} View range.
	 */
	domRangeToView( domRange ) {
		const viewStart = this.domPositionToView( domRange.startContainer, domRange.startOffset );
		const viewEnd = this.domPositionToView( domRange.endContainer, domRange.endOffset );

		if ( viewStart && viewEnd ) {
			return new ViewRange( viewStart, viewEnd );
		}

		return null;
	}

	/**
	 * Converts DOM parent and offset to view {@link module:engine/view/position~Position}.
	 *
	 * If the position is inside a {@link module:engine/view/filler filler} which has no corresponding view node,
	 * position of the filler will be converted and returned.
	 *
	 * If the position is inside DOM element rendered by {@link module:engine/view/uielement~UIElement}
	 * that position will be converted to view position before that UIElement.
	 *
	 * If structures are too different and it is not possible to find corresponding position then `null` will be returned.
	 *
	 * @param {Node} domParent DOM position parent.
	 * @param {Number} [domOffset=0] DOM position offset. You can skip it when converting the inline filler node.
	 * @returns {module:engine/view/position~Position} viewPosition View position.
	 */
	domPositionToView( domParent, domOffset = 0 ) {
		if ( this.isBlockFiller( domParent ) ) {
			return this.domPositionToView( domParent.parentNode, indexOf( domParent ) );
		}

		// If position is somewhere inside UIElement or a RawElement - return position before that element.
		const viewElement = this.mapDomToView( domParent );

		if ( viewElement && ( viewElement.is( 'uiElement' ) || viewElement.is( 'rawElement' ) ) ) {
			return ViewPosition._createBefore( viewElement );
		}

		if ( isText( domParent ) ) {
			if ( isInlineFiller( domParent ) ) {
				return this.domPositionToView( domParent.parentNode, indexOf( domParent ) );
			}

			const viewParent = this.findCorrespondingViewText( domParent );
			let offset = domOffset;

			if ( !viewParent ) {
				return null;
			}

			if ( startsWithFiller( domParent ) ) {
				offset -= INLINE_FILLER_LENGTH;
				offset = offset < 0 ? 0 : offset;
			}

			return new ViewPosition( viewParent, offset );
		}
		// domParent instanceof HTMLElement.
		else {
			if ( domOffset === 0 ) {
				const viewParent = this.mapDomToView( domParent );

				if ( viewParent ) {
					return new ViewPosition( viewParent, 0 );
				}
			} else {
				const domBefore = domParent.childNodes[ domOffset - 1 ];
				const viewBefore = isText( domBefore ) ?
					this.findCorrespondingViewText( domBefore ) :
					this.mapDomToView( domBefore );

				// TODO #663
				if ( viewBefore && viewBefore.parent ) {
					return new ViewPosition( viewBefore.parent, viewBefore.index + 1 );
				}
			}

			return null;
		}
	}

	/**
	 * Returns corresponding view {@link module:engine/view/element~Element Element} or
	 * {@link module:engine/view/documentfragment~DocumentFragment} for provided DOM element or
	 * document fragment. If there is no view item {@link module:engine/view/domconverter~DomConverter#bindElements bound}
	 * to the given DOM - `undefined` is returned.
	 *
	 * For all DOM elements rendered by a {@link module:engine/view/uielement~UIElement} or
	 * a {@link module:engine/view/rawelement~RawElement}, the parent `UIElement` or `RawElement` will be returned.
	 *
	 * @param {DocumentFragment|Element} domElementOrDocumentFragment DOM element or document fragment.
	 * @returns {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment|undefined}
	 * Corresponding view element, document fragment or `undefined` if no element was bound.
	 */
	mapDomToView( domElementOrDocumentFragment ) {
		const hostElement = this.getHostViewElement( domElementOrDocumentFragment );

		return hostElement || this._domToViewMapping.get( domElementOrDocumentFragment );
	}

	/**
	 * Finds corresponding text node. Text nodes are not {@link module:engine/view/domconverter~DomConverter#bindElements bound},
	 * corresponding text node is returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link module:engine/view/domconverter~DomConverter#bindElements bound} element, it is used
	 * to find the corresponding text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link module:engine/view/domconverter~DomConverter#bindElements bound}
	 * element, it is used to find the corresponding text node.
	 *
	 * For all text nodes rendered by a {@link module:engine/view/uielement~UIElement} or
	 * a {@link module:engine/view/rawelement~RawElement}, the parent `UIElement` or `RawElement` will be returned.
	 *
	 * Otherwise `null` is returned.
	 *
	 * Note that for the block or inline {@link module:engine/view/filler filler} this method returns `null`.
	 *
	 * @param {Text} domText DOM text node.
	 * @returns {module:engine/view/text~Text|null} Corresponding view text node or `null`, if it was not possible to find a
	 * corresponding node.
	 */
	findCorrespondingViewText( domText ) {
		if ( isInlineFiller( domText ) ) {
			return null;
		}

		// If DOM text was rendered by a UIElement or a RawElement - return this parent element.
		const hostElement = this.getHostViewElement( domText );

		if ( hostElement ) {
			return hostElement;
		}

		const previousSibling = domText.previousSibling;

		// Try to use previous sibling to find the corresponding text node.
		if ( previousSibling ) {
			if ( !( this.isElement( previousSibling ) ) ) {
				// The previous is text or comment.
				return null;
			}

			const viewElement = this.mapDomToView( previousSibling );

			if ( viewElement ) {
				const nextSibling = viewElement.nextSibling;

				// It might be filler which has no corresponding view node.
				if ( nextSibling instanceof ViewText ) {
					return viewElement.nextSibling;
				} else {
					return null;
				}
			}
		}
		// Try to use parent to find the corresponding text node.
		else {
			const viewElement = this.mapDomToView( domText.parentNode );

			if ( viewElement ) {
				const firstChild = viewElement.getChild( 0 );

				// It might be filler which has no corresponding view node.
				if ( firstChild instanceof ViewText ) {
					return firstChild;
				} else {
					return null;
				}
			}
		}

		return null;
	}

	/**
	 * Returns corresponding DOM item for provided {@link module:engine/view/element~Element Element} or
	 * {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment}.
	 * To find a corresponding text for {@link module:engine/view/text~Text view Text instance}
	 * use {@link #findCorrespondingDomText}.
	 *
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} viewNode
	 * View element or document fragment.
	 * @returns {Node|DocumentFragment|undefined} Corresponding DOM node or document fragment.
	 */
	mapViewToDom( documentFragmentOrElement ) {
		return this._viewToDomMapping.get( documentFragmentOrElement );
	}

	/**
	 * Finds corresponding text node. Text nodes are not {@link module:engine/view/domconverter~DomConverter#bindElements bound},
	 * corresponding text node is returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link module:engine/view/domconverter~DomConverter#bindElements bound} element, it is used
	 * to find the corresponding text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link module:engine/view/domconverter~DomConverter#bindElements bound}
	 * element, it is used to find the corresponding text node.
	 *
	 * Otherwise `null` is returned.
	 *
	 * @param {module:engine/view/text~Text} viewText View text node.
	 * @returns {Text|null} Corresponding DOM text node or `null`, if it was not possible to find a corresponding node.
	 */
	findCorrespondingDomText( viewText ) {
		const previousSibling = viewText.previousSibling;

		// Try to use previous sibling to find the corresponding text node.
		if ( previousSibling && this.mapViewToDom( previousSibling ) ) {
			return this.mapViewToDom( previousSibling ).nextSibling;
		}

		// If this is a first node, try to use parent to find the corresponding text node.
		if ( !previousSibling && viewText.parent && this.mapViewToDom( viewText.parent ) ) {
			return this.mapViewToDom( viewText.parent ).childNodes[ 0 ];
		}

		return null;
	}

	/**
	 * Focuses DOM editable that is corresponding to provided {@link module:engine/view/editableelement~EditableElement}.
	 *
	 * @param {module:engine/view/editableelement~EditableElement} viewEditable
	 */
	focus( viewEditable ) {
		const domEditable = this.mapViewToDom( viewEditable );

		if ( domEditable && domEditable.ownerDocument.activeElement !== domEditable ) {
			// Save the scrollX and scrollY positions before the focus.
			const { scrollX, scrollY } = global.window;
			const scrollPositions = [];

			// Save all scrollLeft and scrollTop values starting from domEditable up to
			// document#documentElement.
			forEachDomNodeAncestor( domEditable, node => {
				const { scrollLeft, scrollTop } = node;

				scrollPositions.push( [ scrollLeft, scrollTop ] );
			} );

			domEditable.focus();

			// Restore scrollLeft and scrollTop values starting from domEditable up to
			// document#documentElement.
			// https://github.com/ckeditor/ckeditor5-engine/issues/951
			// https://github.com/ckeditor/ckeditor5-engine/issues/957
			forEachDomNodeAncestor( domEditable, node => {
				const [ scrollLeft, scrollTop ] = scrollPositions.shift();

				node.scrollLeft = scrollLeft;
				node.scrollTop = scrollTop;
			} );

			// Restore the scrollX and scrollY positions after the focus.
			// https://github.com/ckeditor/ckeditor5-engine/issues/951
			global.window.scrollTo( scrollX, scrollY );
		}
	}

	/**
	 * Returns `true` when `node.nodeType` equals `Node.ELEMENT_NODE`.
	 *
	 * @param {Node} node Node to check.
	 * @returns {Boolean}
	 */
	isElement( node ) {
		return node && node.nodeType == Node.ELEMENT_NODE;
	}

	/**
	 * Returns `true` when `node.nodeType` equals `Node.DOCUMENT_FRAGMENT_NODE`.
	 *
	 * @param {Node} node Node to check.
	 * @returns {Boolean}
	 */
	isDocumentFragment( node ) {
		return node && node.nodeType == Node.DOCUMENT_FRAGMENT_NODE;
	}

	/**
	 * Returns `true` when `node.nodeType` equals `Node.COMMENT_NODE`.
	 *
	 * @param {Node} node Node to check.
	 * @returns {Boolean}
	 */
	isComment( node ) {
		return node && node.nodeType == Node.COMMENT_NODE;
	}

	/**
	 * Checks if the node is an instance of the block filler for this DOM converter.
	 *
	 *		const converter = new DomConverter( viewDocument, { blockFillerMode: 'br' } );
	 *
	 *		converter.isBlockFiller( BR_FILLER( document ) ); // true
	 *		converter.isBlockFiller( NBSP_FILLER( document ) ); // false
	 *
	 * **Note:**: For the `'nbsp'` mode the method also checks context of a node so it cannot be a detached node.
	 *
	 * **Note:** A special case in the `'nbsp'` mode exists where the `<br>` in `<p><br></p>` is treated as a block filler.
	 *
	 * @param {Node} domNode DOM node to check.
	 * @returns {Boolean} True if a node is considered a block filler for given mode.
	 */
	isBlockFiller( domNode ) {
		if ( this.blockFillerMode == 'br' ) {
			return domNode.isEqualNode( BR_FILLER_REF );
		}

		// Special case for <p><br></p> in which <br> should be treated as filler even when we are not in the 'br' mode. See ckeditor5#5564.
		if ( domNode.tagName === 'BR' && hasBlockParent( domNode, this.blockElements ) && domNode.parentNode.childNodes.length === 1 ) {
			return true;
		}

		// If not in 'br' mode, try recognizing both marked and regular nbsp block fillers.
		return domNode.isEqualNode( MARKED_NBSP_FILLER_REF ) || isNbspBlockFiller( domNode, this.blockElements );
	}

	/**
	 * Returns `true` if given selection is a backward selection, that is, if it's `focus` is before `anchor`.
	 *
	 * @param {Selection} DOM Selection instance to check.
	 * @returns {Boolean}
	 */
	isDomSelectionBackward( selection ) {
		if ( selection.isCollapsed ) {
			return false;
		}

		// Since it takes multiple lines of code to check whether a "DOM Position" is before/after another "DOM Position",
		// we will use the fact that range will collapse if it's end is before it's start.
		const range = document.createRange();

		range.setStart( selection.anchorNode, selection.anchorOffset );
		range.setEnd( selection.focusNode, selection.focusOffset );

		const backward = range.collapsed;

		range.detach();

		return backward;
	}

	/**
	 * Returns a parent {@link module:engine/view/uielement~UIElement} or {@link module:engine/view/rawelement~RawElement}
	 * that hosts the provided DOM node. Returns `null` if there is no such parent.
	 *
	 * @param {Node} domNode
	 * @returns {module:engine/view/uielement~UIElement|module:engine/view/rawelement~RawElement|null}
	 */
	getHostViewElement( domNode ) {
		const ancestors = getAncestors( domNode );

		// Remove domNode from the list.
		ancestors.pop();

		while ( ancestors.length ) {
			const domNode = ancestors.pop();
			const viewNode = this._domToViewMapping.get( domNode );

			if ( viewNode && ( viewNode.is( 'uiElement' ) || viewNode.is( 'rawElement' ) ) ) {
				return viewNode;
			}
		}

		return null;
	}

	/**
	 * Checks if the given selection's boundaries are at correct places.
	 *
	 * The following places are considered as incorrect for selection boundaries:
	 *
	 * * before or in the middle of an inline filler sequence,
	 * * inside a DOM element which represents {@link module:engine/view/uielement~UIElement a view UI element},
	 * * inside a DOM element which represents {@link module:engine/view/rawelement~RawElement a view raw element}.
	 *
	 * @param {Selection} domSelection The DOM selection object to be checked.
	 * @returns {Boolean} `true` if the given selection is at a correct place, `false` otherwise.
	 */
	isDomSelectionCorrect( domSelection ) {
		return this._isDomSelectionPositionCorrect( domSelection.anchorNode, domSelection.anchorOffset ) &&
			this._isDomSelectionPositionCorrect( domSelection.focusNode, domSelection.focusOffset );
	}

	/**
	 * Registers a {@link module:engine/view/matcher~MatcherPattern} for view elements whose content should be treated as raw data
	 * and not processed during the conversion from DOM nodes to view elements.
	 *
	 * This is affecting how {@link module:engine/view/domconverter~DomConverter#domToView} and
	 * {@link module:engine/view/domconverter~DomConverter#domChildrenToView} process DOM nodes.
	 *
	 * The raw data can be later accessed by a
	 * {@link module:engine/view/element~Element#getCustomProperty custom property of a view element} called `"$rawContent"`.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} pattern Pattern matching a view element whose content should
	 * be treated as raw data.
	 */
	registerRawContentMatcher( pattern ) {
		this._rawContentElementMatcher.add( pattern );
	}

	/**
	 * Returns the block {@link module:engine/view/filler filler} node based on the current {@link #blockFillerMode} setting.
	 *
	 * @private
	 * @params {Document} domDocument
	 * @returns {Node} filler
	 */
	_getBlockFiller( domDocument ) {
		switch ( this.blockFillerMode ) {
			case 'nbsp':
				return NBSP_FILLER( domDocument ); // eslint-disable-line new-cap
			case 'markedNbsp':
				return MARKED_NBSP_FILLER( domDocument ); // eslint-disable-line new-cap
			case 'br':
				return BR_FILLER( domDocument ); // eslint-disable-line new-cap
		}
	}

	/**
	 * Checks if the given DOM position is a correct place for selection boundary. See {@link #isDomSelectionCorrect}.
	 *
	 * @private
	 * @param {Element} domParent Position parent.
	 * @param {Number} offset Position offset.
	 * @returns {Boolean} `true` if given position is at a correct place for selection boundary, `false` otherwise.
	 */
	_isDomSelectionPositionCorrect( domParent, offset ) {
		// If selection is before or in the middle of inline filler string, it is incorrect.
		if ( isText( domParent ) && startsWithFiller( domParent ) && offset < INLINE_FILLER_LENGTH ) {
			// Selection in a text node, at wrong position (before or in the middle of filler).
			return false;
		}

		if ( this.isElement( domParent ) && startsWithFiller( domParent.childNodes[ offset ] ) ) {
			// Selection in an element node, before filler text node.
			return false;
		}

		const viewParent = this.mapDomToView( domParent );

		// The position is incorrect when anchored inside a UIElement or a RawElement.
		// Note: In case of UIElement and RawElement, mapDomToView() returns a parent element for any DOM child
		// so there's no need to perform any additional checks.
		if ( viewParent && ( viewParent.is( 'uiElement' ) || viewParent.is( 'rawElement' ) ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Takes text data from a given {@link module:engine/view/text~Text#data} and processes it so
	 * it is correctly displayed in the DOM.
	 *
	 * Following changes are done:
	 *
	 * * a space at the beginning is changed to `&nbsp;` if this is the first text node in its container
	 * element or if a previous text node ends with a space character,
	 * * space at the end of the text node is changed to `&nbsp;` if there are two spaces at the end of a node or if next node
	 * starts with a space or if it is the last text node in its container,
	 * * remaining spaces are replaced to a chain of spaces and `&nbsp;` (e.g. `'x   x'` becomes `'x &nbsp; x'`).
	 *
	 * Content of {@link #preElements} is not processed.
	 *
	 * @private
	 * @param {module:engine/view/text~Text} node View text node to process.
	 * @returns {String} Processed text data.
	 */
	_processDataFromViewText( node ) {
		let data = node.data;

		// If any of node ancestors has a name which is in `preElements` array, then currently processed
		// view text node is (will be) in preformatted element. We should not change whitespaces then.
		if ( node.getAncestors().some( parent => this.preElements.includes( parent.name ) ) ) {
			return data;
		}

		// 1. Replace the first space with a nbsp if the previous node ends with a space or there is no previous node
		// (container element boundary).
		if ( data.charAt( 0 ) == ' ' ) {
			const prevNode = this._getTouchingInlineViewNode( node, false );
			const prevEndsWithSpace = prevNode && prevNode.is( '$textProxy' ) && this._nodeEndsWithSpace( prevNode );

			if ( prevEndsWithSpace || !prevNode ) {
				data = '\u00A0' + data.substr( 1 );
			}
		}

		// 2. Replace the last space with nbsp if there are two spaces at the end or if the next node starts with space or there is no
		// next node (container element boundary).
		//
		// Keep in mind that Firefox prefers $nbsp; before tag, not inside it:
		//
		// Foo <span>&nbsp;bar</span>  <-- bad.
		// Foo&nbsp;<span> bar</span>  <-- good.
		//
		// More here: https://github.com/ckeditor/ckeditor5-engine/issues/1747.
		if ( data.charAt( data.length - 1 ) == ' ' ) {
			const nextNode = this._getTouchingInlineViewNode( node, true );
			const nextStartsWithSpace = nextNode && nextNode.is( '$textProxy' ) && nextNode.data.charAt( 0 ) == ' ';

			if ( data.charAt( data.length - 2 ) == ' ' || !nextNode || nextStartsWithSpace ) {
				data = data.substr( 0, data.length - 1 ) + '\u00A0';
			}
		}

		// 3. Create space+nbsp pairs.
		return data.replace( / {2}/g, ' \u00A0' );
	}

	/**
	 * Checks whether given node ends with a space character after changing appropriate space characters to `&nbsp;`s.
	 *
	 * @private
	 * @param {module:engine/view/text~Text} node Node to check.
	 * @returns {Boolean} `true` if given `node` ends with space, `false` otherwise.
	 */
	_nodeEndsWithSpace( node ) {
		if ( node.getAncestors().some( parent => this.preElements.includes( parent.name ) ) ) {
			return false;
		}

		const data = this._processDataFromViewText( node );

		return data.charAt( data.length - 1 ) == ' ';
	}

	/**
	 * Takes text data from native `Text` node and processes it to a correct {@link module:engine/view/text~Text view text node} data.
	 *
	 * Following changes are done:
	 *
	 * * multiple whitespaces are replaced to a single space,
	 * * space at the beginning of a text node is removed if it is the first text node in its container
	 * element or if the previous text node ends with a space character,
	 * * space at the end of the text node is removed if there are two spaces at the end of a node or if next node
	 * starts with a space or if it is the last text node in its container
	 * * nbsps are converted to spaces.
	 *
	 * @param {Node} node DOM text node to process.
	 * @returns {String} Processed data.
	 * @private
	 */
	_processDataFromDomText( node ) {
		let data = node.data;

		if ( _hasDomParentOfType( node, this.preElements ) ) {
			return getDataWithoutFiller( node );
		}

		// Change all consecutive whitespace characters (from the [ \n\t\r] set –
		// see https://github.com/ckeditor/ckeditor5-engine/issues/822#issuecomment-311670249) to a single space character.
		// That's how multiple whitespaces are treated when rendered, so we normalize those whitespaces.
		// We're replacing 1+ (and not 2+) to also normalize singular \n\t\r characters (#822).
		data = data.replace( /[ \n\t\r]{1,}/g, ' ' );

		const prevNode = this._getTouchingInlineDomNode( node, false );
		const nextNode = this._getTouchingInlineDomNode( node, true );

		const shouldLeftTrim = this._checkShouldLeftTrimDomText( node, prevNode );
		const shouldRightTrim = this._checkShouldRightTrimDomText( node, nextNode );

		// If the previous dom text node does not exist or it ends by whitespace character, remove space character from the beginning
		// of this text node. Such space character is treated as a whitespace.
		if ( shouldLeftTrim ) {
			data = data.replace( /^ /, '' );
		}

		// If the next text node does not exist remove space character from the end of this text node.
		if ( shouldRightTrim ) {
			data = data.replace( / $/, '' );
		}

		// At the beginning and end of a block element, Firefox inserts normal space + <br> instead of non-breaking space.
		// This means that the text node starts/end with normal space instead of non-breaking space.
		// This causes a problem because the normal space would be removed in `.replace` calls above. To prevent that,
		// the inline filler is removed only after the data is initially processed (by the `.replace` above). See ckeditor5#692.
		data = getDataWithoutFiller( new Text( data ) );

		// At this point we should have removed all whitespaces from DOM text data.
		//
		// Now, We will reverse the process that happens in `_processDataFromViewText`.
		//
		// We have to change &nbsp; chars, that were in DOM text data because of rendering reasons, to spaces.
		// First, change all ` \u00A0` pairs (space + &nbsp;) to two spaces. DOM converter changes two spaces from model/view to
		// ` \u00A0` to ensure proper rendering. Since here we convert back, we recognize those pairs and change them back to `  `.
		data = data.replace( / \u00A0/g, '  ' );

		const isNextNodeInlineObjectElement = nextNode && this.isElement( nextNode ) && nextNode.tagName != 'BR';
		const isNextNodeStartingWithSpace = nextNode && isText( nextNode ) && nextNode.data.charAt( 0 ) == ' ';

		// Then, let's change the last nbsp to a space.
		if ( /( |\u00A0)\u00A0$/.test( data ) || !nextNode || isNextNodeInlineObjectElement || isNextNodeStartingWithSpace ) {
			data = data.replace( /\u00A0$/, ' ' );
		}

		// Then, change &nbsp; character that is at the beginning of the text node to space character.
		// We do that replacement only if this is the first node or the previous node ends on whitespace character.
		if ( shouldLeftTrim || prevNode && this.isElement( prevNode ) && prevNode.tagName != 'BR' ) {
			data = data.replace( /^\u00A0/, ' ' );
		}

		// At this point, all whitespaces should be removed and all &nbsp; created for rendering reasons should be
		// changed to normal space. All left &nbsp; are &nbsp; inserted intentionally.
		return data;
	}

	/**
	 * Helper function which checks if a DOM text node, preceded by the given `prevNode` should
	 * be trimmed from the left side.
	 *
	 * @private
	 * @param {Node} node
	 * @param {Node} prevNode Either DOM text or `<br>` or one of `#inlineObjectElements`.
	 */
	_checkShouldLeftTrimDomText( node, prevNode ) {
		if ( !prevNode ) {
			return true;
		}

		if ( this.isElement( prevNode ) ) {
			return prevNode.tagName === 'BR';
		}

		// Shouldn't left trim if previous node is a node that was encountered as a raw content node.
		if ( this._encounteredRawContentDomNodes.has( node.previousSibling ) ) {
			return false;
		}

		return /[^\S\u00A0]/.test( prevNode.data.charAt( prevNode.data.length - 1 ) );
	}

	/**
	 * Helper function which checks if a DOM text node, succeeded by the given `nextNode` should
	 * be trimmed from the right side.
	 *
	 * @private
	 * @param {Node} node
	 * @param {Node} nextNode Either DOM text or `<br>` or one of `#inlineObjectElements`.
	 */
	_checkShouldRightTrimDomText( node, nextNode ) {
		if ( nextNode ) {
			return false;
		}

		return !startsWithFiller( node );
	}

	/**
	 * Helper function. For given {@link module:engine/view/text~Text view text node}, it finds previous or next sibling
	 * that is contained in the same container element. If there is no such sibling, `null` is returned.
	 *
	 * @private
	 * @param {module:engine/view/text~Text} node Reference node.
	 * @param {Boolean} getNext
	 * @returns {module:engine/view/text~Text|module:engine/view/element~Element|null} Touching text node, an inline object
	 * or `null` if there is no next or previous touching text node.
	 */
	_getTouchingInlineViewNode( node, getNext ) {
		const treeWalker = new ViewTreeWalker( {
			startPosition: getNext ? ViewPosition._createAfter( node ) : ViewPosition._createBefore( node ),
			direction: getNext ? 'forward' : 'backward'
		} );

		for ( const value of treeWalker ) {
			// Found an inline object (for example an image).
			if ( value.item.is( 'element' ) && this.inlineObjectElements.includes( value.item.name ) ) {
				return value.item;
			}
			// ViewContainerElement is found on a way to next ViewText node, so given `node` was first/last
			// text node in its container element.
			else if ( value.item.is( 'containerElement' ) ) {
				return null;
			}
			// <br> found – it works like a block boundary, so do not scan further.
			else if ( value.item.is( 'element', 'br' ) ) {
				return null;
			}
			// Found a text node in the same container element.
			else if ( value.item.is( '$textProxy' ) ) {
				return value.item;
			}
		}

		return null;
	}

	/**
	 * Helper function. For the given text node, it finds the closest touching node which is either
	 * a text, `<br>` or an {@link #inlineObjectElements inline object}.
	 *
	 * If no such node is found, `null` is returned.
	 *
	 * For instance, in the following DOM structure:
	 *
	 *		<p>foo<b>bar</b><br>bom</p>
	 *
	 * * `foo` doesn't have its previous touching inline node (`null` is returned),
	 * * `foo`'s next touching inline node is `bar`
	 * * `bar`'s next touching inline node is `<br>`
	 *
	 * This method returns text nodes and `<br>` elements because these types of nodes affect how
	 * spaces in the given text node need to be converted.
	 *
	 * @private
	 * @param {Text} node
	 * @param {Boolean} getNext
	 * @returns {Text|Element|null}
	 */
	_getTouchingInlineDomNode( node, getNext ) {
		if ( !node.parentNode ) {
			return null;
		}

		const stepInto = getNext ? 'firstChild' : 'lastChild';
		const stepOver = getNext ? 'nextSibling' : 'previousSibling';

		let skipChildren = true;

		do {
			if ( !skipChildren && node[ stepInto ] ) {
				node = node[ stepInto ];
			} else if ( node[ stepOver ] ) {
				node = node[ stepOver ];
				skipChildren = false;
			} else {
				node = node.parentNode;
				skipChildren = true;
			}

			if ( !node || this._isBlockElement( node ) ) {
				return null;
			}
		} while (
			!( isText( node ) || node.tagName == 'BR' || this._isInlineObjectElement( node ) )
		);

		return node;
	}

	/**
	 * Returns `true` if a DOM node belongs to {@link #blockElements}. `false` otherwise.
	 *
	 * @private
	 * @param {Node} node
	 * @returns {Boolean}
	 */
	_isBlockElement( node ) {
		return this.isElement( node ) && this.blockElements.includes( node.tagName.toLowerCase() );
	}

	/**
	 * Returns `true` if a DOM node belongs to {@link #inlineObjectElements}. `false` otherwise.
	 *
	 * @private
	 * @param {Node} node
	 * @returns {Boolean}
	 */
	_isInlineObjectElement( node ) {
		return this.isElement( node ) && this.inlineObjectElements.includes( node.tagName.toLowerCase() );
	}

	/**
	 * Creates view element basing on the node type.
	 *
	 * @private
	 * @param {Node} node DOM node to check.
	 * @param {Object} options Conversion options. See {@link module:engine/view/domconverter~DomConverter#domToView} options parameter.
	 * @returns {Element}
	 */
	_createViewElement( node, options ) {
		if ( this.isComment( node ) ) {
			return new ViewUIElement( this.document, '$comment' );
		}

		const viewName = options.keepOriginalCase ? node.tagName : node.tagName.toLowerCase();

		return new ViewElement( this.document, viewName );
	}

	/**
	 * Checks if view element's content should be treated as a raw data.
	 *
	 * @private
	 * @param {Element} viewElement View element to check.
	 * @param {Object} options Conversion options. See {@link module:engine/view/domconverter~DomConverter#domToView} options parameter.
	 * @returns {Boolean}
	 */
	_isViewElementWithRawContent( viewElement, options ) {
		return options.withChildren !== false && this._rawContentElementMatcher.match( viewElement );
	}

	/**
	 * Checks whether a given element name should be renamed in a current rendering mode.
	 *
	 * @private
	 * @param {String} elementName The name of view element.
	 * @returns {Boolean}
	 */
	_shouldRenameElement( elementName ) {
		return this.renderingMode == 'editing' && elementName.toLowerCase() == 'script';
	}

	/**
	 * Return a <span> element with a special attribute holding the name of the original element.
	 * Optionally, copy all the attributes of the original element if that element is provided.
	 *
	 * @private
	 * @param {String} elementName The name of view element.
	 * @param {Element} [originalDomElement] The original DOM element to copy attributes and content from.
	 * @returns {Element}
	 */
	_createReplacementDomElement( elementName, originalDomElement = null ) {
		const newDomElement = document.createElement( 'span' );

		// Mark the span replacing a script as hidden.
		newDomElement.setAttribute( UNSAFE_ELEMENT_REPLACEMENT_ATTRIBUTE, elementName );

		if ( originalDomElement ) {
			while ( originalDomElement.firstChild ) {
				newDomElement.appendChild( originalDomElement.firstChild );
			}

			for ( const attributeName of originalDomElement.getAttributeNames() ) {
				newDomElement.setAttribute( attributeName, originalDomElement.getAttribute( attributeName ) );
			}
		}

		return newDomElement;
	}
}

// Helper function.
// Used to check if given native `Element` or `Text` node has parent with tag name from `types` array.
//
// @param {Node} node
// @param {Array.<String>} types
// @returns {Boolean} `true` if such parent exists or `false` if it does not.
function _hasDomParentOfType( node, types ) {
	const parents = getAncestors( node );

	return parents.some( parent => parent.tagName && types.includes( parent.tagName.toLowerCase() ) );
}

// A helper that executes given callback for each DOM node's ancestor, starting from the given node
// and ending in document#documentElement.
//
// @param {Node} node
// @param {Function} callback A callback to be executed for each ancestor.
function forEachDomNodeAncestor( node, callback ) {
	while ( node && node != global.document ) {
		callback( node );
		node = node.parentNode;
	}
}

// Checks if given node is a nbsp block filler.
//
// A &nbsp; is a block filler only if it is a single child of a block element.
//
// @param {Node} domNode DOM node.
// @param {Array.<String>} blockElements
// @returns {Boolean}
function isNbspBlockFiller( domNode, blockElements ) {
	const isNBSP = domNode.isEqualNode( NBSP_FILLER_REF );

	return isNBSP && hasBlockParent( domNode, blockElements ) && domNode.parentNode.childNodes.length === 1;
}

// Checks if domNode has block parent.
//
// @param {Node} domNode DOM node.
// @param {Array.<String>} blockElements
// @returns {Boolean}
function hasBlockParent( domNode, blockElements ) {
	const parent = domNode.parentNode;

	return parent && parent.tagName && blockElements.includes( parent.tagName.toLowerCase() );
}

/**
 * Enum representing the type of the block filler.
 *
 * Possible values:
 *
 * * `br` &ndash; For the `<br data-cke-filler="true">` block filler used in the editing view.
 * * `nbsp` &ndash; For the `&nbsp;` block fillers used in the data.
 * * `markedNbsp` &ndash; For the `&nbsp;` block fillers wrapped in `<span>` elements: `<span data-cke-filler="true">&nbsp;</span>`
 * used in the data.
 *
 * @typedef {String} module:engine/view/filler~BlockFillerMode
 */

/**
 * The {@link module:engine/view/domconverter~DomConverter} detected a `<script>` element that may disrupt the
 * {@glink framework/guides/architecture/editing-engine#editing-pipeline editing pipeline} of the editor. To avoid this,
 * the `<script>` element was renamed to `<span data-ck-unsafe-element="script"></span>`.
 *
 * @error domconverter-unsafe-element-detected
 * @param {module:engine/model/element~Element|HTMLElement} unsafeElement The editing view or DOM element
 * that was renamed.
 */

/**
 * The {@link module:engine/view/domconverter~DomConverter} detected an interactive attribute in the
 * {@glink framework/guides/architecture/editing-engine#editing-pipeline editing pipeline}. For the best
 * editing experience, the attribute was renamed to `data-ck-unsafe-attribute-[original attribute name]`.
 *
 * If you are the author of the plugin that generated this attribute and you want it to be preserved
 * in the editing pipeline, you can configure this when creating the element
 * using {@link module:engine/view/downcastwriter~DowncastWriter} during the
 * {@glink framework/guides/architecture/editing-engine#conversion model–view conversion}. Methods such as
 * {@link module:engine/view/downcastwriter~DowncastWriter#createContainerElement},
 * {@link module:engine/view/downcastwriter~DowncastWriter#createAttributeElement}, or
 * {@link module:engine/view/downcastwriter~DowncastWriter#createEmptyElement}
 * accept an option that will disable filtering of specific attributes:
 *
 *		const paragraph = writer.createContainerElement( 'p',
 *			{
 *				class: 'clickable-paragraph',
 *				onclick: 'alert( "Paragraph clicked!" )'
 *			},
 *			{
 *				// Make sure the "onclick" attribute will pass through.
 *				renderUnsafeAttributes: [ 'onclick' ]
 *			}
 *		);
 *
 * @error domconverter-unsafe-attribute-detected
 * @param {HTMLElement} domElement The DOM element the attribute was set on.
 * @param {String} key The original name of the attribute
 * @param {String} value The value of the original attribute
 */
