/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import MediaEmbed from '../src/mediaembed.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder.js';

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
		// https://github.com/ckeditor/ckeditor5/issues/1684
		it( 'should make the placeholder CSS class disappear when pasting a new media into an empty editing root', async () => {
			const editor = await ClassicTestEditor.create( element, {
				plugins: [ MediaEmbed, Paragraph ]
			} );
			const editingRoot = editor.editing.view.document.getRoot();

			editingRoot.placeholder = 'foo';
			enablePlaceholder( {
				view: editor.editing.view,
				element: editingRoot,
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
