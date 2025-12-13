import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// ---------------- Scene & Camera ----------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// ---------------- Renderer ----------------
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

// ---------------- Lights ----------------
scene.children.filter(o => o.isLight).forEach(l => scene.remove(l));

const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 8);
keyLight.position.set(100, 200, 100);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 8);
fillLight.position.set(-300, -200, 100);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 5);
rimLight.position.set(-200, 300, -400);
scene.add(rimLight);

const bottomLight = new THREE.DirectionalLight(0xffffff, 5);
bottomLight.position.set(0, -500, 500);
scene.add(bottomLight);

const frontlefttight = new THREE.DirectionalLight(0xffffff, 0.1);
bottomLight.position.set(-100, -300, 1000);
scene.add(bottomLight);

const frontrighttight = new THREE.DirectionalLight(0xffffff, 0.1);
bottomLight.position.set(100, -300, 1000);
scene.add(bottomLight);


// ---------------- Slides Presets ----------------
const slides = [
  { x: -40, y: 190, z: 60, scale: 0.5, position: { x: 0.9, y: 0, z: 0 } },
  { x: 0, y: 360, z: 0, scale: 0.3, position: { x: -1.5, y: -0.9, z: 0 } },
  { x: -55, y: 540, z: 0, scale: 0.3, position: { x: 1.5, y: 0.9, z: 0 } },
  { x: 0, y: 540, z: -90, scale: 0.5, position: { x: 1.9, y: 0, z: 0 } },
  { x: 0, y: 720, z: -90, scale: 0.5, position: { x: 1.7, y: 0, z: 0 } },
  { x: 0, y: 720, z: -180, scale: 0.8, position: { x: 0, y: 0, z: 0 } }
];

// ---------------- Load Model ----------------
let object;
const loader = new GLTFLoader();
loader.load('./models/rtx_5090/scene.gltf',
  (gltf) => {
    object = gltf.scene;

    const first = slides[0];
    object.rotation.set(
      THREE.MathUtils.degToRad(first.x),
      THREE.MathUtils.degToRad(first.y),
      THREE.MathUtils.degToRad(first.z)
    );
    object.scale.set(first.scale, first.scale, first.scale);
    object.position.set(first.position.x, first.position.y, first.position.z);

    scene.add(object);
  },
  (xhr) => console.log(`${(xhr.loaded / xhr.total * 100).toFixed(1)}% loaded`),
  (err) => console.error(err)
);

// ---------------- Pagination (整页滚动) ----------------
const $body = $('html,body');
const $section = $('section');
let numOfPages = $section.length - 1;
let curPage = 0;
let scrollLock = false;

function pagination() {
  scrollLock = true;

  // ⭐ 移除所有 active
  $section.removeClass("active");

  $body.stop().animate({
    scrollTop: $section.eq(curPage).offset().top
  }, 1200, 'easeInOutCubic', function () {
    scrollLock = false;

    // ⭐ 当前页加 active（触发动画）
    $section.eq(curPage).addClass("active");

    // ---------------- 播放第四頁影片 ----------------
    if (curPage === 3) {
      const iframe = document.getElementById('ytVideo');
      iframe.contentWindow.postMessage(
        '{"event":"command","func":"playVideo","args":""}', '*'
      );
    }
  });
}



function navigateUp() {
  if (curPage === 0) return;
  curPage--;
  pagination();
}

function navigateDown() {
  if (curPage === numOfPages) return;
  curPage++;
  pagination();
}

function scrollPage() {
  $(document).on("mousewheel DOMMouseScroll", function (e) {
    if (scrollLock) return;
    if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) navigateUp();
    else navigateDown();
  });

  $(document).on("keydown", function (e) {
    if (scrollLock) return;
    if (e.which === 38) navigateUp();
    else if (e.which === 40) navigateDown();
  });
}

$(function () { scrollPage(); });

// ---------------- Animate Model (实时跟随滚动) ----------------
function animate() {
  requestAnimationFrame(animate);
  if (object) {
    const scrollY = window.scrollY;
    const pageHeight = window.innerHeight;
    const maxIndex = slides.length - 1;

    let pageIndex = Math.floor(scrollY / pageHeight);
    pageIndex = Math.min(pageIndex, maxIndex); // 最后一页允许

    let nextIndex = pageIndex + 1;
    let progress = (scrollY % pageHeight) / pageHeight;

    // 如果是最后一页，不再插值
    if (pageIndex === maxIndex) {
      nextIndex = pageIndex;
      progress = 0;
    } else {
      nextIndex = Math.min(nextIndex, maxIndex);
    }

    const lerp = (start, end, t) => start + (end - start) * t;

    const current = slides[pageIndex];
    const next = slides[nextIndex];

    object.rotation.x = THREE.MathUtils.degToRad(lerp(current.x, next.x, progress));
    object.rotation.y = THREE.MathUtils.degToRad(lerp(current.y, next.y, progress));
    object.rotation.z = THREE.MathUtils.degToRad(lerp(current.z, next.z, progress));

    const s = lerp(current.scale, next.scale, progress);
    object.scale.set(s, s, s);

    object.position.x = lerp(current.position.x, next.position.x, progress);
    object.position.y = lerp(current.position.y, next.position.y, progress);
    object.position.z = lerp(current.position.z, next.position.z, progress);
  }
  renderer.render(scene, camera);
}
animate();

// ---------------- Image Compare Slider ----------------
function initComparisons() {
  var x, i;
  /* Find all elements with an "overlay" class: */
  x = document.getElementsByClassName("img-comp-overlay");
  for (i = 0; i < x.length; i++) {
    /* Once for each "overlay" element:
    pass the "overlay" element as a parameter when executing the compareImages function: */
    compareImages(x[i]);
  }
  function compareImages(img) {
    var slider, img, clicked = 0, w, h;
    /* Get the width and height of the img element */
    w = img.offsetWidth;
    h = img.offsetHeight;
    /* Set the width of the img element to 50%: */
    img.style.width = (w / 2) + "px";
    /* Create slider: */
    slider = document.createElement("DIV");
    slider.setAttribute("class", "img-comp-slider");
    /* Insert slider */
    img.parentElement.insertBefore(slider, img);
    /* Position the slider in the middle: */
    slider.style.top = (h / 2) - (slider.offsetHeight / 2) + "px";
    slider.style.left = (w / 2) - (slider.offsetWidth / 2) + "px";
    /* Execute a function when the mouse button is pressed: */
    slider.addEventListener("mousedown", slideReady);
    /* And another function when the mouse button is released: */
    window.addEventListener("mouseup", slideFinish);
    /* Or touched (for touch screens: */
    slider.addEventListener("touchstart", slideReady);
     /* And released (for touch screens: */
    window.addEventListener("touchend", slideFinish);
    function slideReady(e) {
      /* Prevent any other actions that may occur when moving over the image: */
      e.preventDefault();
      /* The slider is now clicked and ready to move: */
      clicked = 1;
      /* Execute a function when the slider is moved: */
      window.addEventListener("mousemove", slideMove);
      window.addEventListener("touchmove", slideMove);
    }
    function slideFinish() {
      /* The slider is no longer clicked: */
      clicked = 0;
    }
    function slideMove(e) {
      var pos;
      /* If the slider is no longer clicked, exit this function: */
      if (clicked == 0) return false;
      /* Get the cursor's x position: */
      pos = getCursorPos(e)
      /* Prevent the slider from being positioned outside the image: */
      if (pos < 0) pos = 0;
      if (pos > w) pos = w;
      /* Execute a function that will resize the overlay image according to the cursor: */
      slide(pos);
    }
    function getCursorPos(e) {
      var a, x = 0;
      e = (e.changedTouches) ? e.changedTouches[0] : e;
      /* Get the x positions of the image: */
      a = img.getBoundingClientRect();
      /* Calculate the cursor's x coordinate, relative to the image: */
      x = e.pageX - a.left;
      /* Consider any page scrolling: */
      x = x - window.pageXOffset;
      return x;
    }
    function slide(x) {
      /* Resize the image: */
      img.style.width = x + "px";
      /* Position the slider: */
      slider.style.left = img.offsetWidth - (slider.offsetWidth / 2) + "px";
    }
  }
}

initComparisons();

// ---------------- Resize ----------------
$(window).on('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 初始页触发动画
$section.eq(0).addClass("active");

