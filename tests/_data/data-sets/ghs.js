/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// This is main Wikipedia page source copied four times. This is to test content with a lot of messy / unsupported markup.
// After it is loaded in the editor, it is ~150 A4 pages (however there are a lot of very short paragraphs and list items).

/* eslint-disable */

const initialData =
	`<p style="color:blue;">Feature paragraph</p>

	<h2 style="color:green">Feature heading1</h2>
	<h3 style="color:green">Feature heading2</h3>
	<h4 style="color:green">Feature heading3</h4>

	<p><strong style="color:blue;">Feature bold</strong></p>
	<p><i style="color:blue;">Feature italic</i></p>
	<p><s style="color:blue;">Feature strike</s></p>
	<p><u style="color:blue;">Feature underline</u></p>
	<p><code style="color:blue;">Feature code</code></p>
	<p><sub style="color:blue;">Feature subscript</sub></p>
	<p><sup style="color:blue;">Feature superscript</sup></p>

	<p><a style="color:green;" href="https://example.com">Link feature</a></p>
	<p><a name="anchor" id="anchor">Anchor (name, ID only)</a></p>

	<p><mark class="marker-yellow" data-mark>Mark feature</mark></p>

	<p><span class="text-big text-italic" style="background-color:hsl(60, 75%, 60%);color:hsl(240, 75%, 60%);font-family:'Courier New', Courier, monospace;border:1px solid black">Font feature</span></p>

	<ul style="background:blue;">
		<li style="color:yellow;">Bulleted List feature</li>
		<li style="color:yellow;">Bulleted List feature</li>
		<li style="color:yellow;">Bulleted List feature</li>
	</ul>

	<ol style="background:blue;">
		<li style="color:yellow;">Numbered List feature</li>
		<li style="color:yellow;">Numbered List feature</li>
		<li style="color:yellow;">Numbered List feature</li>
	</ol>

	<ul class="todo-list" style="background:blue;">
		<li style="color:yellow;">
			<label class="todo-list__label">
				<input type="checkbox" disabled="disabled">
				<span class="todo-list__label__description">Todo List feature</span>
			</label>
		</li>
		<li style="color:yellow;">
			<label class="todo-list__label">
				<input type="checkbox" disabled="disabled">
				<span class="todo-list__label__description">Todo List feature</span>
			</label>
		</li>
		<li style="color:yellow;">
			<label class="todo-list__label">
				<input type="checkbox" disabled="disabled">
				<span class="todo-list__label__description">Todo List feature</span>
			</label>
		</li>
	</ul>

	<blockquote style="color:blue;"><p>Blockquote Feature</p></blockquote>

	<figure style="border: 1px solid blue;" class="image">
		<img src="/ckeditor5/tests/manual/sample.jpg" width="826" height="388"/>
		<figcaption style="background:yellow;">Caption</figcaption>
	</figure>

	<pre style="background:blue;"><code style="color:yellow;" class="language-plaintext">Code Block</code></pre>

	<div style="border: 1px solid blue" class="raw-html-embed">HTML snippet</div>
	<div data-foo class="page-break" style="page-break-after:always;"><span style="display:none;">&nbsp;</span></div>
	<p><i class="inline-icon"></i> empty inline at start</p>
	<p>Text with <i class="inline-icon"></i> empty inline inside</p>
	<p>Text with empty inline at the end <i class="inline-icon"></i></p>`;

export default function makeData() {
  return initialData.repeat( 250 );
}
