import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="container py-4" style={{ maxWidth: 900 }}>
        <div className="alert alert-danger" role="alert">
          Что-то пошло не так. Обновите страницу и попробуйте снова.
        </div>
      </div>
    );
  }
}
