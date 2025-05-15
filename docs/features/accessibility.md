---
category: features
classes: keyboard-shortcuts
meta-title: Accessibility support | CKEditor 5 Documentation
modified_at: 2024-04-05
order: -997
---

# Accessibility support

CKEditor&nbsp;5 incorporates various accessibility features, including keyboard navigation, screen reader support (<acronym title="Accessible Rich Internet Applications">ARIA</acronym> attributes), and robust semantic output markup. This guide provides a detailed overview and presents the current status of editor accessibility.

## Conformance with WCAG 2.x and Section 508

CKEditor&nbsp;5 is compliant with [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/) (<acronym title="Web Content Accessibility Guidelines">WCAG</acronym>) 2.2 levels A and AA and [Section 508 of the Rehabilitation Act](https://www.access-board.gov/ict/) unless stated otherwise in the [Accessibility Conformance Report](#accessibility-conformance-report-vpat).

* [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/) (<acronym title="Web Content Accessibility Guidelines">WCAG</acronym>) provides international standards for making web content accessible to individuals with disabilities, ensuring that web applications are perceivable, operable, understandable, and robust for all users.
* [Section 508 of the Rehabilitation Act](https://www.access-board.gov/ict/) mandates that federal agencies’ electronic and information technology is accessible to people with disabilities, establishing guidelines to achieve this goal.

CKEditor&nbsp;5 strives for conformance with these standards and we welcome your [feedback](#accessibility-feedback-and-bugs) on the accessibility of our software.

## Recommended software

For optimal screen reader experience, we recommend using Google Chrome and <acronym title="NonVisual Desktop Access">NVDA</acronym> (Windows) or Safari and VoiceOver (macOS).

## Accessibility Conformance Report (VPAT)

In our ongoing commitment to accessibility, we provide a report based on the [ITI Voluntary Product Accessibility Template](https://www.itic.org/policy/accessibility/vpat) (VPAT**®**), a standardized format for evaluating the accessibility of computer software. This document serves as a comprehensive resource detailing the accessibility features of CKEditor&nbsp;5, including compliance with accessibility standards and guidelines: [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/) (<acronym title="Web Content Accessibility Guidelines">WCAG</acronym>) 2.2 levels A and AA and [Section 508 of the Rehabilitation Act](https://www.access-board.gov/ict/).

We continuously update the <acronym title="Voluntary Product Accessibility Template">VPAT</acronym>**®** report to reflect any changes or improvements. You can download the latest version of the <acronym title="Voluntary Product Accessibility Template">VPAT</acronym>**®** document below.

<info-box info>
	⬇️ <a href="../assets/pdf/VPAT_CKEditor_5_v44.3.0.pdf" target="_blank"><b>Download <acronym title="Voluntary Product Accessibility Template">VPAT</acronym>**®** report for CKEditor&nbsp;5 v44.3.0 (Mar 5, 2025)</b></a>

	<details>
		<summary>Previous versions</summary>
		<ul>
			<li>
				<a href="../assets/pdf/VPAT_CKEditor_5_v43.0.0.pdf" target="_blank"><acronym title="Voluntary Product Accessibility Template">VPAT</acronym><sup>®</sup> report for CKEditor&nbsp;5 v43.0.0 (Aug 7, 2024)</a>
			</li>
			<li>
				<a href="../assets/pdf/VPAT_CKEditor_5_v41.4.2.pdf" target="_blank"><acronym title="Voluntary Product Accessibility Template">VPAT</acronym><sup>®</sup> report for CKEditor&nbsp;5 v41.4.2 (May 17, 2024)</a>
			</li>
			<li>
				<a href="../assets/pdf/VPAT_CKEditor_5_v41.3.0.pdf" target="_blank"><acronym title="Voluntary Product Accessibility Template">VPAT</acronym><sup>®</sup> report for CKEditor&nbsp;5 v41.3.0 (Apr 10, 2024)</a>
			</li>
		</ul>
	</details>
</info-box>

## Keyboard shortcuts

CKEditor&nbsp;5 supports various keyboard shortcuts that boost productivity and provide necessary accessibility to screen reader users.

<info-box info>
	Keyboard support is enabled by default for all editor types and core {@link features/index editor features}.
</info-box>

Below is a list of the most important keystrokes supported by CKEditor&nbsp;5 and its features.

### Content editing keystrokes

These keyboard shortcuts allow for quick access to content editing features.

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Insert a hard break (a new paragraph)</td>
			<td colspan="2"><kbd>Enter</kbd></td>
		</tr>
		<tr>
			<td>Insert a soft break (a <code>&lt;br&gt;</code> element)</td>
			<td><kbd>Shift</kbd>+<kbd>Enter</kbd></td>
			<td><kbd>⇧Enter</kbd></td>
		</tr>
		<tr>
			<td>Copy selected content</td>
			<td><kbd>Ctrl</kbd>+<kbd>C</kbd></td>
			<td><kbd>⌘C</kbd></td>
		</tr>
		<tr>
			<td>Paste content</td>
			<td><kbd>Ctrl</kbd>+<kbd>V</kbd></td>
			<td><kbd>⌘V</kbd></td>
		</tr>
		<tr>
			<td>Paste content as plain text</td>
			<td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd></td>
			<td><kbd>⌘⇧V</kbd></td>
		</tr>
		<tr>
			<td>Undo</td>
			<td><kbd>Ctrl</kbd>+<kbd>Z</kbd></td>
			<td><kbd>⌘Z</kbd></td>
		</tr>
		<tr>
			<td>Redo</td>
			<td><kbd>Ctrl</kbd>+<kbd>Y</kbd>, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd></td>
			<td><kbd>⌘Y</kbd>, <kbd>⌘⇧Z</kbd></td>
		</tr>
		<tr>
			<td>Bold text</td>
			<td><kbd>Ctrl</kbd>+<kbd>B</kbd></td>
			<td><kbd>⌘B</kbd></td>
		</tr>
		<tr>
			<td>Change text case</td>
			<td><kbd>Shift</kbd>+<kbd>F3</kbd></td>
			<td><kbd>⇧F3</kbd> (may require <kbd>Fn</kbd>)</td>
		</tr>
		<tr>
			<td>Create link</td>
			<td><kbd>Ctrl</kbd>+<kbd>K</kbd></td>
			<td><kbd>⌘K</kbd></td>
		</tr>
		<tr>
			<td>Move out of a link</td>
			<td colspan="2"><kbd>←</kbd><kbd>←</kbd>, <kbd>→</kbd><kbd>→</kbd></td>
		</tr>
		<tr>
			<td>Move out of an inline code style</td>
			<td colspan="2"><kbd>←</kbd><kbd>←</kbd>, <kbd>→</kbd><kbd>→</kbd></td>
		</tr>
		<tr>
			<td>Select all</td>
			<td><kbd>Ctrl</kbd>+<kbd>A</kbd></td>
			<td><kbd>⌘A</kbd></td>
		</tr>
		<tr>
			<td>Find in the document</td>
			<td><kbd>Ctrl</kbd>+<kbd>F</kbd></td>
			<td><kbd>⌘F</kbd></td>
		</tr>
		<tr>
			<td>Copy text formatting</td>
			<td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd></td>
			<td><kbd>⌘⇧C</kbd></td>
		</tr>
		<tr>
			<td>Paste text formatting</td>
			<td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd></td>
			<td><kbd>⌘⇧V</kbd></td>
		</tr>
		<tr>
			<td>Italic text</td>
			<td><kbd>Ctrl</kbd>+<kbd>I</kbd></td>
			<td><kbd>⌘I</kbd></td>
		</tr>
		<tr>
			<td>Strikethrough text</td>
			<td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd></td>
			<td><kbd>⌘⇧X</kbd></td>
		</tr>
		<tr>
			<td>Underline text</td>
			<td><kbd>Ctrl</kbd>+<kbd>U</kbd></td>
			<td><kbd>⌘U</kbd></td>
		</tr>
		<tr>
			<td>Revert autoformatting action</td>
			<td colspan="2"><kbd>Backspace</kbd></td>
		</tr>
	</tbody>
</table>

#### Keystrokes for interacting with annotation threads (such as comments or track changes suggestions)

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Move focus to the thread when the selection is anchored in its marker</td>
			<td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>E</kbd></td>
			<td><kbd>⌘⇧E</kbd></td>
		</tr>
		<tr>
			<td>Exit the annotation and move focus back to the edited content</td>
			<td colspan="2"><kbd>Esc</kbd></td>
		</tr>
		<tr>
			<td>Browse the focused annotation thread or thread comment</td>
			<td colspan="2"><kbd>Enter</kbd></td>
		</tr>
		<tr>
			<td>Move across internals of the annotation thread</td>
			<td><kbd>⇥</kbd>, <kbd>Shift</kbd>+<kbd>⇥</kbd></td>
			<td><kbd>⇥</kbd>, <kbd>⇧⇥</kbd></td>
		</tr>
		<tr>
			<td>Submit the reply while writing a comment</td>
			<td><kbd>Ctrl</kbd>+<kbd>Enter</kbd></td>
			<td><kbd>⌘Enter</kbd></td>
		</tr>
		<tr>
			<td>Move to the previous or next thread in the annotations sidebar or comments archive</td>
			<td colspan="2"><kbd>↑</kbd>, <kbd>↓</kbd></td>
		</tr>
	</tbody>
</table>

#### Keystrokes that can be used when a widget is selected (such as image, table, etc.)

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Insert a new paragraph directly after a widget</td>
			<td colspan="2"><kbd>Enter</kbd></td>
		</tr>
		<tr>
			<td>Insert a new paragraph directly before a widget</td>
			<td><kbd>Shift</kbd>+<kbd>Enter</kbd></td>
			<td><kbd>⇧Enter</kbd></td>
		</tr>
		<tr>
			<td>Move the caret to allow typing directly before a widget</td>
			<td colspan="2"><kbd>↑</kbd>, <kbd>←</kbd></td>
		</tr>
		<tr>
			<td>Move the caret to allow typing directly after a widget</td>
			<td colspan="2"><kbd>↓</kbd>, <kbd>→</kbd></td>
		</tr>
		<tr>
			<td>After entering a nested editable, move the selection to the closest ancestor widget. For example: move from an image caption to the whole image widget.</td>
			<td colspan="2"><kbd>Tab</kbd> then <kbd>Esc</kbd></td>
		</tr>
	</tbody>
</table>

#### Keystrokes that can be used in a list

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Increase list item indent</td>
			<td colspan="2"><kbd>⇥</kbd></td>
		</tr>
		<tr>
			<td>Decrease list item indent</td>
			<td><kbd>Shift</kbd>+<kbd>⇥</kbd></td>
			<td><kbd>⇧⇥</kbd></td>
		</tr>
	</tbody>
</table>

#### Keystrokes for navigating through documents

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Go to the previous page (also move selection)</td>
			<td><kbd>Shift</kbd>+<kbd>Page Up</kbd></td>
			<td><kbd>⇧Page Up</kbd> (may require <kbd>Fn</kbd>)</td>
		</tr>
		<tr>
			<td>Go to the next page (also move selection)</td>
			<td><kbd>Shift</kbd>+<kbd>Page Down</kbd></td>
			<td><kbd>⇧Page Down</kbd> (may require <kbd>Fn</kbd>)</td>
		</tr>
	</tbody>
</table>

#### Keystrokes that can be used in a table cell

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Move the selection to the next cell</td>
			<td colspan="2"><kbd>⇥</kbd></td>
		</tr>
		<tr>
			<td>Move the selection to the previous cell</td>
			<td><kbd>Shift</kbd>+<kbd>⇥</kbd></td>
			<td><kbd>⇧⇥</kbd></td>
		</tr>
		<tr>
			<td>Insert a new table row (when in the last cell of a table)</td>
			<td colspan="2"><kbd>⇥</kbd></td>
		</tr>
		<tr>
			<td>Navigate through the table</td>
			<td colspan="2"><kbd>↑</kbd>, <kbd>→</kbd>, <kbd>↓</kbd>, <kbd>←</kbd></td>
		</tr>
	</tbody>
</table>

### User interface and content navigation keystrokes

Use the following keystrokes for more efficient navigation in the CKEditor&nbsp;5 user interface.

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Close contextual balloons, dropdowns, and dialogs</td>
			<td colspan="2"><kbd>Esc</kbd></td>
		</tr>
		<tr>
			<td>Open the accessibility help dialog</td>
			<td><kbd>Alt</kbd>+<kbd>0</kbd></td>
			<td><kbd>⌥0</kbd></td>
		</tr>
		<tr>
			<td>Move focus between form fields (inputs, buttons, etc.)</td>
			<td><kbd>⇥</kbd>, <kbd>Shift</kbd>+<kbd>⇥</kbd></td>
			<td><kbd>⇥</kbd>, <kbd>⇧⇥</kbd></td>
		</tr>
		<tr>
			<td>Move focus to the toolbar, navigate between toolbars</td>
			<td><kbd>Alt</kbd>+<kbd>F10</kbd></td>
			<td><kbd>⌥F10</kbd> (may require <kbd>Fn</kbd>)</td>
		</tr>
		<tr>
			<td>Navigate through the toolbar or menu bar</td>
			<td colspan="2"><kbd>↑</kbd>, <kbd>→</kbd>, <kbd>↓</kbd>, <kbd>←</kbd></td>
		</tr>
		<tr>
			<td>Navigate to the next focusable field or an element outside the editor</td>
			<td colspan="2"><kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>
		</tr>
		<tr>
			<td>Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.</td>
			<td colspan="2"><kbd>Enter</kbd>, <kbd>Space</kbd></td>
		</tr>
		<tr>
			<td>Move focus to the menu bar, navigate between menu bars</td>
			<td><kbd>Alt</kbd>+<kbd>F9</kbd></td>
			<td><kbd>⌥F9</kbd> (may require <kbd>Fn</kbd>)</td>
		</tr>
		<tr>
			<td>Move focus in and out of an active dialog window</td>
			<td><kbd>Ctrl</kbd>+<kbd>F6</kbd></td>
			<td><kbd>⌘F6</kbd> (may require <kbd>Fn</kbd>)</td>
		</tr>
	</tbody>
</table>

### Source Editing Enhanced (plugin)

Keystrokes introduced by {@link features/source-editing-enhanced Source Editing Enhanced plugin}, to streamline code editing experience.

#### Keystrokes related to the built-in code completion mechanism

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Accept completion</td>
			<td colspan="2"><kbd>Enter</kbd></td>
		</tr>
		<tr>
			<td>Close completion</td>
			<td colspan="2"><kbd>Esc</kbd></td>
		</tr>
		<tr>
			<td>Move completion selection backward</td>
			<td colspan="2"><kbd>↑</kbd></td>
		</tr>
		<tr>
			<td>Move completion selection backward by one page</td>
			<td colspan="2"><kbd>Page Up</kbd></td>
		</tr>
		<tr>
			<td>Move completion selection forward</td>
			<td colspan="2"><kbd>↓</kbd></td>
		</tr>
		<tr>
			<td>Move completion selection forward by one page</td>
			<td colspan="2"><kbd>Page Down</kbd></td>
		</tr>
	</tbody>
</table>

#### Keystrokes related to the built-in code folding mechanism

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Fold all</td>
			<td><kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>[</kbd></td>
			<td><kbd>⌃⌥[</kbd></td>
		</tr>
		<tr>
			<td>Fold code</td>
			<td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>[</kbd></td>
			<td><kbd>⌘⌥[</kbd></td>
		</tr>
		<tr>
			<td>Unfold all</td>
			<td><kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>]</kbd></td>
			<td><kbd>⌃⌥]</kbd></td>
		</tr>
		<tr>
			<td>Unfold code</td>
			<td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>]</kbd></td>
			<td><kbd>⌘⌥]</kbd></td>
		</tr>
	</tbody>
</table>

#### Keystrokes that change the selection in the code editor

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Select all</td>
			<td><kbd>Ctrl</kbd>+<kbd>A</kbd></td>
			<td><kbd>⌘A</kbd></td>
		</tr>
		<tr>
			<td>Select character left</td>
			<td><kbd>Shift</kbd>+<kbd>←</kbd></td>
			<td><kbd>⇧←</kbd>, <kbd>⌃⇧B</kbd></td>
		</tr>
		<tr>
			<td>Select character right</td>
			<td><kbd>Shift</kbd>+<kbd>→</kbd></td>
			<td><kbd>⇧→</kbd>, <kbd>⌃⇧F</kbd></td>
		</tr>
		<tr>
			<td>Select document end</td>
			<td><kbd>Shift</kbd>+<kbd>Ctrl</kbd>+<kbd>End</kbd></td>
			<td><kbd>⌘⇧↓</kbd>, <kbd>⌘⇧End</kbd></td>
		</tr>
		<tr>
			<td>Select document start</td>
			<td><kbd>Shift</kbd>+<kbd>Ctrl</kbd>+<kbd>Home</kbd></td>
			<td><kbd>⌘⇧↑</kbd>, <kbd>⌘⇧Home</kbd></td>
		</tr>
		<tr>
			<td>Select group left</td>
			<td><kbd>Shift</kbd>+<kbd>Ctrl←</kbd></td>
			<td><kbd>⌥⇧←</kbd></td>
		</tr>
		<tr>
			<td>Select group right</td>
			<td><kbd>Shift</kbd>+<kbd>Ctrl→</kbd></td>
			<td><kbd>⌥⇧→</kbd></td>
		</tr>
		<tr>
			<td>Select line</td>
			<td><kbd>Alt</kbd>+<kbd>L</kbd></td>
			<td><kbd>⌃L</kbd></td>
		</tr>
		<tr>
			<td>Select line boundary backward</td>
			<td><kbd>Shift</kbd>+<kbd>Home</kbd></td>
			<td><kbd>⇧Home</kbd></td>
		</tr>
		<tr>
			<td>Select line boundary forward</td>
			<td><kbd>Shift</kbd>+<kbd>End</kbd></td>
			<td><kbd>⇧End</kbd></td>
		</tr>
		<tr>
			<td>Select line down</td>
			<td><kbd>Shift</kbd>+<kbd>↓</kbd></td>
			<td><kbd>⇧↓</kbd>, <kbd>⌃⇧N</kbd></td>
		</tr>
		<tr>
			<td>Select line up</td>
			<td><kbd>Shift</kbd>+<kbd>↑</kbd></td>
			<td><kbd>⇧↑</kbd>, <kbd>⌃⇧P</kbd></td>
		</tr>
		<tr>
			<td>Select page down</td>
			<td><kbd>Shift</kbd>+<kbd>Page Down</kbd></td>
			<td><kbd>⌃⇧↓</kbd>, <kbd>⇧Page Down</kbd></td>
		</tr>
		<tr>
			<td>Select page up</td>
			<td><kbd>Shift</kbd>+<kbd>Page Up</kbd></td>
			<td><kbd>⌃⇧↑</kbd>, <kbd>⇧Page Up</kbd></td>
		</tr>
		<tr>
			<td>Select parent syntax</td>
			<td><kbd>Ctrl</kbd>+<kbd>I</kbd></td>
			<td><kbd>⌘I</kbd></td>
		</tr>
		<tr>
			<td>Select syntax left</td>
			<td><kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>←</kbd></td>
			<td><kbd>⌃⇧←</kbd></td>
		</tr>
		<tr>
			<td>Select syntax right</td>
			<td><kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>→</kbd></td>
			<td><kbd>⌃⇧→</kbd></td>
		</tr>
		<tr>
			<td>Select line boundary left</td>
			<td></td>
			<td><kbd>⌘⇧←</kbd></td>
		</tr>
		<tr>
			<td>Select line boundary right</td>
			<td></td>
			<td><kbd>⌘⇧→</kbd></td>
		</tr>
		<tr>
			<td>Select line end</td>
			<td></td>
			<td><kbd>⌃⇧E</kbd></td>
		</tr>
		<tr>
			<td>Select line start</td>
			<td></td>
			<td><kbd>⌃⇧A</kbd></td>
		</tr>
	</tbody>
</table>

#### Keystrokes that move the cursor (caret) in the code editor

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Move cursor to character left</td>
			<td><kbd>←</kbd></td>
			<td><kbd>←</kbd>, <kbd>⌃B</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to character right</td>
			<td><kbd>→</kbd></td>
			<td><kbd>→</kbd>, <kbd>⌃F</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to document end</td>
			<td><kbd>Ctrl</kbd>+<kbd>End</kbd></td>
			<td><kbd>⌘↓</kbd>, <kbd>⌘End</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to document start</td>
			<td><kbd>Ctrl</kbd>+<kbd>Home</kbd></td>
			<td><kbd>⌘↑</kbd>, <kbd>⌘Home</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to group left</td>
			<td><kbd>Ctrl</kbd>+<kbd>←</kbd></td>
			<td><kbd>⌥←</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to group right</td>
			<td><kbd>Ctrl</kbd>+<kbd>→</kbd></td>
			<td><kbd>⌥→</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to line boundary backward</td>
			<td colspan="2"><kbd>Home</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to line boundary forward</td>
			<td colspan="2"><kbd>End</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to line down</td>
			<td><kbd>↓</kbd></td>
			<td><kbd>↓</kbd>, <kbd>⌃N</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to line up</td>
			<td><kbd>↑</kbd></td>
			<td><kbd>↑</kbd>, <kbd>⌃P</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to matching bracket</td>
			<td><kbd>Shift</kbd>+<kbd>Ctrl\</kbd></td>
			<td><kbd>⌘⇧\</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to page down</td>
			<td><kbd>Page Down</kbd></td>
			<td><kbd>⌃↓</kbd>, <kbd>⌃V</kbd>, <kbd>Page Down</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to page up</td>
			<td><kbd>Page Up</kbd></td>
			<td><kbd>⌃↑</kbd>, <kbd>Page Up</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to syntax left</td>
			<td><kbd>Alt</kbd>+<kbd>←</kbd></td>
			<td><kbd>⌃←</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to syntax right</td>
			<td><kbd>Alt</kbd>+<kbd>→</kbd></td>
			<td><kbd>⌃→</kbd></td>
		</tr>
		<tr>
			<td>Move line down</td>
			<td><kbd>Alt</kbd>+<kbd>↓</kbd></td>
			<td><kbd>⌥↓</kbd></td>
		</tr>
		<tr>
			<td>Move line up</td>
			<td><kbd>Alt</kbd>+<kbd>↑</kbd></td>
			<td><kbd>⌥↑</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to line boundary left</td>
			<td></td>
			<td><kbd>⌘←</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to line boundary right</td>
			<td></td>
			<td><kbd>⌘→</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to line end</td>
			<td></td>
			<td><kbd>⌘E</kbd></td>
		</tr>
		<tr>
			<td>Move cursor to line start</td>
			<td></td>
			<td><kbd>⌘A</kbd></td>
		</tr>
	</tbody>
</table>

#### Keystrokes that modify the code in the editor

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Copy line down</td>
			<td><kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>↓</kbd></td>
			<td><kbd>⇧⌥↓</kbd></td>
		</tr>
		<tr>
			<td>Copy line up</td>
			<td><kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>↑</kbd></td>
			<td><kbd>⇧⌥↑</kbd></td>
		</tr>
		<tr>
			<td>Delete bracket pair</td>
			<td colspan="2"><kbd>Backspace</kbd></td>
		</tr>
		<tr>
			<td>Delete character backward</td>
			<td><kbd>Backspace</kbd>, <kbd>Shift</kbd>+<kbd>Backspace</kbd></td>
			<td><kbd>Backspace</kbd>, <kbd>⌃H</kbd>, <kbd>⇧Backspace</kbd></td>
		</tr>
		<tr>
			<td>Delete character forward</td>
			<td><kbd>Delete</kbd></td>
			<td><kbd>⌃D</kbd>, <kbd>Delete</kbd></td>
		</tr>
		<tr>
			<td>Delete group backward</td>
			<td><kbd>Ctrl</kbd>+<kbd>Backspace</kbd></td>
			<td><kbd>⌥Backspace</kbd>, <kbd>⌃⌥H</kbd></td>
		</tr>
		<tr>
			<td>Delete group forward</td>
			<td><kbd>Ctrl</kbd>+<kbd>Delete</kbd></td>
			<td><kbd>⌥Delete</kbd></td>
		</tr>
		<tr>
			<td>Delete line</td>
			<td><kbd>Shift</kbd>+<kbd>CtrlK</kbd></td>
			<td><kbd>⌘⇧K</kbd></td>
		</tr>
		<tr>
			<td>Indent less</td>
			<td><kbd>Ctrl</kbd>+<kbd>[</kbd></td>
			<td><kbd>⌘[</kbd></td>
		</tr>
		<tr>
			<td>Indent more</td>
			<td><kbd>Ctrl</kbd>+<kbd>]</kbd></td>
			<td><kbd>⌘]</kbd></td>
		</tr>
		<tr>
			<td>Indent selection</td>
			<td><kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>\</kbd></td>
			<td><kbd>⌘⌥\</kbd></td>
		</tr>
		<tr>
			<td>Insert blank line</td>
			<td><kbd>Ctrl</kbd>+<kbd>Enter</kbd></td>
			<td><kbd>⌘Enter</kbd></td>
		</tr>
		<tr>
			<td>Insert new line and indent</td>
			<td><kbd>Enter</kbd>, <kbd>Shift</kbd>+<kbd>Enter</kbd></td>
			<td><kbd>Enter</kbd>, <kbd>⇧Enter</kbd></td>
		</tr>
		<tr>
			<td>Redo</td>
			<td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>, <kbd>Ctrl</kbd>+<kbd>Y</kbd></td>
			<td><kbd>⌘⇧Z</kbd>, <kbd>⌘Y</kbd></td>
		</tr>
		<tr>
			<td>Redo selection</td>
			<td><kbd>Alt</kbd>+<kbd>U</kbd></td>
			<td><kbd>⌘⇧U</kbd></td>
		</tr>
		<tr>
			<td>Simplify selection</td>
			<td colspan="2"><kbd>Esc</kbd></td>
		</tr>
		<tr>
			<td>Toggle block comment</td>
			<td><kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>A</kbd></td>
			<td><kbd>⇧⌥A</kbd></td>
		</tr>
		<tr>
			<td>Toggle comment</td>
			<td><kbd>Ctrl</kbd>+<kbd>/</kbd></td>
			<td><kbd>⌘/</kbd></td>
		</tr>
		<tr>
			<td>Undo</td>
			<td><kbd>Ctrl</kbd>+<kbd>Z</kbd></td>
			<td><kbd>⌘Z</kbd></td>
		</tr>
		<tr>
			<td>Undo selection</td>
			<td><kbd>Ctrl</kbd>+<kbd>U</kbd></td>
			<td><kbd>⌘U</kbd></td>
		</tr>
		<tr>
			<td>Delete line boundary backward</td>
			<td></td>
			<td><kbd>⌘Backspace</kbd></td>
		</tr>
		<tr>
			<td>Delete line boundary forward</td>
			<td></td>
			<td><kbd>⌘Delete</kbd></td>
		</tr>
		<tr>
			<td>Delete to line end</td>
			<td></td>
			<td><kbd>⌃K</kbd></td>
		</tr>
		<tr>
			<td>Split line</td>
			<td></td>
			<td><kbd>⌃O</kbd></td>
		</tr>
		<tr>
			<td>Transpose characters</td>
			<td></td>
			<td><kbd>⌃T</kbd></td>
		</tr>
	</tbody>
</table>

#### Miscellaneous code editor shortcuts

<table>
	<thead>
		<tr>
			<th>Action</th>
			<th>PC</th>
			<th>Mac</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Switch between "focus with tab" and "indent with tab" mode</td>
			<td><kbd>Ctrl</kbd>+<kbd>M</kbd></td>
			<td><kbd>⌥⇧M</kbd></td>
		</tr>
	</body>
</table>

<style>
	.keyboard-shortcuts th {
		text-align: center;
	}
	.keyboard-shortcuts td:nth-of-type(1) {
		text-align: right;
	}
	.keyboard-shortcuts td:nth-of-type(2), .keyboard-shortcuts td:nth-of-type(3) {
		width: 30%;
	}
</style>

### Displaying keyboard shortcuts in the editor

CKEditor 5 offers a dedicated {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp Accessibility help} plugin that displays a list of all available keyboard shortcuts in a dialog. It can be opened by pressing <kbd>Alt</kbd> + <kbd>0</kbd> (on Windows) or <kbd>⌥0</kbd> (on macOS). Alternatively, you can use the toolbar button to open the dialog.

{@snippet features/keyboard-support}

The Accessibility help plugin is enabled by the {@link module:essentials/essentials~Essentials Essentials} plugin from the [@ckeditor/ckeditor5-essentials](https://ckeditor5.github.io/docs/nightly/ckeditor5/latest/api/essentials.html) package (which also enables other common editing features).

Learn how integrators can {@link tutorials/crash-course/keystrokes#adding-keyboard-shortcuts add keyboard shortcuts to their features} and {@link tutorials/crash-course/keystrokes#adding-shortcut-information-to-the-accessibility-help-dialog supply shortcut information} to the Accessibility help dialog.

## Accessibility feedback and bugs

We welcome your feedback on the accessibility of CKEditor&nbsp;5. You can find the [current list of accessibility issues](https://github.com/ckeditor/ckeditor5/issues?q=is%3Aopen+is%3Aissue+label%3Adomain%3Aaccessibility) on GitHub. Learn how to {@link support/index#reporting-issues report issues}.
