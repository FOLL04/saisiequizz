// Éléments du DOM
const textToTypeElement = document.getElementById('text-to-type');
const typingAreaElement = document.getElementById('typing-area');
const timerElement = document.getElementById('timer');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const errorsElement = document.getElementById('errors');
const timeElement = document.getElementById('time');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');
const newTextButton = document.getElementById('new-text-btn');
const resultContainer = document.getElementById('result-container');
const resultContent = document.getElementById('result-content');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const currentTextElement = document.getElementById('current-text');
const totalTextElement = document.getElementById('total-text');

// Variables du jeu
let startTime;
let timerInterval;
let timeLeft = 60;
let isRunning = false;
let originalText = '';
let typedText = '';
let errors = 0;
let totalTyped = 0;
let currentTextIndex = 0;
let totalTexts = 6;
let textsCompleted = 0;

// Textes à taper (5 textes maximum comme demandé)
const textSamples = [
    {
        text: "La programmation est l'art de créer des solutions logiques à des problèmes complexes. Chaque développeur doit maîtriser plusieurs langages et outils pour être efficace dans son travail quotidien. ",
        words: 42,
        difficulty: "Moyen"
    },
    {
        text: "Le soleil brille doucement sur la ville ce matin, illuminant les rues d'une lumière dorée. Les oiseaux chantent dans les arbres, annonçant le début d'une nouvelle journée remplie de promesses et d'opportunités à saisir avec enthousiasme et détermination.",
        words: 38,
        difficulty: "Facile"
    },
    {
        text: "La technologie évolue à un rythme effréné. L'intelligence artificielle et l'apprentissage automatique sont désormais omniprésents dans divers secteurs d'activité économique et sociale à travers le monde.",
        words: 40,
        difficulty: "Moyen"
    },
    {
        text: "La cuisine française est réputée pour et sa diversité. Des croissants du petit-déjeuner aux fromages et vins fins, chaque région offre ses spécialités gastronomiques uniques qui raviront les papilles des gourmets les plus exigeants.",
        words: 39,
        difficulty: "Facile"
    },
    {
        text: " Que ce soit la marche, la natation ou le yoga, trouver une activité que l'on aime est la clé de la persévérance et du bien-être durable au fil des années.",
        words: 41,
        difficulty: "Facile"
    },
    {
        text: "Je suis un champion du code. Je suis le GBAAA",
        words: 10,
        difficulty:"Très Facile"
    }
];

// Initialisation
function init() {
    // Charger l'index du texte courant depuis le localStorage ou commencer à 0
    const savedIndex = localStorage.getItem('typingTestCurrentText');
    currentTextIndex = savedIndex ? parseInt(savedIndex) : 0;
    
    // S'assurer que l'index est dans les limites
    if (currentTextIndex >= totalTexts) {
        currentTextIndex = 0;
    }
    
    // Charger le texte
    loadText(currentTextIndex);
    
    // Réinitialiser les statistiques
    resetStats();
    
    // Mettre à jour l'affichage du compteur de textes
    updateTextCounter();
    
    // Mettre à jour les boutons
    updateButtons();
}

// Charger un texte spécifique
function loadText(index) {
    if (index < 0 || index >= textSamples.length) {
        index = 0;
    }
    
    originalText = textSamples[index].text;
    currentTextIndex = index;
    
    // Sauvegarder l'index dans le localStorage
    localStorage.setItem('typingTestCurrentText', currentTextIndex.toString());
    
    // Afficher le texte à taper
    displayTextToType();
    
    // Réinitialiser la zone de saisie
    typingAreaElement.value = '';
    typedText = '';
    
    // Mettre à jour la progression
    updateProgress();
}

// Afficher le texte à taper avec coloration
function displayTextToType() {
    textToTypeElement.innerHTML = '';
    
    for (let i = 0; i < originalText.length; i++) {
        const span = document.createElement('span');
        span.textContent = originalText[i];
        
        if (i === 0) {
            span.classList.add('current');
        }
        
        textToTypeElement.appendChild(span);
    }
}

// Mettre à jour l'affichage du texte avec les caractères corrects/incorrects
function updateTextDisplay() {
    const spans = textToTypeElement.querySelectorAll('span');
    typedText = typingAreaElement.value;
    
    // Réinitialiser toutes les spans
    spans.forEach(span => {
        span.classList.remove('correct', 'incorrect', 'current');
    });
    
    // Mettre à jour l'affichage en fonction de ce qui a été tapé
    for (let i = 0; i < spans.length; i++) {
        if (i < typedText.length) {
            if (typedText[i] === originalText[i]) {
                spans[i].classList.add('correct');
            } else {
                spans[i].classList.add('incorrect');
            }
        }
        
        // Mettre en évidence le caractère courant
        if (i === typedText.length && i < originalText.length) {
            spans[i].classList.add('current');
        }
    }
    
    // Mettre à jour la barre de progression
    updateProgress();
}

// Mettre à jour la barre de progression
function updateProgress() {
    typedText = typingAreaElement.value;
    const progress = (typedText.length / originalText.length) * 100;
    const clampedProgress = Math.min(100, Math.max(0, progress));
    
    // Mettre à jour la barre de progression
    progressBar.style.width = `${clampedProgress}%`;
    progressText.textContent = `${Math.round(clampedProgress)}%`;
    
    // Si l'utilisateur a terminé le texte
    if (typedText.length >= originalText.length && typedText.length > 0) {
        finishTextEarly();
    }
}

// Mettre à jour le compteur de textes
function updateTextCounter() {
    currentTextElement.textContent = currentTextIndex + 1;
    totalTextElement.textContent = totalTexts;
}

// Démarrer le test
function startTest() {
    if (isRunning) return;
    
    isRunning = true;
    startTime = new Date();
    timeLeft = 60;
    
    // Démarrer le chronomètre
    timerInterval = setInterval(updateTimer, 1000);
    
    // Mettre à jour les boutons
    updateButtons();
    
    // Masquer les résultats précédents
    resultContainer.style.display = 'none';
    
    // Donner le focus à la zone de saisie
    typingAreaElement.focus();
    
    // Initialiser l'affichage du chronomètre
    timerElement.classList.remove('warning', 'danger');
}

// Mettre à jour le chronomètre
function updateTimer() {
    timeLeft--;
    
    // Mettre à jour l'affichage du temps
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timeElement.textContent = `${timeLeft}s`;
    
    // Changer la couleur du chronomètre en fonction du temps restant
    if (timeLeft <= 10) {
        timerElement.classList.add('danger');
        timerElement.classList.remove('warning');
    } else if (timeLeft <= 30) {
        timerElement.classList.add('warning');
        timerElement.classList.remove('danger');
    }
    
    // Calculer les statistiques
    calculateStats();
    
    // Arrêter le test si le temps est écoulé
    if (timeLeft <= 0) {
        endTest();
    }
}

// Calculer les statistiques
function calculateStats() {
    typedText = typingAreaElement.value;
    totalTyped = typedText.length;
    
    // Calculer les erreurs
    errors = 0;
    for (let i = 0; i < Math.min(typedText.length, originalText.length); i++) {
        if (typedText[i] !== originalText[i]) {
            errors++;
        }
    }
    
    // Calculer les mots par minute
    const timeElapsedInSeconds = 60 - timeLeft;
    if (timeElapsedInSeconds > 0) {
        // Un mot est considéré comme 5 caractères (standard)
        const words = typedText.length / 5;
        const minutes = timeElapsedInSeconds / 60;
        const wpm = Math.round(words / minutes);
        wpmElement.textContent = wpm;
    }
    
    // Calculer la précision
    let accuracy = 100;
    if (totalTyped > 0) {
        const correctChars = totalTyped - errors;
        accuracy = Math.round((correctChars / totalTyped) * 100);
    }
    accuracyElement.textContent = `${accuracy}%`;
    
    // Mettre à jour les erreurs
    errorsElement.textContent = errors;
}

// Terminer le texte avant la fin du temps
function finishTextEarly() {
    clearInterval(timerInterval);
    isRunning = false;
    
    // Désactiver la zone de saisie
    typingAreaElement.disabled = true;
    
    // Calculer les statistiques finales
    calculateStats();
    
    // Afficher l'animation de félicitations
    showCelebration();
    
    // Afficher les résultats
    showResults(true);
    
    // Incrémenter le compteur de textes terminés
    textsCompleted++;
    
    // Passer au texte suivant
    setTimeout(() => {
        if (currentTextIndex < totalTexts - 1) {
            currentTextIndex++;
            loadText(currentTextIndex);
            resetTest();
        } else {
            // Si tous les textes sont terminés
            showCompletionMessage();
        }
    }, 3000);
}

// Terminer le test (temps écoulé)
function endTest() {
    clearInterval(timerInterval);
    isRunning = false;
    
    // Désactiver la zone de saisie
    typingAreaElement.disabled = true;
    
    // Calculer les statistiques finales
    calculateStats();
    
    // Afficher les résultats
    showResults(false);
    
    // Mettre à jour les boutons
    updateButtons();
}

// Afficher les résultats
function showResults(finishedEarly) {
    const wpm = parseInt(wpmElement.textContent);
    const accuracy = parseInt(accuracyElement.textContent);
    const totalWords = originalText.length / 5;
    const wordsTyped = typedText.length / 5;
    
    // Calculer la note sur 100
    let score = 0;
    
    if (finishedEarly) {
        // Bonus pour avoir terminé avant la fin
        const completionBonus = 20;
        const speedScore = Math.min(wpm * 1.5, 50); // Max 50 points pour la vitesse
        const accuracyScore = accuracy * 0.3; // Max 30 points pour la précision
        score = Math.min(100, completionBonus + speedScore + accuracyScore);
    } else {
        // Pas terminé avant la fin
        const progress = (typedText.length / originalText.length) * 100;
        const progressScore = Math.min(progress * 0.5, 50); // Max 50 points pour la progression
        const speedScore = Math.min(wpm, 30); // Max 30 points pour la vitesse
        const accuracyScore = accuracy * 0.2; // Max 20 points pour la précision
        score = Math.min(100, progressScore + speedScore + accuracyScore);
    }
    
    // Arrondir le score
    score = Math.round(score);
    
    // Déterminer la note en lettre
    let grade = '';
    let gradeClass = '';
    
    if (score >= 90) {
        grade = 'A';
        gradeClass = 'A';
    } else if (score >= 80) {
        grade = 'B';
        gradeClass = 'B';
    } else if (score >= 70) {
        grade = 'C';
        gradeClass = 'C';
    } else if (score >= 60) {
        grade = 'D';
        gradeClass = 'D';
    } else {
        grade = 'E';
        gradeClass = 'E';
    }
    
    // Préparer le contenu des résultats
    let resultHTML = '';
    
    if (finishedEarly) {
        resultHTML = `
            <h2><i class="fas fa-trophy"></i> Félicitations !</h2>
            <p>Vous avez terminé le texte avant la fin du temps !</p>
            <div class="grade ${gradeClass}">${grade}</div>
            <p>Votre score : <strong>${score}/100</strong></p>
        `;
    } else {
        resultHTML = `
            <h2><i class="fas fa-clock"></i> Temps écoulé !</h2>
            <p>Vous avez tapé ${Math.round(typedText.length / originalText.length * 100)}% du texte.</p>
            <div class="grade ${gradeClass}">${grade}</div>
            <p>Votre score : <strong>${score}/100</strong></p>
        `;
    }
    
    // Ajouter les statistiques
    resultHTML += `
        <div class="result-stats">
            <div class="result-stat">
                <div class="stat-value">${wpm}</div>
                <div class="stat-label">MPM</div>
            </div>
            <div class="result-stat">
                <div class="stat-value">${accuracy}%</div>
                <div class="stat-label">Précision</div>
            </div>
            <div class="result-stat">
                <div class="stat-value">${errors}</div>
                <div class="stat-label">Erreurs</div>
            </div>
            <div class="result-stat">
                <div class="stat-value">${Math.round(wordsTyped)}/${Math.round(totalWords)}</div>
                <div class="stat-label">Mots</div>
            </div>
        </div>
        
        <p style="margin-top: 20px;">
            ${finishedEarly ? 
                'Essayez le texte suivant pour améliorer encore votre score !' : 
                'Essayez à nouveau pour terminer le texte avant la fin du temps !'
            }
        </p>
    `;
    
    // Afficher les résultats
    resultContent.innerHTML = resultHTML;
    resultContainer.style.display = 'block';
    
    // Animation pour les résultats
    resultContent.classList.add('completed-animation');
    setTimeout(() => {
        resultContent.classList.remove('completed-animation');
    }, 1000);
}

// Afficher l'animation de félicitations
function showCelebration() {
    // Créer l'élément de célébration
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    document.body.appendChild(celebration);
    
    // Créer des confettis
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Position aléatoire
        confetti.style.left = `${Math.random() * 100}vw`;
        
        // Couleur aléatoire
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Taille aléatoire
        const size = Math.random() * 15 + 5;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        
        // Animation avec délai aléatoire
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        
        celebration.appendChild(confetti);
    }
    
    // Afficher l'animation
    celebration.style.display = 'block';
    
    // Supprimer l'animation après 3 secondes
    setTimeout(() => {
        document.body.removeChild(celebration);
    }, 3000);
}

// Afficher le message de complétion
function showCompletionMessage() {
    resultContent.innerHTML = `
        <h2><i class="fas fa-medal"></i> Bravo !</h2>
        <p>Vous avez terminé tous les ${totalTexts} textes !</p>
        <div class="grade A" style="font-size: 3rem;">Champion</div>
        <p style="margin-top: 20px;">
            Votre vitesse moyenne : <strong>${wpmElement.textContent} MPM</strong><br>
            Recommencez pour améliorer vos scores !
        </p>
    `;
    resultContainer.style.display = 'block';
}

// Réinitialiser le test
function resetTest() {
    clearInterval(timerInterval);
    isRunning = false;
    
    // Réinitialiser le temps
    timeLeft = 60;
    timerElement.textContent = '01:00';
    timerElement.classList.remove('warning', 'danger');
    timeElement.textContent = '60s';
    
    // Réinitialiser la zone de saisie
    typingAreaElement.value = '';
    typingAreaElement.disabled = false;
    
    // Réinitialiser les statistiques
    resetStats();
    
    // Réinitialiser l'affichage du texte
    displayTextToType();
    
    // Masquer les résultats
    resultContainer.style.display = 'none';
    
    // Mettre à jour les boutons
    updateButtons();
    
    // Réinitialiser la barre de progression
    updateProgress();
    
    // Donner le focus à la zone de saisie
    typingAreaElement.focus();
}

// Réinitialiser les statistiques
function resetStats() {
    wpmElement.textContent = '0';
    accuracyElement.textContent = '100%';
    errorsElement.textContent = '0';
    errors = 0;
    totalTyped = 0;
}

// Mettre à jour l'état des boutons
function updateButtons() {
    if (isRunning) {
        startButton.disabled = true;
        startButton.innerHTML = '<i class="fas fa-pause"></i> En cours...';
        startButton.style.backgroundColor = '#777';
    } else {
        startButton.disabled = false;
        startButton.innerHTML = '<i class="fas fa-play"></i> Commencer';
        startButton.style.backgroundColor = '#4CAF50';
    }
}

// Changer le texte à taper
function changeText() {
    // Passer au texte suivant
    if (currentTextIndex < totalTexts - 1) {
        currentTextIndex++;
    } else {
        // Revenir au premier texte
        currentTextIndex = 0;
    }
    
    loadText(currentTextIndex);
    resetTest();
}

// Événements
startButton.addEventListener('click', startTest);
resetButton.addEventListener('click', resetTest);
newTextButton.addEventListener('click', changeText);

// Démarrer le test quand l'utilisateur commence à taper
typingAreaElement.addEventListener('input', function() {
    if (!isRunning && this.value.length > 0) {
        startTest();
    }
    
    updateTextDisplay();
    calculateStats();
});

// Empêcher le collage dans la zone de texte
typingAreaElement.addEventListener('paste', function(e) {
    e.preventDefault();
    alert('Le collage est désactivé pour ce test de vitesse de frappe.');
});

// Initialiser au chargement de la page
window.addEventListener('DOMContentLoaded', init);