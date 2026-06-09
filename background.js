// ==========================================
//  BACKGROUND PARTIKEL INTERAKTIF
//  Partikel bergerak dan bereaksi terhadap kursor
// ==========================================
(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const glow = document.getElementById('cursorGlow');

    let width, height;
    let mouseX = -1000, mouseY = -1000;
    let isMouseOnPage = false;
    const particles = [];
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 150;
    const MOUSE_RADIUS = 200;

    // Warna tema sesuai portfolio
    const COLORS = [
        'rgba(110, 68, 255, ',   // Ungu
        'rgba(0, 132, 255, ',    // Biru
        'rgba(85, 205, 226, ',   // Cyan
        'rgba(153, 102, 255, ',  // Lavender
        'rgba(0, 162, 255, ',    // Biru terang
    ];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.baseVx = (Math.random() - 0.5) * 0.5;
            this.baseVy = (Math.random() - 0.5) * 0.5;
            this.vx = this.baseVx;
            this.vy = this.baseVy;
            this.radius = Math.random() * 2.5 + 0.8;
            this.baseRadius = this.radius;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.alpha = Math.random() * 0.5 + 0.2;
            this.baseAlpha = this.alpha;
            this.pulseSpeed = Math.random() * 0.02 + 0.005;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update(time) {
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (isMouseOnPage && dist < MOUSE_RADIUS) {
                // Tolak partikel dari kursor
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                const angle = Math.atan2(dy, dx);
                this.vx += Math.cos(angle) * force * 1.5;
                this.vy += Math.sin(angle) * force * 1.5;
                this.alpha = Math.min(1, this.baseAlpha + force * 0.6);
                this.radius = this.baseRadius + force * 2;
            } else {
                this.vx += (this.baseVx - this.vx) * 0.02;
                this.vy += (this.baseVy - this.vy) * 0.02;
                this.alpha += (this.baseAlpha - this.alpha) * 0.05;
                this.radius += (this.baseRadius - this.radius) * 0.05;
            }

            // Pulse
            const pulse = Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.3;
            const displayRadius = this.radius + pulse;

            this.x += this.vx;
            this.y += this.vy;

            // Batasi kecepatan
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 3) {
                this.vx = (this.vx / speed) * 3;
                this.vy = (this.vy / speed) * 3;
            }

            // Wrap di tepi layar
            if (this.x < -20) this.x = width + 20;
            if (this.x > width + 20) this.x = -20;
            if (this.y < -20) this.y = height + 20;
            if (this.y > height + 20) this.y = -20;

            return displayRadius;
        }

        draw(displayRadius) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0.5, displayRadius), 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();

            // Efek glow
            if (this.alpha > 0.4) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, displayRadius * 3, 0, Math.PI * 2);
                ctx.fillStyle = this.color + (this.alpha * 0.1) + ')';
                ctx.fill();
            }
        }
    }

    function init() {
        resize();
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    let lineOpacity = (1 - dist / CONNECTION_DIST) * 0.25;

                    // Garis lebih terang jika dekat kursor
                    if (isMouseOnPage) {
                        const midX = (particles[i].x + particles[j].x) / 2;
                        const midY = (particles[i].y + particles[j].y) / 2;
                        const mouseDist = Math.sqrt(
                            (midX - mouseX) ** 2 + (midY - mouseY) ** 2
                        );
                        if (mouseDist < MOUSE_RADIUS) {
                            lineOpacity += (1 - mouseDist / MOUSE_RADIUS) * 0.3;
                        }
                    }

                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(110, 68, 255, ' + lineOpacity + ')';
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    let time = 0;
    function animate() {
        ctx.clearRect(0, 0, width, height);
        time++;

        drawConnections();

        for (const p of particles) {
            const r = p.update(time);
            p.draw(r);
        }

        requestAnimationFrame(animate);
    }

    // === Event Listeners ===
    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseOnPage = true;

        if (glow) {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
            glow.classList.add('active');
        }
    });

    document.addEventListener('mouseleave', function () {
        isMouseOnPage = false;
        mouseX = -1000;
        mouseY = -1000;
        if (glow) {
            glow.classList.remove('active');
        }
    });

    window.addEventListener('resize', function () {
        resize();
    });

    // Mulai!
    init();
    animate();
})();
