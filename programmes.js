class ColorFunctionProgramme extends Programme {
    /**
     * 
     * @param {(x, y) => []} colorFunction 
     */
    constructor(colorFunction) {
        super()
        this.colorFunction = colorFunction
    }

    render(renderer) {
        let color
        renderer.forEachPixel((x, y, pixel) => {
            color = this.colorFunction(x, y, renderer)
            pixel.setColor(color[0], color[1], color[2], color.length > 2 ? color[3] : 1)
        })
    }
}

class ImageProgramme extends HiddenCanvasProgramme {
    constructor(image) {
        super()
        this.image = image
    }

    render(renderer) {
        let startTimestap = Date.now()
        super.render(renderer)
        renderer.setUp(this.image.naturalWidth, this.image.naturalHeight)
        renderer.hiddenContext.clearRect(0, 0, this.image.naturalWidth, this.image.naturalHeight)
        renderer.hiddenContext.drawImage(this.image, 0, 0)
        renderer.drawImageFromHiddenContext(0, 0, this.image.naturalWidth, this.image.naturalHeight)
        console.log(`Render took ${Date.now() - startTimestap}ms`)
    }
}

class SpritesheetAnimationProgramme extends HiddenCanvasProgramme {
    constructor(spritesheetImage, tileWidth, tileHeight, frameAmount, tileRowLength, frameTime) {
        super()
        this.spritesheetImage = spritesheetImage
        this.tileWidth = tileWidth
        this.tileHeight = tileHeight
        this.frameAmount = frameAmount
        this.tileRowLength = tileRowLength
        this.frameTime = frameTime
    }

    render(renderer) {
        const startTimestamp = Date.now()

        super.render(renderer)
        renderer.hiddenCanvas.width = this.spritesheetImage.naturalWidth
        renderer.hiddenCanvas.height = this.spritesheetImage.naturalHeight
        renderer.hiddenContext.clearRect(0, 0, this.spritesheetImage.naturalWidth, this.spritesheetImage.naturalHeight)
        renderer.hiddenContext.drawImage(this.spritesheetImage, 0, 0)
        renderer.setUp(this.tileWidth, this.tileHeight)

        let offsetX, offsetY, frameStartTimestamp
        const drawFrame = frameIndex => {
            frameStartTimestamp = Date.now()
            frameIndex = frameIndex%this.frameAmount
            offsetY = Math.floor(frameIndex/this.tileRowLength) * this.tileHeight
            offsetX = (frameIndex%this.tileRowLength) * this.tileWidth
            renderer.drawImageFromHiddenContext(offsetX, offsetY, this.tileWidth, this.tileHeight)
            if(frameIndex%10 === 0) console.log(`Last render time: ${Date.now() - frameStartTimestamp}ms`)
            renderer.animationTimeoutId = setTimeout(() => drawFrame(++frameIndex),
                Math.max(this.frameTime - (Date.now() - frameStartTimestamp), 0))
        }
        console.log(`Setup took ${Date.now() - startTimestamp}ms`)

        console.log("Starting spritesheet animation")
        drawFrame(0)
    }
}

class VideoProgramme extends HiddenCanvasProgramme {
    /**
     * 
     * @param {HTMLVideoElement} video 
     */
    constructor(video, framesPerSecond) {
        super()
        this.video = video
        this.framesPerSecond = framesPerSecond
    }

    /**
     * 
     * @param {AsciiRenderer} renderer 
     */
    render(renderer) {
        const startTimestamp = Date.now()

        super.render(renderer)
        renderer.hiddenContext.clearRect(0, 0, this.video.width, this.video.height)
        renderer.setUp(this.video.videoWidth, this.video.videoHeight)

        let frameIndex = 0
        let frameStartTimestamp
        const frameTime = 1000/this.framesPerSecond
        const drawSnapshot = () => {
            frameStartTimestamp = Date.now()
            renderer.hiddenContext.drawImage(this.video, 0, 0)
            renderer.drawImageFromHiddenContext(0, 0, this.video.videoWidth, this.video.videoHeight)
            if(frameIndex++%10 === 0) console.log(`Last render time: ${Date.now() - frameStartTimestamp}ms`)
            renderer.animationTimeoutId = setTimeout(drawSnapshot, frameTime - (Date.now() - frameStartTimestamp))
        }
        console.log(`Setup took ${Date.now() - startTimestamp}ms`)

        console.log("Starting video animation")
        this.video.play().then(drawSnapshot)
    }
}