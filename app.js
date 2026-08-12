document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================
     SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================== */
  const revealElements = document.querySelectorAll(".reveal");

  const observerOptions = {
    root: null,
    threshold: 0.05,
    rootMargin: "0px 0px -40px 0px",
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });

  /* ==========================================
     COUNTDOWN TIMER
     ========================================== */
  const targetDate = new Date("August 23, 2026 19:00:00").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    // Elements
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (difference <= 0) {
      // It's the wedding day or past it
      if (daysEl) daysEl.innerText = "00";
      if (hoursEl) hoursEl.innerText = "00";
      if (minutesEl) minutesEl.innerText = "00";
      if (secondsEl) secondsEl.innerText = "00";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (daysEl) daysEl.innerText = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.innerText = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, "0");
  }

  // Run immediately and then every second
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ==========================================
     WISHES / COMMENTS WALL LOGIC
     ========================================== */
  const commentForm = document.getElementById("comment-form");
  const wishesList = document.getElementById("wishes-list");
  const rsvpRadios = document.querySelectorAll('input[name="rsvp"]');
  const guestCountGroup = document.getElementById("guest-count-group");

  // Dynamic show/hide guest count based on RSVP selection
  function toggleGuestCount() {
    const selectedRsvp = document.querySelector('input[name="rsvp"]:checked').value;
    if (selectedRsvp === "yes") {
      guestCountGroup.classList.remove("hidden");
    } else {
      guestCountGroup.classList.add("hidden");
    }
  }

  rsvpRadios.forEach(radio => {
    radio.addEventListener("change", toggleGuestCount);
  });

  // Run initial toggle check
  if (guestCountGroup) {
    toggleGuestCount();
  }

  // Pre-populated default wishes to make the wall look lively and elegant from the start
  const defaultWishes = [
    {
      name: "Monica & Peter",
      rsvp: "yes",
      guestCount: 2,
      text: "Sending you both all of our love. We cannot wait to see Rogina in her beautiful dress and celebrate this special milestone with you both!",
      timestamp: new Date("2026-08-11T14:30:00").getTime()
    },
    {
      name: "Uncle George & Family",
      rsvp: "yes",
      guestCount: 4,
      text: "Congratulations Yousef and Rogina! May your joint path be filled with happiness, understanding, and infinite love. See you on the 23rd!",
      timestamp: new Date("2026-08-12T09:15:00").getTime()
    },
    {
      name: "Sherif Kamal",
      rsvp: "no",
      guestCount: 0,
      text: "Warmest congratulations on your wedding! I am deeply sorry I won't be able to attend due to work travel, but my heart and prayers are with you both.",
      timestamp: new Date("2026-08-12T11:45:00").getTime()
    }
  ];

  // Load wishes from LocalStorage or use defaults
  function getWishes() {
    const stored = localStorage.getItem("wedding_wishes");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored wishes, resetting to defaults", e);
      }
    }
    // Save defaults to storage on first load
    localStorage.setItem("wedding_wishes", JSON.stringify(defaultWishes));
    return defaultWishes;
  }

  // Save wishes to LocalStorage
  function saveWishes(wishes) {
    localStorage.setItem("wedding_wishes", JSON.stringify(wishes));
  }

  // Format timestamp nicely
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  }

  // Render wishes to the list
  function renderWishes() {
    const wishes = getWishes();
    // Sort by newest first
    wishes.sort((a, b) => b.timestamp - a.timestamp);
    
    wishesList.innerHTML = "";
    
    wishes.forEach(wish => {
      const card = document.createElement("div");
      card.className = "wish-card";
      
      const rsvpClass = wish.rsvp === "yes" ? "attending" : "declined";
      const rsvpText = wish.rsvp === "yes" ? "Attending" : "Declined";
      
      let guestText = "";
      if (wish.rsvp === "yes" && wish.guestCount) {
        guestText = ` <span class="guest-count-tag">(${wish.guestCount} ${wish.guestCount == 1 ? 'guest' : 'guests'})</span>`;
      }
      
      card.innerHTML = `
        <div class="wish-header">
          <span class="wish-name">${escapeHTML(wish.name)}${guestText}</span>
          <span class="wish-badge ${rsvpClass}">${rsvpText}</span>
        </div>
        <p class="wish-text">"${escapeHTML(wish.text)}"</p>
        <div class="wish-time">${formatTime(wish.timestamp)}</div>
      `;
      wishesList.appendChild(card);
    });
  }

  // Escape HTML helper to prevent XSS
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Handle new comment submission
  if (commentForm) {
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById("guest-name");
      const rsvpInput = document.querySelector('input[name="rsvp"]:checked');
      const guestCountSelect = document.getElementById("guest-count");
      const textInput = document.getElementById("comment-text");
      
      if (!nameInput.value.trim() || !textInput.value.trim()) {
        return;
      }
      
      const isAttending = rsvpInput.value === "yes";
      const newWish = {
        name: nameInput.value.trim(),
        rsvp: rsvpInput.value,
        guestCount: isAttending ? parseInt(guestCountSelect.value, 10) : 0,
        text: textInput.value.trim(),
        timestamp: Date.now()
      };
      
      const currentWishes = getWishes();
      currentWishes.push(newWish);
      saveWishes(currentWishes);
      
      // Clear localStorage of any stale items and re-render
      renderWishes();
      
      nameInput.value = "";
      textInput.value = "";
      guestCountSelect.value = "2"; // reset default
      
      // Select the first radio input (Accept) and trigger toggle
      const acceptRadio = document.querySelector('input[name="rsvp"][value="yes"]');
      if (acceptRadio) {
        acceptRadio.checked = true;
        toggleGuestCount();
      }
      
      // Micro-interaction/Toast style confirmation feedback on the button
      const submitBtn = commentForm.querySelector(".submit-btn");
      const originalContent = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>Sent with love!</span> <i class="fa-solid fa-heart" style="color: var(--heart-red); animation: pulse-heart 0.5s infinite alternate;"></i>`;
      submitBtn.style.backgroundColor = "hsl(120, 30%, 30%)";
      submitBtn.disabled = true;
      
      setTimeout(() => {
        submitBtn.innerHTML = originalContent;
        submitBtn.style.backgroundColor = "";
        submitBtn.disabled = false;
      }, 2500);
    });
  }

  // Initial render
  renderWishes();
});
