var typed = new Typed(".text", {
  strings: ["Engineer", "Developer", "Innovator", "Leader"],
  typeSpeed: 100,
  backSpeed: 100,
  backDelay: 1000,
  loop: true
});

function randNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function addPixel(color, startPos) {
  const $pixel = $(
    `<div class='pixel' style='background-color: rgba(${color[0]},${color[1]},${color[2]}, 0.65);
      top: ${startPos[1]}px;
      left: ${startPos[0]}px;
      box-shadow: 0px 0px 7px 7px rgba(${color[0] - 5}, ${color[1] - 5}, ${color[2] - 5}, 0.55);'>
    </div>`
  );

  $('.backDrop').prepend($pixel);
  $pixel.show(500);

  let angle = randNum(0, 360);
  let x = startPos[0];
  let y = startPos[1];
  const speed = .5;
  const w = $(window).width();
  const h = $(window).height();

  function move() {
    angle += randNum(-5, 6); 

    const rad = angle * Math.PI / 180;

    x += Math.cos(rad) * speed;
    y += Math.sin(rad) * speed;

    if (x < 0 || x > w || y < 0 || y > h) {
      $pixel.remove();
      return;
    }

    $pixel.css({ left: `${x}px`, top: `${y}px` });

    requestAnimationFrame(move);
  }

  move(); 
}
  
  const moveInterval = setInterval(() => {
    angle += randNum(-30, 30);
    const dx = Math.cos(angle * Math.PI / 180) * 3;
    const dy = Math.sin(angle * Math.PI / 180) * 2;

    const currentLeft = parseFloat($pixel.css('left')) || 0;
    const currentTop = parseFloat($pixel.css('top')) || 0;
    const newLeft = currentLeft + dx;
    const newTop = currentTop + dy;

    const maxW = $(window).width();
    const maxH = $(window).height();
    if (newLeft < 0 || newLeft > maxW || newTop < 0 || newTop > maxH) {
      $pixel.remove(); 
      clearInterval(moveInterval);
      return;
    }

    $pixel.css({
      left: newLeft + 'px',
      top: newTop + 'px'
    });

  }, 100); 

function letFly() {
  setInterval(function () {
    var color = [
      randNum(40, 80),
      randNum(100, 100),
      randNum(120, 100)
    ];
    var startPos = [
      randNum(0, $(window).width()),
      randNum(0, $(window).height())
    ];
    addPixel(color, startPos);
  }, 400); 
}

function hideTitle() {
  $('.pageTop h1').delay(4000).fadeOut(1000);
}

$(document).ready(function () {
  hideTitle();
  letFly();
});

  const counters = document.querySelectorAll('.number');
  const speed = 90; // Adjust to control speed

  counters.forEach(counter => {
    const updateCount = () => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;

      const increment = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(updateCount, 120); // animation interval
      } else {
        counter.innerText = target;
      }
    };

    updateCount();
  });

const hamburgerMenu = document.querySelector('.hamburger-menu');
const navbar = document.querySelector('.navbar');

hamburgerMenu.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('active');
    navbar.classList.toggle('active');
});

// Close navbar when a link is clicked
navbar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        navbar.classList.remove('active');
    });
});

function showExperienceTab(tabId) {
  // Hide all experience content divs
  document.querySelectorAll('.experience-content').forEach(div => {
    div.classList.remove('active');
  });

  // Deactivate all tab buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });

  // Show the selected experience content
  document.getElementById(`${tabId}-experience`).classList.add('active');

  // Activate the clicked tab button
  document.querySelector(`.tab-button[onclick="showExperienceTab(\'${tabId}\')"]`).classList.add('active');

  // Manually trigger scroll event to update timeline fill for the newly active tab
  window.dispatchEvent(new Event('scroll'));
}

window.addEventListener("scroll", () => {
  const activeTimeline = document.querySelector(".experience-content.active .timeline");
  const fillLine = activeTimeline ? activeTimeline.querySelector(".timeline-line-fill") : null;

  if (!activeTimeline || !fillLine) return; // Ensure elements exist and an active timeline is present

  const rect = activeTimeline.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  const start = rect.top;
  const end = rect.bottom;

  // Calculate scroll progress within the active timeline section
  let scrollProgress = 0;
  if (windowHeight > start && end > 0) { // If timeline is in or passing through viewport
    scrollProgress = Math.min(Math.max((windowHeight - start) / (end - start), 0), 1);
  }
  
  fillLine.style.height = `${scrollProgress * 100}%`;

  // This part is for individual timeline item visibility, remains as is
  const items = activeTimeline.querySelectorAll(".timeline-item");
  const trigger = window.innerHeight * 0.85;

  items.forEach(item => {
    const boxTop = item.getBoundingClientRect().top;
    if (boxTop < trigger) {
      item.classList.add("visible");
    }
  });
});

$(document).ready(function() {
    $('a[href^="#"]').on('click', function(event) {
        event.preventDefault();

        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, 800);
    });
});

/*
function toggleChat() {
  const chatbot = document.getElementById("chatbot");
  chatbot.classList.toggle("open");
}

function sendMessage() {
  const input = document.getElementById("chat-input");
  const body = document.getElementById("chat-body");
  const msg = input.value.trim();

  if (!msg) return;

  const userMsg = document.createElement("div");
  userMsg.className = "chat-message user";
  userMsg.textContent = msg;
  body.appendChild(userMsg);

  setTimeout(() => {
    const botMsg = document.createElement("div");
    botMsg.className = "chat-message bot";
    botMsg.textContent = generateBotResponse(msg);
    body.appendChild(botMsg);
    body.scrollTop = body.scrollHeight;
  }, 800);

  input.value = "";
  body.scrollTop = body.scrollHeight;
}

function generateBotResponse(input) {
  input = input.toLowerCase();

  if (input.includes("skills")) return "As for my technical skills I am comfortable with Python, Java, HTML, Excel, Figma, and SQL. My soft skills include leadership, communication, time management, attention to details, analytical Skills, and I am a fast learner!"
  if (input.includes("project")) return "You can find my recent projects in the Projects section!";
  if (input.includes("name") || input.includes("hi")) {return "Hello, I'm ErikaBot, your AI guide!";}
  if (input.includes("free time")) return "I enjoy travelling, playing outdoor activities such as soccer and volleyball, as well as spending time with friends and family!";

  return "That's an interesting question! I'll get better at answering soon 😉";
}
*/

// Expandable quotes functionality
document.querySelectorAll('.toggle-quote').forEach(button => {
  button.addEventListener('click', function() {
    const quoteText = this.parentElement.querySelector('.quote-text');
    
    quoteText.classList.toggle('expanded');
    if (quoteText.classList.contains('expanded')) {
      this.textContent = 'Read Less';
    } else {
      this.textContent = 'Read More';
    }
  });
});


