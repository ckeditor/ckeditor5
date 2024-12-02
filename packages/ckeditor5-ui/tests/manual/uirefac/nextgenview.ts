/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { default as View } from '../../../src/view.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';
import type {
	AttributeBinding, ListenerBinding, TemplateElementDefinition, TemplateTextDefinition
} from '../../../src/template.js';

class NextGenView extends View {
	public override render() {
		this.setTemplate( this.parseTemplate( this.getTemplate() ) );

		super.render();
	}

	public getTemplate(): HTMLResult {
		return html``;
	}

	public parseTemplate( htmlResult: HTMLResult ) {
		const { combined, values } = htmlResult;
		const templateElement = document.createElement( 'template' );
		const walker = document.createTreeWalker( document, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT );
		const bind = this.bindTemplate;
		let currentValue = 0;

		templateElement.innerHTML = combined.trim();
		walker.currentNode = templateElement.content; // DocFragment

		console.log( 'TemplateElement#innerHTML', templateElement.innerHTML );

		const node = walker.nextNode();

		if ( !node ) {
			throw new Error( 'Parsing failed 1' );
		} else if ( node.nodeType === Node.ELEMENT_NODE ) {
			return getElementDefinition( this, node as Element );
		} else {
			throw new Error( 'Parsing failed 2' );
		}

		function getNextValue() {
			return values[ currentValue++ ];
		}

		function getElementDefinition( view: NextGenView, element: Element ): TemplateElementDefinition {
			const definition: Required<TemplateElementDefinition> = {
				tag: element.tagName.toLowerCase(),
				attributes: {},
				children: [],
				on: {}
			};
			const definitionChildren = definition.children as Array<TemplateElementDefinition | TemplateTextDefinition>;
			let childNode = walker.firstChild();

			setAttributeDefinitions( view, element, definition );

			while ( childNode ) {
				if ( childNode.nodeType === Node.TEXT_NODE ) {
					definitionChildren.push( getTextDefinition( childNode as Text ) );
				} else {
					definitionChildren.push( getElementDefinition( view, childNode as Element ) );
				}

				childNode = walker.nextSibling();
			}

			walker.parentNode();

			console.log( 'ElementDefinition', definition );

			return definition;
		}

		function getTextDefinition( textNode: Text ): TemplateTextDefinition {
			const textValue = textNode.nodeValue!;
			const regExp = new RegExp( '\\$CKB:(.+?)\\$', 'g' );
			const definitionChunks: Array<string | AttributeBinding> = [];

			let match;
			let lastIndex = 0;
			while ( ( match = regExp.exec( textValue ) ) !== null ) {
				const nextValue = getNextValue();

				definitionChunks.push( textValue.slice( lastIndex, match.index ) );

				if ( nextValue instanceof ObservablePropertyBinding ) {
					definitionChunks.push( bind.to( nextValue.property, nextValue.callback ) );
				} else {
					definitionChunks.push( nextValue );
				}

				lastIndex = regExp.lastIndex;
			}

			// Push the remaining non-matching chunk after the last match
			if ( lastIndex < textValue.length ) {
				definitionChunks.push( textValue.slice( lastIndex ) );
			}

			console.log( 'TextDefinition', `"${ textValue }"`, definitionChunks );

			return {
				text: definitionChunks
			};
		}

		function setAttributeDefinitions( view: NextGenView, element: Element, definition: Required<TemplateElementDefinition> ) {
			for ( const name of element.getAttributeNames() ) {
				const value = element.getAttribute( name )!;

				if ( name.startsWith( '@' ) ) {
					const eventName = name.slice( 1 );
					const binding = bind.to( getNextValue().bind( view ) );

					if ( !definition.on[ eventName ] ) {
						definition.on[ eventName ] = [ binding ];
					} else {
						( definition.on[ eventName ] as Array<ListenerBinding> ).push( binding );
					}
				} else {
					definition.attributes![ name ] = value;
				}
			}
		}
	}

	public b( property: string, callback?: ( value: any ) => any ) {
		return new ObservablePropertyBinding( property, callback );
	}
}

type HTMLResult = {
	strings: Array<string>;
	values: Array<any>;
	combined: string;
};

function html( strings, ...values ): HTMLResult {
	let combined = '';

	strings.forEach( ( string, i ) => {
		combined += `${ string }$CKB:${ i }$`;
	} );

	console.log( 'HTML()', { strings, values, combined } );

	return {
		combined,
		strings,
		values
	};
}

class ObservablePropertyBinding {
	public property: string;
	public callback?: ( value: any ) => any;

	public constructor( property: string, callback?: ( value: any ) => any ) {
		this.property = property;
		this.callback = callback;
	}
}

/**
 * TODO
 */
class ExampleView extends NextGenView {
	declare public value: number;

	constructor( locale?: Locale ) {
		super( locale );

		this.set( 'value', 0 );
	}

	public getTemplate() {
		const { b } = this;
		const staticText = 'text';

		return html`
			<button type="button" id="123" @click=${ this.onClick }>
				<label for="123">
					Static ${ staticText }.
					Clicked ${ b( 'value' ) } (x10 = ${ b( 'value', value => value * 10 ) }).
				</label>
			</button>
		`;
	}

	public onClick() {
		this.value++;

		console.log( 'Clicked!', this.value );
	}
}

const example = new ExampleView();
example.render();
document.body.appendChild( example.element! );
