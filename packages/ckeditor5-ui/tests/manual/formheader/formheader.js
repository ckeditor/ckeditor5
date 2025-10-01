/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ButtonView, FormHeaderView } from '../../../src/index.js';

const icon = `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
	<path d="M2 14.994C2 16.102 2.895 17 3.994 17h12.012A2 2 0 0 0 18 14.994V5.006A2.001 2.001 0 0 0
	16.006 3H3.994A2 2 0 0 0 2 5.006v9.988zm1-9.992C3 4.45 3.45 4 4.007 4h11.986A1.01 1.01 0 0 1 17
	5.002v9.996C17 15.55 16.55 16 15.993 16H4.007A1.01 1.01 0 0 1 3 14.998V5.002zm1.024
	10H16v-3.096l-2.89-4.263-3.096 5.257-3.003-2.103L4 13.96l.024 1.043zM6.406 6A1.4 1.4 0 0 0 5
	7.393a1.4 1.4 0 0 0 1.406 1.393 1.4 1.4 0 0 0 1.407-1.393A1.4 1.4 0 0 0 6.406 6z"
	fill-rule="evenodd"/>
</svg>`;

const cancelIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
	<path d="m11.591 10.177 4.243 4.242a1 1 0 0 1-1.415 1.415l-4.242-4.243-4.243 4.243a1 1 0 0 1-1.414-1.415l4.243-4.242L4.52
	 5.934A1 1 0 0 1 5.934 4.52l4.243 4.243 4.242-4.243a1 1 0 1 1 1.415 1.414z"/></svg>`;

const playground = document.querySelector( '#playground' );

const textOnlyView = new FormHeaderView(
	undefined,
	{
		label: 'Foo bar'
	} );

textOnlyView.render();

const withIconView = new FormHeaderView(
	undefined,
	{
		label: 'Foo bar',
		icon
	} );

withIconView.render();

const withIconAndButtonView = new FormHeaderView(
	undefined,
	{
		label: 'Foo bar',
		icon
	} );

withIconAndButtonView.children.add( createButton( 'Example button', cancelIcon ) );
withIconAndButtonView.render();

const withLongTitleView = new FormHeaderView(
	undefined,
	{
		label: 'Foo bar Foo bar Foo bar Foo bar Foo bar Foo bar Foo bar Foo bar',
		icon
	} );

withLongTitleView.children.add( createButton( 'Example button', cancelIcon ) );
withLongTitleView.render();

playground.appendChild( textOnlyView.element );
playground.appendChild( withIconView.element );
playground.appendChild( withIconAndButtonView.element );
playground.appendChild( withLongTitleView.element );

function createButton( label = 'Example button', icon ) {
	const button = new ButtonView();

	button.set( {
		label,
		withText: false,
		icon,
		tooltip: true
	} );

	button.on( 'execute', () => {
		console.log( 'Button clicked!' );
	} );

	return button;
}
