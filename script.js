/**@type{HTMLCanvasElement} */
const canvas1 = document.getElementById("canvas1");
const ctx = canvas1.getContext("2d");
canvas1.width = window.innerWidth;
canvas1.height = window.innerHeight;

const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");
canvas2.width = window.innerWidth;
canvas2.height = window.innerHeight;

ctx.lineWidth = 3;
const gradient = ctx.createLinearGradient(0, 0, 0, canvas1.height);
gradient.addColorStop(0, "black");
gradient.addColorStop(0.5, "black");
gradient.addColorStop(0.5, "white");
gradient.addColorStop(1, "white");
ctx.fillStyle = "blue";
ctx.strokeStyle = "white";
ctx2.fillStyle = "blue";
ctx2.strokeStyle = "white";

class Particle {
  constructor(effect, i) {
    this.effect = effect;
    this.index = i;

    if (this.index % 20 === 0) {
      this.radius = Math.floor(Math.random() * 20 + 50);
    }
    this.radius = Math.floor(Math.random() * 30 + 5);
    this.x = this.radius + Math.random() * (effect.width - this.radius * 2);
    this.y = this.radius + Math.random() * (effect.height - this.radius * 2);
    this.vx = Math.random() * 1 - 0.5;
    this.vy = Math.random() * 1 - 0.5;
    this.pushX = 0;
    this.pushY = 0;
    this.friction = 0.85;
  }
  update() {
    if (this.effect.pointer.pressed) {
      let dx = this.x - this.effect.pointer.x;
      let dy = this.y - this.effect.pointer.y;
      let distance = Math.hypot(dx, dy);
      let force = this.effect.pointer.radius / distance;
      if (distance < this.effect.pointer.radius) {
        let angle = Math.atan2(dy, dx);
        this.pushX += Math.cos(angle) * force;
        this.pushY += Math.sin(angle) * force;
      }
    }
    this.x += (this.pushX *= this.friction) + this.vx;
    this.y += (this.pushY *= this.friction) + this.vy;

    if (this.x < this.radius) {
      this.x = this.radius;
      this.vx *= -1;
    } else if (this.x > this.effect.width - this.radius) {
      this.x = this.effect.width - this.radius;
      this.vx *= -1;
    }

    if (this.y < this.radius) {
      this.y = this.radius;
      this.vy *= -1;
    } else if (this.y > this.effect.height - this.radius) {
      this.y = this.effect.height - this.radius;
      this.vy *= -1;
    }
    //collision with other particle no overlap
    this.effect.particles.forEach((particle) => {
      if (particle.index != this.index) {
        let dx = this.x - particle.x;
        let dy = this.y - particle.y;
        let distance = Math.hypot(dx, dy);
        let sumOfRadii = this.radius + particle.radius;
        if (distance <= sumOfRadii) {
          let unit_x = dx / distance;
          let unit_y = dy / distance;
          this.x = particle.x + (sumOfRadii + 0.1) * unit_x;
          this.y = particle.y + (sumOfRadii + 0.1) * unit_y;
        }
      }
    });
  }
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
  reset() {
    this.x = this.radius + Math.random() * (effect.width - this.radius * 2);
    this.y = this.radius + Math.random() * (effect.height - this.radius * 2);
  }
}

class Effect {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.context = context;
    this.width = canvas.width;
    this.height = canvas.height;
    this.particles = [];
    this.numOfParticles = 100;
    this.createParticles();

    this.pointer = {
      x: 0,
      y: 0,
      pressed: false,
      radius: 150,
    };
    window.addEventListener("pointermove", (e) => {
      if (this.pointer.pressed) {
        this.pointer.x = e.x;
        this.pointer.y = e.y;
      }
    });
    window.addEventListener("pointerdown", (e) => {
      this.pointer.pressed = true;
      this.pointer.x = e.x;
      this.pointer.y = e.y;
    });

    window.addEventListener("pointerup", (e) => {
      this.pointer.pressed = false;
    });

    window.addEventListener("resize", (e) => {
      this.resize(e.target.window.innerWidth, e.target.window.innerHeight);
    });
  }
  createParticles() {
    for (let i = 0; i < this.numOfParticles; i++) {
      this.particles.push(new Particle(this, i));
    }
  }
  handleParticles(context, context2) {
    // effect.connectParticles(context2);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.draw(context2);
      particle.update();
    });
  }
  connectParticles(context) {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i; j < this.particles.length; j++) {
        let dx = this.particles[i].x - this.particles[j].x;
        let dy = this.particles[i].y - this.particles[j].y;
        let maxDistance = 100;
        let distance = Math.hypot(dx, dy);
        if (distance < maxDistance) {
          context.save();
          const opacity = 1 - distance / maxDistance;
          context.globalAlpha = opacity;
          context.lineWidth = 3;
          context.beginPath();
          context.moveTo(this.particles[i].x, this.particles[i].y);
          context.lineTo(this.particles[j].x, this.particles[j].y);
          context.stroke();
          context.restore();
        }
      }
    }
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    const gradient = this.context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0.1, "white");
    gradient.addColorStop(0.5, "gold");
    gradient.addColorStop(0.9, "orangered");
    this.context.strokeStyle = "white";
    this.context.fillStyle = gradient;
    this.particles.forEach((particle) => {
      particle.reset();
    });
  }
}

const effect = new Effect(canvas1, ctx);

function animate() {
  ctx.clearRect(0, 0, canvas1.width, canvas1.height);
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

  effect.handleParticles(ctx, ctx2);

  requestAnimationFrame(animate);
}
animate();
