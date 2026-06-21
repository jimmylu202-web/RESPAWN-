(function () {
  const bootScreen = document.getElementById("bootScreen");
  const bootText = document.getElementById("bootText");
  const hasSeenBoot = sessionStorage.getItem("respawnBootSeen") === "true";
  let bootReady = false;

  if (bootScreen) {
    if (hasSeenBoot) {
      bootReady = true;
      document.body.classList.add("entered");
      bootScreen.style.display = "none";
      const site = document.querySelector(".site");
      if (site) {
        site.style.opacity = "1";
        site.style.transform = "translateY(0)";
      }
    } else {
      window.setTimeout(() => {
        bootReady = true;
        bootScreen.classList.add("is-ready");
        if (bootText) bootText.innerHTML = "<span></span> 点击启动 / Enter RESPAWN";
      }, 2000);
    }
  }

  function enterSite() {
    if (!bootReady) return;
    sessionStorage.setItem("respawnBootSeen", "true");
    document.body.classList.add("entered");
    const site = document.querySelector(".site");
    if (site) {
      site.style.opacity = "1";
      site.style.transform = "translateY(0)";
    }
    if (bootScreen) {
      bootScreen.style.opacity = "0";
      bootScreen.style.visibility = "hidden";
      bootScreen.style.pointerEvents = "none";
      bootScreen.style.transform = "scale(1.04)";
      window.setTimeout(() => {
        bootScreen.style.display = "none";
      }, 850);
    }
  }

  if (bootScreen) {
    bootScreen.addEventListener("click", enterSite);
    bootScreen.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        enterSite();
      }
    });
  }

  initMatrix(document.getElementById("matrix"));
  initVideoReveal(document.querySelector(".home-hero"));
  initGhostCursor(document.getElementById("ghostCursor"), document.querySelector(".home-hero"));
  initElectricBorder(document.getElementById("statusElectricBorder"), document.querySelector(".console"));
  initDecryptedText(document.querySelector(".decrypt-title"));
  initShapeBlur(document.getElementById("shapeBlurProduct"), document.querySelector(".product-visual-card"));
  initFlowingMenu(document.querySelector(".flowing-menu"));
  initChromaGrid(document.getElementById("productChromaGrid"));
  initProfileCard(document.getElementById("profileCard"));
  initContactModal(document.getElementById("contactModal"));

  function initMatrix(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let drops = [];
    const glyphs = "RESPAWN重生010101SYS";

    function resizeMatrix() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const columns = Math.ceil(width / 24);
      drops = Array.from({ length: columns }, () => Math.random() * -height);
    }

    function drawMatrix() {
      ctx.fillStyle = "rgba(3, 4, 2, .12)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(154, 185, 40, .64)";
      ctx.font = "14px Consolas, monospace";
      for (let i = 0; i < drops.length; i += 1) {
        const text = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * 24;
        const y = drops[i];
        ctx.fillText(text, x, y);
        drops[i] += 18 + Math.random() * 8;
        if (drops[i] > height + 40) drops[i] = Math.random() * -180;
      }
      requestAnimationFrame(drawMatrix);
    }

    resizeMatrix();
    drawMatrix();
    window.addEventListener("resize", resizeMatrix);
  }

  function initVideoReveal(host) {
    if (!host) return;

    let revealSize = 0;
    let targetSize = 0;
    let x = 50;
    let y = 50;
    let targetX = 50;
    let targetY = 50;

    function updateTarget(event) {
      const rect = host.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
      targetY = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
      targetX = Math.max(0, Math.min(100, targetX));
      targetY = Math.max(0, Math.min(100, targetY));
      targetSize = Math.min(Math.max(rect.width, rect.height) * 0.38, 430);
    }

    function hideReveal() {
      targetSize = 0;
    }

    function animateReveal() {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      revealSize += (targetSize - revealSize) * 0.14;
      host.style.setProperty("--reveal-x", x.toFixed(2) + "%");
      host.style.setProperty("--reveal-y", y.toFixed(2) + "%");
      host.style.setProperty("--reveal-size", revealSize.toFixed(1) + "px");
      requestAnimationFrame(animateReveal);
    }

    host.addEventListener("pointermove", updateTarget, { passive: true });
    host.addEventListener("pointerleave", hideReveal, { passive: true });
    animateReveal();
  }

  function initGhostCursor(canvas, host) {
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    const trail = [];
    const maxTrail = 50;
    const color = { r: 154, g: 185, b: 40 };
    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const velocity = { x: 0, y: 0 };
    let hasPointer = false;
    let lastMove = performance.now();
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resizeGhost() {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function setPointer(event) {
      const rect = host.getBoundingClientRect();
      target.x = event.clientX - rect.left;
      target.y = event.clientY - rect.top;
      if (!hasPointer) {
        current.x = target.x;
        current.y = target.y;
      }
      hasPointer = true;
      lastMove = performance.now();
    }

    function drawBlob(point, index) {
      const age = 1 - index / maxTrail;
      const radius = 130 * age + 18;
      const alpha = Math.max(0, point.life) * age * .34;
      if (alpha <= 0.002) return;

      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
      gradient.addColorStop(.42, `rgba(190, 235, 85, ${alpha * .28})`);
      gradient.addColorStop(1, "rgba(154, 185, 40, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawGhost(now) {
      ctx.clearRect(0, 0, width, height);

      const idle = now - lastMove;
      const active = hasPointer && idle < 1000;
      const fade = idle <= 1000 ? 1 : Math.max(0, 1 - (idle - 1000) / 1500);

      if (hasPointer) {
        velocity.x = (target.x - current.x) * .5 + velocity.x * .5;
        velocity.y = (target.y - current.y) * .5 + velocity.y * .5;
        current.x += velocity.x * .18;
        current.y += velocity.y * .18;

        trail.unshift({
          x: current.x,
          y: current.y,
          life: active ? 1 : fade
        });
        if (trail.length > maxTrail) trail.pop();
      }

      for (let i = trail.length - 1; i >= 0; i -= 1) {
        trail[i].life *= .97;
        drawBlob(trail[i], i);
      }

      ctx.globalAlpha = .045;
      for (let i = 0; i < 160; i += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.random() * .22})`;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(drawGhost);
    }

    resizeGhost();
    host.addEventListener("pointermove", setPointer, { passive: true });
    host.addEventListener("pointerleave", () => {
      lastMove = performance.now() - 1000;
    }, { passive: true });
    window.addEventListener("resize", resizeGhost);
    requestAnimationFrame(drawGhost);
  }

  function initElectricBorder(canvas, container) {
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = 1;
    const offset = 28;
    const color = "#9AB928";

    function random(x) {
      return Math.sin(x * 12.9898) * 43758.5453 % 1;
    }

    function noise2D(x, y) {
      const i = Math.floor(x);
      const j = Math.floor(y);
      const fx = x - i;
      const fy = y - j;
      const a = random(i + j * 57);
      const b = random(i + 1 + j * 57);
      const c = random(i + (j + 1) * 57);
      const d = random(i + 1 + (j + 1) * 57);
      const ux = fx * fx * (3 - 2 * fx);
      const uy = fy * fy * (3 - 2 * fy);
      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    }

    function octavedNoise(x, time, seed) {
      let y = 0;
      let amplitude = 0.12;
      let frequency = 10;
      for (let i = 0; i < 10; i += 1) {
        y += amplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
        frequency *= 1.6;
        amplitude *= 0.7;
      }
      return y;
    }

    function roundedRectPoint(t, left, top, rectWidth, rectHeight, radius) {
      const straightWidth = rectWidth - 2 * radius;
      const straightHeight = rectHeight - 2 * radius;
      const cornerArc = Math.PI * radius / 2;
      const perimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
      let distance = t * perimeter;

      if (distance <= straightWidth) {
        return { x: left + radius + distance, y: top };
      }
      distance -= straightWidth;

      if (distance <= cornerArc) {
        const p = distance / cornerArc;
        const angle = -Math.PI / 2 + p * Math.PI / 2;
        return { x: left + rectWidth - radius + radius * Math.cos(angle), y: top + radius + radius * Math.sin(angle) };
      }
      distance -= cornerArc;

      if (distance <= straightHeight) {
        return { x: left + rectWidth, y: top + radius + distance };
      }
      distance -= straightHeight;

      if (distance <= cornerArc) {
        const p = distance / cornerArc;
        const angle = p * Math.PI / 2;
        return { x: left + rectWidth - radius + radius * Math.cos(angle), y: top + rectHeight - radius + radius * Math.sin(angle) };
      }
      distance -= cornerArc;

      if (distance <= straightWidth) {
        return { x: left + rectWidth - radius - distance, y: top + rectHeight };
      }
      distance -= straightWidth;

      if (distance <= cornerArc) {
        const p = distance / cornerArc;
        const angle = Math.PI / 2 + p * Math.PI / 2;
        return { x: left + radius + radius * Math.cos(angle), y: top + rectHeight - radius + radius * Math.sin(angle) };
      }
      distance -= cornerArc;

      if (distance <= straightHeight) {
        return { x: left, y: top + rectHeight - radius - distance };
      }
      distance -= straightHeight;

      const p = distance / cornerArc;
      const angle = Math.PI + p * Math.PI / 2;
      return { x: left + radius + radius * Math.cos(angle), y: top + radius + radius * Math.sin(angle) };
    }

    function resizeElectric() {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width + offset * 2, 1);
      height = Math.max(rect.height + offset * 2, 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawElectric(now) {
      const time = now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const left = offset;
      const top = offset;
      const rectWidth = width - offset * 2;
      const rectHeight = height - offset * 2;
      const radius = Math.min(18, rectWidth / 2, rectHeight / 2);
      const perimeter = 2 * (rectWidth + rectHeight) + 2 * Math.PI * radius;
      const sampleCount = Math.max(120, Math.floor(perimeter / 2));

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(154,185,40,.88)";
      ctx.shadowBlur = 12;
      ctx.beginPath();

      for (let i = 0; i <= sampleCount; i += 1) {
        const progress = i / sampleCount;
        const point = roundedRectPoint(progress, left, top, rectWidth, rectHeight, radius);
        const xNoise = octavedNoise(progress * 8, time, 0) * 44;
        const yNoise = octavedNoise(progress * 8, time, 1) * 44;
        const x = point.x + xNoise;
        const y = point.y + yNoise;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      requestAnimationFrame(drawElectric);
    }

    resizeElectric();
    window.addEventListener("resize", resizeElectric);
    requestAnimationFrame(drawElectric);
  }

  function initShuffleText(element) {
    if (!element) return;
    const finalText = element.dataset.text || element.textContent || "";
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    element.textContent = "";

    [...finalText].forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "shuffle-char";
      span.style.animationDelay = `${index * 0.03}s`;
      span.textContent = char === " " ? "\u00A0" : charset[Math.floor(Math.random() * charset.length)];
      element.appendChild(span);

      let swaps = 0;
      const timer = window.setInterval(() => {
        if (char === " ") {
          span.textContent = "\u00A0";
          window.clearInterval(timer);
          return;
        }
        swaps += 1;
        if (swaps >= 5 + index % 4) {
          span.textContent = char;
          window.clearInterval(timer);
        } else {
          span.textContent = charset[Math.floor(Math.random() * charset.length)];
        }
      }, 38 + index * 3);
    });
  }

  function initDecryptedText(element) {
    if (!element) return;
    const finalText = element.dataset.text || element.textContent || "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    element.textContent = "";

    const spans = [...finalText].map((char) => {
      const span = document.createElement("span");
      span.className = char === " " ? "revealed-char" : "encrypted-char";
      span.textContent = char === " " ? " " : chars[Math.floor(Math.random() * chars.length)];
      element.appendChild(span);
      return span;
    });

    let step = 0;
    const order = [];
    const middle = Math.floor(finalText.length / 2);
    for (let offset = 0; order.length < finalText.length; offset += 1) {
      const right = middle + offset;
      const left = middle - offset - 1;
      if (right >= 0 && right < finalText.length) order.push(right);
      if (left >= 0 && left < finalText.length) order.push(left);
    }

    const timer = window.setInterval(() => {
      step += 1;
      const revealCount = Math.min(order.length, step);
      const revealed = new Set(order.slice(0, revealCount));

      spans.forEach((span, index) => {
        const char = finalText[index];
        if (char === " " || revealed.has(index)) {
          span.textContent = char;
          span.className = "revealed-char";
        } else {
          span.textContent = chars[Math.floor(Math.random() * chars.length)];
          span.className = "encrypted-char";
        }
      });

      if (revealCount >= order.length) {
        window.clearInterval(timer);
      }
    }, 62);
  }

  function initShapeBlur(canvas, host) {
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = 1;
    const mouse = { x: 0, y: 0 };
    const damp = { x: 0, y: 0 };
    let active = true;

    function resizeShapeBlur() {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function setMouse(event) {
      const rect = host.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      if (!active) {
        damp.x = mouse.x;
        damp.y = mouse.y;
      }
      active = true;
    }

    function roundedRectPath(x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    function drawShapeBlur() {
      const t = performance.now() * 0.001;
      damp.x += (mouse.x - damp.x) * 0.12;
      damp.y += (mouse.y - damp.y) * 0.12;

      ctx.clearRect(0, 0, width, height);
      const jitter = Math.sin(t * 2.3) * 2.5;
      const pulse = (Math.sin(t * 2.8) + 1) * 0.5;
      const rectX = 28 + jitter;
      const rectY = 28 - jitter;
      const rectW = width - 56 - jitter * 2;
      const rectH = height - 56 + jitter * 2;
      const alphaSoft = 0.22 + pulse * 0.18;
      const alphaCore = 0.52 + pulse * 0.32;

      ctx.save();
      ctx.filter = `blur(${14 + pulse * 10}px)`;
      ctx.strokeStyle = `rgba(154,185,40,${alphaSoft.toFixed(3)})`;
      ctx.lineWidth = 28 + pulse * 8;
      roundedRectPath(rectX, rectY, rectW, rectH, 34);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.filter = `blur(${5 + pulse * 5}px)`;
      ctx.strokeStyle = `rgba(154,185,40,${alphaCore.toFixed(3)})`;
      ctx.lineWidth = 7 + pulse * 5;
      roundedRectPath(rectX, rectY, rectW, rectH, 34);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(154,185,40,.95)";
      ctx.lineWidth = 1.1 + pulse * 0.7;
      roundedRectPath(rectX, rectY, rectW, rectH, 34);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.setLineDash([18 + pulse * 8, 26 - pulse * 10]);
      ctx.lineDashOffset = -t * 90;
      ctx.strokeStyle = "rgba(210,255,90,.48)";
      ctx.lineWidth = 1;
      roundedRectPath(rectX + 10, rectY + 10, rectW - 20, rectH - 20, 28);
      ctx.stroke();
      ctx.restore();

      requestAnimationFrame(drawShapeBlur);
    }

    resizeShapeBlur();
    host.addEventListener("pointermove", setMouse, { passive: true });
    host.addEventListener("pointerenter", setMouse, { passive: true });
    host.addEventListener("pointerleave", () => {
      mouse.x = width / 2;
      mouse.y = height / 2;
    }, { passive: true });
    window.addEventListener("resize", resizeShapeBlur);
    mouse.x = width / 2;
    mouse.y = height / 2;
    damp.x = mouse.x;
    damp.y = mouse.y;
    requestAnimationFrame(drawShapeBlur);
  }

  function initFlowingMenu(menu) {
    if (!menu) return;

    const rows = Array.from(menu.querySelectorAll(".flowing-row"));

    function closestVerticalEdge(event, row) {
      const rect = row.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const topDistance = Math.pow(mouseX - rect.width / 2, 2) + Math.pow(mouseY, 2);
      const bottomDistance = Math.pow(mouseX - rect.width / 2, 2) + Math.pow(mouseY - rect.height, 2);
      return topDistance < bottomDistance ? "top" : "bottom";
    }

    function setDirection(row, edge) {
      if (edge === "top") {
        row.style.setProperty("--menu-y", "-101%");
        row.style.setProperty("--menu-inner-y", "101%");
      } else {
        row.style.setProperty("--menu-y", "101%");
        row.style.setProperty("--menu-inner-y", "-101%");
      }
    }

    rows.forEach((row) => {
      const link = row.querySelector(".flowing-link");
      if (link) {
        link.addEventListener("click", (event) => event.preventDefault());
      }

      row.addEventListener("mouseenter", (event) => {
        setDirection(row, closestVerticalEdge(event, row));
        row.classList.add("is-active");
      });

      row.addEventListener("mouseleave", (event) => {
        setDirection(row, closestVerticalEdge(event, row));
        row.classList.remove("is-active");
      });
    });
  }

  function initChromaGrid(grid) {
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".chroma-card"));
    let currentX = grid.clientWidth / 2;
    let currentY = grid.clientHeight / 2;
    let targetX = currentX;
    let targetY = currentY;
    let frame = 0;

    function writeGridVars() {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      grid.style.setProperty("--x", currentX.toFixed(1) + "px");
      grid.style.setProperty("--y", currentY.toFixed(1) + "px");

      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        frame = window.requestAnimationFrame(writeGridVars);
      } else {
        frame = 0;
      }
    }

    function moveSpotlight(event) {
      const rect = grid.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      grid.classList.add("is-active");
      if (!frame) frame = window.requestAnimationFrame(writeGridVars);
    }

    grid.addEventListener("pointermove", moveSpotlight, { passive: true });
    grid.addEventListener("pointerleave", () => {
      grid.classList.remove("is-active");
      targetX = grid.clientWidth / 2;
      targetY = grid.clientHeight / 2;
      if (!frame) frame = window.requestAnimationFrame(writeGridVars);
    }, { passive: true });

    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
        const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
        card.style.setProperty("--mouse-x", x.toFixed(2) + "%");
        card.style.setProperty("--mouse-y", y.toFixed(2) + "%");
      }, { passive: true });
    });
  }

  function initProfileCard(card) {
    if (!card) return;

    const shell = card.querySelector(".profile-card-shell");
    if (!shell) return;

    function setVars(x, y) {
      const rect = shell.getBoundingClientRect();
      const percentX = Math.max(0, Math.min(100, (x / Math.max(rect.width, 1)) * 100));
      const percentY = Math.max(0, Math.min(100, (y / Math.max(rect.height, 1)) * 100));
      const centerX = percentX - 50;
      const centerY = percentY - 50;

      card.style.setProperty("--pointer-x", percentX.toFixed(2) + "%");
      card.style.setProperty("--pointer-y", percentY.toFixed(2) + "%");
      card.style.setProperty("--rotate-x", (-centerX / 7).toFixed(2) + "deg");
      card.style.setProperty("--rotate-y", (centerY / 8).toFixed(2) + "deg");
    }

    card.addEventListener("pointermove", (event) => {
      const rect = shell.getBoundingClientRect();
      setVars(event.clientX - rect.left, event.clientY - rect.top);
    }, { passive: true });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--pointer-x", "50%");
      card.style.setProperty("--pointer-y", "50%");
      card.style.setProperty("--rotate-x", "0deg");
      card.style.setProperty("--rotate-y", "0deg");
    }, { passive: true });
  }

  function initContactModal(modal) {
    const openButton = document.getElementById("profileContactBtn");
    const closeButton = document.getElementById("contactModalClose");
    if (!modal || !openButton || !closeButton) return;

    function openModal() {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }

    openButton.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }
})();
