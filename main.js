/* =============================================
   MAROVELLE — Main JavaScript
   ============================================= */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// =============================================
// 1. HERO PRELOADER & CINEMATIC OPENING
// =============================================
(() => {
    const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const lerp = (a, b, t) => a + (b - a) * t;

    function tween(duration, ease, onUpdate, onDone) {
        const t0 = performance.now();
        (function tick(now) {
            const p = Math.min((now - t0) / duration, 1);
            onUpdate(ease(p), p);
            p < 1 ? requestAnimationFrame(tick) : onDone && onDone();
        })(performance.now());
    }

    const nav = document.getElementById("nav");
    const scene = document.getElementById("scene");
    const centerCard = document.getElementById("centerCard");
    const heroFull = document.getElementById("heroFull");
    const heroOverlay = document.getElementById("heroOverlay");
    const slideCards = document.querySelectorAll(".card:not(.center)");

    const preloader = document.getElementById("preloader");
    const preloaderLogo = document.getElementById("preloaderLogo");
    const preloaderBar = document.getElementById("preloaderBar");
    const loaderInner = document.getElementById("loaderInner");

    // Mask setup to frame the image inside the center card grid slot
    function initHeroClip() {
        if(!centerCard || !heroFull) return;
        const rect = centerCard.getBoundingClientRect();
        const VW = window.innerWidth;
        const VH = window.innerHeight;
        const clip = `inset(${rect.top}px ${VW - rect.right}px ${VH - rect.bottom}px ${rect.left}px round 18px)`;
        heroFull.style.clipPath = clip;
        heroFull.style.webkitClipPath = clip;
    }

    // Initialize the window mask
    initHeroClip();

    window.addEventListener('resize', () => {
        if (scene && scene.style.display !== "none") initHeroClip();
    });

    // Timing Sequence
    setTimeout(() => {
        if(preloaderLogo) preloaderLogo.style.opacity = "1";
        if(preloaderLogo) preloaderLogo.style.transform = "translateY(0)";
        if(loaderInner) loaderInner.style.width = "100%";
    }, 150);

    setTimeout(() => {
        if(preloaderLogo) preloaderLogo.style.opacity = "0";
        if(preloaderBar) preloaderBar.style.opacity = "0";
    }, 2200);

    setTimeout(() => {
        if(preloader) preloader.classList.add("hide");
    }, 2600);

    setTimeout(() => {
        phase1_slideOut();
    }, 3000);

    function phase1_slideOut() {
        const VH = window.innerHeight;
        slideCards.forEach((card, i) => {
            const dir = card.dataset.dir;
            const delay = i * 120;
            setTimeout(() => {
                const dist = dir === "up" ? -(VH * 1.1) : VH * 1.1;
                tween(1400, easeInOutCubic, (t) => {
                    card.style.transform = `translateY(${lerp(0, dist, t)}px)`;
                    card.style.opacity = `${lerp(1, 0, Math.min(t * 2, 1))}`;
                }, null);
            }, delay);
        });
        const totalSlideTime = slideCards.length * 60 + 1400;
        setTimeout(phase2_expandCenter, totalSlideTime - 300);
    }

    function phase2_expandCenter() {
        const rect = centerCard.getBoundingClientRect();
        const VW = window.innerWidth;
        const VH = window.innerHeight;
        const startTop = rect.top;
        const startRight = VW - rect.right;
        const startBottom = VH - rect.bottom;
        const startLeft = rect.left;

        heroFull.style.willChange = "clip-path";

        tween(1600, easeInOutCubic, (t) => {
            const cT = lerp(startTop, 0, t);
            const cR = lerp(startRight, 0, t);
            const cB = lerp(startBottom, 0, t);
            const cL = lerp(startLeft, 0, t);
            const cRad = lerp(18, 0, t);

            const clip = `inset(${cT}px ${cR}px ${cB}px ${cL}px round ${cRad}px)`;
            heroFull.style.clipPath = clip;
            heroFull.style.webkitClipPath = clip;
            
            if(heroOverlay) heroOverlay.style.opacity = t; 
        }, phase3_revealHero);
    }

    function phase3_revealHero() {
        setTimeout(() => { if(scene) scene.style.display = "none"; }, 100);

        const items = [
            { el: document.getElementById("heroEye"), delay: 100 },
            { el: document.getElementById("heroTitle"), delay: 220 },
            { el: document.getElementById("heroSub"), delay: 340 },
            { el: document.getElementById("heroTag"), delay: 300 },
            { el: document.getElementById("heroBtn"), delay: 420 },
        ];
        items.forEach(({ el, delay }) => {
            if(!el) return;
            setTimeout(() => {
                el.style.transition = "transform 0.9s cubic-bezier(0.22,1,0.36,1)";
                el.style.transform = "translateY(0)";
            }, delay);
        });

        const gRule = document.getElementById("goldRule");
        if(gRule){
            setTimeout(() => {
                gRule.style.transition = "transform 1s cubic-bezier(0.22,1,0.36,1)";
                gRule.style.transform = "scaleX(1)";
            }, 350);
        }

        setTimeout(phase4_revealNav, 450);
    }

    function phase4_revealNav() {
        if(nav) {
            nav.style.transition = "opacity 0.6s ease";
            nav.style.opacity = "1";
        }
        
        const scrollH = document.getElementById("scrollHint");
        if(scrollH) {
            setTimeout(() => {
                scrollH.style.transition = "opacity 0.5s ease";
                scrollH.style.opacity = "0.8";
            }, 600);
        }

        // VERY IMPORTANT: Unlock scrolling after the opening sequence is finished!
        setTimeout(() => {
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "auto";
        }, 800);
    }
})();

// =============================================
// 2. GENERAL PAGE INTERACTIONS
// =============================================
document.addEventListener('DOMContentLoaded', () => {

    /* --- SCROLL REVEAL (IntersectionObserver) --- */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    $$('.reveal-up').forEach(el => revealObserver.observe(el));

    /* --- FEATURES — staggered reveal --- */
    const featureItems = $$('.feature-item');
    const featureObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
                featureObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    featureItems.forEach(item => featureObserver.observe(item));

    /* --- FEATURE ITEMS — hover tilt micro-interaction --- */
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function(e) {
            const btn = this.querySelector('.feature-arrow-btn');
            if (btn) {
                btn.style.transform = 'scale(1.15) rotate(-10deg)';
                btn.style.background = '#fff';
            }
        });
        item.addEventListener('mouseleave', function() {
            const btn = this.querySelector('.feature-arrow-btn');
            if (btn) {
                btn.style.transform = '';
                btn.style.background = '';
            }
        });
    });

    /* --- GALLERY CARDS — subtle 3D tilt on hover --- */
    $$('.gallery-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotX = ((y - cy) / cy) * -4;
            const rotY = ((x - cx) / cx) * 4;
            this.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.transition = 'transform 0.5s ease, box-shadow 0.4s ease';
        });
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.1s ease, box-shadow 0.4s ease';
        });
    });

    /* --- SMOOTH SCROLL for nav links --- */
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const navH = document.getElementById("nav") ? document.getElementById("nav").offsetHeight : 0;
            const targetY = target.getBoundingClientRect().top + window.scrollY - navH;
            window.scrollTo({ top: targetY, behavior: 'smooth' });
        });
    });

    /* --- PRODUCT SLIDER DRAG LOGIC --- */
    const slider = document.querySelector('.slider-container');
    const track = document.querySelector('.slider-track');

    if(slider && track) {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.style.transform ? parseInt(track.style.transform.replace('translateX(', '').replace('px)', '')) : 0;
        });

        slider.addEventListener('mouseleave', () => { isDown = false; });
        slider.addEventListener('mouseup', () => { isDown = false; });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5; 
            let newTransform = scrollLeft + walk;

            const maxScroll = -(track.scrollWidth - slider.offsetWidth);
            if (newTransform > 0) newTransform = 0;
            if (newTransform < maxScroll) newTransform = maxScroll;

            track.style.transform = `translateX(${newTransform}px)`;
        });
    }

    /* --- COUNTER ANIMATION for gallery badges --- */
    const badges = $$('.card-badge');
    const badgeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const badge = entry.target;
                const text  = badge.textContent.trim();
                const match = text.match(/(\d+)\+/);
                if (match) {
                    const target = parseInt(match[1]);
                    const suffix = text.replace(/\d+\+/, '').trim();
                    let count  = 0;
                    const step = Math.ceil(target / 60);
                    const timer = setInterval(() => {
                        count = Math.min(count + step, target);
                        badge.textContent = `${count}+ ${suffix}`;
                        if (count >= target) clearInterval(timer);
                    }, 16);
                }
                badgeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    badges.forEach(b => badgeObserver.observe(b));

    /* --- FEATURES HEADING — gradient text on scroll --- */
    const featHeading = $('.features-heading');
    if (featHeading) {
        const featObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    featHeading.style.transition = '-webkit-text-stroke 1s ease, opacity 1s ease';
                    featHeading.style.webkitTextStroke = '1px rgba(255,255,255,0.5)';
                    featObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        featObserver.observe(featHeading);
    }

    /* --- BOLD DESIGN & EXPLORE BUTTONS --- */
    const exploreButtons = document.querySelectorAll('.explore-btn');
    exploreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const originalText = button.textContent;
            button.textContent = 'Loading...';
            button.style.opacity = '0.8';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.opacity = '1';
                alert('Navigating to the Marovelle collections page...');
            }, 600);
        });
    });

}); // end DOMContentLoaded