class RandomAlphaFilter extends Filter {
    transformInput() {
        this.outputBuffer[3] = Math.random()
    }
}

class InvertFilter extends Filter {
    transformInput() {
        const invert = index => this.outputBuffer[index] = 255 - this.inputBuffer[index]
        invert(0)
        invert(1)
        invert(2)
    }
}

class GrayscaleFilter extends Filter {
    transformInput() {
        const average = (this.inputBuffer[0] + this.inputBuffer[1] + this.inputBuffer[2])/3
        this.outputBuffer[0] = average
        this.outputBuffer[1] = average
        this.outputBuffer[2] = average
    }
}

/**
 * Does something like a saturation filter but I think this isn't real saturation
 */
class FakeSaturationFilter extends Filter {
    constructor() {
        super()
        this.saturation = 1.5
    }

    changeSaturation(saturation) {
        this.saturation = saturation
        this.active = saturation !== 1
        return this
    }

    transformInput() {
        const contrast = index => this.outputBuffer[index] =
            Math.min(Math.max(((this.inputBuffer[index] - 127.5) * this.saturation + 127.5), 0), 255)
        contrast(0)
        contrast(1)
        contrast(2)
    }
}

class BrightnessFilter extends Filter {
    constructor() {
        super()
        this.delta = 100
    }

    changeBrightness(delta) {
        this.delta = delta
        this.active = delta !== 0
        return this
    }

    transformInput() {
        const applyDelta = index =>
            this.outputBuffer[index] = this.inputBuffer[index] + this.delta
        applyDelta(0)
        applyDelta(1)
        applyDelta(2)
    }
}

class AlphaFilter extends Filter {
    transformInput() {
        const average = (this.inputBuffer[0] + this.inputBuffer[1] + this.inputBuffer[2])/3
        this.outputBuffer[3] = average/255
    }
}

class StaticColorFilter extends Filter {
    constructor() {
        super()
        this.changeColor(255, 255, 255)
    }

    changeColor(r, g, b) {
        this.color = [r, g, b]
        this.outputBuffer = [r, g, b, 0]
        return this
    }

    transform(colorValues) {
        this.outputBuffer[3] = colorValues[3]
        return this.outputBuffer
    }
}