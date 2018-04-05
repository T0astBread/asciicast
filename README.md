# asciicast
Modular JavaScript library for generating real-time ASCII art

## Usage
### Installation
Include the `renderer.js`, `programmes.js` and `styles.css` in your HTML file. If you want to use the pre-defined filters, also include `filter.js`.

```html
<link rel="stylesheet" href="libs/asciicast/styles.css">
<script src="libs/asciicast/renderer.js"></script>
<script src="libs/asciicast/programmes.js"></script>
<script src="libs/asciicast/filters.js"></script>
```

### Setup
```javascript
// Initialize the renderer
let renderer = new AsciiRenderer(document.getElementById("ascii-art-container"))

// Add some filters
renderer.filterQueue.add(new BrightnessFilter().changeBrightness(-25).activated(false))
renderer.filterQueue.add(new FakeSaturationFilter().changeSaturation(2.5))
renderer.filterQueue.add(new AlphaFilter()) //Sets the alpha channel to a grayscale version of the image. Useful if you want to get "classic" ASCII art.
renderer.filterQueue.add(new SingleColorFilter().changeColor(0, 0, ,0).weighted(.5))

// Render something!
renderer.renderProgramme(new ImageProgramme(document.images[0])) //Renders a simple image
```
