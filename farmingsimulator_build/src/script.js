/*IMPORTS*/
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
const lblCollect = document.querySelector('.labelcollect')
const gameReady = document.querySelector('.gameready')
const iconWeer = document.querySelector('#iconweer')
const houseText = document.querySelector('#housetext')
const btnShopClose = document.querySelector('#shop-close')
const guiShop = document.querySelector('.shop')

/*Api Weerbericht*/
// fetch settings; BRUSSEL
let url = 'https://api.openweathermap.org/data/2.5/weather?id=2800866&appid=f872ea812be596f5bcdbd8ba36387f8b&units=metric&lang=nl'; // basis url
let options = {}; // extra opties
let params = new URLSearchParams(); // extra parameters
params.append('q', 'appid');
params.append('lang', 'units');

// fetch url; BRUSSEL
fetch(url, options)
    .then(resp => {
        return resp.json();
    })
    .then(data => verwerkData(data))
    .catch(err => verwerkFout(err));
// verwerk fouten – BRUSSEL
function verwerkFout(err) {
    console.log('request mislukt: ', err)
}
// verwerk data – BRUSSEL
function verwerkData(data) {
    const icon = data.weather[0].icon
    iconWeer.src = `http://openweathermap.org/img/w/${icon}.png`
}


/**
 * Sounds
 */

let sndLevelUp = new Audio()
sndLevelUp.src = '/sound/levelup.mp3'

let sndMoneyWin = new Audio()
sndMoneyWin.src = '/sound/money_win.mp3'

let sndSaladCut = new Audio()
sndSaladCut.src = '/sound/salad_cut.mp3'

let sndBackground = new Audio()
sndBackground.src = '/sound/background.mp3'

let money = 4;
let robotlvl = 1;
let mixer = null;
let lettuceSold = 0;


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

        }, 500)

        window.setTimeout(() => {
            sceneReady = true
            sndBackground.play()
            const introtxt = document.querySelector('#introtxt')
            introtxt.innerHTML = 'Hallo mijn naam is Afrem, welkom bij FarmingSimulator, druk op het scherm voor de uitleg'
        }, 2000)
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {
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
water.receiveShadow = true
scene.add(water)
const water2 = new THREE.Mesh(waterGeometry2, waterMaterial)
water2.rotation.x = -Math.PI * 0.5
water2.position.y = -0.05
water2.receiveShadow = true
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


const directionalLightDay = new THREE.DirectionalLight('#ffffff', 1)
directionalLightDay.position.set(0.25, 3, -2.25)
directionalLightDay.castShadow = true
directionalLightDay.shadow.mapSize.set(1024, 1024)
directionalLightDay.shadow.normalBias = 0.05
directionalLightDay.intensity = 1.5
scene.add(directionalLightDay)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
scene.add(ambientLight)

const poleLight = new THREE.PointLight(0xff9000, 0.5, 10, 2)
poleLight.position.set(-2.548, 0.711, 1.167)
scene.add(poleLight)

const doorLight = new THREE.PointLight(0xffffff, 0.5, 10, 2)
doorLight.position.set(-1.701, 0.646, 2.667)
scene.add(doorLight)


/**
 * Loaders
 */

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)


/**
 * Object
 */
let afrem = ''
let animation = ''
gltfLoader.load(
    '/models/AFREM.glb',
    (gltf) => {

        animation = gltf
        afrem = gltf.scene
        mixer = new THREE.AnimationMixer(afrem)
        let action = mixer.clipAction(gltf.animations[1]) //0 = dance and 1 == wave
        action.play()

        afrem.position.x = -5
        afrem.position.y = -20.5
        afrem.position.z = -11
        scene.add(afrem)
    }
)

let farm = ''

gltfLoader.load(
    'farming.glb',
    (gltf) => {
        gltf.scene.castShadow = true
        gltf.scene.receiveShadow = true
        scene.add(gltf.scene)
        farm = gltf.scene
        updateAllMaterials()

    }
)

gltfLoader.load(
    '/polelight/polelight.glb',
    (gltf) => {
        gltf.scene.castShadow = true
        gltf.scene.receiveShadow = true
        gltf.scene.position.set(-4.113, -0.9, 0)
        scene.add(gltf.scene)
        updateAllMaterials()
    }
)

let shop = ''

gltfLoader.load(
    'shop/shop.gltf',
    (gltf) => {

        gltf.scene.scale.set(0.008, 0.008, 0.008)
        gltf.scene.position.y = -0.04
        gltf.scene.position.x = -1.84
        gltf.scene.position.z = 2.03
        gltf.scene.rotation.y = 2.81
        shop = gltf.scene
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

let gameIntro = true
const gameProgress = {
    progress: 1
}

//Robot Arm
gltfLoader.load(
    'robot.glb',
    (gltf) => {
        robot = gltf.scene
        robot.scale.set(0.6, 0.6, 0.6)
        scene.add(robot)
        //237
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


        salade2 = gltf.scene.clone();
        salade2.position.x = -1.45
        salade2.position.y = 0
        salade2.position.z = -2.28
        salade2.castShadow = true
        salade2.scale.set(0.6, 0.6, 0.6)
        scene.add(salade2)

        salade3 = gltf.scene.clone();
        salade3.position.x = -1.45
        salade3.position.y = 0
        salade3.position.z = -1.45
        salade3.castShadow = true
        salade3.scale.set(0.6, 0.6, 0.6)
        scene.add(salade3)

        salade4 = gltf.scene.clone();
        salade4.position.x = -2.36
        salade4.position.y = 0
        salade4.position.z = -1.45
        salade4.castShadow = true
        salade4.scale.set(0.6, 0.6, 0.6)
        scene.add(salade4)

        salade5 = gltf.scene.clone();
        salade5.position.x = 1.42
        salade5.position.y = 0
        salade5.position.z = -2.28
        salade5.castShadow = true
        salade5.scale.set(0.6, 0.6, 0.6)
        scene.add(salade5)

        salade6 = gltf.scene.clone();
        salade6.position.x = 2.33
        salade6.position.y = 0
        salade6.position.z = -2.28
        salade6.castShadow = true
        salade6.scale.set(0.6, 0.6, 0.6)
        scene.add(salade6)

        salade7 = gltf.scene.clone();
        salade7.position.x = 1.42
        salade7.position.y = 0
        salade7.position.z = -1.45
        salade7.castShadow = true
        salade7.scale.set(0.6, 0.6, 0.6)
        scene.add(salade7)

        salade8 = gltf.scene.clone();
        salade8.position.x = 2.35
        salade8.position.y = 0
        salade8.position.z = -1.45
        salade8.castShadow = true
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

    camera2.aspect = sizes.width / sizes.height
    camera2.updateProjectionMatrix()

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


        switch (gameProgress.progress) {
            case 1:
                introtxt.innerHTML = 'Het doel is om sla te verzamelen, de boerderij en de robot te verbeteren!'
                gameProgress.progress = 2
                break;
            case 2:
                introtxt.innerHTML = 'Een beetje advies voordat je begint, zorg ervoor dat je de salade op het juiste moment verzamelt, zodat je niet te veel geld verliest'
                gameProgress.progress = 3
                break;
            case 3:
                introtxt.style.display = 'none'
                scene.remove(afrem)
                cam = camera
                gameReady.style.opacity = 1
                break;
        }

        btnShopClose.addEventListener('click', function () {
            guiShop.style.display = 'none'
        })


        if (currentIntersect) {


            if (currentIntersect.object.name == 'Box020_01_-_Default_0') {
                guiShop.style.display = 'block'
            }
            console.log(currentIntersect.object.name)
            if (currentIntersect.object.name == '10187_LettuceBibb_v1-L2') {
                sndSaladCut.play()


                switch (random) {
                    case 1:
                        if (timing >= 1.05 && timing <= 1.44) {
                            money = money + 0.50
                            lblCollect.style.color = 'green'
                            lblCollect.innerHTML = 'Collected'
                            sndMoneyWin.play()
                            lettuceSold = lettuceSold + 1
                            houseText.innerHTML = `Aantal salade verkocht: ${lettuceSold}`
                        } else {
                            money = money - 0.10
                            lblCollect.style.color = 'red'
                            lblCollect.innerHTML = 'Too fast -0.10'
                        }
                        break;
                    default:
                        lblCollect.style.color = 'white'
                        lblCollect.innerHTML = 'Miss'
                }
                lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`
            }
            if (currentIntersect.object.name == 'link_1') {
                if (money >= 5) {
                    if (robotproperities.robotPrecision == 5) {
                        robotproperities.robotPrecision = 4
                        money = money - 5
                        robot.scale.set(0.7, 0.7, 0.7)
                        robotlvl = 2
                        descriptionRobot.innerHTML = 'Upgrade cost €10'
                        lblRobot.innerHTML = `🔧 ${robotlvl}/5`
                        lblRobotPrecision.innerHTML = 'Precision: 25% <br> Speed: 25%'
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
                        lblRobotPrecision.innerHTML = 'Precision: 50% <br> Speed: 50%'
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
                        lblRobotPrecision.innerHTML = 'Precision: 75% <br> Speed: 75%'
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
                        lblRobotPrecision.innerHTML = 'Precision: 100% <br> Speed: 100%'
                        robotproperities.robotLvlUp = true
                        sndLevelUp.play()

                    }
                }
                lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.physicallyCorrectLights = true
// Clear color
debugObject.clearColor = '#201919'
renderer.setClearColor(debugObject.clearColor)


/**
 * Camera
 */
//GENERAL CAMERA GAME
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)

//START CAMERA INTRODUCTION
const camera2 = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
let cam = camera2
// Base camera 3d model

camera.position.x = -5
camera.position.y = 5
camera.position.z = -6.4
scene.add(camera)

camera2.position.x = -5
camera2.position.y = -20
camera2.position.z = -6.4
scene.add(camera2)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.addEventListener('change', render);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI * 0.4;
controls.enableDamping = true

function render() {

    renderer.render(scene, camera);
    renderer.render(scene, camera2);

}

/**
 * Points
 */
//Points dat een Vector 3 positie hebben
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
let lightSpeed = 0;
let lightRadius = 15
let automaticGain = 0.05

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    lightSpeed += 0.0005;
    automaticGain += 0.000001
    directionalLightDay.position.x = lightRadius * Math.cos(lightSpeed) + 0;
    directionalLightDay.position.y = lightRadius * Math.sin(lightSpeed) + 0;


    if (sceneReady) {
        if (robotproperities.robotPrecision <= 4) {
            switch (robotproperities.robotPrecision) {
                case 4:
                    money = money + (automaticGain / 1000)
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`
                    break;
                case 3:
                    money = money + (automaticGain / 800)
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`
                    break;
                case 2:
                    money = money + (automaticGain / 600)
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`
                    break;
                case 1:
                    money = money + (automaticGain / 500)
                    lblMoney.innerHTML = `💰 €${Math.round(money * 100) / 100}`
                    break;
            }
            robot.rotation.y += 0.008
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

        if (mixer) {
            mixer.update(0.01)
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

        const objectsToTest = [salade1, salade2, salade3, salade4, salade5, salade6, salade7, salade8, robot, shop]
        const intersects = raycaster.intersectObjects(objectsToTest, true)

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
    renderer.render(scene, cam)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()