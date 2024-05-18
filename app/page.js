"use client"
import { useEffect , useState} from "react";
import mqtt from "mqtt";
import { MdHighlight } from "react-icons/md";
import { TbTemperature } from "react-icons/tb";
import { WiHumidity } from "react-icons/wi";
import { GiComputerFan } from "react-icons/gi";
import { GiTheaterCurtains } from "react-icons/gi";
import { MdWbTwighlight } from "react-icons/md";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import Slider from "@mui/material/Slider";
import * as React from "react";

export default function Home() {
  const [client, setClient] = useState(null);
  const [sensorData,setSensorData] = useState()
  const [stateData,setStateData] = useState()
  const [fanRule,setFanRule]=useState()
  const [lightRule, setLightRule] = useState();
  const [curtainRule,setCurtainRule] = useState();

  console.log("Fan rule: ",fanRule);
  useEffect(() => {
    const client = mqtt.connect('wss://test.mosquitto.org:8081');
    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      client.subscribe('gsu_baris_enes_sensor', (err) => {
        if (!err) {
          console.log('Subscribed to gsu_baris_enes_sensor');
        }
      });
      client.subscribe("gsu_baris_enes_status", (err) => {
        if (!err) {
          console.log("Subscribed to gsu_baris_enes_status");
        }
      });
      // // Publish to topics
      // client.publish('gsu_baris_enes_rule', 'Your rule message');
    });

    client.on('message', (topic, message) => {
      console.log(`Topic: ${topic}, Message: ${message.toString()}`);
      if(topic == "gsu_baris_enes_sensor"){
        let data = message.toString().split(":");
        setSensorData({
          lightDensity: parseFloat(data[1]),
          temperature: parseFloat(data[2]),
          humidity: parseFloat(data[3]),
        });
        client.publish("gsu_baris_enes_activator", `x:0`);

      }
      else if (topic == "gsu_baris_enes_status"){
        let data = message.toString().split(":");
        setStateData({
          light:parseInt(data[0]),
          curtain: parseInt(data[1]),
          fan: parseInt(data[2])
        })
      }

    });
    setClient(client);

    return () => {
      if (client) {
        client.end();
      }
    };
  }, []);
  
  
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <h1 className="text-7xl mb-24 mt-12">Barış's House</h1>
      <div className="flex items-center justify-evenly mb-16 pb-8 w-full border-b-2">
        <div className="flex flex-col items-center justify-center mx-12 w-3/12">
          <p className="text-4xl mb-8">Brightness Level </p>
          <MdHighlight className="text-9xl" />
          <p>%{sensorData?.lightDensity}</p>
        </div>
        <div className="flex flex-col items-center justify-center mx-12 w-3/12">
          <p className="text-4xl mb-8">Temperature </p>

          <TbTemperature className="text-9xl" />
          <p>{sensorData?.temperature} C</p>
        </div>
        <div className="flex flex-col items-center justify-center mx-12 w-3/12">
          <p className="text-4xl mb-8">Humidity </p>

          <WiHumidity className="text-9xl" />
          <p>%{sensorData?.humidity}</p>
        </div>
      </div>
      <div className="flex items-center justify-evenly w-full ">
        <div className="flex flex-col items-center justify-center mx-12 w-3/12">
          <p className="text-4xl mb-8">Activate Fan</p>
          <GiComputerFan className="text-9xl" />
          <p className="text-2xl mb-4">%{stateData?.fan}</p>
          <Slider
            className="w-9/12"
            onChange={(e, val) => {
              console.log("val", val);
              client.publish("gsu_baris_enes_activator", `fan:${val}`);
            }}
            defaultValue={stateData?.fan}
            aria-label="Default"
            valueLabelDisplay="auto"
            color="white"
          />
          <p className="mt-8 text-4xl border-b-4 w-full text-center pb-4">
            Rule
          </p>
          <div className="flex items-center justify center mt-4">
            <p className="">Temperature</p>
            <TextField
              className="bg-slate-800 border-white outline-white text-center	w-3/12 mx-4 h-20 text-white"
              InputLabelProps={{
                style: {
                  color: "white",
                },
              }}
              SelectProps={{
                sx: {
                  color: "white",
                  ".MuiSvgIcon-root": {
                    color: "white",
                  },
                },
              }}
              onChange={(err, val) => {
                setFanRule({
                  condition: val.props.value,
                  temperatureOffset: fanRule?.temperatureOffset,
                  fanPower: fanRule?.fanPower,
                });
              }}
              helperText="< or >"
              FormHelperTextProps={{ sx: { color: "white" } }}
              selectedText
              id="outlined-select-currency"
              select
              label="Condition"
              variant="filled">
              <MenuItem key={"<"} value={"<"}>
                &lt;
              </MenuItem>
              <MenuItem key={">"} value={">"}>
                &gt;
              </MenuItem>
            </TextField>
            <TextField
              className="bg-slate-800 border-white outline-white	mr-4 h-20"
              InputLabelProps={{
                style: {
                  color: "white",
                },
              }}
              onChange={(e) => {
                setFanRule({
                  condition: fanRule?.condition,
                  temperatureOffset: e.target.value,
                  fanPower: fanRule?.fanPower,
                });
              }}
              helperText="Temperature offset"
              FormHelperTextProps={{ sx: { color: "white" } }}
              sx={{ input: { color: "white" } }}
              id="outlined-number"
              label="Temperature"
              type="number"
              variant="outlined"
            />
            <TextField
              className="bg-slate-800 border-white outline-white	w-3/12 h-20"
              InputLabelProps={{
                style: {
                  color: "white",
                },
              }}
              onChange={(e) => {
                setFanRule({
                  condition: fanRule?.condition,
                  temperatureOffset: fanRule?.temperatureOffset,
                  fanPower: e.target.value,
                });
              }}
              sx={{ input: { color: "white" } }}
              id="outlined-number"
              helperText="Fan Power"
              FormHelperTextProps={{ sx: { color: "white" } }}
              label="%"
              type="number"
              variant="outlined"
            />
          </div>
          <div className="flex items-center justify-center mt-4">
            <button
              className="outline my-4 p-4 mx-4"
              onClick={() => {
                client.publish("gsu_baris_enes_rule_delete", `fan`);
              }}>
              Delete
            </button>
            <button
              className="outline my-4 p-4 mx-4"
              onClick={() => {
                client.publish(
                  "gsu_baris_enes_rule",
                  `fan:${fanRule.condition}:${fanRule.temperatureOffset}:${fanRule.fanPower}`
                );
              }}
              disabled={
                !(
                  fanRule?.fanPower &&
                  fanRule?.temperatureOffset &&
                  fanRule?.condition
                )
              }>
              Activate
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mx-12 w-3/12">
          <p className="text-4xl mb-8">Activate Curtain</p>
          <GiTheaterCurtains className="text-9xl" />
          <p className="text-2xl mb-4">%{stateData?.curtain}</p>
          <Slider
            className="w-9/12"
            onChange={(e, val) => {
              console.log("val", val);
              client.publish("gsu_baris_enes_activator", `curtain:${val}`);
            }}
            defaultValue={stateData?.curtain}
            aria-label="Default"
            valueLabelDisplay="auto"
            color="white"
          />
          <p className="mt-8 text-4xl border-b-4 w-full text-center pb-4">
            Rule
          </p>
          <div className="flex items-center justify-between mt-4">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                sx={{
                  ".MuiInputBase-input": { color: "white" }, // Style the input text color
                  ".MuiInputLabel-root": { color: "white" }, // Style the label text color

                  input: { color: "white" },
                }}
                onChange={(e) => {
                  setCurtainRule({
                    curtainCloseRule: curtainRule?.curtainCloseRule,
                    curtainOpenRule: {
                      curtainOpenHour: e.$H,
                      curtainOpenMinute: e.$m,
                    },
                  });
                }}
                className="bg-slate-800 border-white outline-white	w-5/12 h-20"
                InputLabelProps={{
                  style: {
                    color: "white",
                  },
                }}
                label="Curtain Open Time"
              />
              <TimePicker
                sx={{
                  ".MuiInputBase-input": { color: "white" }, // Style the input text color
                  ".MuiInputLabel-root": { color: "white" }, // Style the label text color

                  input: { color: "white" },
                }}
                onChange={(e) => {
                  setCurtainRule({
                    curtainOpenRule: curtainRule?.curtainOpenRule,
                    curtainCloseRule: {
                      curtainCloseHour: e.$H,
                      curtainCloseMinute: e.$m,
                    },
                  });

                  console.log(e.$H, e.$m);
                }}
                className="bg-slate-800 border-white outline-white	w-5/12 h-20"
                InputLabelProps={{
                  style: {
                    color: "white",
                  },
                }}
                label="Curtain Close Time"
              />
            </LocalizationProvider>
          </div>
          <div className="flex items-center justify-center mt-4">
            <button
              className="outline my-4 p-4 mx-4"
              onClick={() => {
                client.publish("gsu_baris_enes_rule_delete", `curtain`);
              }}>
              Delete
            </button>
            <button
              className="outline my-4 p-4 mx-4"
              onClick={() => {
                client.publish(
                  "gsu_baris_enes_rule",
                  `curtain:${curtainRule?.curtainOpenRule?.curtainOpenHour}:${curtainRule?.curtainOpenRule?.curtainOpenMinute}:${curtainRule?.curtainCloseRule?.curtainCloseHour}:${curtainRule?.curtainCloseRule?.curtainCloseMinute}`
                );
              }}
              disabled={
                !((curtainRule?.curtainOpenRule?.curtainOpenHour &&
                  curtainRule?.curtainOpenRule?.curtainOpenMinute) ||
                (curtainRule?.curtainCloseRule?.curtainCloseHour &&
                  curtainRule?.curtainCloseRule?.curtainCloseMinute))
              }>
              Activate
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mx-12 w-3/12">
          <p className="text-4xl mb-8">Activate Light</p>
          <MdWbTwighlight className="text-9xl" />
          <p className="text-2xl mb-4">%{stateData?.light}</p>
          <Slider
            className="w-9/12"
            onChange={(e, val) => {
              console.log("val", val);
              client.publish("gsu_baris_enes_activator", `light:${val}`);
            }}
            defaultValue={stateData?.light}
            aria-label="Default"
            valueLabelDisplay="auto"
            color="white"
          />
          <p className="mt-8 text-4xl border-b-4 w-full text-center pb-4">
            Rule
          </p>
          <div className="flex items-center justify center mt-4">
            <p className="">Brightness</p>
            <TextField
              className="bg-slate-800 border-white outline-white text-center	w-3/12 mx-4 h-20 text-white"
              InputLabelProps={{
                style: {
                  color: "white",
                },
              }}
              SelectProps={{
                sx: {
                  color: "white",
                  ".MuiSvgIcon-root": {
                    color: "white",
                  },
                },
              }}
              onChange={(err, val) => {
                setLightRule({
                  condition: val.props.value,
                  brightnessOffset: lightRule?.brightnessOffset,
                  lightPower: lightRule?.lightPower,
                });
              }}
              helperText="< or >"
              FormHelperTextProps={{ sx: { color: "white" } }}
              selectedText
              id="outlined-select-currency"
              select
              label="Condition"
              variant="filled">
              <MenuItem key={"<"} value={"<"}>
                &lt;
              </MenuItem>
              <MenuItem key={">"} value={">"}>
                &gt;
              </MenuItem>
            </TextField>
            <TextField
              className="bg-slate-800 border-white outline-white	mr-4 h-20"
              InputLabelProps={{
                style: {
                  color: "white",
                },
              }}
              onChange={(e) => {
                setLightRule({
                  condition: lightRule?.condition,
                  brightnessOffset: e.target.value,
                  lightPower: lightRule?.lightPower,
                });
              }}
              helperText="Brightness offset %"
              FormHelperTextProps={{ sx: { color: "white" } }}
              sx={{ input: { color: "white" } }}
              id="outlined-number"
              label="Brightness"
              type="number"
              variant="outlined"
            />
            <TextField
              className="bg-slate-800 border-white outline-white	w-3/12 h-20"
              InputLabelProps={{
                style: {
                  color: "white",
                },
              }}
              onChange={(e) => {
                setLightRule({
                  condition: lightRule?.condition,
                  brightnessOffset: lightRule?.brightnessOffset,
                  lightPower: e.target.value,
                });
              }}
              sx={{ input: { color: "white" } }}
              id="outlined-number"
              helperText="Light Power"
              FormHelperTextProps={{ sx: { color: "white" } }}
              label="%"
              type="number"
              variant="outlined"
            />
          </div>
          <div className="flex items-center justify-center mt-4">
            <button
              className="outline my-4 p-4 mx-4"
              onClick={() => {
                client.publish("gsu_baris_enes_rule_delete", `light`);
              }}>
              Delete
            </button>
            <button
              className="outline my-4 p-4 mx-4"
              onClick={() => {
                client.publish(
                  "gsu_baris_enes_rule",
                  `light:${lightRule.condition}:${lightRule.brightnessOffset}:${fanRule.lightPower}`
                );
              }}
              disabled={
                !(
                  lightRule?.lightPower &&
                  lightRule?.brightnessOffset &&
                  lightRule?.condition
                )
              }>
              Activate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
