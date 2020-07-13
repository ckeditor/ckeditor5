/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import MediaEmbed from '../src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';

describe( 'MediaEmbed integration', () => {
	let element, clock;

	beforeEach( () => {
		clock = sinon.useFakeTimers();
		element = document.createElement( 'div' );
		document.body.appendChild( element );
	} );

	afterEach( () => {
		element.remove();
		clock.restore();
	} );

	describe( 'with the placeholder feature', () => {
		it( 'should make the placeholder CSS class disappear when pasting a new media into an empty editing root', async () => {
			const editor = await ClassicTestEditor.create( element, {
				plugins: [ MediaEmbed, Paragraph ]
			} );

			enablePlaceholder( {
				view: editor.editing.view,
				element: editor.editing.view.document.getRoot(),
				text: 'foo',
				isDirectHost: false
			} );

			editor.editing.view.document.fire( 'paste', {
				dataTransfer: {
					getData() {
						return 'https://www.youtube.com/watch?v=H08tGjXNHO4';
					}
				},
				stopPropagation() {},
				preventDefault() {}
			} );

			clock.tick( 100 );

			expect( getViewData( editor.editing.view ) ).to.equal(
				'[<figure class="ck-widget ck-widget_selected media" contenteditable="false" data-placeholder="foo">' +
					'<div class="ck-media__wrapper" data-oembed-url="https://www.youtube.com/watch?v=H08tGjXNHO4"></div>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>]'
			);

			await editor.destroy();
		} );
	} );
} );
