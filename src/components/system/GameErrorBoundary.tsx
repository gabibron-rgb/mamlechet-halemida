import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  errorMessage: string | null;
};

export default class GameErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      errorMessage:
        error instanceof Error ? error.message : 'אירעה שגיאה לא צפויה.',
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('GameErrorBoundary caught an error:', error, info);
  }

  private reloadGame = () => {
    window.location.reload();
  };

  private returnToLogin = () => {
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main
        dir="rtl"
        className="min-h-screen bg-magic-bg px-6 py-12 text-white"
      >
        <section className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-300/20 bg-magic-panel/90 p-7 text-center shadow-2xl">
            <div className="mb-4 text-5xl">🛠️</div>

            <h1 className="text-2xl font-black text-magic-accent">
              משהו השתבש בממלכה
            </h1>

            <p className="mt-3 text-sm leading-6 text-magic-soft/80">
              המשחק נתקל בשגיאה לא צפויה. הנתונים שלך לא נמחקו.
              אפשר לרענן את המשחק או לחזור למסך הכניסה ולנסות שוב.
            </p>

            {import.meta.env.DEV && this.state.errorMessage && (
              <pre
                dir="ltr"
                className="mt-5 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-red-300/15 bg-black/25 p-3 text-left text-xs text-red-100"
              >
                {this.state.errorMessage}
              </pre>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.reloadGame}
                className="rounded-xl bg-yellow-400 px-5 py-2.5 font-black text-indigo-950 hover:bg-yellow-300"
              >
                🔄 רענן את המשחק
              </button>

              <button
                type="button"
                onClick={this.returnToLogin}
                className="rounded-xl border border-white/10 bg-white/10 px-5 py-2.5 font-bold text-white hover:bg-white/15"
              >
                🏰 חזרה למסך הכניסה
              </button>
            </div>

            <p className="mt-5 text-xs text-magic-soft/50">
              אם השגיאה חוזרת, כדאי לסגור את הלשונית ולפתוח את המשחק מחדש.
            </p>
          </div>
        </section>
      </main>
    );
  }
}
