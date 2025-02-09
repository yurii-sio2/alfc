import React, { useState, useEffect } from "react";
import { Toggle } from "../components/Toggle.js";
import { useWebSocket } from "../utils/hooks.js";
import { errorToast } from "../utils/misc.js";
import { getMethods, setMethods } from "../data/mof.js";
import { ToggleState } from "../utils/enums.js";

export function Toggles() {
  const [gpuBoost, setGPUBoost] = useState(ToggleState.Unknown);

  const { isConnected, sendJsonMessage, lastJsonMessage } = useWebSocket();

  useEffect(() => {
    const { kind, data, methodName } = lastJsonMessage;
    if (kind === "state") {
      setGPUBoost(data.gpuBoost ? ToggleState.On : ToggleState.Off);
    } else if (kind === "success") {
      // Current state only changes when we get the websocket
      // result.
      if (methodName === "GetAIBoostStatus") {
        setGPUBoost(data === "0x1" ? ToggleState.On : ToggleState.Off);
      } else if (methodName === "SetAIBoostStatus") {
        sendJsonMessage({
          ...getMethods["GetAIBoostStatus"],
          kind: "get",
        });
      }
    } else if (kind === "error") {
      errorToast("Couldn't apply change.");
      console.error(data);
    }
  }, [lastJsonMessage, sendJsonMessage]);

  if (!isConnected) {
    return null;
  }

  const changeGPUBoost: React.ChangeEventHandler = () => {
    // State is unknown until server responds
    setGPUBoost(ToggleState.Unknown);
    sendJsonMessage({
      ...setMethods["SetAIBoostStatus"],
      kind: "set",
      data: {
        Data: gpuBoost === ToggleState.On ? 0 : 1,
      },
    });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Toggle
        label="GPU Boost"
        name="gpuBoost"
        value={gpuBoost}
        onChange={changeGPUBoost}
      />
    </div>
  );
}
