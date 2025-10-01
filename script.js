// Application de traduction Wolof - Français - Anglais
class TraducteurWolof {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('translationHistory')) || [];
        this.favorites = JSON.parse(localStorage.getItem('translationFavorites')) || [];
        this.quizScore = parseInt(localStorage.getItem('quizScore')) || 0;
        this.quizStreak = parseInt(localStorage.getItem('quizStreak')) || 0;
        this.currentQuizQuestion = null;
        
        this.init();
    }
    
    init() {
        // Initialisation des écouteurs d'événements
        this.setupEventListeners();
        
        // Chargement de l'historique et des favoris
        this.renderHistory();
        this.renderFavorites();
        
        // Initialisation du quiz
        this.setupQuiz();
    }
    
    setupEventListeners() {
        // Événement de traduction
        document.getElementById('translate-btn').addEventListener('click', () => {
            this.translate();
        });
        
        // Événement de saisie pour l'autocomplétion
        document.getElementById('input-text').addEventListener('input', (e) => {
            this.showSuggestions(e.target.value);
        });
        
        // Événement pour la prononciation de l'entrée
        document.getElementById('speak-btn').addEventListener('click', () => {
            this.speakText(document.getElementById('input-text').value);
        });
        
        // Événement pour la prononciation de la sortie
        document.getElementById('speak-output-btn').addEventListener('click', () => {
            this.speakText(document.getElementById('output-text').innerText);
        });
        
        // Événement pour copier le résultat
        document.getElementById('copy-btn').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('output-text').innerText);
        });
        
        // Événement pour ajouter aux favoris
        document.getElementById('favorite-btn').addEventListener('click', () => {
            this.addToFavorites();
        });
        
        // Événements pour les onglets
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Événement pour la touche Entrée
        document.getElementById('input-text').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.translate();
            }
        });
        
        // Événement pour le bouton suivant du quiz
        document.getElementById('quiz-next').addEventListener('click', () => {
            this.nextQuizQuestion();
        });
    }
    
    // Traduction principale
    translate() {
        const inputText = document.getElementById('input-text').value.trim();
        const direction = document.getElementById('direction').value;
        
        if (!inputText) {
            this.showOutput("Veuillez entrer un mot ou une phrase à traduire.");
            return;
        }
        
        let result = this.performTranslation(inputText, direction);
        
        if (result) {
            this.showOutput(result);
            this.addToHistory(inputText, result, direction);
        } else {
            this.showOutput("Désolé, aucune traduction trouvée pour ce terme.");
        }
    }
    
    // Logique de traduction
    performTranslation(text, direction) {
        const normalizedText = text.toLowerCase().trim();
        
        switch(direction) {
            case 'wolof-fr':
                return this.translateFromWolof(normalizedText, 'fr');
            case 'fr-wolof':
                return this.translateFromFrench(normalizedText);
            case 'wolof-en':
                return this.translateFromWolof(normalizedText, 'en');
            case 'en-wolof':
                return this.translateFromEnglish(normalizedText);
            default:
                return null;
        }
    }
    
    // Traduction du wolof vers français ou anglais
    translateFromWolof(text, targetLang) {
        // Recherche exacte d'abord
        for (const entry of dictionnaire) {
            if (entry.wolof.toLowerCase() === text) {
                return targetLang === 'fr' ? entry.francais : entry.anglais;
            }
        }
        
        // Recherche partielle
        for (const entry of dictionnaire) {
            if (entry.wolof.toLowerCase().includes(text) || text.includes(entry.wolof.toLowerCase())) {
                return targetLang === 'fr' ? entry.francais : entry.anglais;
            }
        }
        
        return null;
    }
    
    // Traduction du français vers wolof
    translateFromFrench(text) {
        // Recherche exacte d'abord
        for (const entry of dictionnaire) {
            if (entry.francais.toLowerCase() === text) {
                return entry.wolof;
            }
        }
        
        // Recherche partielle
        for (const entry of dictionnaire) {
            if (entry.francais.toLowerCase().includes(text) || text.includes(entry.francais.toLowerCase())) {
                return entry.wolof;
            }
        }
        
        return null;
    }
    
    // Traduction de l'anglais vers wolof
    translateFromEnglish(text) {
        // Recherche exacte d'abord
        for (const entry of dictionnaire) {
            if (entry.anglais.toLowerCase() === text) {
                return entry.wolof;
            }
        }
        
        // Recherche partielle
        for (const entry of dictionnaire) {
            if (entry.anglais.toLowerCase().includes(text) || text.includes(entry.anglais.toLowerCase())) {
                return entry.wolof;
            }
        }
        
        return null;
    }
    
    // Affichage du résultat
    showOutput(text) {
        const outputElement = document.getElementById('output-text');
        outputElement.textContent = text;
        outputElement.classList.add('fade-in');
        
        setTimeout(() => {
            outputElement.classList.remove('fade-in');
        }, 300);
    }
    
    // Autocomplétion et suggestions
    showSuggestions(input) {
        const suggestionsContainer = document.getElementById('suggestions');
        
        if (input.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        const direction = document.getElementById('direction').value;
        const suggestions = this.getSuggestions(input, direction);
        
        if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = '';
            suggestions.forEach(suggestion => {
                const suggestionElement = document.createElement('div');
                suggestionElement.classList.add('suggestion-item');
                suggestionElement.textContent = suggestion;
                suggestionElement.addEventListener('click', () => {
                    document.getElementById('input-text').value = suggestion;
                    suggestionsContainer.style.display = 'none';
                    this.translate();
                });
                suggestionsContainer.appendChild(suggestionElement);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }
    
    // Obtention des suggestions
    getSuggestions(input, direction) {
        const normalizedInput = input.toLowerCase();
        const suggestions = [];
        
        if (direction.startsWith('wolof')) {
            // Suggestions depuis le wolof
            for (const entry of dictionnaire) {
                if (entry.wolof.toLowerCase().includes(normalizedInput)) {
                    suggestions.push(entry.wolof);
                }
            }
        } else if (direction === 'fr-wolof') {
            // Suggestions depuis le français
            for (const entry of dictionnaire) {
                if (entry.francais.toLowerCase().includes(normalizedInput)) {
                    suggestions.push(entry.francais);
                }
            }
        } else if (direction === 'en-wolof') {
            // Suggestions depuis l'anglais
            for (const entry of dictionnaire) {
                if (entry.anglais.toLowerCase().includes(normalizedInput)) {
                    suggestions.push(entry.anglais);
                }
            }
        }
        
        return suggestions.slice(0, 5); // Limiter à 5 suggestions
    }
    
    // Ajout à l'historique
    addToHistory(input, output, direction) {
        const translation = {
            input,
            output,
            direction,
            timestamp: new Date().toISOString()
        };
        
        this.history.unshift(translation);
        
        // Limiter l'historique à 50 entrées
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.saveHistory();
        this.renderHistory();
    }
    
    // Sauvegarde de l'historique
    saveHistory() {
        localStorage.setItem('translationHistory', JSON.stringify(this.history));
    }
    
    // Affichage de l'historique
    renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        this.history.forEach((item, index) => {
            const historyItem = document.createElement('li');
            historyItem.classList.add('history-item', 'fade-in');
            
            const directionText = this.getDirectionText(item.direction);
            
            historyItem.innerHTML = `
                <div class="history-text">
                    <strong>${item.input}</strong> → ${item.output}
                    <span class="history-direction">${directionText}</span>
                </div>
                <div class="history-actions">
                    <button class="history-action-btn" data-index="${index}" data-action="reuse">Réutiliser</button>
                    <button class="history-action-btn" data-index="${index}" data-action="favorite">★</button>
                    <button class="history-action-btn" data-index="${index}" data-action="delete">×</button>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // Ajout des écouteurs d'événements pour les actions de l'historique
        document.querySelectorAll('.history-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const action = e.target.dataset.action;
                
                switch(action) {
                    case 'reuse':
                        this.reuseTranslation(index);
                        break;
                    case 'favorite':
                        this.addToFavoritesFromHistory(index);
                        break;
                    case 'delete':
                        this.deleteFromHistory(index);
                        break;
                }
            });
        });
    }
    
    // Réutilisation d'une traduction de l'historique
    reuseTranslation(index) {
        const item = this.history[index];
        document.getElementById('input-text').value = item.input;
        document.getElementById('direction').value = item.direction;
        this.translate();
    }
    
    // Suppression d'un élément de l'historique
    deleteFromHistory(index) {
        this.history.splice(index, 1);
        this.saveHistory();
        this.renderHistory();
    }
    
    // Ajout aux favoris depuis l'historique
    addToFavoritesFromHistory(index) {
        const item = this.history[index];
        this.favorites.unshift(item);
        
        // Limiter les favoris à 30 entrées
        if (this.favorites.length > 30) {
            this.favorites = this.favorites.slice(0, 30);
        }
        
        this.saveFavorites();
        this.renderFavorites();
        
        // Animation de confirmation
        const btn = document.querySelector(`[data-index="${index}"][data-action="favorite"]`);
        btn.textContent = '✓';
        btn.style.color = 'var(--jaune)';
        
        setTimeout(() => {
            btn.textContent = '★';
            btn.style.color = '';
        }, 1000);
    }
    
    // Ajout aux favoris depuis le bouton
    addToFavorites() {
        const inputText = document.getElementById('input-text').value.trim();
        const outputText = document.getElementById('output-text').innerText;
        const direction = document.getElementById('direction').value;
        
        if (!inputText || !outputText || outputText.includes("Désolé") || outputText.includes("Veuillez")) {
            return;
        }
        
        const favorite = {
            input: inputText,
            output: outputText,
            direction: direction,
            timestamp: new Date().toISOString()
        };
        
        this.favorites.unshift(favorite);
        
        // Limiter les favoris à 30 entrées
        if (this.favorites.length > 30) {
            this.favorites = this.favorites.slice(0, 30);
        }
        
        this.saveFavorites();
        this.renderFavorites();
        
        // Animation de confirmation
        const favoriteBtn = document.getElementById('favorite-btn');
        favoriteBtn.textContent = '✓ Ajouté';
        favoriteBtn.classList.add('pulse');
        
        setTimeout(() => {
            favoriteBtn.textContent = 'Favori';
            favoriteBtn.classList.remove('pulse');
        }, 1500);
    }
    
    // Sauvegarde des favoris
    saveFavorites() {
        localStorage.setItem('translationFavorites', JSON.stringify(this.favorites));
    }
    
    // Affichage des favoris
    renderFavorites() {
        const favoritesList = document.getElementById('favorites-list');
        favoritesList.innerHTML = '';
        
        this.favorites.forEach((item, index) => {
            const favoriteItem = document.createElement('li');
            favoriteItem.classList.add('history-item', 'fade-in');
            
            const directionText = this.getDirectionText(item.direction);
            
            favoriteItem.innerHTML = `
                <div class="history-text">
                    <strong>${item.input}</strong> → ${item.output}
                    <span class="history-direction">${directionText}</span>
                </div>
                <div class="history-actions">
                    <button class="history-action-btn" data-index="${index}" data-action="reuse-fav">Réutiliser</button>
                    <button class="history-action-btn" data-index="${index}" data-action="delete-fav">×</button>
                </div>
            `;
            
            favoritesList.appendChild(favoriteItem);
        });
        
        // Ajout des écouteurs d'événements pour les actions des favoris
        document.querySelectorAll('[data-action="reuse-fav"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.reuseFavorite(index);
            });
        });
        
        document.querySelectorAll('[data-action="delete-fav"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.deleteFromFavorites(index);
            });
        });
    }
    
    // Réutilisation d'un favori
    reuseFavorite(index) {
        const item = this.favorites[index];
        document.getElementById('input-text').value = item.input;
        document.getElementById('direction').value = item.direction;
        this.translate();
    }
    
    // Suppression d'un favori
    deleteFromFavorites(index) {
        this.favorites.splice(index, 1);
        this.saveFavorites();
        this.renderFavorites();
    }
    
    // Obtention du texte de direction
    getDirectionText(direction) {
        const directions = {
            'wolof-fr': 'Wolof → Français',
            'fr-wolof': 'Français → Wolof',
            'wolof-en': 'Wolof → Anglais',
            'en-wolof': 'Anglais → Wolof'
        };
        
        return directions[direction] || direction;
    }
    
    // Changement d'onglet
    switchTab(tabName) {
        // Désactiver tous les onglets
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Activer l'onglet sélectionné
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-content`).classList.add('active');
        
        // Initialiser le quiz si l'onglet quiz est sélectionné
        if (tabName === 'quiz' && !this.currentQuizQuestion) {
            this.nextQuizQuestion();
        }
    }
    
    // Configuration du quiz
    setupQuiz() {
        this.updateQuizStats();
    }
    
    // Question suivante du quiz
    nextQuizQuestion() {
        this.currentQuizQuestion = this.generateQuizQuestion();
        
        if (!this.currentQuizQuestion) {
            document.getElementById('quiz-question').textContent = "Pas assez de mots pour générer un quiz.";
            document.getElementById('quiz-options').innerHTML = '';
            return;
        }
        
        document.getElementById('quiz-question').textContent = `Comment dit-on "${this.currentQuizQuestion.question}" en ${this.currentQuizQuestion.targetLanguage === 'fr' ? 'français' : 'wolof'}?`;
        
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';
        
        this.currentQuizQuestion.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('quiz-option');
            optionElement.textContent = option;
            optionElement.dataset.index = index;
            
            optionElement.addEventListener('click', () => {
                this.checkQuizAnswer(index);
            });
            
            optionsContainer.appendChild(optionElement);
        });
    }
    
    // Génération d'une question de quiz
    generateQuizQuestion() {
        if (dictionnaire.length < 4) {
            return null;
        }
        
        // Choisir aléatoirement une direction (wolof-fr ou fr-wolof)
        const isWolofToFrench = Math.random() > 0.5;
        const targetLanguage = isWolofToFrench ? 'fr' : 'wolof';
        
        // Choisir un mot aléatoire comme question
        const randomIndex = Math.floor(Math.random() * dictionnaire.length);
        const correctEntry = dictionnaire[randomIndex];
        
        const question = isWolofToFrench ? correctEntry.wolof : correctEntry.francais;
        const correctAnswer = isWolofToFrench ? correctEntry.francais : correctEntry.wolof;
        
        // Générer des options incorrectes
        const incorrectOptions = [];
        while (incorrectOptions.length < 3) {
            const randomOptionIndex = Math.floor(Math.random() * dictionnaire.length);
            if (randomOptionIndex !== randomIndex) {
                const option = isWolofToFrench ? 
                    dictionnaire[randomOptionIndex].francais : 
                    dictionnaire[randomOptionIndex].wolof;
                
                if (!incorrectOptions.includes(option) && option !== correctAnswer) {
                    incorrectOptions.push(option);
                }
            }
        }
        
        // Mélanger les options
        const allOptions = [correctAnswer, ...incorrectOptions];
        this.shuffleArray(allOptions);
        
        return {
            question,
            correctAnswer,
            options: allOptions,
            targetLanguage
        };
    }
    
    // Vérification de la réponse du quiz
    checkQuizAnswer(selectedIndex) {
        if (!this.currentQuizQuestion) return;
        
        const selectedOption = this.currentQuizQuestion.options[selectedIndex];
        const isCorrect = selectedOption === this.currentQuizQuestion.correctAnswer;
        
        // Mettre à jour l'apparence des options
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((option, index) => {
            option.classList.remove('correct', 'incorrect');
            
            if (this.currentQuizQuestion.options[index] === this.currentQuizQuestion.correctAnswer) {
                option.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                option.classList.add('incorrect');
            }
            
            // Désactiver les clics après la réponse
            option.style.pointerEvents = 'none';
        });
        
        // Mettre à jour le score
        if (isCorrect) {
            this.quizScore += 10;
            this.quizStreak += 1;
        } else {
            this.quizStreak = 0;
        }
        
        this.updateQuizStats();
        this.saveQuizStats();
    }
    
    // Mise à jour des statistiques du quiz
    updateQuizStats() {
        document.getElementById('quiz-score').textContent = `Score: ${this.quizScore}`;
        document.getElementById('quiz-streak').textContent = `Série: ${this.quizStreak}`;
    }
    
    // Sauvegarde des statistiques du quiz
    saveQuizStats() {
        localStorage.setItem('quizScore', this.quizScore.toString());
        localStorage.setItem('quizStreak', this.quizStreak.toString());
    }
    
    // Mélange d'un tableau (algorithme de Fisher-Yates)
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Synthèse vocale
    speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Déterminer la langue en fonction du texte
            if (this.containsWolofCharacters(text)) {
                // Pour le wolof, essayer différentes langues
                utterance.lang = 'fr-FR'; // Fallback au français
            } else if (this.isFrenchText(text)) {
                utterance.lang = 'fr-FR';
            } else {
                utterance.lang = 'en-US';
            }
            
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        } else {
            alert("La synthèse vocale n'est pas supportée par votre navigateur.");
        }
    }
    
    // Vérification si le texte contient des caractères wolof
    containsWolofCharacters(text) {
        // Cette fonction vérifie la présence de caractères communs en wolof
        // Note: Cette implémentation est basique et pourrait être améliorée
        const wolofPattern = /[ñŋñÑŊ]/;
        return wolofPattern.test(text);
    }
    
    // Vérification si le texte est en français
    isFrenchText(text) {
        // Vérification basique basée sur des mots français courants
        const frenchWords = ['le', 'la', 'les', 'un', 'une', 'des', 'est', 'et', 'à', 'de'];
        return frenchWords.some(word => text.toLowerCase().includes(word));
    }
    
    // Copie dans le presse-papiers
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            const copyBtn = document.getElementById('copy-btn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copié!';
            copyBtn.classList.add('pulse');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('pulse');
            }, 1500);
        }).catch(err => {
            console.error('Erreur lors de la copie: ', err);
        });
    }
}

// Initialisation de l'application lorsque la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new TraducteurWolof();
});
