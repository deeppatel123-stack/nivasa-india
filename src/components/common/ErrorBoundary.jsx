import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
export class ErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error('Nivasa UI error:', error, info);
    }
    render() {
        if (!this.state.hasError)
            return this.props.children;
        return (<div className="grid min-h-screen place-items-center bg-canvas px-4">
        <div className="card max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-600" aria-hidden/>
          <h1 className="mt-4 font-display text-xl font-bold text-ink-950">Something went wrong</h1>
          <p className="mt-2 text-sm text-ink-500">The page could not be displayed. Reload to try again.</p>
          <Button className="mt-5" leftIcon={<RotateCcw className="h-4 w-4"/>} onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      </div>);
    }
}
