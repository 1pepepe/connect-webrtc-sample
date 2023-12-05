import { useState, useEffect } from "react";
import { Button } from "@aws-amplify/ui-react";
import {
  Connect,
  StartWebRTCContactCommandOutput,
} from "@aws-sdk/client-connect";
import { fetchAuthSession } from "aws-amplify/auth";

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
      <h1>in-app web通話のサンプル</h1>
      <Button loadingText="" onClick={() => startWebRTCContact("contact")}>
        web通話を開始
      </Button>
      <audio id="audio-element"></audio>
    </div>
  );
}
