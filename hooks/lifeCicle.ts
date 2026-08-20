import { useEffect, useRef } from "react";

export function useMountEffect(callback: () => void): void {
    const isMounted = useRef<boolean>(false);

    useEffect(() => {
        if (!isMounted.current) {
            callback();
            isMounted.current = true;
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useUpdateEffect(callback: () => void, dependencies: React.DependencyList): void {
    const isFirstRender = useRef<boolean>(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
        } else {
            callback();
        }
    }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
}
