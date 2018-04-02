const randomAlphaFilter = new Filter(colorVals => {
    colorVals[3] = Math.random()
    return colorVals
})

const invertedColorsFilter = new Filter(colorVals => {
    const invert = index => colorVals[index] = 255 - colorVals[index]
    invert(0)
    invert(1)
    invert(2)
    return colorVals
})