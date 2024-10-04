import { useEffect } from "react";

const useScrollControlPdf = (mapper: Record<"up" | "down", any>) => {
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        mapper.up?.();
      } else {
        mapper.down?.();
      }

      const target = e.target as HTMLDivElement;
      const parent = target.parentElement;

      parent?.scrollTo({ behavior: "auto", top: e.layerY, left: e.layerX });
    };
    window.addEventListener("wheel", handleScroll);
    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, [mapper]);
};

export default useScrollControlPdf;
