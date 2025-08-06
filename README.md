# ChessMate AI ♟️

Welcome to ChessMate AI, a modern and interactive chess application where you can test your skills against a powerful generative AI opponent. Built with a cutting-edge tech stack, this project showcases the power of Next.js for web development and Google's GenAI for creating intelligent, human-like opponents.

![ChessMate AI Screenshot](https://placehold.co/800x450.png?text=ChessMate+AI)
*A screenshot of the ChessMate AI application in action.*

---

## ✨ Key Features

- **Interactive Chessboard:** A smooth, responsive chessboard with drag-and-drop and tap-to-move functionality for a seamless user experience on both desktop and mobile.
- **Adjustable AI Difficulty:** Choose from three difficulty levels (Beginner, Intermediate, Advanced) to match your skill.
- **Intelligent AI Opponent:** Powered by Google's generative AI, the opponent doesn't just calculate moves; it analyzes the board strategically, making for a challenging and human-like game.
- **Focus Mode:** Minimize distractions and immerse yourself in the game with a clean, focused interface.
- **Sleek, Modern UI:** Built with ShadCN UI components and Tailwind CSS for a polished and professional look and feel.
- **Visual Feedback:** The last move is highlighted with a neon glow, making it easy to follow the game's progression.

---

## 🚀 Tech Stack

This project is built with a modern, full-stack JavaScript architecture:

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Generative AI:** [Google Genkit](https://firebase.google.com/docs/genkit)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Chess Logic:** [Chess.js](https://github.com/jhlywa/chess.js)

---

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/your-repository-name.git
    cd your-repository-name
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project and add your Google AI API key:
    ```env
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```

### Running the Application

1.  **Start the Genkit developer server:**
    Open a terminal and run:
    ```sh
    npm run genkit:dev
    ```
    This will start the Genkit server that the Next.js app communicates with.

2.  **Start the Next.js development server:**
    In a second terminal, run:
    ```sh
    npm run dev
    ```

3.  Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

---

## 🤖 The AI Opponent

The AI opponent in ChessMate AI is powered by a large language model through Google's Genkit. The prompt is carefully engineered to make the AI evaluate the board based on strategic principles like material advantage, positional control, and king safety. This creates a more dynamic and less predictable opponent than traditional chess engines.
