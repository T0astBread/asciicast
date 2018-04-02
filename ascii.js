class AsciiRenderer {
    /**
     * 
     * @param {HTMLElement} container 
     */
    constructor(container) {
        this.container = container
        this.container.classList.add("ascii-container")
        this.pixelArray = null
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
                pixel = new Pixel(x, y, document.createElement("span"))
                this.container.appendChild(pixel.element)
                this.pixelArray.push(pixel)
            }
            this.container.appendChild(document.createElement("br"))
        }
    }

    /**
     * 
     * @param {boolean} randomAlpha 
     */
    setRandomAlpha(randomAlpha) {
        this.randomAlpha = randomAlpha
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

    /**
     * 
     * @param {ColorFunction} colorFunction 
     */
    displayFunction(colorFunction) {
        const renderTime = this.forEachPixel((x, y, pixel) => pixel.setColor(
            colorFunction.red(x, y),
            colorFunction.green(x, y),
            colorFunction.blue(x, y),
            this.randomAlpha ? Math.random() : colorFunction.alpha(x, y)
        ))
        console.log(`Render took ${this.forEachPixel(renderTime)}ms`)
    }

    drawImageFromHiddenContext(offsetX, offsetY, windowWidth, windowHeight) {
        let imageData = this.hiddenContext.getImageData(offsetX, offsetY, windowWidth, windowHeight)
        const getPixVal = (x, y, offset) => imageData.data[(y * imageData.width + x) * 4 + offset]
        this.forEachPixel((x, y, pixel) => {
            pixel.setColor(
                getPixVal(x, y, 0), 
                getPixVal(x, y, 1),
                getPixVal(x, y, 2),
                this.randomAlpha === true ? Math.random() : getPixVal(x, y, 3)/255
            )
        })
    }

    /**
     *
     * @param {HTMLImageElement} image 
     */
    displayImage(image) {
        let startTimestap = Date.now()
        this.setUp(image.naturalWidth, image.naturalHeight)
        this.getHiddenContext()
        this.hiddenContext.clearRect(0, 0, image.naturalWidth, image.naturalHeight)
        this.hiddenContext.drawImage(image, 0, 0)
        this.drawImageFromHiddenContext(0, 0, image.naturalWidth, image.naturalHeight)
        console.log(`Render took ${Date.now() - startTimestap}ms`)
    }

    stopAnimation() {
        console.log("Stopping animation")
        clearTimeout(this.animationTimeoutId)
    }

    displaySpritesheetAnimation(spritesheetImage, tileWidth, tileHeight, frameAmount, tileRowLength, frameTime) {
        const startTimestamp = Date.now()

        let offsetX, offsetY, frameStartTimestamp
        const drawFrame = frameIndex => {
            frameIndex = frameIndex%frameAmount
            frameStartTimestamp = Date.now()
            offsetY = Math.floor(frameIndex/tileRowLength) * tileHeight
            offsetX = (frameIndex%tileRowLength) * tileWidth
            this.animationTimeoutId = setTimeout(() => {
                this.drawImageFromHiddenContext(offsetX, offsetY, tileWidth, tileHeight)
                if(frameIndex%10 === 0) console.log(`Last render time: ${Date.now() - frameStartTimestamp}ms`)
                drawFrame(++frameIndex)
            }, Math.max(frameTime - (Date.now() - frameStartTimestamp), 0))
        }

        this.getHiddenContext()
        this.hiddenCanvas.width = spritesheetImage.naturalWidth
        this.hiddenCanvas.height = spritesheetImage.naturalHeight
        this.hiddenContext.clearRect(0, 0, spritesheetImage.naturalWidth, spritesheetImage.naturalHeight)
        this.hiddenContext.drawImage(spritesheetImage, 0, 0)
        this.setUp(tileWidth, tileHeight)
        console.log(`Setup took ${Date.now() - startTimestamp}ms`)

        console.log("Starting spritesheet animation")
        drawFrame(0)
    }
}

class ColorFunction {
    red(x, y) {}
    green(x, y) {}
    blue(x, y) {}
    alpha(x, y) {}
}

class Pixel {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {HTMLElement} element 
     */
    constructor(x, y, element) {
        this.x = x
        this.y = y
        this.element = element
        this.element.innerText = "0"
        this.element.classList.add(`x-${x}`)
        this.element.classList.add(`y-${y}`)
    }

    setColor(r, g, b, alpha) {
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