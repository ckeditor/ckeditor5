## Styles rendering from <head>

When `fullPage.allowRenderStylesFromHead` is set to `true` styles from `<head>` are rendered.

With this option on we recommend to use a CSS sanitizer function to increase the security.

In this manual test sanitizer function is added and it simply removes `color: green;` from stylesheet; This property is initially added to the `h2` but as you can see the headline is not green but black (default color). When you click the `Source` button, you will see that style that is set to the `h2` remains the same. Sanitizer function only works during rendering the style on page while editing it in the editor. It does not affect the source style.
