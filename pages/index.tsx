import { useState, useEffect } from "react";
import {
  Button,
  Text,
  TextAreaField,
  View,
  RadioGroupField,
  Radio,
  ToggleButton,
  Grid,
} from "@aws-amplify/ui-react";
import {
  Connect,
  StartWebRTCContactCommandOutput,
} from "@aws-sdk/client-connect";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  BiMicrophone,
  BiMicrophoneOff,
  BiVideo,
  BiVideoOff,
} from "react-icons/bi";

import {
  ConsoleLogger,
  DefaultMeetingSession,
  MeetingSessionConfiguration,
  DefaultDeviceController,
  LogLevel,
} from "amazon-chime-sdk-js";

const region = "ap-northeast-1";
const contactFlowId = "e99d4c4d-28ee-4f04-908b-2d8476f7c8f4";
const instanceId = "f6c2c10c-92a0-458c-aa31-0d2c2a7426a9";
const participantDetails = {
  DisplayName: "customer",
};

export default function Contact() {
  const [callType, setCallType] = useState("simple");
  const [text, setText] = useState("");
  const [meetingSession, setMeetingSession] = useState<DefaultMeetingSession>();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const changeMicMutedStatus = async () => {
    if (meetingSession !== undefined) {
      if (isMuted) {
        meetingSession.audioVideo.realtimeUnmuteLocalAudio();
      } else {
        meetingSession.audioVideo.realtimeMuteLocalAudio();
      }
      setIsMuted(!isMuted);
    }
  };

  const startWebRTCContact = async (callType: string) => {
    const credentials = (await fetchAuthSession()).credentials;
    const connect = new Connect({
      region: region,
      credentials: credentials,
    });
    const contactInformation: StartWebRTCContactCommandOutput =
      await connect.startWebRTCContact({
        ContactFlowId: contactFlowId,
        InstanceId: instanceId,
        ParticipantDetails: participantDetails,
        Attributes: {
          callType: callType,
          text: text,
        },
      });
    console.log(contactInformation);

    // instantiate Amazon Chime SDK client MeetingSessionConfiguration object
    const meetingSessionConfiguration = new MeetingSessionConfiguration(
      {
        Meeting: contactInformation.ConnectionData?.Meeting,
      },
      {
        Attendee: contactInformation.ConnectionData?.Attendee,
      }
    );
    // console.log(meetingSessionConfiguration);
    const logger = new ConsoleLogger("logger", LogLevel.INFO);
    const deviceController = new DefaultDeviceController(logger);
    const meetingSession = new DefaultMeetingSession(
      meetingSessionConfiguration,
      logger,
      deviceController
    );
    setMeetingSession(meetingSession);
    // console.log(meetingSession);
    await meetingSession.deviceController.startAudioInput("default");
    await meetingSession.deviceController.chooseAudioOutput("default");
    await meetingSession.audioVideo.bindAudioElement(
      document.getElementById("audio-element") as HTMLAudioElement
    );
    meetingSession.audioVideo.start();
    return;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <View as="div" padding={"1rem"} width={"50%"}>
        <h1>in-app web call sample</h1>

        <View as="div" padding={"1rem"} width={"100%"}>
          <RadioGroupField
            legend="Call Type"
            name="callType"
            value={callType}
            onChange={(e) => setCallType(e.target.value)}
          >
            <Radio value="simple">Simple web call</Radio>
            <Radio value="textbased">Text based call routing</Radio>
          </RadioGroupField>
        </View>

        <View
          as="div"
          padding={"1rem"}
          width={"100%"}
          hidden={callType !== "textbased"}
        >
          <TextAreaField
            label="Text based call routing"
            descriptiveText=""
            placeholder="Enter text and try text based call routing!"
            rows={3}
            width={"100%"}
            paddingTop={"1rem"}
            paddingBottom={"1rem"}
            onChange={(e) => setText(e.target.value)}
          />

          <Text>Your call will be placed below categories.</Text>
          <Text>- Service</Text>
          <Text>- Account</Text>
          <Text>- Other</Text>
        </View>
        <View as="div" padding={"1rem"} width={"100%"}>
          <Button loadingText="" onClick={() => startWebRTCContact(callType)}>
            Start web call
          </Button>
        </View>
      </View>

      <audio id="audio-element"></audio>
      <View as="div" padding={"1rem"} width={"50%"} hidden={!meetingSession}>
        <ToggleButton
          variation="primary"
          isPressed={isMuted}
          onChange={changeMicMutedStatus}
        >
          {isMuted ? <BiMicrophoneOff /> : <BiMicrophone />}
        </ToggleButton>
      </View>
    </div>
  );
}
