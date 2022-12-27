## ImageStyle feature

### Image toolbar

* The drop-down buttons should have labels like "Drop-down name: Selected style name".
* On the first image the "Break text" button should be highlighted.
	- After opening the drop-down the nested button "Centered image" should be highlighted.
* On the second image the "In line" button should be highlighted.
	- After opening the drop-down the nested button "Left aligned image" should be highlighted.
* The highlighted "Break text" button on the first image should look and behave like the drop-down:
	- it should have uniform background with the arrow on hover,
	- it should have uniform background with the arrow if it"s open,
	- it should open on click on the icon or the arrow,
	- it should close on click on the icon or the arrow,
* The not highlighted "Wrap text" button on the first image should look and behave like the split button:
	- the arrow and the icon should be separated visually on hover
	- it should have uniform background with the arrow if it"s open,
	- clicking the icon should change the image styling and should not open the drop-down
	- clicking the arrow should open the drop-down without affecting the image styling

### Image styling

* The first image
	- The "Break text" styles:
		* Should make the "Break text" button highlighted.
		* Should display the image between the paragraphs aligned to the left/center/right.
		* The image should have side margins if aligned to the left/right.
	- The "Wrap text" styles:
		* Should make the "Wrap text" button highlighted.
		* The image should have the top, bottom and side margins and should be aligned to the left/right.
		* The text should be wrapped around the image if there is enough space for that.
		* If the button was clicked after one of the "Break text" options, the `img` should be wrapped with the `figure` HTML element.
		* If the button was clicked after the "In line" option, the `img` should be wrapped with the `span` HTML element.
	- The "In line" style:
		* The image should have no margins and should be displayed in the text line (if image was in the block-mode previously, it has to dragged into a paragraph, otherwise it gets wrapped with an empty paragraph).
### The "semantic–oriented" editor

* Click on image - toolbar with icons should appear.
	- "Centered image" icon should be selected for the first image.
	- "In line" icon should be selected for the second image.
* Resize the browser window so the scrollbar is visible. Click on image and scroll editor contents - check if toolbar is placed in proper position.

### The "formatting–oriented" editor

* Click on image - toolbar with icons should appear.
	- "Break text: Centered image" icon should be selected for the first image.
	- "Wrap text: Left aligned image" icon should be selected for the second image.

### The "declarative drop-downs" editor

* Click on image - toolbar with drop-downs should appear.
	- The first drop-down should have the "Inline image: Left aligned image" label and should be selected for the second image. It should contain "In line", "Left aligned image", and "Right aligned image" buttons.
	- The second drop-down should have the "Block image: Centered image" label and should be selected for the first image. It should contain "Left aligned image", "Centered image", and "Right aligned image" buttons.
