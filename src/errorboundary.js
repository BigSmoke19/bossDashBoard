import { useState, useEffect } from "react";

const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false); // Reset on re-render
    }, [children]);

    if (hasError) {
        return <div>Error occurred. Try reloading.</div>;
    }

    return children;
};

export default ErrorBoundary;
