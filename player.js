// --- Key handling ---
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// --- Sprite setup ---
const sprites = {
  idle: { src: "images/HTMLPlayer.png", frames: 4, w: 2, h: 2 },
  jump: { src: "images/HTMLPlayerJump.png", frames: 2, w: 1, h: 2 },
  attack: { src: "images/HTMLPlayerAtk.png", frames: 4, w: 2, h: 2 },
  dash: { src: "images/HTMLPlayerDash.png", frames: 4, w: 2, h: 2 }
};

for (let key in sprites) {
  const img = new Image();
  img.src = sprites[key].src;
  sprites[key].img = img;
}

// --- Player class ---
class Player {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.state = "idle";
    this.frame = 0;
    this.frameTimer = 0;
    this.canDash = true;
    this.dashing = false;
    this.dashTime = 0;
    this.lockFacing = false;
  }

  update(blocks, canvas) {
    if (!this.dashing) this.vy += 0.5; // gravity

    // Controls
    if (!this.dashing) {
      if (keys["ArrowLeft"]) { this.vx = -3; if (!this.lockFacing) this.facing = -1; }
      else if (keys["ArrowRight"]) { this.vx = 3; if (!this.lockFacing) this.facing = 1; }
      else this.vx = 0;

      if (keys[" "] && this.onGround) {
        this.vy = -10;
        this.onGround = false;
        this.state = "jump";
      }

      if (keys["z"]) this.state = "attack";

      if (keys["x"] && !this.onGround && this.canDash) {
        this.state = "dash";
        this.dashing = true;
        this.dashTime = 15;
        this.vx = this.facing * 12;
        this.vy = 0;
        this.canDash = false;
        this.lockFacing = true;
      }
    }

    // Dash end
    if (this.dashing) {
      this.dashTime--;
      if (this.dashTime <= 0) {
        this.dashing = false;
        this.lockFacing = false;
      }
    }

    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // --- Block collisions ---
    this.onGround = false;
    blocks.forEach(b => {
      if (this.x < b.x + b.size &&
          this.x + this.width > b.x &&
          this.y < b.y + b.size &&
          this.y + this.height > b.y) {
        
        // Land on top
        if (this.vy > 0 && this.y + this.height - this.vy <= b.y) {
          this.y = b.y - this.height;
          this.vy = 0;
          this.onGround = true;
          this.canDash = true;
          if (!keys["z"] && !this.dashing) this.state = "idle";
        }
      }
    });

    // Fallback floor at bottom
    if (this.y + this.height >= canvas.height) {
      this.y = canvas.height - this.height;
      this.vy = 0;
      this.onGround = true;
      this.canDash = true;
      if (!keys["z"] && !this.dashing) this.state = "idle";
    }

    this.animate();
  }

  animate() {
    this.frameTimer++;
    if (this.frameTimer > 10) {
      this.frameTimer = 0;
      this.frame++;
    }
  }

  draw(ctx) {
    let spr = sprites[this.state] || sprites.idle;
    let frameIndex = this.frame % spr.frames;

    let fw = spr.img.width / spr.w;
    let fh = spr.img.height / spr.h;
    let sx = (frameIndex % spr.w) * fw;
    let sy = Math.floor(frameIndex / spr.w) * fh;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(this.facing, 1);
    ctx.drawImage(
      spr.img,
      sx, sy, fw, fh,
      -this.width / 2, -this.height / 2,
      this.width, this.height
    );
    ctx.restore();
  }
}

// --- Hook into level1.html ---
window.playerUpdate = function(ctx, canvas, blocks) {
  if (!window.player) {
    // Spawn near bottom-left
    window.player = new Player(64, canvas.height - 128, 64, 64);
  }
  window.player.update(blocks, canvas);
  window.player.draw(ctx);
};
