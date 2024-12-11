/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// This is main Wikipedia page source copied four times. This is to test content with a lot of messy / unsupported markup.
// After it is loaded in the editor, it is ~150 A4 pages (however there are a lot of very short paragraphs and list items).

/* eslint-disable */

const initialData =
  `<h2>HTML playground</h2>
	<div id="cke5-source-code-demo">
		<article>
			<p data-foo="bar">
				A sample paragraph with a <strong>data attribute</strong>.
			</p>
			<hr>
			<section>
				<h3>Responsive column layout</h3>
				<div class="columns" style="gap:10px">
					<div class="column" style="border: 1px solid orange">
						<figure class="image">
							<img src="/ckeditor5/tests/manual/sample.jpg"/>
							<figcaption><abbr title="HyperText Markup Language">HTML</abbr></figcaption>
						</figure>
					</div>
					<div class="column" style="border: 1px dotted blue">
						<figure class="image">
							<img src="/ckeditor5/tests/manual/sample.jpg"/>
							<figcaption><abbr title="Cascading Style Sheets">CSS</abbr></figcaption>
						</figure>
					</div>
					<div class="column" style="border: 1px dashed olive">
						<figure class="image">
							<img src="/ckeditor5/tests/manual/sample.jpg"/>
							<figcaption><abbr title="JavaScript">JS</abbr></figcaption>
						</figure>
					</div>
				</div>
			</section>
			<hr>
			<aside>
				<h3>HTML-related features</h3>
				<ul>
					<li>
						<a href="https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html">HTML embed</a>
					</li>
					<li>
						<a href="https://ckeditor.com/docs/ckeditor5/latest/features/style.html">Styles</a>
					</li>
					<li>
						<a href="https://ckeditor.com/docs/ckeditor5/latest/features/html/html-comments.html">HTML comment element</a>
					</li>
				</ul>
			</aside>
		</article>
	</div>`;

export default function makeData() {
  return initialData.repeat( 1000 );
}
