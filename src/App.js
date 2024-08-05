import './App.css';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import {
  FileCodeIcon,
  MarkGithubIcon,
  HomeIcon
} from "@primer/octicons-react";
import React, {useEffect, useRef, useState} from "react";
import {
  Box,
  createTheme,
  CssBaseline,
  FormControlLabel,
  ImageListItem,
  Link,
  Radio,
  RadioGroup,
  Stack,
  ThemeProvider, Tooltip
} from "@mui/material";
import ClipboardJS from "clipboard";
import {SnackbarProvider, useSnackbar} from "notistack";

const METADATA = "https://raw.githubusercontent.com/xsalazar/fluent-emoji/main/src/Components/metadata.json";

const getRandomBackgroundColor = () => {
  const partyColors = [
    "#FF6B6B",
    "#FF6BB5",
    "#FF81FF",
    "#D081FF",
    "#81ACFF",
    "#81FFFF",
    "#81FF81",
    "#FFD081",
    "#FF8181",
  ];
  return partyColors[Math.floor(Math.random() * partyColors.length)];
}

const Header = () => {
  return (
    <header>
      <img
        style={{marginTop: 20}}
        src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Convenience store/3D/convenience_store_3d.png"
        alt="Alien" width="30" height="30"/>
      <h2 style={{marginTop: 0}}>
        Fluent Emoji Mart
      </h2>
    </header>
  )
}

const FluentEmojiPicker = () => {
  const {enqueueSnackbar} = useSnackbar();

  const [metaData, setMetaData] = useState([]);
  const [emojiURLs, setEmojiURLs] = useState([]);

  const [copyMode, setCopyMode] = useState("Markdown");

  const nativeCopyRef = useRef();
  const [nativeEmoji, setNativeEmoji] = useState(null);

  useEffect(() => {
    console.log(METADATA);
    fetch(METADATA)
      .then(res => res.json())
      .then(data => setMetaData(data));
  }, []);

  useEffect(() => {
    const clipboard = new ClipboardJS(".emoji-item");
    clipboard.on('success', (e) => {
      if (e.text.length > 2) {
        enqueueSnackbar('Copied', { variant: "success", autoHideDuration: 1000 ,anchorOrigin: { vertical : "top", horizontal: "center" } });
      }
      e.clearSelection();
    });

    clipboard.on('error', (e) => {
      console.error('Action:', e.action);
      console.error('Trigger:', e.trigger);
      enqueueSnackbar('Fail', { variant: "error", anchorOrigin: { vertical : "top", horizontal: "center" } });
    });

    return () => {
      clipboard.destroy();
    };
  }, [enqueueSnackbar]);

  useEffect(() => {
    nativeCopyRef.current?.click();
  }, [nativeEmoji]);

  const findEmoji = (pickerSelected) => {
    setNativeEmoji(() => pickerSelected.native)
    console.log("Selected: ", pickerSelected)
    /**
     * 1 Default
     * 2 Light
     * 3 MediumLight
     * 4 Medium
     * 5 MediumDark
     * 6 Dark
     */
    let hasSkin = pickerSelected.skin;

    let mode;
    if (hasSkin) {
      switch (pickerSelected.skin) {
        case 1: mode = "Default"; break;
        case 2: mode = "Light"; break;
        case 3: mode = "MediumLight"; break;
        case 4: mode = "Medium"; break;
        case 5: mode = "MediumDark"; break;
        case 6: mode = "Dark"; break;
        default: {}
      }
    }

    const URLs = [];

    let fluentEmoji = metaData[pickerSelected.name];
    if (!fluentEmoji) {
      for (const key in metaData) {
        if (metaData[key].cldr === pickerSelected.name.toLowerCase() || metaData[key].glyph === pickerSelected.native) {
          fluentEmoji = metaData[key];
          break;
        }
      }
    }

    if (fluentEmoji) {
      let imagesObj = hasSkin && fluentEmoji["skintones"] ? fluentEmoji["skintones"][mode] : fluentEmoji["styles"];
      for (let k in imagesObj) {
        URLs.push(
          imagesObj[k]
        );
      }
    }

    console.log("Fluent: ", fluentEmoji);
    console.log("\n");
    setEmojiURLs(URLs)
  }

  const handleCopyURL = (url) => {
    if (copyMode === "Markdown") {
      return `<img src="${url}" alt="Alien" width="25" height="25" />`
    }
    return url;
  }

  return (
    <div className="flex flex-center" style={{
      justifyContent: "center",
      display: "flex"
    }}>
      <div>
        <Header/>
        <Picker
          data={data}
          onEmojiSelect={i => {
            setEmojiURLs(pre => []);
            findEmoji(i);
          }}/>
        <footer>
          <h1>
            <RadioGroup
              row
              value={copyMode}
              onChange={event => setCopyMode(event.target.value)}
              style={{padding: "0 12px"}}
            >
              <FormControlLabel value="Markdown" control={<Radio/>} label="Markdown"/>
              <FormControlLabel value="Raw" control={<Radio/>} label="Raw"/>
            </RadioGroup>
          </h1>
          <button className={"emoji-item"} ref={nativeCopyRef} data-clipboard-text={nativeEmoji} style={{ display: "none" }}></button>
          {emojiURLs &&
            <div
              className="container"
              style={{
                display: "grid",
                placeItems: "center",
                gridAutoFlow: "column",
                backgroundColor: "#151618",
                padding: 10,
                borderRadius: 10,
                minHeight: 100,
              }}>
              {emojiURLs.length === 0 && <p style={{ color: "#9f9f9f" }}>Not found</p>}
              {emojiURLs.map((url) => (
                <ImageListItem
                  key={url}
                  className={"emoji-item"}
                  data-clipboard-text={handleCopyURL(url)}
                  sx={{
                    width: 80,
                    borderRadius: 2,
                    padding: 0.25,
                    "&:hover": {
                      backgroundColor: () => getRandomBackgroundColor(),
                    },
                  }}
                >
                  <img
                    loading="lazy"
                    width="32px"
                    height="32px"
                    src={url}
                    alt={url}
                  />
                </ImageListItem>
              ))}
            </div>
          }
          <Box component="footer" sx={{ py: 4 }}>
            <Stack spacing={4} direction="row" justifyContent="center">
              <Tooltip title="Home Pages">
                <Link
                  href="https://zqskate.com"
                  color="textPrimary"
                  aria-label="Home Pages"
                  target="_blank"
                  rel="noopener"
                >
                  <HomeIcon size="small" verticalAlign="middle" />
                </Link>
              </Tooltip>
              <Tooltip title="GitHub">
                <Link
                  href="https://github.com/HttpStatusOK"
                  color="textPrimary"
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener"
                >
                  <MarkGithubIcon size="small" verticalAlign="middle" />
                </Link>
              </Tooltip>
              <Tooltip title="Source Code">
                <Link
                  href="https://github.com/HttpStatusOK/fluent-emoji-mart"
                  color="textPrimary"
                  aria-label="Source Code"
                  target="_blank"
                  rel="noopener"
                >
                  <FileCodeIcon size="small" verticalAlign="middle" />
                </Link>
              </Tooltip>
            </Stack>
          </Box>
        </footer>
      </div>
    </div>
  )
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const App = () => {

  return (
    <div className="App">
      <ThemeProvider theme={darkTheme}>
        <CssBaseline/>
        <SnackbarProvider maxSnack={1}>
          <FluentEmojiPicker/>
        </SnackbarProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
