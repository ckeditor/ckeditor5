/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { HtmlDataProcessor, ViewUpcastWriter, ViewDocument, StylesProcessor } from '@ckeditor/ckeditor5-engine';
import { replaceMSFootnotes } from '../../src/filters/replacemsfootnotes.js';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new ViewDocument( new StylesProcessor() ) );

	describe( 'replaceMSFootnotes', () => {
		let writer, viewDocument;

		before( () => {
			viewDocument = new ViewDocument();
			writer = new ViewUpcastWriter( viewDocument );
		} );

		it( 'should transform single MS footnote if footnotes list present', () => {
			const inputData = `
				<p class="MsoNormal">
					Hello World
					<a style='mso-footnote-id:ftn1' href="#_ftn1" name="_ftnref1" title="">
						<span class="MsoFootnoteReference">
							<span>
								<![if !supportFootnotes]>
								<span class="MsoFootnoteReference">[1]</span>
								<![endif]>
							</span>
						</span>
					</a>
					213213
					<o:p></o:p>
				</p>
				<div style='mso-element:footnote-list'>
					<![if !supportFootnotes]>
					<br clear=all>
					<hr align=left size=1 width="33%">
					<![endif]>
					<div style='mso-element:footnote' id=ftn1>
						<p class="MsoFootnoteText">
							<a style='mso-footnote-id:ftn1' href="#_ftnref1" name="_ftn1" title="">
								<span class="MsoFootnoteReference">
									<span>
										<![if !supportFootnotes]>
										<span class="MsoFootnoteReference">[1]</span>
										<![endif]>
									</span>
								</span>
							</a>
							Test footnote
							<o:p></o:p>
						</p>
					</div>
				</div>
			`;

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceMSFootnotes( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p class="MsoNormal">' +
					'Hello World ' +
					'<sup class="footnote">' +
						'<a id="ref-ftn1" href="#ftn1"></a>' +
					'</sup>' +
					'213213&nbsp;<o:p></o:p>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="ftn1">' +
						'<a class="footnote-backlink" href="#ref-ftn1">^</a>' +
						'<div class="footnote-content">' +
							'<p class="MsoFootnoteText">Test footnote&nbsp;<o:p></o:p></p>' +
						'</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should transform multiple MS footnotes if footnotes list present', () => {
			const inputData = `
				<p class="MsoNormal">
					Hello World
					<a style='mso-footnote-id:ftn1' href="#_ftn1" name="_ftnref1" title="">
						<span class="MsoFootnoteReference">
							<span>
								<![if !supportFootnotes]>
								<span class="MsoFootnoteReference">[1]</span>
								<![endif]>
							</span>
						</span>
					</a>
					213213
					<a style='mso-footnote-id:ftn2' href="#_ftn2" name="_ftnref2" title="">
						<span class="MsoFootnoteReference">
							<span>
								<![if !supportFootnotes]>
								<span class="MsoFootnoteReference">[2]</span>
								<![endif]>
							</span>
						</span>
					</a>
					<o:p></o:p>
				</p>
				<div style='mso-element:footnote-list'>
					<![if !supportFootnotes]>
					<br clear=all>
					<hr align=left size=1 width="33%">
					<![endif]>
					<div style='mso-element:footnote' id=ftn1>
						<p class="MsoFootnoteText">
							<a style='mso-footnote-id:ftn1' href="#_ftnref1" name="_ftn1" title="">
								<span class="MsoFootnoteReference">
									<span>
										<![if !supportFootnotes]>
										<span class="MsoFootnoteReference">[1]</span>
										<![endif]>
									</span>
								</span>
							</a>
							Test foot	note 1
							<o:p></o:p>
						</p>
					</div>
					<div style='mso-element:footnote' id=ftn2>
						<p class="MsoFootnoteText">
							<a style='mso-footnote-id:ftn2' href="#_ftnref2" name="_ftn2" title="">
								<span class="MsoFootnoteReference">
									<span>
										<![if !supportFootnotes]>
										<span class="MsoFootnoteReference">[2]</span>
										<![endif]>
									</span>
								</span>
							</a>
							Test foot	note 2
							<o:p></o:p>
						</p>
					</div>
				</div>
			`;

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceMSFootnotes( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p class="MsoNormal">' +
					'Hello World ' +
					'<sup class="footnote">' +
						'<a id="ref-ftn1" href="#ftn1"></a>' +
					'</sup>' +
					'213213&nbsp;' +
					'<sup class="footnote">' +
						'<a id="ref-ftn2" href="#ftn2"></a>' +
					'</sup>' +
					'<o:p></o:p>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="ftn1">' +
						'<a class="footnote-backlink" href="#ref-ftn1">^</a>' +
						'<div class="footnote-content">' +
							'<p class="MsoFootnoteText">Test foot note 1&nbsp;<o:p></o:p></p>' +
						'</div>' +
					'</li>' +
					'<li class="footnote-definition" id="ftn2">' +
						'<a class="footnote-backlink" href="#ref-ftn2">^</a>' +
						'<div class="footnote-content">' +
							'<p class="MsoFootnoteText">Test foot note 2&nbsp;<o:p></o:p></p>' +
						'</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should not transform MS footnotes if footnotes list is missing', () => {
			const inputData = `
				<p class="MsoNormal">
					Hello World
					<a style='mso-footnote-id:ftn1' href="#_ftn1" name="_ftnref1" title="">
						<span class="MsoFootnoteReference">
							<span>
								<![if !supportFootnotes]>
								<span class="MsoFootnoteReference">[1]</span>
								<![endif]>
							</span>
						</span>
					</a>
					213213
					<o:p></o:p>
				</p>
			`;

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceMSFootnotes( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p class="MsoNormal">' +
					'Hello World ' +
					'<a style="mso-footnote-id:ftn1;" href="#_ftn1" name="_ftnref1" title="">' +
						'<span class="MsoFootnoteReference">' +
							'<span>' +
								'<span class="MsoFootnoteReference">[1]</span> ' +
							'</span>' +
						'</span>' +
					'</a>' +
					'213213&nbsp;<o:p></o:p>' +
				'</p>'
			);
		} );

		it( 'should handle scenario when there is footnote reference that does not have corresponding definition', () => {
			const inputData = `
				<p class="MsoNormal">
					Hello World
					<a style='mso-footnote-id:ftn1' href="#_ftn1" name="_ftnref1" title="">
						<span class="MsoFootnoteReference">
							<span>
								<![if !supportFootnotes]>
								<span class="MsoFootnoteReference">[1]</span>
								<![endif]>
							</span>
						</span>
					</a>
					213213
					<a style='mso-footnote-id:ftn2' href="#_ftn2" name="_ftnref2" title="">
						<span class="MsoFootnoteReference">
							<span>
								<![if !supportFootnotes]>
								<span class="MsoFootnoteReference">[2]</span>
								<![endif]>
							</span>
						</span>
					</a>
					<o:p></o:p>
				</p>
				<div style='mso-element:footnote-list'>
					<![if !supportFootnotes]>
					<br clear=all>
					<hr align=left size=1 width="33%">
					<![endif]>
					<div style='mso-element:footnote' id=ftn1>
						<p class="MsoFootnoteText">
							<a style='mso-footnote-id:ftn1' href="#_ftnref1" name="_ftn1" title="">
								<span class="MsoFootnoteReference">
									<span>
										<![if !supportFootnotes]>
										<span class="MsoFootnoteReference">[1]</span>
										<![endif]>
									</span>
								</span>
							</a>
							Test foot	note 1
							<o:p></o:p>
						</p>
					</div>
				</div>
			`;

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceMSFootnotes( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p class="MsoNormal">' +
					'Hello World ' +
					'<sup class="footnote">' +
						'<a id="ref-ftn1" href="#ftn1"></a>' +
					'</sup>' +
					'213213 ' +
					'<a style="mso-footnote-id:ftn2;" href="#_ftn2" name="_ftnref2" title="">' +
						'<span class="MsoFootnoteReference">' +
							'<span>' +
								'<span class="MsoFootnoteReference">[2]</span>&nbsp;' +
							'</span>' +
						'</span>' +
					'</a>' +
					'<o:p></o:p>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="ftn1">' +
						'<a class="footnote-backlink" href="#ref-ftn1">^</a>' +
						'<div class="footnote-content">' +
							'<p class="MsoFootnoteText">Test foot note 1&nbsp;<o:p></o:p></p>' +
						'</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should remove single space text nodes following footnote references in definitions', () => {
			const inputData = `
				<p class="MsoNormal">
					Hello World
					<a style='mso-footnote-id:ftn1' href="#_ftn1" name="_ftnref1" title="">
						<span class="MsoFootnoteReference">
							<span>
								<![if !supportFootnotes]>
								<span class="MsoFootnoteReference">[1]</span>
								<![endif]>
							</span>
						</span>
					</a>
					<o:p></o:p>
				</p>
				<div style='mso-element:footnote-list'>
					<![if !supportFootnotes]>
					<br clear=all>
					<hr align=left size=1 width="33%">
					<![endif]>
					<div style='mso-element:footnote' id=ftn1>
						<p class="MsoFootnoteText">
							<a style='mso-footnote-id:ftn1' href="#_ftnref1" name="_ftn1" title="">
								<span class="MsoFootnoteReference">
									<span>
										<![if !supportFootnotes]>
										<span class="MsoFootnoteReference">[1]</span>
										<![endif]>
									</span>
								</span>
							</a>&nbsp;Footnote content
							<o:p></o:p>
						</p>
					</div>
				</div>
			`;

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceMSFootnotes( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p class="MsoNormal">' +
					'Hello World&nbsp;' +
					'<sup class="footnote">' +
						'<a id="ref-ftn1" href="#ftn1"></a>' +
					'</sup>' +
					'<o:p></o:p>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="ftn1">' +
						'<a class="footnote-backlink" href="#ref-ftn1">^</a>' +
						'<div class="footnote-content">' +
							'<p class="MsoFootnoteText">Footnote content&nbsp;<o:p></o:p></p>' +
						'</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should work properly if there are no text in footnote definition except the reference', () => {
			const inputData = `
				<p class="MsoNormal">
					Hello World
					<a style='mso-footnote-id:ftn1' href="#_ftn1" name="_ftnref1" title="">
						<span class="MsoFootnoteReference">
							<span>
								<![if !supportFootnotes]>
								<span class="MsoFootnoteReference">[1]</span>
								<![endif]>
							</span>
						</span>
					</a>
					<o:p></o:p>
				</p>
				<div style='mso-element:footnote-list'>
					<![if !supportFootnotes]>
					<br clear=all>
					<hr align=left size=1 width="33%">
					<![endif]>
					<div style='mso-element:footnote' id=ftn1>
						<p class="MsoFootnoteText">
							<a style='mso-footnote-id:ftn1' href="#_ftnref1" name="_ftn1" title="">
								<span class="MsoFootnoteReference">
									<span>
										<![if !supportFootnotes]>
										<span class="MsoFootnoteReference">[1]</span>
										<![endif]>
									</span>
								</span>
							</a>&nbsp;
						</p>
					</div>
				</div>
			`;

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceMSFootnotes( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p class="MsoNormal">' +
					'Hello World&nbsp;' +
					'<sup class="footnote">' +
						'<a id="ref-ftn1" href="#ftn1"></a>' +
					'</sup>' +
					'<o:p></o:p>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="ftn1">' +
						'<a class="footnote-backlink" href="#ref-ftn1">^</a>' +
						'<div class="footnote-content">' +
							'<p class="MsoFootnoteText"></p>' +
						'</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should handle scenario when there is table in footnote definition', () => {
			const inputData = `
				<p class="MsoNormal">
					Hello World
					<a style='mso-footnote-id:ftn1' href="#_ftn1" name="_ftnref1" title="">
						<span class="MsoFootnoteReference">
							<span>
								<![if !supportFootnotes]>
								<span class="MsoFootnoteReference">[1]</span>
								<![endif]>
							</span>
						</span>
					</a>
					<o:p></o:p>
				</p>
				<div style='mso-element:footnote-list'>
					<![if !supportFootnotes]>
					<br clear=all>
					<hr align=left size=1 width="33%">
					<![endif]>
					<div style='mso-element:footnote' id=ftn1>
						<p class="MsoFootnoteText">
							<a style='mso-footnote-id:ftn1' href="#_ftnref1" name="_ftn1" title="">
								<span class="MsoFootnoteReference">
									<span>
										<![if !supportFootnotes]>
										<span class="MsoFootnoteReference">[1]</span>
										<![endif]>
									</span>
								</span>
							</a>&nbsp;
							<table>
								<tr>
									<td>Cell 1</td>
									<td>Cell 2</td>
								</tr>
							</table>
							<o:p></o:p>
						</p>
					</div>
				</div>
			`;

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceMSFootnotes( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p class="MsoNormal">' +
					'Hello World&nbsp;' +
					'<sup class="footnote">' +
						'<a id="ref-ftn1" href="#ftn1"></a>' +
					'</sup>' +
					'<o:p></o:p>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="ftn1">' +
						'<a class="footnote-backlink" href="#ref-ftn1">^</a>' +
						'<div class="footnote-content">' +
							'<p class="MsoFootnoteText">' +
								'<table>' +
									'<tbody>' +
										'<tr>' +
											'<td>Cell 1</td>' +
											'<td>Cell 2</td>' +
										'</tr>' +
									'</tbody>' +
								'</table>' +
								'<o:p></o:p>' +
							'</p>' +
						'</div>' +
					'</li>' +
				'</ol>'
			);
		} );
	} );
} );
