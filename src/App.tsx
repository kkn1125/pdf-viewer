import { useEffect, useState } from "react";
import { pdfMapper } from "./common/pdfMapper";
import PDFViewer from "./components/moleculars/PDFViewer";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";

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
      <Typography component="h3" variant="h3" align="center" fontWeight={700}>PDF Viewer</Typography>
      {pdfMapper.map(([name, img, filename]) => (
        <Stack key={name} direction='row'>
          <Paper component={Stack} p={2} gap={2}>
            <Box
              component='img'
              src={img}
              alt={name}
              width={200}
              sx={{ border: "1px solid #56565626", borderRadius: 1 }}
            />
            <Button
              variant='contained'
              color='warning'
              onClick={handleToggle}
              sx={{ fontSize: 16 }}>
              상세보기
            </Button>
            {visible && (
              <PDFViewer filename={filename} handleClose={handleClose} />
            )}
          </Paper>
        </Stack>
      ))}
    </Stack>
  );
}

export default App;
