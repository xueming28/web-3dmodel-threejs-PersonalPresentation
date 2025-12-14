import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});


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
  { x: -60, y: 180, z: 0, scale: 0.8, position: { x: 0, y: 0.3, z: 0 } },
  { x: 0, y: 360, z: 0, scale: 0.3, position: { x: -1.5, y: -0.9, z: 0 } },
  { x: 110, y: 360, z: 0, scale: 0.3, position: { x: 1.5, y: -0.9, z: 0 } },
  { x: -40, y: 190, z: 20, scale: 0.35, position: { x: -1.5, y: -0.7, z: 0 } },
  { x: -60, y: 180, z: 0, scale: 0.6, position: { x: 0, y: -0.7, z: 0 } },
  { x: 0, y: 250, z: 90, scale: 0.5, position: { x: 1.9, y: 0, z: 0 } },
  { x: 0, y: 360, z: 0, scale: 0.3, position: { x: -1.5, y: -0.9, z: 0 } },
  { x: -55, y: 540, z: -180, scale: 0.3, position: { x: 1.5, y: 0.9, z: 0 } },
  { x: 0, y: 540, z: -90, scale: 0.5, position: { x: 1.9, y: 0, z: 0 } },
  { x: 0, y: 720, z: -90, scale: 0.5, position: { x: 1.7, y: 0, z: 0 } },
  { x: 0, y: 720, z: -180, scale: 0.9, position: { x: 0, y: -0.2, z: 0 } }
];

const LAST_PAGE_INDEX = slides.length - 1;

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
  }, 1800, 'easeInOutCubic', function () {
    scrollLock = false;

    // ⭐ 当前页加 active（触发动画）
    $section.eq(curPage).addClass("active");

    // ---------------- 播放影片 ----------------
    if (curPage === 9) {
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

  // ↑ ↓ 原本的頁面控制
  if (e.which === 38) {
    navigateUp();
    return;
  }
  if (e.which === 40) {
    navigateDown();
    return;
  }

  // ===== 數字鍵跳頁 =====
  // 1~9：直接跳對應頁
  if (e.which >= 49 && e.which <= 57) {
    const page = e.which - 49; // '1' -> 0
    if (page <= numOfPages) {
      curPage = page;
      pagination();
    }
    return;
  }

  // 0 → 第 10 頁（index 9）
  if (e.which === 48) {
    if (9 <= numOfPages) {
      curPage = 9;
      pagination();
    }
  }
});

}

$(function () { scrollPage(); });

// ---------------- Animate Model (实时跟随滚动) ----------------
function animate() {
  requestAnimationFrame(animate);

  const scrollY = window.scrollY;
  const vh = window.innerHeight;
  const maxIndex = slides.length - 1;

  let pageIndex = Math.min(Math.floor(scrollY / vh), maxIndex);
  let progress = (scrollY % vh) / vh;

  if (pageIndex === maxIndex) progress = 0;

  // ----- 3D Model -----
  if (object) {
    const isLastPage = pageIndex === LAST_PAGE_INDEX;

    if (!isLastPage) {
      // ===== 正常 scroll 插值 =====
      const next = Math.min(pageIndex + 1, LAST_PAGE_INDEX);
      const lerp = (a, b, t) => a + (b - a) * t;

      const c = slides[pageIndex];
      const n = slides[next];

      object.rotation.x = THREE.MathUtils.degToRad(lerp(c.x, n.x, progress));
      object.rotation.y = THREE.MathUtils.degToRad(lerp(c.y, n.y, progress));
      object.rotation.z = THREE.MathUtils.degToRad(lerp(c.z, n.z, progress));

      const s = lerp(c.scale, n.scale, progress);
      object.scale.setScalar(s);

      object.position.x = lerp(c.position.x, n.position.x, progress);
      object.position.y = lerp(c.position.y, n.position.y, progress);
      object.position.z = lerp(c.position.z, n.position.z, progress);

    } else {
      // ===== 最後一頁：自動旋轉 =====
      const last = slides[LAST_PAGE_INDEX];

      // 固定在最後一個 slide 的位置與大小
      object.scale.setScalar(last.scale);
      object.position.set(
        last.position.x,
        last.position.y,
        last.position.z
      );

      // 基準角度
      object.rotation.x = THREE.MathUtils.degToRad(last.x);
      object.rotation.z = THREE.MathUtils.degToRad(last.z);

      // ⭐ 自動旋轉（Y 軸）
      object.rotation.y += 0.003; // 速度可調
    }
  }


  // ----- Text Reveal (同步 PPT 滾動) -----
  document.querySelectorAll("section").forEach((section, i) => {
    const items = section.querySelectorAll(".reveal > *");
    const total = items.length;

    items.forEach((el, idx) => {

      // 已經滾過的頁 → 永遠顯示
      if (i - 1 < pageIndex) {
        el.style.transform = "translateY(0)";
        return;
      }

      // 還沒到的頁 → 隱藏
      if (i - 1 > pageIndex) {
        el.style.transform = "translateY(120%)";
        return;
      }

      // 正在滾動的頁 → 同步動畫
      // 延遲到頁面滾動到一半才開始
      const start = 0.3 + (idx / total) * 0.3;  // 起點在頁面一半
      const end = 0.5 + ((idx + 1) / total) * 0.5; // 結束在頁面底部

      let localProgress = (progress - start) / (end - start);
      localProgress = Math.min(Math.max(localProgress, 0), 1);

      el.style.transform = `translateY(${(1 - localProgress) * 120}%)`;
    });
  });

  renderer.render(scene, camera);
}
animate();

// ---------------- Image Compare Slider ----------------
function initComparisons() {
  const overlays = document.getElementsByClassName("img-comp-overlay");

  for (let i = 0; i < overlays.length; i++) {
    compareImages(overlays[i]);
  }

  function compareImages(img) {
    let slider;
    let clicked = false;
    let w = img.offsetWidth;
    let h = img.offsetHeight;
    let animated = false; // ⭐ 防止重播動畫

    // ⭐ 初始在最左
    img.style.width = "0px";

    // 建立滑塊
    slider = document.createElement("DIV");
    slider.className = "img-comp-slider";
    img.parentElement.insertBefore(slider, img);

    slider.style.top = (h / 2) - (slider.offsetHeight / 2) + "px";
    slider.style.left = "0px";

    // ---------------- 自動滑動到中間 ----------------
    function autoSlide() {
      if (animated) return;
      animated = true;

      const target = w / 2;
      let current = 0;
      const speed = w / 300; // ⭐ 控制動畫速度（數字越小越慢）

      function animate() {
        current += speed;
        if (current >= target) {
          slide(target);
          return;
        }
        slide(current);
        requestAnimationFrame(animate);
      }

      animate();
    }

    // ⭐ 只在該 section 變成 active 時播放
    const section = img.closest("section");
    const observer = new MutationObserver(() => {
      if (section.classList.contains("active")) {
        autoSlide();
      }
    });

    observer.observe(section, { attributes: true });

    // ---------------- 拖曳邏輯 ----------------
    slider.addEventListener("mousedown", slideReady);
    window.addEventListener("mouseup", slideFinish);
    slider.addEventListener("touchstart", slideReady);
    window.addEventListener("touchend", slideFinish);

    function slideReady(e) {
      e.preventDefault();
      clicked = true;
      window.addEventListener("mousemove", slideMove);
      window.addEventListener("touchmove", slideMove);
    }

    function slideFinish() {
      clicked = false;
    }

    function slideMove(e) {
      if (!clicked) return;
      let pos = getCursorPos(e);
      pos = Math.max(0, Math.min(pos, w));
      slide(pos);
    }

    function getCursorPos(e) {
      e = e.changedTouches ? e.changedTouches[0] : e;
      const rect = img.getBoundingClientRect();
      return e.pageX - rect.left - window.pageXOffset;
    }

    function slide(x) {
      img.style.width = x + "px";
      slider.style.left = (x - slider.offsetWidth / 2) + "px";
    }
  }
}

initComparisons();


function setupOverlay(triggerSelector, overlayId, imageSrc) {
  const trigger = document.querySelector(triggerSelector);
  const overlay = document.getElementById(overlayId);

  if (!trigger || !overlay) {
    console.warn(`Overlay setup skipped: ${triggerSelector} or ${overlayId} not found`);
    return;
  }

  const overlayImg = overlay.querySelector('img');
  overlayImg.src = imageSrc;

  trigger.addEventListener('click', () => {
    const rect = trigger.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    overlayImg.style.transformOrigin = `${originX}px ${originY}px`;
    overlay.classList.add('active');
  });

  overlay.addEventListener('click', () => {
    overlay.classList.remove('active');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupOverlay('.chip', 'chip-overlay', '/images/NVIDIA-GeForce-RTX-5090-Founders-Edition_RTX-Blackwell-GB202-Fullchip.jpg');
  setupOverlay('.sm', 'sm-overlay', '/images/rtx-50-SM.jpg');
});

const trigger = document.querySelector('.compare-trigger');
const overlay = document.querySelector('.compare-overlay');

trigger.addEventListener('click', () => {
  overlay.classList.add('active');
});

/* 點擊背景關閉 */
overlay.addEventListener('click', () => {
  overlay.classList.remove('active');
});


// ---------------- Resize ----------------
$(window).on('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 初始页触发动画
$section.eq(0).addClass("active");


