import { useEffect, useState } from "react";
import { pdfMapper } from "./common/pdfMapper";
import PDFViewer from "./components/moleculars/PDFViewer";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PDFItem from "./components/moleculars/PDFItem";

// import * as pdfjs from "pdfjs-dist";
//@ts-ignore
// import workerSrc from "pdfjs-dist/build/pdf.worker.mjs";

function App() {
  const [visible, setVisible] = useState(false);
  function handleToggle() {
    setVisible((visible) => !visible);
  }
  function handleClose() {
    setVisible(() => false);
  }
  useEffect(() => {
    function handleExit(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (visible) {
          handleClose();
        }
      }
    }
    window.addEventListener("keydown", handleExit);
    return () => {
      window.removeEventListener("keydown", handleExit);
    };
  });
  return (
    <Stack height='inherit' component={Container}>
      <Typography component='h3' variant='h3' align='center' fontWeight={700}>
        PDF Viewer
      </Typography>
      <Stack direction='row' flexWrap='wrap' gap={2}>
        {pdfMapper.map(({ name, img, pdf }) => (
          <PDFItem key={name} img={img} name={name} filename={pdf} />
        ))}
      </Stack>
    </Stack>
  );
}

export default App;
