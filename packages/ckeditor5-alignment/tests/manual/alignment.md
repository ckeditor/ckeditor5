### Loading

1. The data should be loaded with:
  * first paragraph with default (left) alignment,
  * second paragraph aligned to right,
  * third paragraph should be centered,
  * fourth paragraph should be justified,
  * an image with caption between first and second paragraphs.
2. Toolbar should have alignment button dropdown with four buttons for alignment control: left, right, center and justify.

### Testing

You should be able to:
1. Change alignment on any paragraph.
2. Change alignment on any selection of paragraphs.

You should not be able to change alignment of figcaption by:
1. Placing cursor inside caption.
2. Selecting image with other paragraphs.

You should be able to create blocks that can be aligned:
1. paragraphs
2. headings
3. lists

Alignment UI should:
1. change button dropdown to "left" and highlight "left" button when selection is inside left aligned block (default one)
2. change button dropdown to "right" and highlight "right" button when selection is inside right aligned block
3. change button dropdown to "center" and highlight "center" button when selection is inside centered block
4. change button dropdown to "justify" and highlight "justify" button when selection is inside justified block
5. be disabled if in figcaption
6. only one button should be active at once inside dropdown
7. alignment dropdown should be vertical

