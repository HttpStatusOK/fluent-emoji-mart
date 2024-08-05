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
  TextField,
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

  const [copyMode, setCopyMode] = useState(localStorage.getItem("copyMode") || "Markdown");
  const [copyWidth, setCopyWidth] = useState(localStorage.getItem("copyWidth") ? Number(localStorage.getItem("copyWidth")) : 25);

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
      if (e.text.length > 50) {
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
    if (nativeEmoji) {
      nativeCopyRef.current?.click();
    }
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
    let suffix = "";
    if (hasSkin) {
      switch (pickerSelected.skin) {
        case 1: mode = "Default"; suffix = ""; break;
        case 2: mode = "Light"; suffix = " Light Skin Tone"; break;
        case 3: mode = "MediumLight"; suffix = " Medium-Light Skin Tone"; break;
        case 4: mode = "Medium"; suffix = " Medium Skin Tone"; break;
        case 5: mode = "MediumDark"; suffix = " Medium-Dark Skin Tone"; break;
        case 6: mode = "Dark"; suffix = " Dark Skin Tone"; break;
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
      handleAnimatedEmoji(pickerSelected, fluentEmoji, suffix);
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

  const handleAnimatedEmoji = (pickerSelected, fluentEmoji, suffix) => {
    let animatedGroup;
    switch (fluentEmoji.group) {
      case "Smileys & Emotion": animatedGroup = "Smilies"; break;
      case "People & Body": animatedGroup = "Hand gestures"; break;
      case "Animals & Nature": animatedGroup = "Animals"; break;
      case "Food & Drink": animatedGroup = "Food"; break;
      case "Travel & Places": animatedGroup = "Travel and places"; break;
      default: animatedGroup = fluentEmoji.group;
    }
    let fileName = (pickerSelected.name + suffix).replaceAll(" ", "%20");
    animatedGroup = animatedGroup?.replaceAll(" ", "%20")
    let url = `https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/${animatedGroup}/${fileName}.png`;
    fetch(url)
      .then(res => {
        if (res.ok) {
          addAnimatedURL(url);
        } else if (fluentEmoji.group === "People & Body") {
          animatedGroup = "People%20with%20professions";
          url = `https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/${animatedGroup}/${fileName}.png`
          fetch(url)
            .then(res => {
              if (res.ok) {
                addAnimatedURL(url);
              }
            })
        }
      })
      .catch(err => {});
  }

  const addAnimatedURL = (successURL) => {
    setEmojiURLs(pre => {
      let temp = [...pre];
      if (temp.length < 3) {
        temp.push(successURL);
      } else {
        temp[3] = successURL;
      }
      return temp;
    });
  }

  const handleCopyURL = (url) => {
    if (copyMode === "Markdown") {
      return `<img src="${url}" alt="Alien" width="${copyWidth}" height="${copyWidth}" />`
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
          theme="dark"
          data={data}
          onEmojiSelect={i => {
            setEmojiURLs(pre => []);
            findEmoji(i);
          }}/>
        <footer>
          <h1>
            <Box component="footer" >
              <Stack spacing={4} direction="row" justifyContent="center">
                <RadioGroup
                  row
                  value={copyMode}
                  onChange={event => {
                    setCopyMode(event.target.value);
                    localStorage.setItem("copyMode", event.target.value);
                  }}
                  // style={{ padding: "0 12px", textAlign: "right" }}
                >
                  <FormControlLabel value="Markdown" control={<Radio size="small"/>} label="Markdown"/>
                  <FormControlLabel value="Raw" control={<Radio size="small"/>} label="Raw"/>
                </RadioGroup>
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Width"
                  variant="outlined"
                  type="number"
                  style={{ width: 100 }}
                  value={copyWidth}
                  onChange={e => {
                    setCopyWidth(Number(e.target.value));
                    localStorage.setItem("copyWidth", e.target.value);
                  }}/>
              </Stack>
            </Box>
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
                minHeight: 100
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
