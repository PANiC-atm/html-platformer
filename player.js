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
    // AABB collision
    if (this.x < b.x + b.size &&
        this.x + this.width > b.x &&
        this.y < b.y + b.size &&
        this.y + this.height > b.y) {
      
      // From top
      if (this.vy > 0 && this.y + this.height - this.vy <= b.y) {
        this.y = b.y - this.height;
        this.vy = 0;
        this.onGround = true;
        this.canDash = true;
        if (!keys["z"] && !this.dashing) this.state = "idle";
      }
      // (You can expand later for hitting sides/ceiling if needed)
    }
  });

  // Fallback ground check
  if (this.y + this.height >= canvas.height) {
    this.y = canvas.height - this.height;
    this.vy = 0;
    this.onGround = true;
    this.canDash = true;
    if (!keys["z"] && !this.dashing) this.state = "idle";
  }
}
