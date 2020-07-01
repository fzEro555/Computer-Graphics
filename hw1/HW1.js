let gl
let clearColorR = 0.5
let clearColorG = 0.5
let clearColorB = 0.5

const sliderR = document.getElementById("RedSlider")
const sTextR = document.getElementById("RedText")

sliderR.addEventListener('change', function(){
    console.log(sliderR.value)
    sTextR.value = sliderR.value
    clearColorR = parseFloat(sTextR.value)
    clearGraphicContext()
})

const sliderG = document.getElementById("GreenSlider")
const sTextG = document.getElementById("GreenText")

sliderG.addEventListener('change', function(){
    console.log(sliderG.value)
    sTextG.value = sliderG.value
    clearColorG = parseFloat(sTextG.value)
    clearGraphicContext()
})

const sliderB = document.getElementById("BlueSlider")
const sTextB = document.getElementById("BlueText")

sliderB.addEventListener('change', function(){
    console.log(sliderB.value)
    sTextB.value = sliderB.value
    clearColorB = parseFloat(sTextB.value)
    clearGraphicContext()
})

function initGL(){
    const canvas = document.querySelector('canvas')
    gl = canvas.getContext('webgl2')
    if(!gl){
        alert('Could not initialize WebGL')
        return
    }
    gl.clearColor(0.5,0.2,0.0,1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    console.log(canvas)
}

function clearGraphicContext(){
    gl.clearColor(clearColorR,clearColorG,clearColorB,1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
}