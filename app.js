import { animalData, questions } from './data.js';
import * as framerMotion from './assets/js/framer_motion.js';

const { animate } = framerMotion;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    const state = {
        currentQuestionIndex: 0,
        scores: {},
    };

    const dom = {
        appContainer: document.getElementById('app-container'),
        homePage: document.getElementById('home-page'),
        quizPage: document.getElementById('quiz-page'),
        resultPage: document.getElementById('result-page'),
        startBtn: document.getElementById('start-btn'),
        quizContainer: document.getElementById('quiz-container'),
        questionCard: document.getElementById('question-card'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        progressBar: document.getElementById('progress-bar'),
        questionCounter: document.getElementById('question-counter'),
        resultImage: document.getElementById('result-image'),
        resultName: document.getElementById('result-name'),
        resultTitle: document.getElementById('result-title'),
        resultDescription: document.getElementById('result-description'),
        resultGuide: document.getElementById('result-guide'),
        shareBtn: document.getElementById('share-btn'),
        shareBtnText: document.getElementById('share-btn-text'),
        retakeBtn: document.getElementById('retake-btn'),
        darkModeToggle: document.getElementById('dark-mode-toggle'),
    };

    const init = () => {
        setupEventListeners();
        handleUrlParams();
        initDarkMode();
        animate(dom.homePage, { opacity: [0, 1], y: [20, 0] }, { duration: 0.5 });
    };

    const setupEventListeners = () => {
        dom.startBtn.addEventListener('click', startQuiz);
        dom.retakeBtn.addEventListener('click', retakeQuiz);
        dom.shareBtn.addEventListener('click', shareResult);
        dom.darkModeToggle.addEventListener('click', toggleDarkMode);
    };

    const handleUrlParams = () => {
        const params = new URLSearchParams(window.location.search);
        const resultId = params.get('result');
        if (resultId && animalData[resultId]) {
            showResult(resultId);
        } else {
            showPage(dom.homePage);
        }
    };
    
    const showPage = async (pageToShow) => {
        const pages = [dom.homePage, dom.quizPage, dom.resultPage];
        for (const page of pages) {
            if (page !== pageToShow) {
                if (!page.classList.contains('hidden')) {
                    await animate(page, { opacity: 0 }, { duration: 0.3 });
                    page.classList.add('hidden');
                }
            }
        }
        pageToShow.classList.remove('hidden');
        await animate(pageToShow, { opacity: [0, 1] }, { duration: 0.5 });
        window.scrollTo(0, 0);
    };

    const startQuiz = async () => {
        state.currentQuestionIndex = 0;
        state.scores = Object.keys(animalData).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
        await showPage(dom.quizPage);
        animate(dom.quizContainer, { opacity: [0, 1], y: [20, 0] }, { duration: 0.5, delay: 0.2 });
        showQuestion();
    };

    const retakeQuiz = () => {
        history.pushState(null, '', window.location.pathname);
        showPage(dom.homePage);
        animate(dom.homePage.querySelector('.home-content'), { opacity: [0, 1], y: [20, 0] }, { duration: 0.5, delay: 0.2 });
    };

    const showQuestion = async () => {
        await animate(dom.questionCard, { opacity: 0, scale: 0.95 }, { duration: 0.2 });
        
        const question = questions[state.currentQuestionIndex];
        dom.questionText.textContent = question.text;
        dom.optionsContainer.innerHTML = '';
        
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option.text;
            button.addEventListener('click', () => selectOption(option.scores));
            dom.optionsContainer.appendChild(button);
        });

        updateProgress();
        animate(dom.questionCard, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.4, ease: "easeOut" });
    };

    const selectOption = (scoresToAdd) => {
        for (const animal in scoresToAdd) {
            state.scores[animal] += scoresToAdd[animal];
        }

        state.currentQuestionIndex++;

        if (state.currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            finishQuiz();
        }
    };

    const updateProgress = () => {
        const progress = ((state.currentQuestionIndex) / questions.length) * 100;
        dom.progressBar.style.width = `${progress}%`;
        dom.questionCounter.textContent = `第 ${state.currentQuestionIndex + 1} / ${questions.length} 题`;
    };

    const finishQuiz = async () => {
        const finalResultId = calculateResult();
        await showResult(finalResultId);
        history.pushState({ result: finalResultId }, `Result: ${finalResultId}`, `?result=${finalResultId}`);
    };
    
    const calculateResult = () => {
        return Object.entries(state.scores).reduce((a, b) => a[1] > b[1] ? a : b, [null, -Infinity])[0] || 'leftover_bits';
    };

    const showResult = async (animalId) => {
        const result = animalData[animalId];
        if (!result) return;
        
        dom.resultImage.src = result.image;
        dom.resultImage.alt = result.name;
        dom.resultImage.loading = 'lazy';
        dom.resultImage.decoding = 'async';
        dom.resultName.textContent = result.name;
        dom.resultTitle.textContent = result.title;
        dom.resultDescription.innerHTML = result.description;
        dom.resultGuide.innerHTML = result.guide;

        await showPage(dom.resultPage);
        animate(document.getElementById('result-card'), { opacity: [0, 1], y: [20, 0] }, { duration: 0.6, delay: 0.2 });
    };

    const shareResult = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            const originalText = dom.shareBtnText.textContent;
            dom.shareBtnText.textContent = '链接已复制!';
            dom.shareBtn.classList.add('copied');
            
            setTimeout(() => {
                dom.shareBtnText.textContent = originalText;
                dom.shareBtn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('分享失败，请手动复制链接。');
        });
    };

    const initDarkMode = () => {
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        lucide.createIcons(); 
    };

    const toggleDarkMode = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        lucide.createIcons();
    };

    init();
});
