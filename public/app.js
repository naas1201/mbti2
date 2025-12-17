// MBTI Type Descriptions
const mbtiDescriptions = {
  INTJ: "The Architect - Strategic, analytical, and independent. You see the big picture and create long-term plans to achieve your vision.",
  INTP: "The Logician - Innovative, curious, and theoretical. You love exploring ideas and understanding how systems work.",
  ENTJ: "The Commander - Bold, strategic, and confident. You're a natural leader who enjoys organizing people and resources.",
  ENTP: "The Debater - Quick-witted, clever, and original. You love intellectual challenges and testing new ideas.",
  INFJ: "The Advocate - Idealistic, compassionate, and insightful. You're driven by deep values and a vision for a better world.",
  INFP: "The Mediator - Empathetic, creative, and authentic. You seek meaning and stay true to your values.",
  ENFJ: "The Protagonist - Charismatic, inspiring, and altruistic. You naturally bring out the best in others.",
  ENFP: "The Campaigner - Enthusiastic, creative, and sociable. You see life as full of possibilities and connections.",
  ISTJ: "The Logistician - Practical, reliable, and detail-oriented. You value structure and follow through on commitments.",
  ISFJ: "The Defender - Warm, dedicated, and meticulous. You protect and care for the people and traditions you value.",
  ESTJ: "The Executive - Organized, strong-willed, and traditional. You create order and ensure things get done right.",
  ESFJ: "The Consul - Caring, social, and dutiful. You create harmony and take care of your community.",
  ISTP: "The Virtuoso - Bold, practical, and experimental. You're a master of tools and understand how things work.",
  ISFP: "The Adventurer - Flexible, spontaneous, and artistic. You live in the moment and express yourself creatively.",
  ESTP: "The Entrepreneur - Energetic, perceptive, and action-oriented. You dive into life and make things happen.",
  ESFP: "The Entertainer - Spontaneous, enthusiastic, and playful. You bring joy and excitement wherever you go.",
};

// Initialize Clerk
const CLERK_PUBLISHABLE_KEY =
  "pk_test_cmVuZXdlZC1zZXJ2YWwtMTAuY2xlcmsuYWNjb3VudHMuZGV2JA";
let clerk;
let isClerkReady = false;

async function initializeClerk() {
  try {
    if (window.Clerk) {
      clerk = new window.Clerk(CLERK_PUBLISHABLE_KEY);
      await clerk.load();
      isClerkReady = true;
      console.log("Clerk initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize Clerk:", error);
  }
}

// Initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeClerk);
} else {
  initializeClerk();
}

function mbtiApp() {
  return {
    testStarted: false,
    testCompleted: false,
    currentQuestion: 0,
    answers: [],
    questions: [],
    result: null,
    resultMessage: "",
    resultDescription: "",
    loading: false,
    error: null,
    isAuthenticated: false,
    showSavePrompt: false,

    async init() {
      // Wait for Clerk to be ready
      const checkClerk = setInterval(() => {
        if (isClerkReady && clerk) {
          clearInterval(checkClerk);
          this.checkAuthStatus();

          // Listen for auth changes
          clerk.addListener((state) => {
            this.isAuthenticated = !!state.user;
          });
        }
      }, 100);

      // Fetch questions from API
      await this.loadQuestions();
    },

    async loadQuestions() {
      try {
        const response = await fetch("/api/questions");
        if (!response.ok) {
          throw new Error("Failed to load questions");
        }
        const data = await response.json();
        this.questions = data.questions;
      } catch (error) {
        console.error("Failed to load questions:", error);
        this.error = "Failed to load questions. Please refresh the page.";
      }
    },

    checkAuthStatus() {
      if (clerk && clerk.user) {
        this.isAuthenticated = true;
      }
    },

    async signIn() {
      if (clerk) {
        try {
          await clerk.openSignIn();
        } catch (error) {
          console.error("Sign in error:", error);
        }
      }
    },

    async signOut() {
      if (clerk) {
        try {
          await clerk.signOut();
          this.isAuthenticated = false;
        } catch (error) {
          console.error("Sign out error:", error);
        }
      }
    },

    startTest() {
      this.testStarted = true;
      this.testCompleted = false;
      this.currentQuestion = 0;
      this.answers = new Array(this.questions.length).fill(null);
      this.result = null;
      this.error = null;
      this.showSavePrompt = false;
    },

    selectAnswer(value) {
      this.answers[this.currentQuestion] = value;

      // Auto-advance to next question after a brief delay
      setTimeout(() => {
        if (this.currentQuestion < this.questions.length - 1) {
          this.currentQuestion++;
        } else {
          // All questions answered, submit test
          this.submitTest();
        }
      }, 200);
    },

    previousQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--;
      }
    },

    getAnswerLabel(value) {
      const labels = {
        1: "Strongly Disagree",
        2: "Disagree",
        3: "Neutral",
        4: "Agree",
        5: "Strongly Agree",
      };
      return labels[value];
    },

    async submitTest() {
      this.testCompleted = true;
      this.loading = true;
      this.error = null;

      // Check if all answers are filled
      if (this.answers.some((answer) => answer === null)) {
        this.error = "Please answer all questions";
        this.loading = false;
        return;
      }

      try {
        let token = null;

        // Get auth token if user is signed in
        if (clerk && clerk.session) {
          token = await clerk.session.getToken();
        }

        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch("/api/submit-test", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ answers: this.answers }),
        });

        const data = await response.json();

        if (!response.ok) {
          // If 401 and not authenticated, calculate locally and show save prompt
          if (response.status === 401 && !this.isAuthenticated) {
            this.calculateLocalResult();
            this.showSavePrompt = true;
            this.loading = false;
            return;
          }
          throw new Error(data.error || "Failed to submit test");
        }

        this.result = data.mbtiType;
        this.resultMessage = data.message;
        this.resultDescription = mbtiDescriptions[data.mbtiType] || "";
        this.showSavePrompt = false;
      } catch (error) {
        console.error("Error submitting test:", error);

        // If submission failed but we have answers, calculate locally
        if (!this.isAuthenticated) {
          this.calculateLocalResult();
          this.showSavePrompt = true;
        } else {
          this.error = "Failed to submit your test. Please try again.";
        }
      } finally {
        this.loading = false;
      }
    },

    calculateLocalResult() {
      // Client-side calculation for non-authenticated users
      const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };

      this.answers.forEach((answer, index) => {
        const question = this.questions[index];
        const normalizedScore = (answer - 3) * question.weight;
        scores[question.dimension] += normalizedScore;
      });

      const type = [
        scores.EI >= 0 ? "E" : "I",
        scores.SN >= 0 ? "N" : "S",
        scores.TF >= 0 ? "T" : "F",
        scores.JP >= 0 ? "J" : "P",
      ].join("");

      this.result = type;
      this.resultMessage = `Your personality type is ${type}`;
      this.resultDescription = mbtiDescriptions[type] || "";
    },

    async saveResult() {
      if (!this.isAuthenticated) {
        await this.signIn();
        // After sign in, resubmit
        setTimeout(() => {
          if (this.isAuthenticated) {
            this.submitTest();
          }
        }, 1000);
      }
    },

    resetTest() {
      this.testStarted = false;
      this.testCompleted = false;
      this.currentQuestion = 0;
      this.answers = [];
      this.result = null;
      this.resultMessage = "";
      this.resultDescription = "";
      this.error = null;
      this.loading = false;
      this.showSavePrompt = false;
    },
  };
}

// Make it globally available
window.mbtiApp = mbtiApp;
