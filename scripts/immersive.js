/* ============================================
   THREE.JS IMMERSIVE PORTAL EXPERIENCE
   Optimized for Performance & Browser Compatibility
   ============================================ */

if (typeof THREE === 'undefined') {
    // Graceful fallback if Three.js fails to load
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('no-three-js');
        console.warn('Three.js failed to load. Using 2D fallback.');
    });
} else {
    // Start the experience when script is ready
    if (document.readyState === 'complete') initPortalExperience();
    else window.addEventListener('load', initPortalExperience);
}

function initPortalExperience() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    // Performance Monitor
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // ============================================
    // SCENE SETUP
    // ============================================
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const cameraRig = new THREE.Group();
    cameraRig.add(camera);
    scene.add(cameraRig);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobile, // Disable antialias on mobile for FPS boost
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);

    // Fog setup (TeamLab style depth)
    const baseFogDensity = 0.002;
    scene.fog = new THREE.FogExp2(0x000000, baseFogDensity);

    // ============================================
    // ASSETS: OPTIMIZED TUNNEL
    // ============================================
    const tunnelLength = 2000;
    const particleCount = isMobile ? 2000 : 5000; // Reduce particles on mobile
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorOptions = [
        new THREE.Color(0x4ade80), // Mint
        new THREE.Color(0x22d3ee), // Cyan
        new THREE.Color(0xFFFFFF)  // White
    ];

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = 20 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const z = Math.random() * tunnelLength - tunnelLength / 2;

        positions[i3] = Math.cos(theta) * radius;
        positions[i3 + 1] = Math.sin(theta) * radius;
        positions[i3 + 2] = z;

        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    const tunnelGeo = new THREE.BufferGeometry();
    tunnelGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    tunnelGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const tunnelMat = new THREE.PointsMaterial({
        size: isMobile ? 0.8 : 0.5,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.8
    });

    const tunnel = new THREE.Points(tunnelGeo, tunnelMat);
    scene.add(tunnel);

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    let scrollProgress = 0;
    let targetScroll = 0;
    let mouse = { x: 0, y: 0 };
    let targetMouse = { x: 0, y: 0 };

    // Optimization: Throttled scroll listener
    let lastScrollTime = 0;
    window.addEventListener('scroll', () => {
        const bodyHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        const maxScroll = bodyHeight - viewportHeight;

        // Defensive check: if no height yet, don't update
        if (maxScroll <= 0) return;

        const currentScroll = window.pageYOffset || document.documentElement.scrollTop || window.scrollY;
        targetScroll = Math.max(0, Math.min(1, currentScroll / maxScroll));
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
        targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    const sections = document.querySelectorAll('.room-section');

    function updateHTMLTransitions(progress) {
        if (!sections.length) return;

        const sectionCount = sections.length;
        // Map 0-1 progress to 0-(sectionCount-1)
        const totalProgress = progress * (sectionCount - 1);
        const activeIndex = Math.round(totalProgress);

        sections.forEach((section, index) => {
            if (index === activeIndex) {
                section.classList.add('active');
                section.classList.remove('past');

                // Calculate local progress for this section (-0.5 to 0.5)
                const localProgress = totalProgress - index;

                // Opacity logic: only fade if not the first (fade in) or last (stay opaque)
                let opacity = 1;
                if (index < sectionCount - 1 && localProgress > 0.3) {
                    opacity = 1 - (localProgress - 0.3) * 3;
                } else if (index > 0 && localProgress < -0.3) {
                    opacity = 1 + (localProgress + 0.3) * 3;
                }

                section.style.opacity = Math.max(0, Math.min(1, opacity));

                // Parallax depth
                const zOffset = localProgress * -60;
                section.style.transform = `perspective(1000px) translate3d(0, 0, ${zOffset}px)`;
            } else {
                section.classList.remove('active');
                if (index < activeIndex) section.classList.add('past');
                else section.classList.remove('past');
                section.style.opacity = 0;
            }
        });

        // Fog Density Transition
        const fogIntensity = Math.abs(0.5 - (progress % 1)) * 2;
        scene.fog.density = baseFogDensity + (1 - fogIntensity) * 0.006;
    }

    // ============================================
    // MAIN RENDER LOOP
    // ============================================
    const clock = new THREE.Clock();

    function animate() {
        const elapsed = clock.getElapsedTime();

        // Smooth Lerp for Scroll & Mouse
        scrollProgress += (targetScroll - scrollProgress) * 0.05;
        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;

        // Camera movement along Tunnel
        camera.position.z = -scrollProgress * tunnelLength;

        // Immersive Mouse Look (Rig Parallax)
        cameraRig.rotation.y = mouse.x * 0.15;
        cameraRig.rotation.x = -mouse.y * 0.1;

        // Update HTML rooms with new progress
        updateHTMLTransitions(scrollProgress);

        // Update Depth Progress Bar
        const scrollBar = document.getElementById('scroll-bar');
        if (scrollBar) {
            scrollBar.style.height = `${scrollProgress * 100}%`;
        }

        // Subtle tunnel rotation
        tunnel.rotation.z = elapsed * 0.03;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    // Clean resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 250);
    });

    animate();
}
