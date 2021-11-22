import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap } from 'gsap'

/**
 * Spector JS
 */
// const SPECTOR = require ('spectorjs')
// const spector = new SPECTOR.Spector()
// spector.displayUI()


/**
 * Loaders
 */
 const loadingBarElement = document.querySelector('.loading-bar')
 const loadingManager = new THREE.LoadingManager(
     // Loaded
     () =>
     {
         // Wait a little
         window.setTimeout(() =>
         {
             // Animate overlay
             gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })
 
             // Update loadingBarElement
             loadingBarElement.classList.add('ended')
             loadingBarElement.style.transform = ''
         }, 500)
     },
 
     // Progress
     (itemUrl, itemsLoaded, itemsTotal) =>
     {
         // Calculate the progress and update the loadingBarElement
         const progressRatio = itemsLoaded / itemsTotal
         loadingBarElement.style.transform = `scaleX(${progressRatio})`
     }
 )


/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 400
})



// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
 const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
 const overlayMaterial = new THREE.ShaderMaterial({
     // wireframe: true,
     transparent: true,
     uniforms:
     {
         uAlpha: { value: 1 }
     },
     vertexShader: `
         void main()
         {
             gl_Position = vec4(position, 1.0);
         }
     `,
     fragmentShader: `
         uniform float uAlpha;
 
         void main()
         {
             gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
         }
     `
 })
 const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
 scene.add(overlay)

 /**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * lights
 */

/**
 * Lights
 */

 const rectAreaLight = new THREE.RectAreaLight('white', 2, 1, 1)
 rectAreaLight.position.x = -5
 rectAreaLight.position.y = 5
 rectAreaLight.position.z = -6.4
 rectAreaLight.width = 5
 rectAreaLight.height = 5
 rectAreaLight.lookAt(new THREE.Vector3())
scene.add(rectAreaLight)

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding
/**
 * Object
 */

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5})

/**
 * Model
 */
//Base model
gltfLoader.load(
    'farmingSimulator.glb',
    (gltf) =>
    {   
        const bakedMesh = gltf.scene.children.find(child => child.name === 'baked')   
        const poleLight = gltf.scene.children.find(child => child.name === 'poleLight')   
        bakedMesh.material = bakedMaterial
        poleLight.material = poleLightMaterial
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)
let robot = ''
//Robot Arm
gltfLoader.load(
    'robot.glb',
    (gltf) =>
    {
        robot = gltf.scene
        scene.add(robot)
    }
)

let salade1 = ''
let salade2 = ''
let salade3 = ''
let salade4 = ''
let salade5 = ''
let salade6 = ''
let salade7 = ''
let salade8 = ''

//Lettuce 
gltfLoader.load(
    'lettuce.glb',
    (gltf) =>
    {
        gltf.scene.position.x = -2.36
        gltf.scene.position.y = 0
        gltf.scene.position.z = -2.28
        salade1 = gltf.scene
        salade1.scale.set(0.6, 0.6, 0.6)
        scene.add(salade1)
    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) =>
    {
        gltf.scene.position.x = -1.45
        gltf.scene.position.y = 0
        gltf.scene.position.z = -2.28
        salade2 = gltf.scene
        salade2.scale.set(0.6, 0.6, 0.6)
        scene.add(salade2)


    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) =>
    {

        gltf.scene.position.x = -1.45
        gltf.scene.position.y = 0
        gltf.scene.position.z = -1.45
        salade3 = gltf.scene
        salade3.scale.set(0.6, 0.6, 0.6)
        scene.add(salade3)
    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) =>
    {
        gltf.scene.position.x = -2.36
        gltf.scene.position.y = 0
        gltf.scene.position.z = -1.45
        salade4 = gltf.scene
        salade4.scale.set(0.6, 0.6, 0.6)
        scene.add(salade4)
    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) =>
    {
        gltf.scene.position.x = 1.42
        gltf.scene.position.y = 0
        gltf.scene.position.z = -2.28
        salade5 = gltf.scene
        salade5.scale.set(0.6, 0.6, 0.6)
        scene.add(salade5)
    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) =>
    {
        gltf.scene.position.x = 2.33
        gltf.scene.position.y = 0
        gltf.scene.position.z = -2.28
        salade6 = gltf.scene
        salade6.scale.set(0.6, 0.6, 0.6)
        scene.add(salade6)
    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) =>
    {

        gltf.scene.position.x = 1.42
        gltf.scene.position.y = 0
        gltf.scene.position.z = -1.45
        salade7 = gltf.scene
        salade7.scale.set(0.6, 0.6, 0.6)
        scene.add(salade7)
        

    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) =>
    {
        gltf.scene.position.x = 2.35
        gltf.scene.position.y = 0
        gltf.scene.position.z = -1.45
        salade8 = gltf.scene
        salade8.scale.set(0.6, 0.6, 0.6)
        scene.add(salade8)
    }
)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = -5
camera.position.y = 5
camera.position.z = -6.4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
// Clear color
debugObject.clearColor = '#201919'
renderer.setClearColor(debugObject.clearColor)

/**
 * Animate
 */
const clock = new THREE.Clock()

let growth = 0.6

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()
    
    if(robot) {
        robot.rotation.y += 0.008
    }

    growth += 0.0005
    if(salade1) {
        if (growth > 1.15) {
            growth = 0.6
        }
        salade1.rotation.y += 0.002
        salade1.scale.set(growth, growth, growth)

        salade2.rotation.y += 0.002
        salade2.scale.set(growth, growth, growth)

        salade3.rotation.y += 0.002
        salade3.scale.set(growth, growth, growth)

        salade4.rotation.y += 0.002
        salade4.scale.set(growth, growth, growth)

        salade5.rotation.y += 0.002
        salade5.scale.set(growth, growth, growth)

        salade6.rotation.y += 0.002
        salade6.scale.set(growth, growth, growth)

        salade7.rotation.y += 0.002
        salade7.scale.set(growth, growth, growth)

        salade8.rotation.y += 0.002
        salade8.scale.set(growth, growth, growth)
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()