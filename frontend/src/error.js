// error component, used for error handling in case front end breaks
import { useEffect, useContext } from 'react';
import { SocketContext } from './SocketContext.js';

function ErrorBoundary({ children }) {
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleReactError = (error, errorInfo) => {
      // sends error information to backend
      const errorMessage = {
        type: 'error',
        message: error.message,
        stackTrace: errorInfo.componentStack,
      };
      if (errorMessage) {
        socket.emit('error', errorMessage);
      }
    };

    // Attach the error handler to the window's error event
    const handleErrorEvent = (event) => {
      handleReactError(event.error, { componentStack: '' });
    };
    window.addEventListener('error', handleErrorEvent);

    // Clean up the error handler on component unmount
    return () => {
      window.removeEventListener('error', handleErrorEvent);
    };
  }, [socket]);

  return children;
}

export default ErrorBoundary;
