---
category: features
classes: keyboard-shortcuts
meta-title: Accessibility support | CKEditor 5 Documentation
modified_at: 2024-04-05
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
	⬇️ <a href="../assets/pdf/VPAT_CKEditor_5_v41.3.0.pdf" target="_blank"><b>Download <acronym title="Voluntary Product Accessibility Template">VPAT</acronym>**®** report for CKEditor&nbsp;5 v41.3.0 (Apr 10, 2024)</b></a>
</info-box>

## Keyboard shortcuts

CKEditor&nbsp;5 supports various keyboard shortcuts that boost productivity and provide necessary accessibility to screen reader users.

<info-box info>
	Keyboard support is enabled by default for all {@link installation/getting-started/predefined-builds editor types} and core {@link features/index editor features}.
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

We welcome your feedback on the accessibility of CKEditor&nbsp;5. You can find the [current list of accessibility issues](https://github.com/ckeditor/ckeditor5/issues?q=is%3Aopen+is%3Aissue+label%3Adomain%3Aaccessibility) on GitHub. Learn how to {@link support/reporting-issues report issues}.
