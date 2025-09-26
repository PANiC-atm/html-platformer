// --- Hook into level1.html ---
window.playerUpdate = function(ctx, canvas, blocks, camera) {
  if (!window.player) {
    // Spawn near bottom-left
    window.player = new Player(64, canvas.height - 128, 64, 64);
  }
  window.player.update(blocks, canvas);
  window.player.draw(ctx, camera);
};

// Update draw method to accept camera offset
Player.prototype.draw = function(ctx, camera) {
  let spr = sprites[this.state] || sprites.idle;
  let frameIndex = this.frame % spr.frames;

  let fw = spr.img.width / spr.w;
  let fh = spr.img.height / spr.h;
  let sx = (frameIndex % spr.w) * fw;
  let sy = Math.floor(frameIndex / spr.w) * fh;

  ctx.save();
  ctx.translate(this.x - camera.x + this.width / 2, this.y - camera.y + this.height / 2);
  ctx.scale(this.facing, 1);
  ctx.drawImage(
    spr.img,
    sx, sy, fw, fh,
    -this.width / 2, -this.height / 2,
    this.width, this.height
  );
  ctx.restore();
};
