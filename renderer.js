class AsciiRenderer {
    /**
     * 
     * @param {HTMLElement} container 
     */
    constructor(container) {
        this.container = container
        this.container.classList.add("ascii-container")
        this.pixelArray = null
        this.filterQueue = new FilterQueue()
        this.animationTimeoutId = null
    }

    setUp(width, height) {
        this.stopAnimation()

        this.container.innerHTML = ""
        this.pixelArray = []
        this.width = width
        this.height = height

        let pixel = null
        for(let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                pixel = new Pixel(x, y, document.createElement("span"), this)
                this.container.appendChild(pixel.element)
                this.pixelArray.push(pixel)
            }
            this.container.appendChild(document.createElement("br"))
        }
    }

    forEachPixel(consumer) {
        let iterationStart = Date.now()
        for(let y = 0; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {
                consumer(x, y, this.pixelArray[y * this.width + x])
            }
        }
        let iterationEnd = Date.now()
        return iterationEnd - iterationStart
    }

    /**
     * Canvas for extracting image data
     */
    getHiddenCanvas() {
        if(!this.hiddenCanvas) {
            this.hiddenCanvas = document.createElement("canvas")
            document.body.appendChild(this.hiddenCanvas)
            this.hiddenCanvas.classList.add("hidden-canvas")
        }
        return this.hiddenCanvas
    }

    /**
     * Context of the hidden canvas
     */
    getHiddenContext() {
        if(!this.hiddenContext) this.hiddenContext = this.getHiddenCanvas().getContext("2d")
        return this.hiddenContext
    }

    drawImageFromHiddenContext(offsetX, offsetY, windowWidth, windowHeight) {
        let imageData = this.hiddenContext.getImageData(offsetX, offsetY, windowWidth, windowHeight)
        const getPixVal = (x, y, offset) => imageData.data[(y * imageData.width + x) * 4 + offset]
        this.forEachPixel((x, y, pixel) => {
            pixel.setColor(
                getPixVal(x, y, 0), 
                getPixVal(x, y, 1),
                getPixVal(x, y, 2),
                getPixVal(x, y, 3)/255
            )
        })
    }

    stopAnimation() {
        console.log("Stopping animation")
        clearTimeout(this.animationTimeoutId)
    }

    /**
     * 
     * @param {Programme} programme 
     */
    renderProgramme(programme) {
        programme.render(this)
    }
}

class Pixel {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {HTMLElement} element 
     * @param {AsciiRenderer} renderer
     */
    constructor(x, y, element, renderer) {
        this.x = x
        this.y = y
        this.element = element
        this.element.innerText = "0"
        this.element.classList.add(`x-${x}`)
        this.element.classList.add(`y-${y}`)
        this.renderer = renderer
    }

    setColor(r, g, b, alpha) {
        let colorValues = this.renderer.filterQueue.applyFilters([r, g, b, alpha])
        r = colorValues[0]
        g = colorValues[1]
        b = colorValues[2]
        alpha = colorValues[3]
        this.element.style.color = `rgb(${r}, ${g}, ${b})`
        this.setAlpha(alpha)
    }

    setAlpha(alpha) {
        let letter = null
        if(alpha < .1667) letter = ":"
        else if(alpha < .3333) letter = "|"
        else if(alpha < .5) letter = "+"
        else if(alpha < .6667) letter = "o"
        else if(alpha < .8333) letter = "W"
        else letter = "#"
        this.element.innerText = letter
    }
}

class Programme {
    /**
     * 
     * @param {AsciiRenderer} renderer 
     */
    render(renderer) {
    }
}

class HiddenCanvasProgramme extends Programme {
    render(renderer) {
        renderer.getHiddenContext()
    }
}

class FilterQueue {
    constructor() {
        this.queue = []
    }

    /**
     * 
     * @param {Filter} filter 
     */
    add(filter) {
        this.queue.push(filter)
    }

    get(index) {
        return this.queue[index]
    }

    applyFilters(colorValues) {
        this.queue.forEach(filter => {
            if(filter.active) colorValues = filter.transform(colorValues)
        })
        return colorValues
    }
}

class Filter {
    constructor(transform) {
        this.transform = transform
        this.active = true
    }
}