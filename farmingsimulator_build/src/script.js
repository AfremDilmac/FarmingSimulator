import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
    DRACOLoader
} from 'three/examples/jsm/loaders/DRACOLoader.js'
import {
    gsap
} from 'gsap'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

/**
 * Html JS link
 */
const lblMoney = document.querySelector('.labelmoney')
const lblRobot = document.querySelector('.labelrobot')
const descriptionRobot = document.querySelector('.textrobot')
const lblRobotPrecision = document.querySelector('.textr')
const imgloader = document.querySelector('#loadingimage')

/**
 * Sounds
 */

let sndBackground = new Audio()
sndBackground.src = '/sound/background.mp3'
sndBackground.play()

let sndLevelUp = new Audio()
sndLevelUp.src = '/sound/levelup.mp3'

let sndMoneyWin = new Audio()
sndMoneyWin.src = '/sound/money_win.mp3'

let sndSaladCut = new Audio()
sndSaladCut.src = '/sound/salad_cut.mp3'

let money = 0;
let robotlvl = 1;

/**
 * Loaders
 */
const loadingBarElement = document.querySelector('.loading-bar')
let sceneReady = false

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        // Wait a little
        window.setTimeout(() => {
            // Animate overlay
            gsap.to(overlayMaterial.uniforms.uAlpha, {
                duration: 3,
                value: 0,
                delay: 1
            })

            // Update loadingBarElement
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
            imgloader.style.display = 'none'

        }, 500)

        window.setTimeout(() => {
            sceneReady = true
           
            
        }, 2000)
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {
        // Calculate the progress and update the loadingBarElement
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
)

sndBackground.addEventListener("ended", function(){
    sndBackground.currentTime = 0;
    console.log("ended");
});

/**
 * Base
 */
// Debug
const debugObject = {}
/*
const gui = new dat.GUI({
    width: 400
})
*/
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */

// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 6, 512, 512)
const waterGeometry2 = new THREE.PlaneGeometry(6, 2, 512, 512)

// Colors
debugObject.depthColor = '#186691'
debugObject.surfaceColor = '#9bd8ff'

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
        uTime: {
            value: 0
        },

        uBigWavesElevation: {
            value: 0.043
        },
        uBigWavesFrequency: {
            value: new THREE.Vector2(4, 1.5)
        },
        uBigWavesSpeed: {
            value: 0.75
        },

        uSmallWavesElevation: {
            value: 0.15
        },
        uSmallWavesFrequency: {
            value: 3
        },
        uSmallWavesSpeed: {
            value: 0.2
        },
        uSmallIterations: {
            value: 4
        },

        uDepthColor: {
            value: new THREE.Color(debugObject.depthColor)
        },
        uSurfaceColor: {
            value: new THREE.Color(debugObject.surfaceColor)
        },
        uColorOffset: {
            value: 0.08
        },
        uColorMultiplier: {
            value: 2.452
        }
    }
})

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = -Math.PI * 0.5
water.position.y = -0.05
scene.add(water)
const water2 = new THREE.Mesh(waterGeometry2, waterMaterial)
water2.rotation.x = -Math.PI * 0.5
water2.position.y = -0.05
scene.add(water2)

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    transparent: true,
    uniforms: {
        uAlpha: {
            value: 1
        }
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

const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

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
const bakedMaterial = new THREE.MeshBasicMaterial({
    map: bakedTexture
})

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffe5
})

/**
 * Model
 */
//Base model
gltfLoader.load(
    'farmingSimulator.glb',
    (gltf) => {
        const bakedMesh = gltf.scene.children.find(child => child.name === 'baked')
        const poleLight = gltf.scene.children.find(child => child.name === 'poleLight')
        bakedMesh.material = bakedMaterial
        poleLight.material = poleLightMaterial
        gltf.scene.receiveShadow = true
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)
let robot = ''
const robotproperities = {
    robotlvl: 1,
    robotPrecision: 5,
    robotUpgrade: 2,
    robotLvlUp: false
}

//Robot Arm
gltfLoader.load(
    'robot.glb',
    (gltf) => {
        robot = gltf.scene
        robot.scale.set(0.6, 0.6, 0.6)
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
    (gltf) => {
        gltf.scene.position.x = -2.36
        gltf.scene.position.y = 0
        gltf.scene.position.z = -2.28
        gltf.scene.castShadow = true
        salade1 = gltf.scene
        salade1.scale.set(0.6, 0.6, 0.6)
        scene.add(salade1)



    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) => {
        gltf.scene.position.x = -1.45
        gltf.scene.position.y = 0
        gltf.scene.position.z = -2.28
        gltf.scene.castShadow = true
        salade2 = gltf.scene
        salade2.scale.set(0.6, 0.6, 0.6)
        scene.add(salade2)


    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) => {

        gltf.scene.position.x = -1.45
        gltf.scene.position.y = 0
        gltf.scene.position.z = -1.45
        gltf.scene.castShadow = true
        salade3 = gltf.scene
        salade3.scale.set(0.6, 0.6, 0.6)
        scene.add(salade3)
    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) => {
        gltf.scene.position.x = -2.36
        gltf.scene.position.y = 0
        gltf.scene.position.z = -1.45
        gltf.scene.castShadow = true
        salade4 = gltf.scene
        salade4.scale.set(0.6, 0.6, 0.6)
        scene.add(salade4)
    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) => {
        gltf.scene.position.x = 1.42
        gltf.scene.position.y = 0
        gltf.scene.position.z = -2.28
        gltf.scene.castShadow = true
        salade5 = gltf.scene
        salade5.scale.set(0.6, 0.6, 0.6)
        scene.add(salade5)
    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) => {
        gltf.scene.position.x = 2.33
        gltf.scene.position.y = 0
        gltf.scene.position.z = -2.28
        gltf.scene.castShadow = true
        salade6 = gltf.scene
        salade6.scale.set(0.6, 0.6, 0.6)
        scene.add(salade6)
    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) => {

        gltf.scene.position.x = 1.42
        gltf.scene.position.y = 0
        gltf.scene.position.z = -1.45
        gltf.scene.castShadow = true
        salade7 = gltf.scene
        salade7.scale.set(0.6, 0.6, 0.6)
        scene.add(salade7)


    }
)

gltfLoader.load(
    'lettuce.glb',
    (gltf) => {
        gltf.scene.position.x = 2.35
        gltf.scene.position.y = 0
        gltf.scene.position.z = -1.45
        gltf.scene.castShadow = true
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

window.addEventListener('resize', () => {
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
 * Mouse
 */
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = -(event.clientY / sizes.height) * 2 + 1

})

window.addEventListener('click', (_event) => {
    let random = Math.floor(Math.random() * robotproperities.robotPrecision);
    if (sceneReady) {
        let timing = growth

        if (currentIntersect) {

            //SALADE
            switch (currentIntersect.object.id) {
                case 35:
                    sndSaladCut.play()
                    switch (random) {
                        case 1:
                            if (timing >= 1.05 && timing <= 1.44) {
                                money = money + 0.50
                                sndMoneyWin.play()

                            } else {
                                money = money - 0.10
                            }
                            break;
                        default:
                            console.log("Miss...")
                    }
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`

                    break;
                case 34:
                    sndSaladCut.play()
                    switch (random) {
                        case 1:
                            if (timing >= 1.05 && timing <= 1.44) {
                                money = money + 0.50
                                sndMoneyWin.play()
                            } else {
                                money = money - 0.10
                            }
                            break;
                        default:
                            console.log("Miss...")
                    }
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`

                    break;
                case 32:
                    sndSaladCut.play()
                    switch (random) {
                        case 1:
                            if (timing >= 1.05 && timing <= 1.44) {
                                money = money + 0.50
                                sndMoneyWin.play()
                            } else {
                                money = money - 0.10
                            }
                            break;
                        default:
                            console.log("Miss...")
                    }
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`

                    break;
                case 33:
                    sndSaladCut.play()
                    switch (random) {
                        case 1:
                            if (timing >= 1.05 && timing <= 1.44) {
                                money = money + 0.50
                                sndMoneyWin.play()
                            } else {
                                money = money - 0.10
                            }
                            break;
                        default:
                            console.log("Miss...")
                    }
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`
                    break;
                case 38:
                    sndSaladCut.play()
                    switch (random) {
                        case 1:
                            if (timing >= 1.05 && timing <= 1.44) {
                                money = money + 0.50
                                sndMoneyWin.play()
                            } else {
                                money = money - 0.10
                            }
                            break;
                        default:
                            console.log("Miss...")
                    }
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`
                    break;
                case 37:
                    sndSaladCut.play()
                    switch (random) {
                        case 1:
                            if (timing >= 1.05 && timing <= 1.44) {
                                money = money + 0.50
                                sndMoneyWin.play()
                            } else {
                                money = money - 0.10
                            }
                            break;
                        default:
                            console.log("Miss...")
                    }
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`

                    break;
                case 39:
                    sndSaladCut.play()
                    switch (random) {
                        case 1:
                            if (timing >= 1.05 && timing <= 1.44) {
                                money = money + 0.50
                                sndMoneyWin.play()
                            } else {
                                money = money - 0.10
                            }
                            break;
                        default:
                            console.log("Miss...")
                    }
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`

                    break;
                case 36:
                    sndSaladCut.play()
                    switch (random) {
                        case 1:
                            if (timing >= 1.05 && timing <= 1.44) {
                                money = money + 0.50
                                sndMoneyWin.play()
                            } else {
                                money = money - 0.10
                            }
                            break;
                        default:
                            console.log("Miss...")
                    }
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`

                    break;
                    //ROBOT ARM
                case 26:
                    console.log("Robotic Arm ID: " + currentIntersect.object.id)
                    console.log("Robot lvl: " + robotproperities.robotlvl)
                    console.log(`Robot precision: ${robotproperities.robotlvl}/${robotproperities.robotPrecision}`)
                    if (money >= 5) {
                        if (robotproperities.robotPrecision == 5) {
                            robotproperities.robotPrecision = 4
                            money = money - 5
                            robot.scale.set(0.7, 0.7, 0.7)
                            robotlvl = 2
                            descriptionRobot.innerHTML = 'Upgrade cost €10'
                            lblRobot.innerHTML = `🔧 ${robotlvl}/5`
                            lblRobotPrecision.innerHTML = 'Precision: 25%'
                            robotproperities.robotLvlUp = true
                            sndLevelUp.play()

                        }
                    }
                    if (money >= 10) {
                        if (robotproperities.robotPrecision == 4) {
                            robotproperities.robotPrecision = 3
                            money = money - 10
                            robot.scale.set(0.8, 0.8, 0.8)
                            robotlvl = 3
                            descriptionRobot.innerHTML = 'Upgrade cost €20'
                            lblRobot.innerHTML = `🔧 ${robotlvl}/5`
                            lblRobotPrecision.innerHTML = 'Precision: 33%'
                            robotproperities.robotLvlUp = true
                            sndLevelUp.play()

                        }
                    }
                    if (money >= 20) {
                        if (robotproperities.robotPrecision == 3) {
                            robotproperities.robotPrecision = 2
                            money = money - 20
                            robot.scale.set(0.9, 0.9, 0.9)
                            robotlvl = 4
                            descriptionRobot.innerHTML = 'Upgrade cost €40'
                            lblRobot.innerHTML = `🔧 ${robotlvl}/5`
                            lblRobotPrecision.innerHTML = 'Precision: 50%'
                            robotproperities.robotLvlUp = true
                            sndLevelUp.play()

                        }
                    }
                    if (money >= 40) {
                        if (robotproperities.robotPrecision == 2) {
                            robotproperities.robotPrecision = 1
                            money = money - 40
                            robot.scale.set(1, 1, 1)
                            robotlvl = 5
                            descriptionRobot.innerHTML = 'MAX'
                            lblRobot.innerHTML = `🔧 ${robotlvl}/5`
                            lblRobotPrecision.innerHTML = 'Precision: 100%'
                            robotproperities.robotLvlUp = true
                            sndLevelUp.play()

                        }
                    }
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`
                    console.log(robotproperities.robotPrecision)
            }
        }
    }
})

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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = -5
camera.position.y = 5
camera.position.z = -6.4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.addEventListener( 'change', render );
controls.minPolarAngle = 0;
controls.maxPolarAngle =  Math.PI * 0.4;
controls.enableDamping = true

function render() {

    renderer.render( scene, camera );

}

/**
 * Points
 */

const points = [{
        position: new THREE.Vector3(1.25, 1.25, 1.05),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(-1.96, 0.91, -1.77),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(1.88, 0.91, -1.77),
        element: document.querySelector('.point-2')
    },
    {
        position: new THREE.Vector3(0, 1.43, 0),
        element: document.querySelector('.point-3')
    }
]



/**
 * Animate
 */

const clock = new THREE.Clock()

let currentIntersect = null
let growth = 0.6

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    if (sceneReady) {
        if (robot) {
            robot.rotation.y += 0.008
        }

        if (robotproperities.robotLvlUp) {
            setTimeout(function(){
                robot.position.y += 0.05
           }, 2000);//wait 2 seconds
            robotproperities.robotLvlUp = false
        }

        growth += 0.0005
        if (salade1) {
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


        for (const point of points) {
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = -screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }
        // Water
        waterMaterial.uniforms.uTime.value = elapsedTime

        /**
         * Raycaster
         */
        const raycaster = new THREE.Raycaster()

        raycaster.setFromCamera(mouse, camera)

        const objectsToTest = [salade1, salade2, salade3, salade4, salade5, salade6, salade7, salade8, robot]
        const intersects = raycaster.intersectObjects(objectsToTest)

        if (intersects.length) {
            if ((!currentIntersect)) {

            }

            currentIntersect = intersects[0]
        } else {
            if (currentIntersect) {}
            currentIntersect = null
        }
    }
 

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()