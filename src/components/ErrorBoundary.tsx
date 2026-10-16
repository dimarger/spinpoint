import { Component, type ReactNode } from 'react';
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="empty-state">
          <h1>Не вдалося відкрити сторінку</h1>
          <p>Оновіть сторінку. Якщо проблема повторюється, спробуйте інший браузер.</p>
          <button className="button primary" onClick={() => location.reload()}>
            Оновити
          </button>
        </main>
      );
    return this.props.children;
  }
}
