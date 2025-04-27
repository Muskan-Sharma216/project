// Hogwarts-themed quotes
const quotes = [
  "Happiness can be found even in the darkest of times, if one only remembers to turn on the light. ✨",
  "It is our choices that show what we truly are, far more than our abilities. 🪄",
  "Working hard is important, but there is something that matters even more: believing in yourself. 🏰",
  "It does not do to dwell on dreams and forget to live. 🌟",
  "Words are, in my not-so-humble opinion, our most inexhaustible source of magic. 📚",
  "We've all got both light and dark inside us. What matters is the part we choose to act on. 💫",
  "It takes a great deal of bravery to stand up to our enemies, but just as much to stand up to our friends. 🦁",
  "The best of us must sometimes eat our words. 🍽️",
  "It is the unknown we fear when we look upon death and darkness, nothing more. 🕯️",
  "Understanding is the first step to acceptance, and only with acceptance can there be recovery. 💖"
];

// House colors and emojis
const houses = {
  gryffindor: { color: '#740001', secondary: '#D3A625', emoji: '🦁' },
  slytherin: { color: '#1A472A', secondary: '#5D5D5D', emoji: '🐍' },
  ravenclaw: { color: '#0E1A40', secondary: '#946B2D', emoji: '🦅' },
  hufflepuff: { color: '#FFD800', secondary: '#000000', emoji: '🦡' }
};

// Quiz questions
const quizQuestions = [
  {
    question: "Who teaches Potions at Hogwarts?",
    options: ["Professor McGonagall", "Professor Snape", "Professor Flitwick"],
    answer: 1
  },
  {
    question: "What is the name of Harry's owl?",
    options: ["Pigwidgeon", "Hedwig", "Errol"],
    answer: 1
  },
  {
    question: "What position does Harry play in Quidditch?",
    options: ["Chaser", "Seeker", "Keeper"],
    answer: 1
  },
  {
    question: "What is the name of the Weasley's house?",
    options: ["The Burrow", "Shell Cottage", "Grimmauld Place"],
    answer: 0
  },
  {
    question: "What is the core of Harry's wand?",
    options: ["Phoenix feather", "Dragon heartstring", "Unicorn hair"],
    answer: 0
  }
];

// Wizard levels and badges
const wizardLevels = [
  { level: "First-Year", points: 0, badge: "🎓" },
  { level: "Second-Year", points: 50, badge: "📚" },
  { level: "Third-Year", points: 100, badge: "🪄" },
  { level: "Fourth-Year", points: 200, badge: "🏆" },
  { level: "Fifth-Year", points: 400, badge: "🌟" },
  { level: "Sixth-Year", points: 800, badge: "👑" },
  { level: "Seventh-Year", points: 1600, badge: "💫" }
];

let tasks = [];
let housePoints = 0;
let currentHouse = null;
let completedTasks = 0;
let quizTimer = null;
let taskTimers = {};

// Load saved data
if (localStorage.getItem('hogwartsTasks')) {
  tasks = JSON.parse(localStorage.getItem('hogwartsTasks'));
  housePoints = parseInt(localStorage.getItem('housePoints')) || 0;
  currentHouse = localStorage.getItem('currentHouse');
  completedTasks = parseInt(localStorage.getItem('completedTasks')) || 0;
}

const taskInput = document.getElementById('taskInput');
const timeInput = document.getElementById('timeInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const pointsDisplay = document.getElementById('points');
const levelDisplay = document.getElementById('level');
const quoteDiv = document.querySelector('.quote');
const wand = document.getElementById('wand');

// House selection
document.querySelectorAll('.house-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const house = btn.dataset.house;
    currentHouse = house;
    localStorage.setItem('currentHouse', house);
    updateHouseTheme(house);
    showNotification(`Welcome to ${house.charAt(0).toUpperCase() + house.slice(1)}! ${houses[house].emoji}`, 'success');
  });
});

function updateHouseTheme(house) {
  document.documentElement.style.setProperty('--primary-color', houses[house].color);
  document.documentElement.style.setProperty('--secondary-color', houses[house].secondary);
}

// Add task with timer
function addTask() {
  const text = taskInput.value.trim();
  const time = parseInt(timeInput.value);
  
  if (!text || !time) {
    showNotification("Please enter both a spell and time! ⏳", "warning");
    return;
  }

  const task = {
    id: Date.now(),
    text,
    time,
    completed: false,
    startTime: Date.now(),
    endTime: Date.now() + (time * 60 * 1000)
  };

  tasks.unshift(task);
  startTaskTimer(task);
  renderTasks();
  showRandomQuote();
  saveTasks();
  
  taskInput.value = '';
  timeInput.value = '';
  
  showNotification("New spell added! Good luck! 🪄", "success");
}

// Start timer for a task
function startTaskTimer(task) {
  if (taskTimers[task.id]) clearInterval(taskTimers[task.id]);
  
  taskTimers[task.id] = setInterval(() => {
    const now = Date.now();
    const remaining = task.endTime - now;
    
    if (remaining <= 0) {
      clearInterval(taskTimers[task.id]);
      if (!task.completed) {
        task.failed = true;
        showTimePopup(`Time's up! The spell "${task.text}" has failed... ⚡`);
        renderTasks();
      }
    } else if (remaining <= 5 * 60 * 1000) { // 5 minutes warning
      showNotification(`Only 5 minutes left for "${task.text}"! ⏰`, "warning");
    }
  }, 1000);
}

// Render completed tasks
function renderCompletedTasks() {
  const completedTasksList = document.getElementById('completedTasksList');
  const completedTasks = tasks.filter(task => task.completed);
  
  completedTasksList.innerHTML = '';
  
  completedTasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'completed-task-item';
    
    const completionTime = new Date(task.completionTime).toLocaleString();
    
    div.innerHTML = `
      <div class="completed-task-header">
        <span class="completed-task-text">${task.text}</span>
        <span class="completed-task-time">Completed: ${completionTime}</span>
      </div>
      ${task.notes ? `<div class="completed-task-notes">${task.notes}</div>` : ''}
    `;
    
    completedTasksList.appendChild(div);
  });
}

// Enhanced task completion
function toggleTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  task.completed = !task.completed;
  
  if (task.completed) {
    if (!task.failed) {
      task.completionTime = new Date().toISOString();
      housePoints += 10;
      completedTasks++;
      showNotification(`Spell completed successfully! +10 House Points! Total: ${housePoints} ${houses[currentHouse].emoji}`, "success");
      checkLevelUp();
    }
    clearInterval(taskTimers[taskId]);
    showMagicalEffect();
    createSparkleTrail();
  } else {
    housePoints -= 10;
    showNotification(`-10 House Points for incomplete spell... Total: ${housePoints}`, "warning");
  }
  
  renderTasks();
  renderCompletedTasks();
  saveTasks();
}

// Check for level up
function checkLevelUp() {
  const currentLevel = wizardLevels.find(level => level.points > housePoints);
  if (currentLevel) {
    const previousLevel = wizardLevels[wizardLevels.indexOf(currentLevel) - 1];
    if (previousLevel && previousLevel.points <= housePoints) {
      showLevelUp(previousLevel);
    }
  }
}

// Show level up modal
function showLevelUp(level) {
  const modal = document.getElementById('levelUpModal');
  const message = document.getElementById('levelUpMessage');
  const badgeContainer = document.querySelector('.badge-container');
  
  message.textContent = `Congratulations! You've reached ${level.level} Wizard Level!`;
  badgeContainer.innerHTML = `<div class="badge">${level.badge}</div>`;
  
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.style.display = 'none';
  }, 3000);
}

// Show magical effect
function showMagicalEffect() {
  const effect = document.createElement('div');
  effect.className = 'magical-effect';
  effect.innerHTML = '✨';
  document.body.appendChild(effect);
  
  setTimeout(() => {
    effect.remove();
  }, 1000);
}

// Start random quiz
function startRandomQuiz() {
  if (quizTimer) clearInterval(quizTimer);
  
  quizTimer = setInterval(() => {
    const question = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    showQuiz(question);
  }, 10 * 60 * 1000); // Every 10 minutes
}

// Show quiz modal
function showQuiz(question) {
  const modal = document.getElementById('quizModal');
  const questionEl = document.getElementById('quizQuestion');
  const optionsEl = document.getElementById('quizOptions');
  
  questionEl.textContent = question.question;
  optionsEl.innerHTML = question.options.map((option, index) => `
    <button class="quiz-option" data-index="${index}">${option}</button>
  `).join('');
  
  modal.style.display = 'flex';
  
  optionsEl.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = parseInt(btn.dataset.index);
      if (selected === question.answer) {
        housePoints += 30;
        showNotification("Correct! +30 House Points! 🎉", "success");
      } else {
        housePoints -= 10;
        showNotification("Wrong answer... -10 House Points ⚡", "warning");
      }
      modal.style.display = 'none';
      saveTasks();
    });
  });
  
  setTimeout(() => {
    modal.style.display = 'none';
  }, 30000); // Auto-close after 30 seconds
}

// Wand interaction
wand.addEventListener('click', () => {
  const effects = ['✨', '🌟', '💫', '⚡', '🪄'];
  const effect = effects[Math.floor(Math.random() * effects.length)];
  
  showNotification(`Wand cast: ${effect}`, "info");
  showMagicalEffect();
});

// Save tasks and points
function saveTasks() {
  localStorage.setItem('hogwartsTasks', JSON.stringify(tasks));
  localStorage.setItem('housePoints', housePoints);
  localStorage.setItem('completedTasks', completedTasks);
  updateDisplay();
}

// Update display
function updateDisplay() {
  pointsDisplay.textContent = housePoints;
  const currentLevel = wizardLevels.find(level => level.points > housePoints) || wizardLevels[wizardLevels.length - 1];
  levelDisplay.textContent = currentLevel.level;
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-emoji">${type === 'success' ? '✨' : type === 'warning' ? '⚡' : '🪄'}</span>
      <span class="notification-text">${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Show random quote
function showRandomQuote() {
  const random = Math.floor(Math.random() * quotes.length);
  quoteDiv.textContent = quotes[random];
}

// Render tasks with enhanced features
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''} ${task.failed ? 'failed' : ''}`;
    
    const remaining = Math.max(0, Math.ceil((task.endTime - Date.now()) / 1000 / 60));
    const timerClass = remaining < 5 ? 'warning' : '';
    
    li.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
        <span class="task-text">${task.text}</span>
        <span class="timer ${timerClass}">${remaining} min remaining</span>
        <button class="notes-btn" onclick="toggleNotes(${task.id})">📝</button>
      </div>
      <div class="notes-section" id="notes-${task.id}" style="display: none;">
        <textarea class="task-notes" placeholder="Add your notes here..." onchange="saveNotes(${task.id}, this.value)">${task.notes || ''}</textarea>
      </div>
      <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
    `;
    
    taskList.appendChild(li);
  });
  
  updateDisplay();
}

// Toggle notes visibility
function toggleNotes(taskId) {
  const notesSection = document.getElementById(`notes-${taskId}`);
  if (notesSection.style.display === 'none') {
    notesSection.style.display = 'block';
    showNotification("Notes revealed! ✨", "info");
  } else {
    notesSection.style.display = 'none';
  }
}

// Save notes for a task
function saveNotes(taskId, notes) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.notes = notes;
    saveTasks();
    showNotification("Notes saved! 📚", "success");
  }
}

// Delete task
function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  clearInterval(taskTimers[taskId]);
  renderTasks();
  saveTasks();
  showNotification("Spell vanished! 🪄", "info");
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// Initialize
renderTasks();
renderCompletedTasks();
showRandomQuote();
startRandomQuiz();
updateDisplay();

// Theme toggle
document.getElementById('lumosBtn').addEventListener('click', () => {
  document.body.classList.add('light-theme');
  showNotification("Lumos! 💡", "info");
});

document.getElementById('noxBtn').addEventListener('click', () => {
  document.body.classList.remove('light-theme');
  showNotification("Nox! 🌙", "info");
});

// Sample data for initial tasks
const sampleTasks = [
    { text: "Study Charms Theory", time: 45, completed: false },
    { text: "Practice Transfiguration", time: 30, completed: false },
    { text: "Read Potions Textbook", time: 60, completed: false },
    { text: "Review Herbology Notes", time: 40, completed: false },
    { text: "Write Defense Against Dark Arts Essay", time: 50, completed: false }
];

// Initialize with sample data
function initializeSampleData() {
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify(sampleTasks));
        tasks = [...sampleTasks];
        renderTasks();
    }
}

// Enhanced magical effects
function createMagicalEffect(emoji, x, y) {
    const effect = document.createElement('div');
    effect.className = 'magical-effect';
    effect.textContent = emoji;
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 2000);
}

// Enhanced task completion effect
function completeTaskWithMagic(taskItem, index) {
    const rect = taskItem.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Create multiple magical effects
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createMagicalEffect('✨', x + Math.random() * 50 - 25, y + Math.random() * 50 - 25);
        }, i * 200);
    }
    
    // Add house points
    addHousePoints(10);
    
    // Check for level up
    checkLevelUp();
    
    // Show success notification
    showNotification('Spell mastered! +10 House Points!', 'success');
}

// Enhanced add task with magical effect
function addTaskWithTime(taskText, timeInMinutes) {
    if (taskText.trim() === '') return;
    
    const newTask = {
        text: taskText,
        time: timeInMinutes,
        completed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    // Create magical effect
    const input = document.querySelector('.task-input');
    const rect = input.getBoundingClientRect();
    createMagicalEffect('📜', rect.left + rect.width / 2, rect.top + rect.height / 2);
    
    // Show notification
    showNotification('New spell added to your list!', 'info');
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeSampleData();
    renderTasks();
    renderCompletedTasks();
    showRandomQuote();
    startBreakTimer();
    
    // Add initial magical effects
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            createMagicalEffect('✨', x, y);
        }, i * 1000);
    }
});

// Create sparkle trail effect
function createSparkleTrail() {
  for (let i = 0; i < 10; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'magical-sparkle';
    sparkle.style.left = Math.random() * window.innerWidth + 'px';
    sparkle.style.top = Math.random() * window.innerHeight + 'px';
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
      sparkle.remove();
    }, 1000);
  }
}

// Show time popup
function showTimePopup(message) {
  const popup = document.createElement('div');
  popup.className = 'time-popup';
  popup.innerHTML = `
    <h3>Time Alert! ⏰</h3>
    <p>${message}</p>
    <button class="magical-button" onclick="this.parentElement.remove()">OK</button>
  `;
  
  document.body.appendChild(popup);
  
  // Add magical effects
  createSparkleTrail();
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    popup.remove();
  }, 5000);
} 