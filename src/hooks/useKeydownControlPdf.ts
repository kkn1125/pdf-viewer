import { useEffect } from "react";

const useKeydownControlPdf = (mapper: Record<KeyboardEvent["key"], any>) => {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const key = e.key;
      const feature = mapper[key];
      feature?.();
    };
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [mapper]);
};

export default useKeydownControlPdf;
