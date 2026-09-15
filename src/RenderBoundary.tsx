import { Component, type ReactNode } from 'react';

export class RenderBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() {
    if (this.state.failed) return <div className="state" role="alert"><p>We couldn’t open this workspace. Reload to try again.</p><button className="button secondary" onClick={() => window.location.reload()}>Reload</button></div>;
    return this.props.children;
  }
}
